import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import * as pgvector from 'pgvector/pg';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { randomUUID } from 'crypto';
import { DocumentReaderService } from '../../embedding/service/documentReader.service';
import { OpenAiEmbbedingService } from 'src/module/embedding/service/openAIEmbedding.service';
import { ProductWithVariants } from 'src/model/product.model';
import { Decimal } from '@prisma/client/runtime/library';

const VECTOR_TABLE_MAP: Record<string, string> = {
  AgentUserDocument: 'agent_user_document',
  AgentUserProduct: 'agent_user_product',
  AgentUserDataTrain: 'agent_user_data_train',
};

// Keys that are stored inside the metadata JSONB column
const METADATA_KEYS = new Set([
  'userId',
  'documentId',
  'agentId',
  'productId',
  'categoryId',
  'type',
  'source',
  'chunkIndex',
  'sku',
  'price',
  'stock',
  'isActive',
]);

@Injectable()
export class PostgreStoreService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(
    private documentReaderService: DocumentReaderService,
    private openAiEmbeddingService: OpenAiEmbbedingService,
  ) {
    // Connect to Docker pgvector instance
    this.pool = new Pool({
      host: process.env.DB_HOST ,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USERNAME ,
      password:
         process.env.DB_PASSWORD,
      database:process.env.DB_NAME,
      max: 10,
    });
  }

  async onModuleInit() {
    const client = await this.pool.connect();
    try {
      // Enable pgvector extension if not enabled (MUST be done BEFORE registerTypes)
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');

      // Register pgvector types (after extension is created)
      await pgvector.registerTypes(client);

      // Create tables if not exist
      await this.createTablesIfNotExist(client);
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  private async createTablesIfNotExist(client: PoolClient) {
    const tables = [
      'agent_user_document',
      'agent_user_product',
      'agent_user_data_train',
    ];

    for (const table of tables) {
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${table} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          embedding vector(3072),
          content TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      // Create an index on the vector column for similarity search
      await client.query(`
        CREATE INDEX IF NOT EXISTS ${table}_embedding_idx
        ON ${table}
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `).catch(() => {
        // Ignore error if index already exists or not enough data
      });
    }
  }

  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 350,
    chunkOverlap: 50,
  });

  private toQdrantLikeResult(rows: any[]) {
    return {
      points: rows.map((row) => ({
        id: row.id,
        payload: {
          ...row,
        },
      })),
    };
  }

  private validateVector(vector: number[]) {
    if (!Array.isArray(vector) || !vector.length) {
      throw new BadRequestException('Invalid vector');
    }
  }

  async storeMany(
    embeddings: number[][],
    collection: keyof typeof VECTOR_TABLE_MAP,
    contents: string[],
    metadatas: Record<string, any>[],
  ) {
    const table = VECTOR_TABLE_MAP[collection];
    if (!table) {
      throw new BadRequestException(
        `No table mapping defined for collection ${collection}`,
      );
    }

    if (
      embeddings.length !== contents.length ||
      embeddings.length !== metadatas.length
    ) {
      throw new BadRequestException('Length mismatch');
    }

    const client = await this.pool.connect();
    try {
      await pgvector.registerTypes(client);

      for (let i = 0; i < embeddings.length; i++) {
        await client.query(
          `INSERT INTO ${table} (id, embedding, content, metadata)
           VALUES ($1, $2, $3, $4)`,
          [
            randomUUID(),
            pgvector.toSql(embeddings[i]),
            contents[i],
            metadatas[i],
          ],
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    } finally {
      client.release();
    }
  }

  /* 
     SEARCH
  */

  async similaritySearch(
    vector: number[],
    collection: keyof typeof VECTOR_TABLE_MAP,
    filter:
      | {
          must?: Array<{
            key: string;
            match?: { value: any };
          }>;
        }
      | Record<string, any>,
    limit = 5,
  ) {
    this.validateVector(vector);

    const table = VECTOR_TABLE_MAP[collection];
    if (!table) {
      throw new BadRequestException(
        `No table mapping defined for collection ${collection}`,
      );
    }

    const client = await this.pool.connect();
    try {
      await pgvector.registerTypes(client);

      const { whereClause, params } = this.buildWhereClause(filter, 2);
      const query = `
        SELECT *, 1 - (embedding <=> $1) as similarity
        FROM ${table}
        ${whereClause}
        ORDER BY embedding <=> $1
        LIMIT ${limit}
      `;

      const { rows } = await client.query(query, [
        pgvector.toSql(vector),
        ...params,
      ]);
      return rows;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    } finally {
      client.release();
    }
  }

  async searchByFilter(
    collection: keyof typeof VECTOR_TABLE_MAP,
    filter:
      | {
          must?: Array<{
            key: string;
            match?: { value: any };
          }>;
        }
      | Record<string, any>,
  ) {
    const table = VECTOR_TABLE_MAP[collection];
    if (!table) {
      throw new BadRequestException(
        `No table mapping defined for ${collection}`,
      );
    }

    const client = await this.pool.connect();
    try {
      const { whereClause, params } = this.buildWhereClause(filter, 1);
      const query = `SELECT * FROM ${table} ${whereClause}`;

      const { rows } = await client.query(query, params);
      return this.toQdrantLikeResult(rows);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    } finally {
      client.release();
    }
  }

  /* ======================
     DELETE BY FILTER
  ====================== */

  async deleteByFilter(
    collection: keyof typeof VECTOR_TABLE_MAP,
    filter:
      | {
          must?: Array<{
            key: string;
            match?: { value: any };
          }>;
        }
      | Record<string, any>,
  ) {
    const table = VECTOR_TABLE_MAP[collection];
    if (!table) {
      throw new BadRequestException(
        `No table mapping defined for ${collection}`,
      );
    }

    const client = await this.pool.connect();
    try {
      const { whereClause, params } = this.buildWhereClause(filter, 1);
      const query = `DELETE FROM ${table} ${whereClause} RETURNING id`;

      await client.query(query, params);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    } finally {
      client.release();
    }
  }

  /* ======================
     BUILD WHERE CLAUSE
  ====================== */

  private buildWhereClause(
    filter:
      | {
          must?: Array<{
            key: string;
            match?: { value: any };
          }>;
        }
      | Record<string, any>,
    startParamIndex: number,
  ): { whereClause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = startParamIndex;

    if ('must' in filter && Array.isArray(filter.must)) {
      for (const clause of filter.must) {
        const value = clause.match?.value;
        if (value === undefined) continue;

        if (clause.key.startsWith('metadata.')) {
          const metaKey = clause.key.replace('metadata.', '');
          conditions.push(`metadata->>'${metaKey}' = $${paramIndex}`);
          params.push(String(value));
          paramIndex++;
        } else if (METADATA_KEYS.has(clause.key)) {
          conditions.push(`metadata->>'${clause.key}' = $${paramIndex}`);
          params.push(String(value));
          paramIndex++;
        } else {
          conditions.push(`${clause.key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
    } else if (filter && Object.keys(filter).length) {
      for (const [key, value] of Object.entries(filter)) {
        if (key === 'metadata') {
          conditions.push(`metadata @> $${paramIndex}`);
          params.push(JSON.stringify(value));
          paramIndex++;
        } else if (METADATA_KEYS.has(key)) {
          conditions.push(`metadata->>'${key}' = $${paramIndex}`);
          params.push(String(value));
          paramIndex++;
        } else {
          conditions.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, params };
  }

  /* ======================
     STORE FILE
  ====================== */

  async storeVectorFile(filePath: string, agentId: string, userId: string) {
    const document = await this.documentReaderService.read(filePath);
    const chunks = await this.splitter.createDocuments([document]);

    const texts = chunks.map((d) => d.pageContent);
    const embeddings = await this.openAiEmbeddingService.embedDocuments(texts);

    const metadatas = chunks.map((_, i) => ({
      agentId,
      userId,
      source: filePath,
      chunkIndex: i,
      type: 'document',
    }));

    await this.storeMany(embeddings, 'AgentUserDocument', texts, metadatas);
  }

  /* ======================
     STORE DATA TRAIN
  ====================== */

  async storeVectorDataTrain(
    dataTrain: string,
    agentId: string,
    userId: string,
  ) {
    const chunks = await this.splitter.createDocuments([dataTrain]);
    const texts = chunks.map((d) => d.pageContent);
    const embeddings = await this.openAiEmbeddingService.embedDocuments(texts);

    const metadatas = chunks.map((_, i) => ({
      agentId,
      userId,
      chunkIndex: i,
      type: 'datatrain',
    }));

    await this.storeMany(embeddings, 'AgentUserDataTrain', texts, metadatas);
  }

  /* ======================
     STORE PRODUCT
  ====================== */

  async storeVectorProduct(
    products: ProductWithVariants[],
    agentId: string,
    userId: string,
  ) {
    const texts = products.map(this.serializeProductForEmbedding);
    const embeddings = await this.openAiEmbeddingService.embedDocuments(texts);

    const metadatas = products.map((p) => ({
      type: 'product',
      agentId,
      userId,
      productId: p.id,
      categoryId: p.categoryId,
      isActive: p.isActive,
      sku: p.sku,
      price: Number(p.price),
      stock: p.stock,
    }));

    await this.storeMany(embeddings, 'AgentUserProduct', texts, metadatas);
  }

  serializeProductForEmbedding(product: ProductWithVariants): string {
    return `
Produk: ${product.name}
Deskripsi: ${product.description}
SKU: ${product.sku}
Harga: ${product.price}
Stok: ${product.stock}
    `.trim();
  }

  formatPrice(price: Decimal | number) {
    return typeof price === 'number' ? price : Number(price.toString());
  }

  normalizeFilter(
    filter:
      | {
          must?: Array<{
            key: string;
            match?: { value: any };
          }>;
        }
      | Record<string, any>,
  ): Record<string, any> {
    if (!filter || !('must' in filter)) {
      return filter ?? {};
    }

    const result: Record<string, any> = {};

    for (const clause of filter.must ?? []) {
      const value = clause.match?.value;
      if (value === undefined) continue;

      if (clause.key.startsWith('metadata.')) {
        const metaKey = clause.key.replace('metadata.', '');
        result.metadata ??= {};
        result.metadata[metaKey] = value;
      } else {
        result[clause.key] = value;
      }
    }

    return result;
  }
}

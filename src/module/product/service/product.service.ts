import { HttpException, Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/module/prisma/service/prisma.service';
import { ValidationService } from 'src/module/common/other/validation.service';
import {
  ChangeProduct,
  GetModelProduct,
  PaginationResponseProduct,
  PostProduct,
  ProductApi,
} from 'src/model/product.model';
import { ProductValidation } from '../dto/product.validation';
import { moveFile } from 'src/interceptors/multer.interceptors';

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getProductByUserId(
    query: GetModelProduct,
  ): Promise<PaginationResponseProduct> {
    const ProductValid: GetModelProduct = this.validationService.validate(
      ProductValidation.Pagination,
      query,
    );
    if (!ProductValid) throw new HttpException('Validation Error', 400);
    const { page, limit, userId, categoryId, harga, sku, status } =
      ProductValid;
    if (userId == '' || !userId)
      throw new HttpException('Validation Error', 400);

    const whereClause: any = {
      userId,
      ...(categoryId && { categoryId }),
      ...(harga && { harga: Number(harga) }),
      ...(sku && { sku: String(sku) }),
      ...(status && { status: String(status) }),
    };

    const data = await this.prismaService.product.findMany({
      where: whereClause,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    const totalData = await this.prismaService.product.count({
      where: {
        userId: query.userId,
      },
    });

    return {
      Product: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }
  async getProduct(query: GetModelProduct): Promise<PaginationResponseProduct> {
    const ProductValid: GetModelProduct = this.validationService.validate(
      ProductValidation.Pagination,
      query,
    );
    if (!ProductValid) throw new HttpException('Validation Error', 400);
    const { page, limit } = ProductValid;

    const data = await this.prismaService.product.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
    const totalData = await this.prismaService.product.count();

    return {
      Product: data,
      Pagination: {
        page: Number(page),
        pageSize: Number(limit),
        totalItems: totalData,
        totalPages: totalData / Number(limit),
      },
    };
  }

  async getProductbyId(id: string): Promise<Product> {
    try {
      if (!id) throw new HttpException('Validation Error', 400);

      const data = await this.prismaService.product.findFirst({
        where: {
          id: id,
        },
        include: {
          productVariants: {
            include: {
              values: true,
            },
          },
          variantOptions: true,
        },
      });

      if (!data) throw new HttpException('Cannot Find Product', 403);

      return data;
    } catch (error) {
      throw new HttpException('ProductId is Invalid', 400);
    }
  }

  async addNewProduct(req: PostProduct): Promise<ProductApi> {
    const ProductValid: PostProduct = this.validationService.validate(
      ProductValidation.Product,
      req,
    );

    if (!ProductValid) throw new HttpException('Validation Error', 400);

    const data = await this.prismaService.product.create({
      data: ProductValid,
    });

    if (data) {
      const replacePath = data.image.replace('image', 'temp');
      await moveFile(replacePath, 'image');
    }

    const res: ProductApi = {
      ...data,
      price: Number(data.price),
      weight: Number(data.weight),
    };

    return res;
  }

  async editProduct(req: ChangeProduct) {
    try {
      const ProductValid: ChangeProduct = this.validationService.validate(
        ProductValidation.changeProduct,
        req,
      );

      if (!ProductValid) throw new HttpException('Validation Error', 400);

      const find = await this.getProductbyId(ProductValid.id);
      const data = await this.prismaService.product.update({
        where: {
          id: req.id,
        },
        data: ProductValid,
      });

      if (find.image !== data.image) {
        const replacePath = data.image.replace('image', 'temp');
        await moveFile(replacePath, 'image');
        await moveFile(find.image, 'temp');
      }

      const res: ProductApi = {
        ...data,
        price: Number(data.price),
        weight: Number(data.weight),
      };
      return res;
    } catch (error) {
      console.log(error);
      if (String(error).includes('invalid_type')) throw error;
      throw new HttpException('ProductId is Invalid', 400);
    }
  }
  async deleteProduct(id: string) {
    if (!id) throw new HttpException('Validation Error', 400);

    try {
      const data = await this.prismaService.product.delete({
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      throw new HttpException('ProductId is Invalid', 400);
    }
  }
}

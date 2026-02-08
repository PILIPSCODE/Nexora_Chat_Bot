import { Global, Module } from '@nestjs/common';
import { VectorStoreService } from './service/vectoreStore.service';
import { SupabaseStoreService } from './service/supabaseStore.service';
import { PostgreStoreService } from './service/postgreStore.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [VectorStoreService, SupabaseStoreService, PostgreStoreService],
  exports: [VectorStoreService, SupabaseStoreService, PostgreStoreService],
})
export class VectorModule {}

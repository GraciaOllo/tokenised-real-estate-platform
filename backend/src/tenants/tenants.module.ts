import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { AuthModule } from '../auth/auth.module';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    forwardRef(() => AuthModule),
    PropertiesModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
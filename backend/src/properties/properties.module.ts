import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyController } from './properties.controller';
import { PropertyService } from './properties.service';
import { Property, PropertySchema } from './schemas/property.schema';
import { AuthModule } from '../auth/auth.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
        forwardRef(() => AuthModule),
        BlockchainModule,
    ],
    controllers: [PropertyController],
    providers: [PropertyService],
    exports: [PropertyService],
})
export class PropertiesModule {}

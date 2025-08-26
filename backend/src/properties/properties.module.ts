import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyController } from './properties.controller';
import { PropertyService } from './properties.service';
import { Property, PropertySchema } from './schemas/property.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
        forwardRef(() => AuthModule),
    ],
    controllers: [PropertyController],
    providers: [PropertyService],
    exports: [PropertyService],
})
export class PropertiesModule {}

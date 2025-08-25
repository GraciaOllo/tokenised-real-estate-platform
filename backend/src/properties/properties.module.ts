import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { Property, PropertySchema } from './schemas/property.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
        forwardRef(() => AuthModule),
    ],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})
export class PropertiesModule {}

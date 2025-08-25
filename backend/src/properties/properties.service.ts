import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
    constructor(@InjectModel(Property.name) private propertyModel: Model<PropertyDocument>) {}

    async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
        const { valuation, tokenPercentage, tokenPrice, totalTokens, images = [], documents = [], ...rest } = createPropertyDto;
        const calculatedTokenPrice = tokenPrice || valuation * (tokenPercentage / 100);
        const calculatedTotalTokens = totalTokens || Math.floor(valuation / calculatedTokenPrice);

        const createdProperty = new this.propertyModel({
            ...rest,
            valuation,
            tokenPrice: calculatedTokenPrice,
            totalTokens: calculatedTotalTokens,
            availableTokens: calculatedTotalTokens,
            images,
            documents,
        });
        return createdProperty.save();
    }

    async findAll(): Promise<Property[]> {
        return this.propertyModel.find().exec();
    }

    async findById(id: string): Promise<Property | null> {
        return this.propertyModel.findById(id).exec();
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
        return this.propertyModel.findByIdAndUpdate(id, updatePropertyDto, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.propertyModel.findByIdAndDelete(id).exec();
    }

    async findByOwner(ownerId: string): Promise<Property[]> {
        return this.propertyModel.find({ ownerId }).exec();
    }
}
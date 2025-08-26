import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class PropertyService {
findById: any;
constructor(@InjectModel(Property.name) private propertyModel: Model<PropertyDocument>) {}

async createProperty(dto: CreatePropertyDto, manager: UserDocument): Promise<Property> {
if (manager.role !== 'manager') {
    throw new ForbiddenException('Only managers can create properties');
}
const created = new this.propertyModel({ ...dto });
return created.save();
}

async getAllProperties(): Promise<Property[]> {
return this.propertyModel.find().exec();
}

async getPropertyById(id: string): Promise<Property> {
const prop = await this.propertyModel.findById(id).exec();
if (!prop) throw new NotFoundException('Property not found');
return prop;
}

async updateProperty(id: string, dto: UpdatePropertyDto, user: UserDocument): Promise<Property> {
const prop = await this.getPropertyById(id);

// Only admin or property owner (manager) can update
if (user.role !== 'admin' && user.role !== 'manager') {
    throw new ForbiddenException('Not authorized');
}

Object.assign(prop, dto);
return prop.save();
}

async publishProperty(id: string, admin: UserDocument, blockchainData: Partial<Property>): Promise<Property> {
if (admin.role !== 'admin') {
    throw new ForbiddenException('Only admin can publish to blockchain');
}

const prop = await this.getPropertyById(id);

// Update blockchain-related fields
Object.assign(prop, blockchainData);
prop.isPublished = true;

return prop.save();
}
}

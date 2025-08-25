import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const createdTenant = new this.tenantModel({
      ...createTenantDto,
      userId: new Types.ObjectId(createTenantDto.userId),
      propertyId: createTenantDto.propertyId ? new Types.ObjectId(createTenantDto.propertyId) : undefined,
    });
    return createdTenant.save();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().populate('userId propertyId').exec();
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantModel.findById(id).populate('userId propertyId').exec();
  }

  async findByUserId(userId: string): Promise<Tenant | null> {
    return this.tenantModel.findOne({ userId: new Types.ObjectId(userId) }).populate('userId propertyId').exec();
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant | null> {
    const updateData: any = { ...updateTenantDto };
    
    if (updateTenantDto.userId) {
      updateData.userId = new Types.ObjectId(updateTenantDto.userId);
    }
    
    if (updateTenantDto.propertyId) {
      updateData.propertyId = new Types.ObjectId(updateTenantDto.propertyId);
    }
    
    return this.tenantModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<any> {
    return this.tenantModel.findByIdAndDelete(id).exec();
  }

  async addPayment(tenantId: string, payment: any): Promise<Tenant | null> {
    return this.tenantModel.findByIdAndUpdate(
      tenantId,
      { $push: { paymentHistory: payment } },
      { new: true }
    ).exec();
  }

  async addMaintenanceRequest(tenantId: string, request: any): Promise<Tenant | null> {
    return this.tenantModel.findByIdAndUpdate(
      tenantId,
      { $push: { maintenanceRequests: request } },
      { new: true }
    ).exec();
  }

  async assignProperty(tenantId: string, propertyId: string): Promise<Tenant | null> {
    return this.tenantModel.findByIdAndUpdate(
      tenantId,
      { propertyId: new Types.ObjectId(propertyId) },
      { new: true }
    ).exec();
  }

  async findByPropertyOwnerId(ownerId: string): Promise<Tenant[]> {
    return this.tenantModel.aggregate([
      {
        $lookup: {
          from: 'properties',
          localField: 'propertyId',
          foreignField: '_id',
          as: 'property'
        }
      },
      {
        $unwind: '$property'
      },
      {
        $match: {
          'property.ownerId': ownerId
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ]).exec();
  }

  async validatePropertyOwnership(propertyId: string, ownerId: string): Promise<boolean> {
    const property = await this.propertiesService.findById(propertyId);
    return property && property.ownerId === ownerId;
  }
}

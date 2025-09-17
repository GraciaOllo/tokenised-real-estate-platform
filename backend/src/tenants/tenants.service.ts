import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { PropertyService } from '../properties/properties.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private readonly propertiesService: PropertyService,
    private readonly blockchainService: BlockchainService,
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

  // Record rent payment and distribute to investors based on ERC-20 holdings
  async payRent(tenantId: string, amountEth: number, meta: any = {}): Promise<{ tenant: Tenant; transactionHash: string }> {
    const tenant = await this.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    if (!tenant.propertyId) {
      throw new BadRequestException('Tenant is not assigned to any property');
    }

    // Load property to get ERC-20 address
    const propertyId = (tenant as any).propertyId?._id
      ? String((tenant as any).propertyId._id)
      : String(tenant.propertyId);
    const property = await this.propertiesService.getPropertyById(propertyId);
    if (!property.erc20ContractAddress) {
      throw new ForbiddenException('Property is not fractionalized; cannot distribute rent');
    }
    if (!amountEth || amountEth <= 0) {
      throw new BadRequestException('Rent amount must be positive');
    }

    // Try on-chain contract distribution; fallback to off-chain payouts when method not available
    let transactionHash = '';
    let reference = '';
    try {
      const res = await this.blockchainService.distributeDividends(
        property.erc20ContractAddress,
        amountEth
      );
      transactionHash = res.transactionHash;
      reference = transactionHash;
    } catch (err: any) {
      // Fallback: off-chain distribution by sending ETH to holders pro-rata
      const result = await this.blockchainService.distributeDividendsOffchain(
        property.erc20ContractAddress,
        amountEth
      );
      reference = `offchain:${result.payouts.length} txs totalWei=${result.totalWei.toString()}`;
    }

    // Append payment record
    const paymentRecord = {
      date: new Date(),
      amount: amountEth,
      status: 'paid',
      paymentMethod: meta?.paymentMethod || 'onchain',
      reference: meta?.reference || reference,
    };
    await this.addPayment(tenantId, paymentRecord);

    // Return updated tenant and on-chain tx hash
    const updated = await this.findById(tenantId);
    return { tenant: updated as Tenant, transactionHash };
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

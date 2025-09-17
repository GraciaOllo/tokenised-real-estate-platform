import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(AuthGuard)
async create(@Body() createTenantDto: CreateTenantDto) {
    console.log('Incoming tenant data:', createTenantDto);
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard)
  async findByUserId(@Param('userId') userId: string) {
    return this.tenantsService.findByUserId(userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.tenantsService.delete(id);
  }

  @Post(':id/payments')
  @UseGuards(AuthGuard)
  async addPayment(@Param('id') id: string, @Body() payment: any) {
    return this.tenantsService.addPayment(id, payment);
  }

  // Tenant pays rent -> distribute to investors
  @Post(':id/pay-rent')
  @UseGuards(AuthGuard)
  async payRent(
    @Param('id') id: string,
    @Body('amountEth') amountEth: number,
    @Body() body: any
  ) {
    return this.tenantsService.payRent(id, Number(amountEth), { paymentMethod: body?.paymentMethod, reference: body?.reference });
  }

  @Post(':id/maintenance-requests')
  @UseGuards(AuthGuard)
  async addMaintenanceRequest(@Param('id') id: string, @Body() request: any) {
    return this.tenantsService.addMaintenanceRequest(id, request);
  }

  @Post(':id/assign-property')
  @UseGuards(AuthGuard)
  async assignProperty(@Param('id') id: string, @Body('propertyId') propertyId: string) {
    return this.tenantsService.assignProperty(id, propertyId);
  }

  @Get('owner/:ownerId')
  @UseGuards(AuthGuard)
  async findByPropertyOwnerId(@Param('ownerId') ownerId: string) {
    return this.tenantsService.findByPropertyOwnerId(ownerId);
  }

  // New endpoint for owner-specific tenant creation
  @Post('owner/:ownerId/create')
  @UseGuards(AuthGuard)
  async createForOwner(
    @Param('ownerId') ownerId: string,
    @Body() createTenantDto: CreateTenantDto
  ) {
    // Validate that property belongs to owner
    const property = await this.tenantsService.validatePropertyOwnership(
      createTenantDto.propertyId,
      ownerId
    );
    
    return this.tenantsService.create({
      ...createTenantDto,
      propertyId: createTenantDto.propertyId
    });
  }
}

import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { PropertyService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('properties')
export class PropertyController {
constructor(private readonly propertyService: PropertyService) {}

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
@Post()
async create(@Body() dto: CreatePropertyDto, @Req() req) {
return this.propertyService.createProperty(dto, req.user);
}

@Get()
async getAll() {
return this.propertyService.getAllProperties();
}

@Get(':id')
async getOne(@Param('id') id: string) {
return this.propertyService.getPropertyById(id);
}

@UseGuards(AuthGuard, RolesGuard)
@Patch(':id')
async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @Req() req) {
return this.propertyService.updateProperty(id, dto, req.user);
}

// Admin publishes property to blockchain
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Patch(':id/publish')
async publish(@Param('id') id: string, @Body() blockchainData: Partial<CreatePropertyDto>, @Req() req) {
return this.propertyService.publishProperty(id, req.user, blockchainData);
}
}

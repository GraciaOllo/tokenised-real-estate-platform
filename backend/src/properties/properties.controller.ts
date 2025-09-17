import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PropertyService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, PublishPropertyDto, ListPropertyDto } from './dto/property.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('test')
  test() {
    return { message: 'Test endpoint is working!' };
  }

  @Get()
  async getAll() {
    return this.propertyService.getAllProperties();
  }

  // Get all properties for the currently authenticated manager
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Get('owner')
  async getMyProperties(@Req() req) {
    return this.propertyService.getMyProperties(req.user.userId);
  }

  @Get('manager/:managerId')
  async getByManager(@Param('managerId') managerId: string) {
    console.log('Fetching properties for manager:', managerId);
    try {
      const properties = await this.propertyService.getPropertiesByOwner(managerId);
      console.log('Found properties:', properties);
      return properties;
    } catch (error) {
      console.error('Error in getByManager:', error);
      throw error;
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    // Get property by ID (only if it's a valid property ID)
    return this.propertyService.getPropertyById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 10 },
  ], {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    }),
  }))
  @Post()
  async create(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: { images?: Express.Multer.File[]; documents?: Express.Multer.File[] },
    @Req() req
  ) {
    const user = req.user;

    // Process uploaded files and set paths
    const imagePaths = files.images?.map(file => `/uploads/${file.filename}`) || [];
    const documentPaths = files.documents?.map(file => `/uploads/${file.filename}`) || [];

    const payload: any = {
      ...dto,
      images: imagePaths,
      documents: documentPaths,
      ownerId: user?.userId,
      ownerName: user?.name || user?.email,
    };

    return this.propertyService.createProperty(payload, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @Req() req) {
    return this.propertyService.updateProperty(id, dto, req.user);
  }

  // Admin publishes property to blockchain (mints ERC-721)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/publish')
  async publish(@Param('id') id: string, @Body() blockchainData: PublishPropertyDto, @Req() req) {
    return this.propertyService.publishProperty(id, req.user, blockchainData);
  }

  // POST alias for clients expecting POST instead of PATCH
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/publish')
  async publishPost(@Param('id') id: string, @Body() blockchainData: PublishPropertyDto, @Req() req) {
    return this.propertyService.publishProperty(id, req.user, blockchainData);
  }

  // Marketplace listing (server-side mirror)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/list')
  async list(@Param('id') id: string, @Body() dto: ListPropertyDto, @Req() req) {
    return this.propertyService.setListing(id, dto, req.user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id/delist')
  async delist(@Param('id') id: string, @Req() req) {
    return this.propertyService.delistProperty(id, req.user);
  }

  // Investor purchase endpoint
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.INVESTOR)
  @Post(':id/buy')
  async buy(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req
  ) {
    const amount = Number(body?.amount);
    const walletAddress = body?.walletAddress || body?.wallet || body?.recipient;
    return this.propertyService.buyTokens(id, amount, walletAddress, req.user);
  }

  // Admin fractionalize endpoint
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/fractionalize')
  async fractionalize(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req
  ) {
    const dto = {
      totalShares: Number(body?.totalShares),
      sharePrice: Number(body?.sharePrice),
      tokenName: body?.tokenName,
      tokenSymbol: body?.tokenSymbol,
    };
    return this.propertyService.fractionalizeProperty(id, dto, req.user);
  }
}

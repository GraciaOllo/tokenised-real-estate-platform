import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFiles
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Express } from 'express';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) {}

    @Get()
    async findAll() {
        return this.propertiesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.propertiesService.findById(id);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createPropertyDto: CreatePropertyDto,
        @Request() req,
    ) {
        const images = files
            .filter(f => f.fieldname === 'images')
            .map(f => `/uploads/${f.filename}`);
        const documents = files
            .filter(f => f.fieldname === 'documents')
            .map(f => `/uploads/${f.filename}`);

        return this.propertiesService.create({
            ...createPropertyDto,
            images,
            documents,
            ownerId: req.user.userId,
        });
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updatePropertyDto: UpdatePropertyDto,
    ) {
        return this.propertiesService.update(id, updatePropertyDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: string) {
        await this.propertiesService.delete(id);
        return { message: 'Property deleted successfully' };
    }

    @Get('owner/:ownerId')
    @UseGuards(AuthGuard)
    async findByOwner(@Param('ownerId') ownerId: string) {
        return this.propertiesService.findByOwner(ownerId);
    }
}
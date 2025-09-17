import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('payments')
@UseGuards(AuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    async findAll() {
        return this.paymentsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.paymentsService.findById(id);
    }

    @Post()
    async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
        return this.paymentsService.create({
        ...createPaymentDto,
        userId: req.user.userId,
        });
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.paymentsService.findByUser(userId);
    }

    @Get('property/:propertyId')
    async findByProperty(@Param('propertyId') propertyId: string) {
        return this.paymentsService.findByProperty(propertyId);
    }

    @Put(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.paymentsService.updateStatus(id, body.status);
    }
}
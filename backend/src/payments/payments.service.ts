import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
    constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>) {}

    async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
        const createdPayment = new this.paymentModel(createPaymentDto);
        return createdPayment.save();
    }

    async findAll(): Promise<Payment[]> {
        return this.paymentModel.find().exec();
    }

    async findById(id: string): Promise<Payment | null> {
        return this.paymentModel.findById(id).exec();
    }

    async findByUser(userId: string): Promise<Payment[]> {
        return this.paymentModel.find({ userId }).exec();
    }

    async findByProperty(propertyId: string): Promise<Payment[]> {
        return this.paymentModel.find({ propertyId }).exec();
    }

    async updateStatus(id: string, status: string): Promise<Payment> {
        return this.paymentModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }
}
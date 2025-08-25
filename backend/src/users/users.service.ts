import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

async create(createUserDto: CreateUserDto): Promise<User> {
const createdUser = new this.userModel(createUserDto);
return createdUser.save();
}

async createByAdmin(createUserDto: CreateUserDto): Promise<UserDocument> {
const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
const createdUser = new this.userModel({
    ...createUserDto,
    password: hashedPassword,
    isActive: true,
});
return createdUser.save();
}

async findByEmail(email: string): Promise<UserDocument | null> {
return this.userModel.findOne({ email }).exec();
}

async findById(id: string): Promise<User | null> {
return this.userModel.findById(id).exec();
}

async findAll(): Promise<User[]> {
return this.userModel.find().select('-password').exec();
}

async update(id: string, updateData: Partial<User>): Promise<User> {
return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
}

async delete(id: string): Promise<void> {
await this.userModel.findByIdAndDelete(id).exec();
}
}
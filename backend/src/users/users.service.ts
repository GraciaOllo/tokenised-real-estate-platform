import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
create: any;
constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

async createUser(userData: Partial<User>): Promise<User> {
const user = new this.userModel(userData);
return user.save();
}

async getAllUsers(): Promise<User[]> {
return this.userModel.find().exec();
}

async getUserById(id: string): Promise<User> {
const user = await this.userModel.findById(id).exec();
if (!user) throw new NotFoundException('User not found');
return user;
}

async findByEmail(email: string): Promise<User> {
const user = await this.userModel.findOne({ email }).exec();
if (!user) throw new NotFoundException('User not found');
return user;
}

async updateUser(id: string, data: Partial<User>): Promise<User> {
const user = await this.getUserById(id);
Object.assign(user, data);
return user.save();
}

async validatePassword(email: string, password: string): Promise<User | null> {
const user = await this.userModel.findOne({ email }).exec();
if (!user) return null;
const match = await bcrypt.compare(password, user.password);
return match ? user : null;
}
}
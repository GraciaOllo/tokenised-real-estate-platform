import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema'; 
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
constructor(private readonly usersService: UserService) {}

async register(createUserDto: CreateUserDto) {
const existingUser = await this.usersService.findByEmail(createUserDto.email);
if (existingUser) {
    throw new Error('User already exists');
}

const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
const user = await this.usersService.create({
    ...createUserDto,
    password: hashedPassword,
})as UserDocument;;

const userId = user._id || user.id; 
const token = this.generateToken(userId, user.email, user.role);


return {
    token,
    user: {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletAddress: user.walletAddresses,
    },
};
}

async login(loginDto: LoginDto) {
const user = await this.usersService.findByEmail(loginDto.email);
if (!user) {
    throw new UnauthorizedException('Invalid credentials');
}

const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
}

const userId = user._id;
const token = this.generateToken(userId, user.email, user.role);

return {
    token,
    user: {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    walletAddress: user.walletAddresses,
    },
};
}

private generateToken(userId: string, email: string, role: string): string {
return jwt.sign(
    { userId, email, role },
    'your-secret-key',
    { expiresIn: '24h' }
);
}

verifyToken(token: string) {
try {
    return jwt.verify(token, 'your-secret-key');
} catch {
    throw new UnauthorizedException('Invalid token');
}
}
}
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema'; 
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService) {}

  async register(createUserDto: CreateUserDto) {
    let existingUser: UserDocument | null = null;
    try {
      existingUser = await this.usersService.findByEmail(createUserDto.email) as any;
    } catch {
      existingUser = null;
    }
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Let Mongoose pre-save hook hash the password
    const user = await this.usersService.createUser({
      ...createUserDto,
    }) as UserDocument;

    if (!user) {
      throw new BadRequestException('User registration failed');
    }

    const userId = user._id?.toString();
    const token = this.generateToken(userId, user.email, user.role);

    return {
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddresses, // 👈 match schema field
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

    const userId = user._id?.toString();
    const token = this.generateToken(userId, user.email, user.role);

    return {
      token,
      user: {
        id: userId,
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
      'your-secret-key', // ❗ replace with process.env.JWT_SECRET
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

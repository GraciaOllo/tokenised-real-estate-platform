import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('register')
async register(@Body() createUserDto: CreateUserDto) {
try {
    const result = await this.authService.register(createUserDto);
    return {
    success: true,
    message: 'User registered successfully',
    data: result,
    };
} catch (error) {
    throw new HttpException(
    {
        success: false,
        message: error.message,
    },
    HttpStatus.BAD_REQUEST,
    );
}
}

@Post('login')
async login(@Body() loginDto: LoginDto) {
try {
    const result = await this.authService.login(loginDto);
    return {
    success: true,
    message: 'Login successful',
    data: result,
    };
} catch (error) {
    throw new HttpException(
    {
        success: false,
        message: error.message,
    },
    HttpStatus.UNAUTHORIZED,
    );
}
}
}
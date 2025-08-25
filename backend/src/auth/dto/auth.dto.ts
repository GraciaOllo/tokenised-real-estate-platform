import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
ADMIN = 'admin',
INVESTOR = 'investor',
TENANT = 'tenant',
MANAGER = 'manager',
}

export class CreateUserDto {
@IsString()
name: string;

@IsEmail()
email: string;

@IsString()
@MinLength(6)
password: string;

@IsEnum(UserRole)
role: UserRole;

@IsOptional()
@IsString()
walletAddress?: string;

@IsOptional()
@IsString()
phone?: string;
}

export class LoginDto {
@IsEmail()
email: string;

@IsString()
password: string;
}
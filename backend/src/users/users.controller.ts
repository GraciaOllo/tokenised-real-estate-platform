import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateUserDto } from '../auth/dto/auth.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
constructor(private readonly usersService: UsersService) {}

@Get()
async findAll() {
return this.usersService.findAll();
}

@Get(':id')
async findOne(@Param('id') id: string) {
return this.usersService.findById(id);
}

@Post()
async create(@Body() createUserDto: CreateUserDto) {
return this.usersService.createByAdmin(createUserDto);
}

@Put(':id')
async update(@Param('id') id: string, @Body() updateData: any) {
return this.usersService.update(id, updateData);
}

@Delete(':id')
async delete(@Param('id') id: string) {
await this.usersService.delete(id);
return { message: 'User deleted successfully' };
}

@Put(':id/activate')
async activateUser(@Param('id') id: string) {
return this.usersService.update(id, { isActive: true });
}

@Put(':id/deactivate')
async deactivateUser(@Param('id') id: string) {
return this.usersService.update(id, { isActive: false });
}
}
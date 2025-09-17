import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
export class UserController {
constructor(private readonly userService: UserService) {}

@Post()
async create(@Body() data) {
return this.userService.createUser(data);
}

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Get()
async getAll() {
return this.userService.getAllUsers();
}

@UseGuards(AuthGuard, RolesGuard)
@Get(':id')
async getOne(@Param('id') id: string) {
return this.userService.getUserById(id);
}

@UseGuards(AuthGuard, RolesGuard)
@Get(':id')
async findByEmail(@Param('email') id: string) {
return this.userService.findByEmail(id);
}

@UseGuards(AuthGuard, RolesGuard)
@Patch(':id')
async update(@Param('id') id: string, @Body() data, @Req() req) {
return this.userService.updateUser(id, data);
}
}

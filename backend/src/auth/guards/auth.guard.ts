import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
        throw new UnauthorizedException('No token provided');
        }

        try {
        const decoded = this.authService.verifyToken(token);
        request.user = decoded;
        return true;
        } catch (error) {
        throw new UnauthorizedException('Invalid token');
        }
    }
}
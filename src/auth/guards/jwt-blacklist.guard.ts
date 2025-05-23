// src/auth/guards/jwt-blacklist.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtBlacklistGuard extends AuthGuard('jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero, verifica la autenticación usando el guard JWT estándar
    const canActivate = await super.canActivate(context);
    
    if (!canActivate) {
      return false;
    }
    
    // Si pasa la autenticación JWT, verifica si el token está en la lista negra
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (token && this.authService.isTokenInvalidated(token)) {
      throw new UnauthorizedException('Token has been invalidated (logged out)');
    }
    
    return true;
  }
}
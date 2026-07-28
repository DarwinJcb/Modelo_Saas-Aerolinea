/* saas-backend/src/auth/auth.controller.ts */
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { SolicitudConUsuario } from './interfaces/auth.interface';
import { RolUsuario } from '../generated/prisma/enums';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Roles(RolUsuario.SUPERADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('perfil')
    perfil(@Req() solicitud: SolicitudConUsuario) {
        return solicitud.usuario;
    }
}
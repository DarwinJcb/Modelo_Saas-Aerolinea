/* saas-backend/src/auth/auth.controller.ts */
import { Body, Controller, Get, Post, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UsuarioAutenticado } from './interfaces/usuario-autenticado.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    obtenerPerfil(
        @UsuarioActual()
        usuarioAutenticado: UsuarioAutenticado,
    ) {
        return usuarioAutenticado;
    }
}
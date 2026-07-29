/* saas-backend/src/auth/auth.controller.ts */
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UsuarioAutenticado } from './interfaces/auth.interface';

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

    @UseGuards(JwtAuthGuard)
    @Get('perfil')
    perfil(
        @UsuarioActual()
        usuario: UsuarioAutenticado,
    ) {
        return usuario;
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Patch('cambiar-contrasena')
    cambiarContrasena(
        @Body()
        cambiarContrasenaDto: CambiarContrasenaDto,
        @UsuarioActual()
        usuarioActual: UsuarioAutenticado,
    ) {
        return this.authService.cambiarContrasena(
            cambiarContrasenaDto,
            usuarioActual,
        );
    }
}

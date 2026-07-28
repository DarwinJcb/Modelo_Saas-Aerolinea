/* saas-backend/src/planes/planes.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../generated/prisma/enums';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanesService } from './planes.service';

@Roles(RolUsuario.SUPERADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('planes')
export class PlanesController {
  constructor(
    private readonly planesService: PlanesService,
  ) { }

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  @Get()
  findAll() {
    return this.planesService.findAll();
  }

  @Get(':idPlan')
  findOne(
    @Param('idPlan', ParseIntPipe)
    idPlan: number,
  ) {
    return this.planesService.findOne(idPlan);
  }

  @Patch(':idPlan')
  update(
    @Param('idPlan', ParseIntPipe)
    idPlan: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planesService.update(
      idPlan,
      updatePlanDto,
    );
  }

  @Delete(':idPlan')
  remove(
    @Param('idPlan', ParseIntPipe)
    idPlan: number,
  ) {
    return this.planesService.remove(idPlan);
  }
}
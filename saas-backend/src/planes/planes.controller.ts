/* saas-backend/src/planes/planes.controller.ts */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanesService } from './planes.service';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) { }

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  @Get()
  findAll() {
    return this.planesService.findAll();
  }

  @Get(':idPlan')
  findOne(@Param('idPlan', ParseIntPipe) idPlan: number) {
    return this.planesService.findOne(idPlan);
  }

  @Patch(':idPlan')
  update(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planesService.update(idPlan, updatePlanDto);
  }

  @Delete(':idPlan')
  remove(@Param('idPlan', ParseIntPipe) idPlan: number) {
    return this.planesService.remove(idPlan);
  }
}
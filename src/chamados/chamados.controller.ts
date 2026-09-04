import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ChamadosService } from './chamados.service';
import { ClassificarChamadoDto } from './dto/classificar-chamado.dto';

@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}
  @Post('classificar')
  @HttpCode(200)
  async classificar(@Body() dto: ClassificarChamadoDto) {
    return this.chamadosService.classificar(dto.texto);
  }
}

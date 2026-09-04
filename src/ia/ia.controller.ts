import { Body, Controller, Post } from '@nestjs/common';
import { ResponderDto } from './dto/responder.dto';
import { IaService } from './ia.service';
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}
  @Post('responder')
  async responder(@Body() dto: ResponderDto) {
    const resultado = await this.iaService.responder(dto.mensagem);
    return { resposta: resultado.resposta, modelo: resultado.modelo, uso: { tokensEntrada: resultado.tokensEntrada, tokensSaida: resultado.tokensSaida } };
  }
}

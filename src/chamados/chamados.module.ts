import { Module } from '@nestjs/common';
import { IaModule } from '../ia/ia.module';
import { ChamadosController } from './chamados.controller';
import { ChamadosService } from './chamados.service';

@Module({
  imports: [IaModule],
  controllers: [ChamadosController],
  providers: [ChamadosService],
})
export class ChamadosModule {}

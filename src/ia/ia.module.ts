import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MODELO_PROVIDER } from './providers/modelo.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  imports: [HttpModule],
  providers: [{ provide: MODELO_PROVIDER, useClass: OllamaProvider }],
  exports: [MODELO_PROVIDER],
})
export class IaModule {}

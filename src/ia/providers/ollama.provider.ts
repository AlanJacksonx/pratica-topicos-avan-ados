import { HttpService } from '@nestjs/axios';
import { BadGatewayException, GatewayTimeoutException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GerarRespostaInput, GerarRespostaOutput, ModeloProvider } from './modelo.provider';

interface OllamaChatResponse { model: string; message?: { role: string; content: string; }; done: boolean; prompt_eval_count?: number; eval_count?: number; }

@Injectable()
export class OllamaProvider implements ModeloProvider {
  constructor(private readonly http: HttpService, private readonly config: ConfigService) {}
  async gerar(input: GerarRespostaInput): Promise<GerarRespostaOutput> {
    const baseUrl = this.config.getOrThrow<string>('OLLAMA_BASE_URL');
    const model = this.config.getOrThrow<string>('OLLAMA_MODEL');
    const timeout = Number(this.config.get<string>('OLLAMA_TIMEOUT_MS') ?? '30000');
    try {
      const response = await this.http.axiosRef.post<OllamaChatResponse>(
        `${baseUrl}/api/chat`, { model, messages: [{ role: 'user', content: input.mensagem }], stream: false }, { timeout }
      );
      const content = response.data.message?.content?.trim();
      if (!content) throw new BadGatewayException('Resposta invalida do modelo');
      return { resposta: content, modelo: response.data.model, tokensEntrada: response.data.prompt_eval_count, tokensSaida: response.data.eval_count };
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) throw error;
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') throw new GatewayTimeoutException('Tempo limite da inferencia excedido');
        if (error.code === 'ECONNREFUSED') throw new ServiceUnavailableException('Servidor de IA indisponivel');
      }
      throw new BadGatewayException('Falha ao consultar o modelo');
    }
  }
}

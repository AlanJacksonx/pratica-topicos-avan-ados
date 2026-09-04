import { BadGatewayException, BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MODELO_PROVIDER, type ModeloProvider } from '../ia/providers/modelo.provider';
import { ChamadoCategoria } from './chamado-categoria';

@Injectable()
export class ChamadosService {
  constructor(@Inject(MODELO_PROVIDER) private readonly modelo: ModeloProvider) {}
  async classificar(texto: string) {
    const textoNormalizado = texto.trim();
    if (textoNormalizado.length < 10) throw new BadRequestException('O texto deve conter no minimo 10 caracteres uteis.');
    
    const prompt = `Classifique o seguinte chamado em exatamente uma destas categorias: ACESSO, FINANCEIRO, MATRICULA, DOCUMENTOS, OUTROS. Responda APENAS com a palavra da categoria, sem pontuacao e sem texto adicional. Chamado: "${textoNormalizado}"`;
    
    const resultado = await this.modelo.gerar({ mensagem: prompt });
    const categoriaGerada = resultado.resposta.trim().toUpperCase();
    
    if (!Object.values(ChamadoCategoria).includes(categoriaGerada as ChamadoCategoria)) {
      throw new BadGatewayException('O modelo retornou uma categoria invalida');
    }
    return { texto: textoNormalizado, categoria: categoriaGerada as ChamadoCategoria, modelo: resultado.modelo };
  }
}

import { BadGatewayException, BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MODELO_PROVIDER, type ModeloProvider } from '../ia/providers/modelo.provider';
import { ChamadoCategoria } from './chamado-categoria';

@Injectable()
export class ChamadosService {
  constructor(@Inject(MODELO_PROVIDER) private readonly modelo: ModeloProvider) {}

  async classificar(texto: string) {
    const textoNormalizado = texto.trim();
    if (textoNormalizado.length < 10) throw new BadRequestException('O texto deve conter no minimo 10 caracteres uteis.');
    
    // Engenharia de Prompt Avançada: Contexto + Exemplos (Few-Shot)
    const prompt = `Atue como um classificador de chamados. Classifique o chamado em exatamente UMA destas categorias:
- ACESSO (para senha, login, portal bloqueado)
- FINANCEIRO (para mensalidade, boleto, pagamento)
- MATRICULA (para disciplinas, trancamento, turmas)
- DOCUMENTOS (para histórico escolar, certificado, declaração)
- OUTROS (para assuntos diferentes)

Exemplo 1:
Chamado: "Esqueci minha senha"
Categoria: ACESSO

Exemplo 2:
Chamado: "Preciso do meu histórico escolar"
Categoria: DOCUMENTOS

Agora é a sua vez. Responda APENAS com a palavra da categoria, sem nenhuma pontuação.
Chamado: "${textoNormalizado}"
Categoria:`;
    
    const resultado = await this.modelo.gerar({ mensagem: prompt });
    
    console.log("=========================================");
    console.log("CHAMADO:", textoNormalizado);
    console.log("RESPOSTA DA IA:", resultado.resposta);
    console.log("=========================================");

    // Limpeza pesada na string da IA
    const respostaLimpa = resultado.resposta
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z]/gi, '')
      .toUpperCase();
      
    // Impede o erro de grafia da IA ("ACCESSO" em vez de "ACESSO")
    const respostaCorrigida = respostaLimpa.replace('ACCESSO', 'ACESSO');
    
    const categoriaEncontrada = Object.values(ChamadoCategoria).find((categoria) => 
      respostaCorrigida.includes(categoria)
    );
    
    if (!categoriaEncontrada) {
      throw new BadGatewayException('O modelo retornou uma categoria invalida: ' + resultado.resposta);
    }
    
    return { texto: textoNormalizado, categoria: categoriaEncontrada, modelo: resultado.modelo };
  }
}

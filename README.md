# Relatório Técnico — Encontro 07
**NestJS e IA Local: Classificação de Chamados**

**Aluno:** Alan Jackson Silva de Medeiros  
**Disciplina:** Tecnologia em Sistemas para Internet (TSI)  
**Instituição:** Instituto Federal do Rio Grande do Norte (IFRN)  
**Data:** 04 de Setembro de 2026  

---

## 1. Arquitetura da Solução
A aplicação foi estruturada seguindo os princípios de separação de responsabilidades:

* **Controller:** `ChamadosController` expõe a rota HTTP `POST /chamados/classificar` e gerencia o retorno de sucesso com status `200 OK`.
* **DTO:** `ClassificarChamadoDto` atua em conjunto com o `ValidationPipe` para barrar requisições malformadas, garantindo que a propriedade `texto` contenha entre 10 e 2.000 caracteres antes de atingir a lógica de negócios.
* **Service:** `ChamadosService` centraliza a regra de negócio. Ele constrói o prompt para o LLM, sanitiza a resposta e faz a validação da categoria contra o enum `ChamadoCategoria`.
* **Provider:** `ModeloProvider` isola a comunicação de infraestrutura com a API local do Ollama (modelo `llama3.2:latest`), definindo um contrato claro de entrada e saída.

## 2. Engenharia de Prompt e Resiliência
A comunicação com o modelo não determinístico exigiu técnicas defensivas no backend:

* **Few-Shot Prompting:** O prompt foi enriquecido com exemplos explícitos de classificação (ex: "histórico escolar" ➔ `DOCUMENTOS`), ancorando a resposta da IA e reduzindo consideravelmente as taxas de alucinação (onde a IA inventa classes que não existem).
* **Sanitização de String:** O texto retornado pela IA é submetido à normalização NFD, remoção de caracteres diacríticos (acentos) e exclusão de qualquer caractere não alfabético. Isso garante que respostas com pontuação extra ou quebras de linha sejam processadas corretamente.
* **Fallback Controlado:** Se mesmo com as tratativas a IA retornar algo fora do domínio de categorias permitidas, a aplicação aciona uma `BadGatewayException` estruturada (Status `502`), impedindo que respostas corrompidas atinjam os clientes da API.

## 3. Validação de Contratos

| Cenário Testado | Ação / Payload | Resultado Obtido |
| :--- | :--- | :--- |
| **Caminho Feliz (Sucesso)** | `{"texto": "Preciso do meu histórico escolar."}` | Classificação correta (`DOCUMENTOS`). Status `200 OK`. |
| **Violação de Tamanho** | `{"texto": "Erro"}` | Bloqueio pelo DTO. Status `400 Bad Request`. |
| **Atributos Adicionais** | `{"texto": "...", "prioridade": 1}` | Bloqueio pelo whitelist do ValidationPipe. Status `400 Bad Request`. |
| **IA Falha/Indisponível** | Docker do Ollama paralisado | Timeout/Erro tratado. Status `503/504`. |

---
title: 'Como escrever Skills para IA que realmente funcionam'
description: 'Instruções globais definem o que a IA sempre sabe. Skills definem o que ela sabe fazer quando o assunto muda. Entenda a arquitetura de carregamento progressivo, o frontmatter correto, os anti-padrões que destroem o contexto e como transformar expertise real em capacidade reutilizável.'
pubDate: '2026-03-18'
tags: ['ia', 'github-copilot', 'produtividade', 'prompt-engineering', 'devtools']
draft: false
---

Se você ainda não leu [Como fazer o Copilot entender seu projeto de verdade](/blog/como-fazer-o-copilot-entender-seu-projeto-de-verdade), comece por lá. Esse post cobre a camada de Custom Instructions: os três níveis de hierarquia (Personal, Repository e Organization), instruções por caminho, prompt files e a arte de escrever diretivas que funcionam. É o contexto que torna tudo que você vai ler agora muito mais poderoso.

Aqui, a conversa avança um nível. Vamos falar de **Skills**.

---

Você já pediu pra IA gerar algo específico do seu domínio, recebeu uma resposta tecnicamente correta, mas completamente "baunilha". Sem as convenções do time, sem o tom da empresa, sem o padrão que todo mundo já sabe de cabeça. A IA resolveu o problema errado do jeito certo.

E a tentação é escrever um prompt enorme, com todas as regras e exceções. Funciona uma vez. Na próxima conversa, você repete o ciclo.

Existe uma saída melhor, e ela tem um nome: **Skills**.

---

## O que é uma Skill, afinal?

Uma skill não é um prompt. Não é uma instrução global. Ela está entre os dois.

Pense assim: **instruções globais** são o código de conduta do projeto, regras que sempre se aplicam. Um **prompt avulso** é uma ordem pra uma tarefa específica. Uma **skill** é um manual técnico que a IA puxa da estante só quando a tarefa exige.

Essa distinção não é apenas conceitual: ela tem uma consequência direta na janela de contexto. Cada instrução global consome tokens em absolutamente todas as conversas, independente da tarefa. Uma skill só consome tokens quando a tarefa é do domínio dela. Em projetos com muitas regras específicas, a diferença de eficiência é enorme.

As Skills se baseiam num **padrão aberto** originado pela Anthropic e adotado pelo ecossistema GitHub/Claude. Isso significa que uma skill bem escrita funciona tanto no GitHub Copilot quanto no Claude Code, desde que os caminhos estejam corretos.

**Caminhos de descoberta (onde colocar suas skills):**

- `.github/skills/` ou `.agents/skills/` → skills versionadas no repositório, herdadas por toda a equipe
- `~/.copilot/skills/` ou `~/.claude/skills/` → skills pessoais, só na sua máquina

A estrutura física é simples: uma pasta nomeada com um arquivo `SKILL.md` e, opcionalmente, subdiretórios com recursos de suporte.

```text
.agents/
  skills/
    dotnet-architect/
      SKILL.md   ← o coração da skill
      resources/
        implementation-playbook.md   ← referência carregada sob demanda
    content-creator/
      SKILL.md
    api-reviewer/
      SKILL.md
      scripts/
        scan-endpoints.js   ← script executado pela IA, não lido
```

O `SKILL.md` não é um arquivo de documentação: é um **system prompt especializado** que a IA carrega dinamicamente quando julga que aquela skill é relevante pra tarefa atual.

![Estrutura de pastas de skills no explorador de arquivos: pasta .agents/skills com subpastas dotnet-architect (SKILL.md + resources), content-creator (SKILL.md) e api-reviewer (SKILL.md + scripts), ilustrando a organização modular de capacidades especializadas.](/images/blog/estrutura-pastas-skills.png)

---

## Como o carregamento progressivo funciona (e por que você precisa saber disso)

Antes de escrever uma linha de `SKILL.md`, entenda o mecanismo por trás da ativação. O carregamento das skills opera em três camadas progressivas, e essa arquitetura explica por que algumas decisões de escrita importam tanto.

### Camada 1: Metadados (sempre no contexto)

O frontmatter YAML do `SKILL.md` é lido **sempre**, em toda conversa. É o índice que a IA consulta pra decidir se a skill é candidata à ativação. Por isso, o campo `description` precisa ser cirúrgico: curto, focado e com as palavras certas.

Exemplo real de um frontmatter bem estruturado:

```yaml
---
name: dotnet-architect
description: Expert .NET backend architect specializing in C#, ASP.NET Core, Entity Framework, Dapper, and enterprise application patterns.
risk: unknown
source: community
date_added: '2026-02-27'
---
```

Os campos relevantes:

- **`name`**: ID único da skill. Minúsculas, com hifens. Deve coincidir exatamente com o nome da pasta. `name: "My Skill"` com espaço quebra o carregamento.
- **`description`**: O gatilho da skill. É essa string que a IA cruza com a tarefa atual. Longa demais? Você desperdiça tokens do prompt inicial antes da conversa começar. Vaga demais? A skill nunca dispara.
- **`risk` / `source` / `date_added`**: Metadados de governança, úteis em bibliotecas organizacionais com curadoria.

> **Alerta crítico:** a description é injetada no System Prompt inicial de todas as conversas. Se você colocar instruções detalhadas ali, está consumindo tokens preciosos antes mesmo do usuário digitar a primeira palavra.

### Camada 2: Corpo do SKILL.md (carregado sob demanda)

Quando a description no YAML ativa a skill, o corpo Markdown completo é injetado no contexto. É aqui que mora toda a inteligência: o raciocínio, os passos, os exemplos, as restrições.

Essa camada só aparece quando necessária. Em tarefas fora do domínio da skill, ela nunca é lida. Esse é o mecanismo que torna as skills eficientes: conhecimento especializado disponível sem poluir o contexto de tarefas não relacionadas.

### Camada 3: Resources e Scripts (executados por demanda explícita)

Arquivos externos na pasta da skill (scripts `.js`, `.py`, documentos de referência `.md`) são acessados apenas quando as instruções do corpo da skill ordenam explicitamente.

**E aqui está uma distinção que muda tudo:**

| | References (`.md`, texto) | Scripts (`.js`, `.py`, `.sh`) |
| --- | --- | --- |
| **Como a IA usa** | Lê o conteúdo | Executa e lê apenas o output |
| **Consome tokens** | Sim (o texto inteiro) | Não (só o resultado) |
| **Volume de dados** | Limitado pela janela de contexto | Ilimitado (o script processa) |
| **Caso de uso** | Regras de negócio, checklists | PDFs, APIs, análise de logs |

**Token Bleed:** se o `SKILL.md` não descrever clara e explicitamente como invocar o script e o que ele faz, a IA pode tentar ler o código-fonte do script pra *adivinhar* o funcionamento. O resultado: desperdício de tokens lendo Python ou JavaScript quando deveria estar lendo o output. Sempre documente: "Execute `scripts/scan-repo.js`. O script retorna JSON com as dependências mapeadas."

![Diagrama das três camadas de carregamento progressivo de uma skill: Camada 1 (Metadados YAML) sempre no contexto, Camada 2 (Corpo do SKILL.md) injetada sob demanda quando a skill é ativada, e Camada 3 (Scripts e Resources) acessada apenas por chamada explícita das instruções.](/images/blog/carregamento-progressivo-skills.png)

---

> **Por que os exemplos de skill estão em inglês?**
> Skills funcionam melhor quando escritas em inglês. Os modelos de linguagem foram treinados predominantemente com texto em inglês, então instruções nesse idioma geram matching mais preciso e respostas mais consistentes. Escrever sua skill em português funciona, mas você pode notar variações na qualidade e fidelidade das respostas. Os exemplos deste post refletem essa recomendação, e o template ao final também.

## Um exemplo real: a skill `dotnet-architect`

Código abstrato é difícil de avaliar. Então vamos dissecar uma skill concreta, a `dotnet-architect`, que tenho no meu setup pessoal:

```yaml
---
name: dotnet-architect
description: Expert .NET backend architect specializing in C#, ASP.NET Core, Entity Framework, Dapper, and enterprise application patterns.
risk: unknown
source: community
date_added: '2026-02-27'
---

## Use this skill when
- Working on dotnet architect tasks or workflows
- Needing guidance, best practices, or checklists for dotnet architect

## Do not use this skill when
- The task is unrelated to dotnet architect
- You need a different domain or tool outside this scope

## Instructions
- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.
- If detailed examples are required, open `resources/implementation-playbook.md`.
```

Seguido de uma seção de Capabilities profundamente detalhada: C# Language Mastery com features modernas do C# 12/13, ASP.NET Core Expertise, Data Access Patterns com EF Core e Dapper, Caching Strategies, Testing Practices com xUnit e FluentAssertions, Architecture Patterns com Clean Architecture, DDD e CQRS.

E depois: Behavioral Traits, declarações de como a IA deve se comportar ao usar essa skill:

- *"Favors composition over inheritance"*
- *"Applies SOLID principles pragmatically"*
- *"Considers performance implications but avoids premature optimization"*

E finalmente: exemplos de interações esperadas e preferências de estilo de código com exemplos reais em C#.

**Por que essa skill funciona tão bem?**

Ela cobre os três eixos que definem uma skill de alta qualidade: o *domínio* (expertise técnica), o *comportamento* (como raciocinar), e a *saída* (como o código resultante deve parecer). A IA não recebe só regras: recebe uma persona completa de especialista sênior.

![Comparação lado a lado: sem skill dotnet-architect a IA sugere código genérico com padrões desatualizados; com a skill ativa o código usa primary constructors, Result types e async/await corretos, ilustrando o impacto da persona especializada no resultado.](/images/blog/antes-depois-skill-dotnet-architect.png)

---

## A anatomia de um SKILL.md eficiente

Com o mecanismo de carregamento em mente, podemos falar de estrutura. Cada seção tem um propósito específico no ciclo de ativação e execução da skill.

### 1. O frontmatter YAML: o ponto de entrada

Já coberto anteriormente: `name` isomórfico com a pasta, `description` como gatilho cirúrgico, campos de governança opcionais.

O único adendo aqui: **não coloque `Use this skill when:` na description**. Essa informação vai no corpo, não no YAML.

### 2. `## Use this skill when` e `## Do not use this skill when`

Essas são as seções mais ignoradas e as mais importantes para o matching correto.

A IA decide *quando* carregar a skill com base nelas. Se não estiverem claras, a skill dispara nos momentos errados, ou nunca.

```markdown
## Use this skill when
- Working on .NET backend tasks: APIs, services, data access
- Reviewing C# code for performance, security, or architecture
- Designing solutions with ASP.NET Core, EF Core, or Dapper
- When user mentions: C#, .NET, ASP.NET, Entity Framework, Dapper

## Do not use this skill when
- The task involves frontend (React, Angular, CSS)
- You need infrastructure (Terraform, Kubernetes configs)
- The domain is Python, Node.js, or Go
```

A seção negativa é onde a maioria das skills não tem. É ela que evita falsos positivos: a IA ativando a skill `dotnet-architect` quando o usuário está perguntando sobre CSS. Esses **falsos positivos poluem o contexto** com expertise irrelevante.

### 3. `## Instructions`: o raciocínio sequencial

Para tarefas que envolvem múltiplos passos, use listas numeradas. Elas forçam o modelo a aplicar **Chain of Thought** (raciocínio encadeado), ao invés de pular direto pra uma resposta.

```markdown
## Instructions
- Clarify goals, constraints, and required inputs before starting.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps with verification checkpoints.
- If detailed examples are required, open `resources/implementation-playbook.md`.
```

Repare na última linha: ela instrui a IA a buscar o arquivo de referência externo — ativando a Camada 3 do carregamento progressivo. A IA não abre o arquivo por padrão; ela só o acessa quando a instrução manda explicitamente.

### 4. Capabilities: a expertise declarada

Aqui você injeta o conhecimento especializado que diferencia a skill de uma resposta genérica.

A estrutura que funciona é por módulos de competência, não por lista plana:

```markdown
## Capabilities

### C# Language Mastery
- Modern C# 12/13 features: required members, primary constructors
- Async/await: ValueTask, IAsyncEnumerable, ConfigureAwait
- Memory management: Span<T>, ArrayPool, stackalloc
- Pattern matching: switch expressions, property patterns

### Data Access Patterns
- EF Core: AsNoTracking, split queries, compiled queries
- Dapper: high-performance queries, multi-mapping
- Repository and Unit of Work patterns
- Connection pooling and transaction management
```

A diferença entre **lista plana** e **módulos** não é estética: quando o modelo precisa de uma informação específica dentro de uma skill densa, ele localiza melhor em seções nomeadas do que numa lista de 40 bullets misturados.

### 5. Behavioral Traits: o como, não só o quê

Essa seção define a **persona** da skill. Em vez de "o que saber", define "como se comportar".

```markdown
## Behavioral Traits
- Favors composition over inheritance
- Applies SOLID principles pragmatically
- Considers performance implications but avoids premature optimization
- Uses async/await correctly throughout the call stack
- Handles errors gracefully with Result types or exceptions as appropriate
```

A diferença entre uma skill com e sem Behavioral Traits é a diferença entre uma IA que entrega código correto e uma IA que entrega código correto *do jeito que um especialista sênior entregaria*. A primeira passa nos testes. A segunda passa nos testes e foi pensada por alguém que já viu o mesmo problema três vezes.

### 6. Exemplos: few-shot learning dentro da skill

**Few-shot learning** é uma das técnicas mais poderosas de prompt engineering, e cabe perfeitamente aqui.

```markdown
## Example Interactions
- "Design a caching strategy for product catalog with 100K items"
- "Review this async code for potential deadlocks"
- "Implement repository pattern with EF Core and Dapper"

## Code Style Preferences

```csharp
// ✅ Preferred: Modern C# with clear intent
public sealed class ProductService(
    IProductRepository repository,
    ICacheService cache) : IProductService
{
    public async Task<Result<Product>> GetByIdAsync(string id, CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(id);
        var cached = await cache.GetAsync<Product>($"product:{id}", ct);
        if (cached is not null) return Result.Success(cached);
        // ...
    }
}
```

Esse bloco ancora a IA num padrão de excelência concreto. Um exemplo de código real vale mais do que dez regras abstratas sobre "escreva código limpo".

---

## O que considerar antes de escrever uma skill

Antes de abrir o VS Code e criar o `SKILL.md`, responda essas perguntas. Elas vão economizar uma hora de reescrita depois.

### 1. Isso é uma skill ou uma instrução global?

Se a regra se aplica a **todo e qualquer** contexto do projeto, coloque nas instruções globais (`copilot-instructions.md`). Se ela só faz sentido numa **tarefa específica**, é uma skill.

- "Use TypeScript com aspas simples" → instrução global
- "Ao revisar contratos de API REST, verifique autenticação, rate limiting e sanitização de inputs" → skill

A fronteira importa porque a janela de contexto é finita. Skill no lugar errado polui o contexto de tarefas completamente não relacionadas.

### 2. Precisa de scripts ou só de referências?

Se a tarefa envolve grandes volumes de dados (logs de CI, conteúdo de PDFs, análise de repositório), crie um script. O script processa os dados fora da janela de contexto e retorna um resultado compacto que a IA consegue usar.

Se a tarefa precisa de regras de negócio ou checklists, use arquivos de referência Markdown no diretório `references/`. Só lembre que esses arquivos *são lidos* e *consomem tokens*, então mantenha-os enxutos.

### 3. Quais são os erros mais comuns que ela precisa prevenir?

As melhores skills são construídas a partir de dores reais. Se toda semana alguém do time esquece de incluir um campo obrigatório numa especificação, isso entra na skill. Se revisores sempre apontam o mesmo padrão de problema, isso entra.

Não escreva a partir do vazio: escreva a partir dos padrões de erro que você já observou repetidamente.

### 4. Ela pode ser validada?

Uma skill bem escrita produz resultados objetivamente verificáveis. Se você não consegue responder *"como eu sei que a skill está funcionando?"*, o escopo está vago demais.

---

## Escrevendo o prompt otimizado: a diferença na prática

### Use linguagem imperativa e direta

A IA responde melhor a comandos do que a sugestões.

| ❌ Vago | ✅ Direto |
| --- | --- |
| "Seria bom usar parágrafos curtos" | "Limite cada parágrafo a 3 frases" |
| "Tente ser objetivo" | "Elimine adjetivos que não adicionam informação" |
| "Considere performance" | "Pergunte sobre volume de dados e SLA antes de propor a solução" |

### Ancore em critérios mensuráveis

Regras vagas geram resultados inconsistentes.

**Vago:** "O código deve ser performático"

**Mensurável:** "Para queries que retornam mais de 1.000 registros, use `AsNoTracking()` e avalie paginação. Meça com BenchmarkDotNet quando o caminho é crítico."

### Scripts precisam de output robusto

Scripts silenciosos que falham sem retornar erro forçam a IA a ler o código-fonte pra depurar (Token Bleed). Garanta que todo script retorne erros descritivos no STDOUT:

```javascript
// ✅ Output estruturado que a IA consegue processar
console.log(JSON.stringify({ 
  success: false, 
  error: "Database connection failed: ECONNREFUSED 5432",
  hint: "Check DATABASE_URL environment variable"
}));
```

### Inclua o "porquê" nas regras menos óbvias

```markdown
- Use aspas simples para strings (padronização com o linter do projeto)
- Evite `any` no TypeScript (compromete o benefício central da tipagem estática)
- Prefira `record` types para DTOs (imutabilidade por padrão, menos boilerplate)
```

A justificativa cria compreensão, não só obediência. A IA que entende o porquê generaliza melhor pra casos não previstos na skill.

---

## Os erros mais comuns (e como corrigir)

### YAML inconsistente

```yaml
# ❌ Quebra o carregamento
name: "My Awesome Skill"   # espaços, letras maiúsculas

# ✅ Correto
name: my-awesome-skill
```

O `name` deve coincidir exatamente com o nome da pasta: minúsculas, hifens. Qualquer diferença e a skill não é descoberta.

### Description poluída com instruções

```yaml
# ❌ Desperdiça tokens no prompt inicial de TODAS as conversas
description: >
  Senior .NET architect. When activated: first understand requirements,
  then clarify constraints, apply SOLID principles, use async/await...

# ✅ Conciso: é o gatilho, nada mais
description: Expert .NET backend architect specializing in C#, ASP.NET Core, Entity Framework, Dapper, and enterprise application patterns.
```

### Seção negativa ausente

Sem `## Do not use this skill when`, a skill pode disparar em contextos errados. Uma skill de arquitetura .NET sendo ativada quando o usuário está perguntando sobre CSS não ajuda: atrapalha.

### Skill genérica demais

```markdown
# Developer Helper
Você é um assistente para desenvolvedores.
```

Isso não é uma skill. É uma instrução de uma linha. Sem domínio específico, sem exemplos, a IA não tem âncora pra calibrar as respostas além do treinamento base.

**Corrija:** domínio ultra-específico. Em vez de "developer helper", crie `api-contract-reviewer` com foco exclusivo em revisar contratos REST seguindo os padrões da sua empresa.

---

## Como verificar se sua skill está funcionando: comandos CLI

Essa parte a maioria dos tutoriais não mostra. Antes de confiar que a skill está disparando, verifique:

```bash
# Lista todas as skills detectadas nos caminhos configurados
/skills list

# Detalha o caminho e o status de carregamento de uma skill específica
/skills info dotnet-architect

# Recarrega alterações no SKILL.md sem reiniciar a sessão
/skills reload

# Adiciona um diretório externo de skills (biblioteca organizacional)
/skills add ~/.company/skills

# Remove um caminho de descoberta
/skills remove ~/.company/skills
```

O comando `/skills info` é particularmente útil: ele confirma se o `name` no YAML corresponde ao nome da pasta e se o arquivo está sendo lido de onde você espera. É o primeiro lugar pra olhar quando uma skill não dispara como esperado.

---

## A estrutura completa em um template

O template abaixo já está em inglês, que é o idioma recomendado para skills. Os comentários em português existem só pra facilitar a leitura do post, mas na skill de verdade tudo deve ser em inglês.

```markdown
---
name: skill-name
description: One concise sentence that works as a matching trigger.
risk: unknown
source: internal
date_added: 'YYYY-MM-DD'
---

## Use this skill when
- [Concrete scenario 1]
- [Concrete scenario 2]
- When user mentions: [domain keywords]

## Do not use this skill when
- [Out-of-scope domain 1]
- [Out-of-scope domain 2]

## Instructions
1. [First step: clarify goals and constraints]
2. [Second step: execute with measurable criteria]
3. [Third step: validate and deliver]
4. If detailed examples are required, open `resources/playbook.md`.

## Capabilities

### [Competency Module 1]
- [Specific capability with technical detail]
- [Specific capability with technical detail]

### [Competency Module 2]
- [Specific capability with technical detail]

## Behavioral Traits
- [How to reason or prioritize in ambiguous situations]
- [Design principle that guides decisions]

## Example Interactions
- "[Typical request 1]"
- "[Typical request 2]"

## Code / Output Style

[Real example of high-quality output with an explanatory comment]
```

---

## Do zero à primeira skill: o caminho mais curto

**Passo 1: escolha um domínio onde você repete trabalho**
O sinal claro de que algo precisa de uma skill: você já copiou o mesmo bloco de instrução mais de três vezes em uma semana.

**Passo 2: documente sua expertise, não o que você quer que a IA faça**
A melhor skill captura como *você* pensa ao abordar o problema. Quais critérios você usa pra julgar um resultado bom? Quais erros você já evita de forma automática? Quais trade-offs você avalia antes de qualquer decisão? Isso é o que vai no corpo da skill.

**Passo 3: comece pequeno e itere**
Uma skill de 60 linhas que dispara corretamente e entrega resultados consistentes vale muito mais do que uma skill de 400 linhas que o modelo interpreta de forma errática. Comece com o mínimo que produz um resultado notavelmente melhor. Adicione complexidade só quando o comportamento atual estiver estável.

**Passo 4: valide com `/skills list` e `/skills info`**
Antes de confiar que funciona, confirme que a skill foi detectada e que o `name` bate com a pasta. Muita skill "que não funciona" nunca foi descoberta.

---

Skills são o elo que fecha o ciclo iniciado pelas Custom Instructions. Se as instruções definem quem o Copilot é no seu projeto, as skills definem o que ele consegue fazer quando o assunto muda. Juntas, elas transformam uma IA genérica num parceiro que tem tanto o contexto do projeto quanto a expertise especializada pra cada tipo de tarefa.

O repositório [awesome-copilot](https://github.com/github/awesome-copilot) tem uma biblioteca de skills da comunidade pra você explorar, usar como referência e adaptar ao seu contexto. É o ponto de partida mais rápido pra quem quer ver skills de alta qualidade funcionando antes de escrever a primeira.

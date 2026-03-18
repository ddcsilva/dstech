---
title: 'Como fazer o Copilot entender seu projeto de verdade'
description: 'O Copilot é poderoso, mas genérico. Então você descobre que pode moldá-lo ao seu contexto, e tudo muda. Entenda como Custom Instructions transformam uma IA generalista num parceiro que já conhece sua arquitetura, seus padrões e até suas manias.'
pubDate: '2026-03-17'
tags: ['github-copilot', 'ia', 'produtividade', 'devtools', 'arquitetura']
draft: false
---

Estou lendo o livro **The GitHub Copilot Handbook**, do Rob Bos e Randy Pagels, e logo no prefácio a April Yoho escreveu algo que me fez refletir bastante: *"A IA não está aqui para nos substituir, ela está aqui para nos amplificar... para nos dar espaço para focar em design, arquitetura e inovação, ou seja, as coisas que tornam a engenharia verdadeiramente humana."*

Essa frase parece simples. Mas ela carrega um diagnóstico preciso do momento que estamos vivendo.

---

Você já pediu pro Copilot gerar um teste unitário e ele devolveu em Karma/Jasmine, sendo que o projeto ainda já está em Jest? Ou gerou um componente dependente de NgModule, quando sua codebase já está toda em standalone com signals e APIs modernas?

Se sim, parabéns: você experimentou a **dívida de edição**. Aquele tempo invisível que você gasta corrigindo, adaptando e reformulando sugestões da IA que eram tecnicamente corretas, mas completamente fora do contexto do seu projeto.

Essa dor não precisa existir. E a solução não é um prompt mais longo.

---

## Copilot genérico vs Copilot com contexto

A maioria dos devs usa o Copilot como um autocompletar sofisticado. Aceita a sugestão, ajusta o que não encaixa, segue em frente. Funciona? Funciona. Mas é como dirigir um carro esportivo sempre na primeira marcha.

A transição para um Copilot que realmente entende o seu projeto acontece quando você descobre as **Custom Instructions**, que são arquivos de configuração que funcionam como um **System Prompt persistente**. Enquanto um prompt de chat é volátil e morre no fim da conversa, as instruções moldam o comportamento da IA de forma contínua.

Pense assim: em vez de repetir "use TypeScript com aspas simples e retornos antecipados" toda vez que abre o chat, você escreve isso uma vez, num arquivo, e o Copilot já nasce sabendo. Toda sugestão, toda geração de código, toda review passa por esse filtro.

É a diferença entre explicar seu projeto do zero pra um estagiário a cada segunda-feira, e ter um colega que já leu a documentação inteira e conhece as convenções do time.

---

## Os três níveis: Personal, Repository e Organization

As instruções não são um bloco monolítico. O GitHub organizou uma hierarquia em camadas que faz sentido pra times de qualquer tamanho.

### Organization (a camada de governança)

Configurada pela liderança técnica da empresa. Aqui entram as diretrizes de segurança corporativa, conformidade e restrições legais. Coisas do tipo: *"Nunca exponha chaves de API em logs"* ou *"Todo endpoint deve validar autenticação"*. São os guardrails que ninguém pode ignorar.

### Repository (a camada do projeto)

Aqui mora o coração técnico. É onde você descreve o stack, os padrões arquiteturais e as convenções que todo código daquele repositório deve seguir. Essa camada tem três sabores:

- **Globais** (`.github/copilot-instructions.md`): padrões válidos pra todo o projeto. *"Use Angular 17+ com standalone components e signals como padrão. Evite NgModules. Utilize RxJS apenas quando necessário. Priorize composição e APIs reativas."*

- **Por caminho** (`.github/instructions/*.instructions.md`): regras aplicadas apenas a pastas ou extensões específicas. Essencial pra **monorepos**, onde o `/backend` em .NET e o `/frontend` em Angular exigem diretrizes completamente diferentes.

- **Agentes** (`AGENTS.md`): instruções exclusivas para quando a IA opera no modo de agente autônomo.

### Personal (a camada do dev)

Suas preferências individuais. Estilo de código, idioma das explicações, nível de verbosidade. *"Responda em português"*, *"Explique um conceito por vez"*, *"Use camelCase para variáveis"*.

---

> **A regra de ouro da precedência:** quando existe conflito, a ordem é **Personal > Repository > Organization**. Suas preferências pessoais têm a palavra final, mas espera-se que as instruções de cada camada sejam projetadas para serem complementares, não conflitantes.

---

## Instruções vs. Habilidades: quando usar cada uma

Essa distinção é sutil, mas muda completamente a eficiência do seu setup. Confundir os dois é o erro mais comum que arquitetos cometem ao configurar o Copilot pela primeira vez.

### Instruções: o que a IA deve saber sempre

São diretrizes globais, ativas o tempo todo. Pense nelas como o código de conduta do projeto.

```markdown
<!-- .github/copilot-instructions.md -->
- Use retornos antecipados (early returns)
- Priorize funções puras sempre que possível
- Testes seguem o padrão AAA (Arrange-Act-Assert)
- Nomes de variáveis em camelCase
- Componentes React são sempre funcionais, nunca classes
```

### Habilidades (Skills): o que a IA carrega sob demanda

São pastas de instruções e scripts que o Copilot só injeta no contexto quando julga necessário. Cada habilidade tem um `SKILL.md` com um bloco de metadados no topo (frontmatter) explicando pra que ela serve e quando deve ser usada.

A vantagem? **Janela de contexto otimizada.** Em vez de sobrecarregar a IA com 47 regras sobre migração de banco de dados quando o dev está escrevendo CSS, a habilidade de migração só aparece quando a tarefa envolve banco de dados.

- **Habilidades de Projeto:** ficam versionadas no repositório (ex:`.github/skills`)
- **Habilidades Pessoais:** ficam locais na sua máquina (ex: `~/.copilot/skills`)

A analogia que funciona pra mim: instruções são como a placa de regras do escritório, aquelas que todo mundo vê o tempo todo. Habilidades são como manuais técnicos na estante, que você só puxa quando precisa resolver um problema específico.

![Comparação visual entre Instruções e Habilidades: à esquerda uma placa com "Regras do Time", à direita uma estante com livros técnicos, mostrando o conceito de directives globais versus recursos sob demanda.](/images/blog/instrucoes-vs-habilidades.png)

---

## Instruções por caminho: a arma secreta dos monorepos

Se você trabalha num monorepo, isso aqui muda o jogo.

Imagine um projeto com `/backend` em .NET e `/frontend` em Angular. Sem instruções por caminho, a IA recebe regras dos dois mundos ao mesmo tempo e mistura tudo.
Já vi o Copilot sugerir padrão de backend dentro de componente Angular, ou até estruturar código frontend com mentalidade de controller.

Com instruções por caminho, cada contexto recebe suas próprias regras:

```yaml
# .github/instructions/backend.instructions.md
---
applyTo: backend/**/*.cs
---
- Use arquitetura baseada em camadas (Domain, Application, Infrastructure)
- Controllers devem ser finos, delegando lógica para Application
- Use DTOs para entrada e saída, nunca exponha entidades de domínio
- Prefira async/await e evite bloqueios síncronos
```

```yaml
# .github/instructions/frontend.instructions.md
---
applyTo: src/**/*.ts
---
- Use Angular 17+ com standalone components
- Prefira signals para estado local e comunicação reativa
- Evite NgModules
- Organização por feature (feature-based structure)
- Estilização com Tailwind CSS
```

A sintaxe é Glob no frontmatter YAML.
`backend/**/*.cs` significa: aplique essas regras para qualquer arquivo `.cs` dentro da pasta `backend`, em qualquer nível de profundidade.

O resultado é simples:
a IA passa a respeitar o contexto do arquivo que você está editando.

É como se cada parte do seu monorepo tivesse seu próprio Copilot, mas alinhado com o stack, as regras e a arquitetura daquele pedaço do sistema.

---

## Prompt Files: catálogos de tarefas reutilizáveis

Além das instruções, existe um recurso que poucos exploram: os **arquivos `.prompt.md`**. Eles são mais do que templates: são fluxos de trabalho completos, reutilizáveis e compartilháveis com o time.

```markdown
<!-- .github/prompts/api-security-review.prompt.md -->
Analise o código alterado neste PR e verifique:
1. Todos os endpoints validam autenticação?
2. Inputs do usuário são sanitizados antes de queries?
3. Dados sensíveis estão sendo logados?
4. Rate limiting está configurado em rotas públicas?

Consulte as diretrizes em #file:docs/security-guidelines.md
```

Repare no `#file:`: essa sintaxe injeta automaticamente o conteúdo de outro arquivo no prompt. Você pode anexar documentações, guias de arquitetura, ADRs, qualquer referência que a IA precise pra fazer um trabalho preciso.

Pense nesses arquivos como receitas da equipe. Um dev novo chega, abre o catálogo de prompts e já sabe como fazer uma review de segurança, como gerar testes de integração ou como documentar uma API, tudo seguindo exatamente os padrões do time.

> **Nota de compatibilidade:** arquivos `.prompt.md` atualmente funcionam no **VS Code, Visual Studio e JetBrains IDEs**. Se você usa Vim, Neovim ou Xcode, esse recurso ainda não tem suporte nativo.

---

## A arte de escrever instruções que funcionam

Aqui é onde a maioria dos times tropeça. Instruções vagas produzem sugestões vagas. A IA é poderosa, mas não lê mentes: ela preenche lacunas com suposições, e suposições erradas custam tempo.

Escrever boas instruções é, no fundo, **engenharia de software em linguagem natural**. E como toda boa engenharia, segue princípios claros:

### 1. Visão geral primeiro

Defina o propósito do projeto, o domínio de negócio e os objetivos. Não faz diferença se a IA "entende" o contexto do negócio: ela usa como filtro para decisões técnicas.

### 2. Estrutura e arquitetura

Descreva a árvore de diretórios relevante e ancore a IA aos padrões do projeto. *"Este projeto segue Domain-Driven Design. A camada de domínio nunca importa da camada de infraestrutura."*

### 3. Stack com versões exatas

Não diga só *"use Angular"*. Seja específico:
*"Angular 17+, standalone components, signals como padrão. Evite NgModules."*

A versão importa. Sem isso, a IA pode sugerir APIs antigas ou padrões que seu projeto já abandonou.

### 4. Curto, direto, imperativo

Em vez de: *"Seria bom tentar escrever código limpo e organizado"*

Escreva: *"Use retornos antecipados. Variáveis em camelCase. Máximo de 20 linhas por função."*

Cada instrução deve ser uma **declaração autocontida**. Se levar mais de uma frase pra explicar, provavelmente é densa demais pra uma instrução e deveria virar uma habilidade.

---

## Na prática: o antes e o depois

O contraste entre ter e não ter instruções configuradas é brutal. Dois cenários reais que ilustram a diferença:

### Cenário 1: Geração de testes

**Sem instruções:** Você pede *"Crie um teste pra essa função"*. O Copilot gera um teste com uma abordagem diferente da do projeto. Funciona? Tecnicamente, sim. Mas seu projeto usa Jest com `describe/it` e padrão `AAA`. Você gasta 5 minutos adaptando.

**Com instruções:** O mesmo pedido gera um teste em Jest, com blocos `describe` e `it`, e com as etapas de preparação, ação e verificação bem definidas. Pronto pro commit.

Cinco minutos por teste. Dez testes por dia. Uma hora economizada. Toda semana.

### Cenário 2: Code Review local (Shift-Left)

Com instruções de estilo documentadas como *"use aspas simples"*, *"imports absolutos"* e *"evite any no TypeScript"*, você pode pedir uma revisão local antes de abrir o PR.

A IA cruza as regras do repositório com as mudanças atuais e aponta desvios de padrão na hora. Aquelas discussões triviais de formatação no Pull Request? Desaparecem. O tempo dos revisores humanos fica livre pra discutir arquitetura e lógica de negócio, que é onde o valor real está.

![Diagrama comparativo: Code Review Inteligente - O Impacto das Custom Instructions. Lado esquerdo mostra "Sem Instructions" com tempo perdido. Lado direito mostra "Com Instructions" com eficiência máxima.](/images/blog/code-review-impacto-custom-instructions.png)

---

## O ecossistema avançado: Agentes e MCP

Se as instruções são o presente, os agentes e o MCP são o futuro que já está batendo na porta.

### Agent Mode vs. Coding Agent

O Copilot não é mais só um assistente de chat. Ele agora opera em dois modos de agente:

- **Agent Mode:** roda dentro do IDE. Ideal pra automação iterativa: ele propõe, executa, testa e corrige, tudo no seu ambiente local, com você acompanhando em tempo real.

- **Coding Agent:** roda de forma assíncrona no GitHub.com. Ele provisiona uma **sandbox efêmera** baseada em GitHub Actions, com firewall e isolamento completo, pra explorar o código, rodar testes e implementar mudanças. O resultado? Pull Requests criados autonomamente a partir de Issues.

A parte que me impressiona na arquitetura de segurança: o Coding Agent só faz push em branches isoladas (`copilot/*`) e opera como um colaborador externo. Ele é **incapaz de aprovar seus próprios PRs**. O ciclo de revisão humana é inviolável por design.

### Model Context Protocol (MCP)

O **MCP** é o padrão aberto que conecta a IA a dados, APIs e ferramentas externas como Jira, Slack, Azure e bancos de dados.

Pra governança em escala, arquitetos podem definir um **MCP Registry** (uma allowlist centralizada de servidores) e customizar **Toolsets**, controlando exatamente quais ferramentas a IA pode acessar. Isso otimiza tanto o consumo de tokens quanto a superfície de ataque.

Por padrão, o servidor MCP do GitHub usa um token de **leitura estrita (read-only)** limitado ao repositório atual. A IA pode ler, mas não pode escrever nem sair do repositório sem autorização explícita.

![Diagrama de arquitetura do ecossistema de IA: GitHub Copilot no centro, cercado pelas camadas de Instructions, Agentes e MCP conectado a ferramentas externas como Jira, Slack e Azure.](/images/blog/arquitetura-do-ecossistema-de-ia.png)

---

## Os limites que você precisa conhecer (e os anti-padrões pra evitar)

Toda ferramenta poderosa tem arestas. E a honestidade sobre os limites é tão importante quanto o entusiasmo sobre as capacidades.

### O limite de 4.000 caracteres

Existe uma restrição de leitura de instruções que se aplica **exclusivamente ao Copilot Code Review**. O Chat e os Agentes de Codificação não têm essa limitação. Se suas instruções estão sendo truncadas, provavelmente é porque você está usando Code Review com um arquivo de instruções muito extenso.

### Saturação de contexto

Carregar instruções com detalhes irrelevantes não é inofensivo: é ativamente prejudicial. Modelos saturados sofrem de uma espécie de *amnésia seletiva*: começam a ignorar diretrizes críticas e a contradizer regras que você impôs explicitamente.

A lógica é simples: se tudo é prioridade, nada é prioridade. O modelo tem uma janela de contexto finita. Cada token gasto com uma regra irrelevante é um token a menos para uma regra que importa.

### Soluções "ocas" (Reward Hijacking)

Esse é o mais traiçoeiro. A IA quer completar a tarefa, e é literalmente pra isso que ela foi treinada. Em cenários ambíguos, ela pode forçar uma solução que *parece* funcionar: omitindo tratamento de erros complexos ou gerando testes com valores hardcoded que sempre passam.

O teste que passa com `expect(true).toBe(true)` é o equivalente moderno de fazer um `// TODO: fix later` e nunca voltar.

### O ciclo de "dois passos pra trás"

Usar a IA pra adivinhar a correção de um bug sem entender a causa raiz gera um efeito cascata de novos erros. Cada correção cega introduz uma regressão. A IA é excelente pra *implementar* correções, mas o *diagnóstico* ainda precisa ser humano, ou pelo menos guiado pelo humano com contexto do problema.

---

## Recomendações para adoção em escala

Se você lidera um time e quer sair do cenário de "cada dev usa o Copilot do seu jeito" pra algo estruturado, aqui vai um roteiro que funciona:

### 1. Plante a base de governança

Comece com um `.github/copilot-instructions.md` que reflita os padrões de segurança, restrições técnicas e convenções arquiteturais da empresa. Não tente cobrir tudo de uma vez: comece com as 10 regras que, se todo código seguisse, já eliminaria 80% das discussões em PR.

### 2. Use prompt files para onboarding

Crie arquivos `.prompt.md` para os fluxos mais comuns: *"como criar um novo endpoint"*, *"como adicionar uma migration"*, *"como rodar a suite de testes"*. O dev novo executa o prompt e recebe um guia passo a passo que já segue os padrões do time. Reduz o tempo de rampa drasticamente.

### 3. Estruture o treinamento em fases

Não jogue o Agent Mode nas mãos de alguém que ainda não domina o chat. A progressão natural é:

1. **Inline Suggestions**: aceitar e ajustar sugestões em tempo real
2. **Chat**: fazer perguntas e pedir geração de código contextualizada
3. **Agent Mode**: automação iterativa com supervisão

Cada fase constrói a confiança e a calibragem necessárias pra usar a próxima de forma eficiente.

### 4. Crie uma comunidade interna

Hackathons, sessões semanais de Q&A, newsletters internas com dicas. Identifique os **Copilot Champions**, aqueles devs que naturalmente experimentam e compartilham o que descobrem. Formalize esse papel. O conhecimento que fica numa conversa de Slack morre em dois dias; o que é consolidado numa wiki interna vira patrimônio do time.

### 5. Meça o que importa

Acompanhe a adoção pelos **Copilot Metrics Dashboards**, mas resista à tentação de medir só volume de código gerado. Foque em métricas de valor e fluidez: tempo até o primeiro commit, frequência de retrabalho em PRs, satisfação do desenvolvedor. A IA não está lá pra gerar mais linhas: está lá pra gerar as linhas certas, mais rápido.

![Roadmap de adoção de IA em 5 etapas: Base de Governança, Prompt Files de Onboarding, Treinamento em Fases, Comunidade Interna e Métricas de Impacto.](/images/blog/roadmap-de-adocao-de-ia.png)

---

## A hierarquia completa num olhar

Para referência rápida, aqui está como tudo se conecta:

| Nível | Arquivo / Local | Foco | Quem configura |
| ----- | --------------- | ---- | -------------- |
| **Organization** | Configurações da Org no GitHub | Segurança, conformidade, restrições legais | Liderança técnica |
| **Repository (Global)** | `.github/copilot-instructions.md` | Stack, padrões, arquitetura do projeto | Tech Lead / Time |
| **Repository (Path)** | `.github/instructions/*.instructions.md` | Regras por pasta/extensão (monorepos) | Tech Lead / Time |
| **Repository (Agent)** | `AGENTS.md` | Comportamento do modo agente | Tech Lead / Time |
| **Skills** | `.github/skills/` ou `~/.copilot/skills/` | Tarefas especializadas sob demanda | Time ou Dev individual |
| **Prompt Files** | `.github/prompts/*.prompt.md` | Fluxos de trabalho reutilizáveis | Time |
| **Personal** | Configurações do GitHub.com | Preferências individuais do dev | Cada desenvolvedor |

---

## O que isso tudo significa na prática

As Custom Instructions são o **tecido conectivo** entre a inteligência da IA e o rigor técnico da sua equipe. Elas garantem que velocidade e automação não sacrifiquem padronização.

Mas, longe de serem arquivos estáticos que você configura uma vez e esquece, elas devem ser tratadas como **documentação viva**. Evoluem com o projeto. Capturam novos padrões. Refletem aprendizados arquiteturais. Quando alguém do time descobre que uma regra está faltando, ela é adicionada e, a partir daquele momento, toda sugestão da IA já incorpora esse conhecimento.

Ao dominar essa configuração, o papel do desenvolvedor muda. Deixamos de ser revisores de sintaxe da IA para nos tornarmos **orquestradores de contexto**, profissionais que sabem exatamente o que a máquina precisa saber pra entregar valor desde a primeira sugestão.

E isso levanta a mesma provocação que vale pra qualquer ferramenta poderosa: o diferencial não está em quem tem o Copilot, mas em **quem soube ensiná-lo**.

Porque, no final das contas, a regra de ouro continua a mesma: **é um Copilot, não um Autopilot**. A IA acelera, inspira e automatiza. Mas o julgamento crítico, a liderança e o voo continuam, de forma inegociável, nas mãos do engenheiro humano.

---

Se esse post abriu apetite pra ir mais a fundo, o próximo passo natural é explorar as Skills. Custom Instructions definem o que o Copilot sabe sobre o seu projeto. Skills definem o que ele consegue *fazer*, com precisão de especialista, quando o assunto muda. A arquitetura de carregamento progressivo, os gatilhos de ativação, os anti-padrões que destroem o contexto. Escrevi sobre tudo isso em [Como escrever Skills para IA que realmente funcionam](/blog/como-escrever-skills-para-ia-que-realmente-funcionam).

---

**Referências:**

- [**The GitHub Copilot Handbook**](https://www.amazon.com.br/GitHub-Copilot-Handbook-programming-collaboration-ebook/dp/B0FLXL6HL2), de Rob Bos e Randy Pagels
- [**Learning GitHub Copilot**](https://www.amazon.com.br/Learning-GitHub-Copilot-Multiplying-Productivity-ebook/dp/B0FHSDHRFF), de Brent Laster
- [**GitHub Docs**](https://docs.github.com/pt/copilot): Personalização de respostas, Habilidades de agente, Model Context Protocol
- [**Visual Studio Code**](https://www.youtube.com/@code): Canal oficial do YouTube (demonstrações de Custom Instructions)

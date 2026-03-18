# Análise do Projeto DStech

> Documento de revisão técnica gerado em 17/03/2026.  
> Última atualização: 18/03/2026 — com status de implementação.  
> Cobre: bugs encontrados, melhorias de código/UX, novas features e sugestões estratégicas.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Problemas Encontrados (Bugs)](#problemas-encontrados-bugs)
3. [Melhorias](#melhorias)
4. [Features Sugeridas](#features-sugeridas)
5. [Sugestões Estratégicas](#sugestões-estratégicas)
6. [Status de Implementação](#status-de-implementação)

---

## Visão Geral

| Item              | Detalhe                                              |
| ----------------- | ---------------------------------------------------- |
| Framework         | Astro 5.17.1 (SSG)                                   |
| CSS               | Tailwind CSS v4 (via `@tailwindcss/vite`)            |
| TypeScript        | Strict mode — `astro/tsconfigs/strict`               |
| Páginas           | Home, Sobre, Projetos, CV, Blog, Contato             |
| Features avançadas| OG Images dinâmicas (Satori), RSS Feed, Sitemap      |
| Dados             | JSON estático (projetos, skills, experiência, etc.)  |
| Posts publicados  | 2                                                    |
| Deploy target     | `https://dstech.net.br`                              |

O projeto está bem estruturado para um portfólio pessoal: SEO cuidado, acessibilidade presente (skip-link, ARIA, focus-visible), e componentes reutilizáveis razoavelmente bem isolados. Os problemas abaixo são oportunidades de evolução, não indicadores de má qualidade.

---

## Problemas Encontrados (Bugs)

### 🔴 Crítico

#### 1. Imagens de projetos não existem (`public/images/projects/` vazio) — ⏳ PENDENTE (requer ação manual)

**Arquivo:** `src/data/projects.json` e `src/components/projects/ProjectCard.astro`  
**Problema:** Todos os projetos referenciam imagens como `/images/projects/squad-poker.webp`, `/images/projects/virtus.webp`, etc., mas a pasta `public/images/projects/` está completamente vazia. Todas as imagens de projeto retornam 404.  
**Impacto:** Visual quebrado nas páginas de projetos e na home (projetos em destaque).  
**Correção:** Adicionar as imagens correspondentes à pasta `public/images/projects/` ou remover o campo `image` dos projetos que ainda não têm imagem real.

---

#### 2. Fetch externo ao Google Fonts durante geração de OG images (sem cache/fallback) — ✅ CORRIGIDO

**Arquivo:** `src/utils/og-image.ts` — função `loadGoogleFont`  
**Problema:** A cada geração de OG image (build), a função faz duas requisições HTTP ao Google Fonts para baixar Inter Bold e Inter Regular. Não há cache local, nenhum fallback e nenhum tratamento de erro robusto. O build quebrará em ambientes sem acesso à internet (CI/CD sem rede, Docker isolado).  
**Impacto:** Build instável e lento; possível falha silenciosa ou erro explícito no CI.  
**Correção sugerida:** Baixar as fontes e guardá-las em `public/fonts/` (ou `src/assets/fonts/`), depois lê-las com `fs.readFile` no `og-image.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const interBold = readFileSync(join(__dirname, '../../public/fonts/Inter-Bold.ttf'));
const interRegular = readFileSync(join(__dirname, '../../public/fonts/Inter-Regular.ttf'));
```

---

### 🟠 Importante

#### 3. Feed RSS não é autodetectado por browsers e leitores de feed — ✅ CORRIGIDO

**Arquivo:** `src/components/seo/BaseHead.astro`  
**Problema:** Embora o RSS exista em `/rss.xml`, o `<head>` não possui a tag `<link rel="alternate">` que permite browsers e leitores de feed detectarem automaticamente o RSS do site.  
**Impacto:** Usuários e agregadores que testam autodetecção de RSS não encontram o feed.  
**Correção:** Adicionar ao `BaseHead.astro`:

```html
<link rel="alternate" type="application/rss+xml" title="DStech Blog | Danilo Silva" href="/rss.xml" />
```

---

#### 4. Botão "Baixar PDF" com `href="#"` na página de CV — ✅ CORRIGIDO

**Arquivo:** `src/pages/cv.astro`  
**Problema:** O botão "Baixar PDF (em breve)" usa `href="#"`, o que causa scroll para o topo da página ao clicar e é considerado uma prática ruim de UX/acessibilidade. Leitores de tela anunciam um link não funcional.  
**Impacto:** UX confusa e problema de acessibilidade.  
**Correção:** Enquanto o PDF não está disponível, usar um `<button>` desabilitado com `disabled` ou `aria-disabled="true"` em vez de `<a href="#">`, ou simplesmente remover o botão até o PDF estar pronto.

---

#### 5. Fonte `JetBrains Mono` declarada mas nunca carregada — ✅ CORRIGIDO

**Arquivo:** `src/styles/global.css`  
**Problema:** `--font-mono: 'JetBrains Mono', ui-monospace, monospace;` está definida no tema, mas não há nenhuma `<link>` para Google Fonts ou arquivo local da fonte. O resultado é que blocos de código no blog usam o fallback `ui-monospace` sem aviso.  
**Impacto:** Experiência visual inconsistente nos posts; a fonte anunciada nunca é renderizada.  
**Correção:** Adicionar o carregamento da fonte ao `BaseHead.astro`, ou substituir `JetBrains Mono` por uma fonte mono disponível no stack atual.

---

#### 6. Path alias `@utils/*` ausente no `tsconfig.json` — ✅ CORRIGIDO

**Arquivo:** `tsconfig.json`  
**Problema:** Existem aliases para `@components/*`, `@layouts/*`, `@data/*` e `@types/*`, mas não para `@utils/*`. Por isso, `reading-time.ts` e `og-image.ts` são importados com caminhos relativos (`../../utils/...`) em vez do padrão consistente dos demais aliases.  
**Impacto:** Inconsistência e risco de caminhos quebrados ao mover arquivos.  
**Correção:** Adicionar ao `tsconfig.json`:

```json
"@utils/*": ["src/utils/*"]
```

---

#### 7. Tags do blog exibidas como texto não clicável — ✅ CORRIGIDO

**Arquivos:** `src/pages/blog/index.astro`, `src/layouts/BlogLayout.astro`  
**Problema:** As tags são renderizadas como `<span>` estáticos, tanto na listagem do blog quanto no rodapé dos posts. Não existe rota `/blog/tags/[tag]` para filtrar posts por tecnologia.  
**Impacto:** Usuários não conseguem explorar posts por tópico; a navegação por tags é uma expectativa comum em blogs técnicos.  
**Correção:** Criar `src/pages/blog/tags/[tag].astro` com `getStaticPaths` filtrando posts por tag, e transformar os `<span>` de tags em `<a href="/blog/tags/{tag}">`.

---

#### 8. Email exposto diretamente no HTML da página de Contato — ✅ CORRIGIDO

**Arquivo:** `src/pages/contato.astro`  
**Problema:** O email `danilo.silva@msn.com` aparece em texto claro como `href="mailto:danilo.silva@msn.com"`. Bots de scraping de email vasculham o HTML de páginas públicas para coletar endereços para spam.  
**Impacto:** Aumento de spam no email pessoal ao longo do tempo.  
**Mitigação sugerida:** Substituir por um formulário de contato (ver Features), ou ofuscar levemente o email usando entidades HTML ou JavaScript para montar o endereço em runtime.

---

### 🟡 Menor

#### 9. `article:modified_time` não emitido quando `updatedDate` existe — ✅ CORRIGIDO

**Arquivo:** `src/components/seo/BaseHead.astro`  
**Problema:** O `BlogLayout` recebe `updatedDate` e o exibe na UI, mas o `BaseHead` não propaga esse dado para a meta tag `article:modified_time` do Open Graph.  
**Impacto:** Ferramentas e plataformas que consomem OG tags de artigos (Facebook, LinkedIn) não sabem que o artigo foi atualizado.

---

#### 10. `twitter:creator` e `twitter:site` ausentes no BaseHead — ⏳ PENDENTE (requer handle do Twitter/X)

**Arquivo:** `src/components/seo/BaseHead.astro`  
**Problema:** As meta tags do Twitter Cards estão presentes mas incompletas. `twitter:creator` e `twitter:site` permitem que o Twitter/X atribua o card ao handle correto do autor.  
**Correção:** Adicionar (caso o autor tenha conta no Twitter/X):

```html
<meta name="twitter:creator" content="@seu_handle" />
<meta name="twitter:site" content="@seu_handle" />
```

---

## Melhorias

### Código e Arquitetura

#### 1. SVGs de ícones duplicados em múltiplos componentes — ✅ IMPLEMENTADO

**Arquivos afetados:** `Header.astro`, `Footer.astro`, `index.astro`, `sobre.astro`, `cv.astro`, `contato.astro`, `BlogLayout.astro`  
**Problema:** Os mesmos SVGs (LinkedIn, GitHub, setas, calendário, relógio, etc.) são copiados inline em cada arquivo. Qualquer correção ou ajuste precisa ser replicada em todos os lugares.  
**Sugestão:** Criar `src/components/common/Icon.astro` com um prop `name` e renderizar o SVG correto, eliminando a duplicação:

```astro
<!-- Icon.astro -->
---
interface Props {
  name: 'linkedin' | 'github' | 'arrow-left' | 'clock' | 'calendar' | ...;
  class?: string;
}
---
```

---

#### 2. Imagens de projetos sem otimização do Astro — ⏳ PENDENTE (depende de imagens reais)

**Arquivo:** `src/components/projects/ProjectCard.astro`  
**Problema:** As imagens de projetos provavelmente usam `<img>` convencional sem o componente `<Image>` do Astro. O componente nativo do Astro gera automaticamente formatos modernos (WebP/AVIF), aplica lazy loading, define `width/height` para evitar layout shifts (CLS) e reduz o peso da imagem.  
**Sugestão:** Substituir por `import { Image } from 'astro:assets'` quando as imagens forem adicionadas.

---

#### 3. Velocidade de leitura subestimada em `reading-time.ts` — ✅ IMPLEMENTADO

**Arquivo:** `src/utils/reading-time.ts`  
**Problema:** O cálculo usa 200 WPM. A média de leitura para conteúdo técnico em português é de aproximadamente 250–300 WPM. Com 200 WPM, o tempo estimado é superestimado em ~25–50%, o que pode desestimular a leitura.  
**Sugestão:** Ajustar para 250 WPM:

```ts
return Math.max(1, Math.ceil(words / 250));
```

---

#### 4. Google Fonts carregado via CDN externo (privacidade e performance) — ✅ IMPLEMENTADO

**Arquivo:** `src/components/seo/BaseHead.astro`  
**Problema:** Carregar fontes de `fonts.googleapis.com` implica uma requisição a servidores do Google para cada visita, o que expõe o IP do usuário a terceiros. Isso é uma preocupação de privacidade (LGPD/GDPR) e adiciona uma dependência de rede externa crítica.  
**Sugestão:** Usar [Fontsource](https://fontsource.org/) para auto-hospedar a Inter:

```bash
npm install @fontsource-variable/inter
```

E no `global.css`:
```css
@import '@fontsource-variable/inter';
```

---

#### 5. Seções sem `aria-labelledby` associando título à `<section>` — ✅ IMPLEMENTADO

**Arquivo:** `src/components/common/Section.astro`  
**Problema:** O componente `Section` gera um `<section>` com um `<h2>` interno, mas não usa `aria-labelledby` para conectar o título à seção. Isso reduz a qualidade da navegação por landmarks para usuários de leitores de tela.  
**Sugestão:** Gerar um `id` automático e associar:

```astro
const titleId = title ? `section-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;
```

```html
<section aria-labelledby={titleId}>
  <h2 id={titleId}>{title}</h2>
```

---

#### 6. Histórico de experiência truncado sem opção de expandir — ⏳ PENDENTE

**Arquivo:** `src/pages/cv.astro`  
**Problema:** `TimelineItem` mostra até 8 tecnologias com badge `+N` para o restante, mas não há como o usuário expandir e ver todas. O mesmo se aplica à Timeline na página "Sobre" que, se tiver `limit`, esconde experiências sem link para ver mais.  
**Sugestão:** Adicionar um botão "Ver mais" controlado por JavaScript, ou linkar ao CV completo.

---

### Performance e SEO

#### 7. Falta `view transitions` para navegação suave — ✅ IMPLEMENTADO

**Arquivo:** `astro.config.mjs`  
**O Astro tem suporte nativo a View Transitions API.** Ativá-las em um site SSG é trivial e melhora significativamente a percepção de performance entre páginas:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ...
});
```

E no `BaseLayout.astro`:
```astro
import { ViewTransitions } from 'astro:transitions';
// ...
<ViewTransitions />
```

---

#### 8. Sitemap sem configuração de prioridade ou changefreq — ✅ IMPLEMENTADO

**Arquivo:** `astro.config.mjs`  
**Problema:** O `@astrojs/sitemap` usa valores padrão para todas as páginas. Páginas como `/blog/[slug]` (conteúdo frequentemente atualizado) e `/` (mais relevante) deveriam ter `changefreq` e `priority` diferenciados para orientar melhor os crawlers.  
**Sugestão:**

```js
sitemap({
  filter: (page) => !page.includes('/og/'),
  changefreq: 'weekly',
  priority: 0.7,
  lastmod: new Date(),
})
```

---

## Features Sugeridas

### Alta Prioridade

#### 1. Página 404 personalizada — ✅ IMPLEMENTADO

**Arquivo a criar:** `src/pages/404.astro`  
Sem uma página 404 customizada, o Astro serve uma página genérica que quebra o layout do site. Uma 404 no padrão do site com links para as páginas principais melhora UX e SEO.

---

#### 2. Download de CV em PDF — ⏳ PENDENTE

**Arquivo afetado:** `src/pages/cv.astro`  
O botão "Baixar PDF" já existe mas está desativado. Opções de implementação:
- **Hospedagem direta:** Gerar um PDF do CV (Canva, Word, etc.) e servir de `public/cv-danilo-silva.pdf`.
- **Geração dinâmica:** Usar `puppeteer` ou `@react-pdf/renderer` para gerar via API Route (requer SSR ou função serverless).

A opção mais simples e escalável é um PDF estático atualizado manualmente: `<Button href="/cv-danilo-silva.pdf" download>`.

---

#### 3. Formulário de contato funcional — ⏳ PENDENTE

**Arquivo afetado:** `src/pages/contato.astro`  
A página de contato lista apenas links externos. Um formulário simples com nome, email e mensagem melhoraria a conversão de visitantes em contatos.  
Opções gratuitas e sem backend:
- [Formspree](https://formspree.io/) — POST para endpoint deles, zero backend
- [Web3Forms](https://web3forms.com/) — similar ao Formspree, focado em privacidade
- [Resend](https://resend.com/) — para projetos com SSR/Edge function

---

#### 4. Filtro de posts por tag (`/blog/tags/[tag]`) — ✅ IMPLEMENTADO

**Arquivo a criar:** `src/pages/blog/tags/[tag].astro`  
Permitir que usuários cliquem em uma tag e vejam todos os posts com aquela tag. Implementação com `getStaticPaths`:

```ts
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const tags = [...new Set(posts.flatMap((p) => p.data.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: { posts: posts.filter((p) => p.data.tags.includes(tag)) },
  }));
}
```

---

### Média Prioridade

#### 5. Dark mode

**Arquivos afetados:** `src/styles/global.css`, `src/layouts/BaseLayout.astro`  
Desenvolvedores esperam dark mode em sites técnicos. Implementar com:
- CSS custom properties para as cores
- `prefers-color-scheme` via media query para respeito automático à preferência do sistema
- Opcionalmente um toggle com `localStorage` para preferência manual

Como o projeto usa Tailwind v4, a classe `dark:` já está disponível nativamente.

---

#### 6. Tabela de conteúdo (ToC) para posts do blog

**Arquivo afetado:** `src/layouts/BlogLayout.astro`  
Posts longos como os publicados se beneficiam muito de uma ToC lateral ou no topo. O Astro permite extrair os headings do Markdown via `post.render()` que retorna `headings[]`:

```ts
const { Content, headings } = await post.render();
```

---

#### 7. Posts relacionados ao final de cada post

**Arquivo afetado:** `src/pages/blog/[slug].astro`  
Exibir 2–3 posts com tags em comum ao final do post aumenta tempo de sessão e engajamento:

```ts
const relatedPosts = allPosts
  .filter((p) => p.slug !== post.slug && p.data.tags.some((t) => post.data.tags.includes(t)))
  .slice(0, 3);
```

---

#### 8. Botões de compartilhamento nos posts

**Arquivo afetado:** `src/layouts/BlogLayout.astro`  
Adicionar links de compartilhamento ao final de cada post para LinkedIn, X/Twitter e WhatsApp. São links simples com query params, sem necessidade de scripts externos:

```html
<!-- LinkedIn Share -->
<a href="https://www.linkedin.com/sharing/share-offsite/?url={canonicalURL}" target="_blank" rel="noopener noreferrer">
  Compartilhar no LinkedIn
</a>
```

---

#### 9. Progress bar de leitura nos posts

**Arquivo afetado:** `src/layouts/BlogLayout.astro`  
Uma barra de progresso no topo da página que avança conforme o usuário rola o post é um detalhe de UX que enriquece a experiência de leitura. Implementável com ~15 linhas de JavaScript inline.

---

### Baixa Prioridade / Futuro

#### 10. Busca estática com Pagefind

[Pagefind](https://pagefind.app/) é uma biblioteca de busca que indexa o HTML gerado pelo build do Astro e serve resultados 100% no client side, sem backend. Integração com `astro-pagefind` é trivial e funcionaria perfeitamente no modelo SSG do projeto.

---

#### 11. Paginação no blog

**Arquivo afetado:** `src/pages/blog/index.astro`  
Com 2 posts atualmente não é necessário, mas ao atingir 10–15 posts, a página de listagem se tornará longa. O Astro tem suporte nativo a paginação via `paginate()` no `getStaticPaths`.

---

#### 12. Seção "Disponível para oportunidades" na Home

**Arquivo afetado:** `src/pages/index.astro`  
Uma badge ou banner sutil na hero section indicando disponibilidade/abertura a oportunidades aumenta a taxa de conversão de visitantes recrutadores em contatos. Pode ser um dado em `src/data/` para fácil atualização:

```json
// src/data/availability.json
{ "available": true, "message": "Aberto a oportunidades remotas" }
```

---

#### 13. Foto de perfil/avatar

**Arquivos afetados:** `src/pages/index.astro`, `src/pages/sobre.astro`, `src/layouts/BlogLayout.astro`  
Um portfólio pessoal ganha muito em humanização e confiança com uma foto profissional. Sugestão de posicionamento: na hero da Home ao lado do texto, no cabeçalho do "Sobre" e na autoria dos posts do blog.

---

#### 14. Seção de Destaques Profissionais / Métricas na Home

**Arquivo afetado:** `src/pages/index.astro`  
Uma faixa com números concretos aumenta o impacto da hero section:

| Métrica                | Exemplo     |
| ---------------------- | ----------- |
| Anos de experiência    | ~20 anos    |
| Projetos entregues     | +50 projetos|
| Sistemas modernizados  | +10 sistemas|
| Tecnologias dominadas  | +15 tech    |

---

## Sugestões Estratégicas

### 1. Self-host de fontes para conformidade com privacidade

Carregar fontes do Google Fonts implica envio do IP de cada visitante ao Google. Para conformidade com LGPD, o ideal é hospedar as fontes localmente via Fontsource. É uma mudança simples com impacto real.

### 2. Imagem de capa padrão para posts sem imagem específica

Atualmente, posts sem `image` definido usam o OG image dinâmico (gerado pelo Satori). Isso é bom, mas a imagem de capa padrão (`/og-default.png`) é gerada em runtime via API Route, o que a torna dependente de uma requisição. Considere pré-gerar e salvar em `/public/og-default.png` com um script de build.

### 3. Monitoramento de analytics respeitoso à privacidade

Para um portfólio público, saber quais posts e páginas têm mais acesso é valioso. Alternativas sem cookies que respeitam privacidade:
- [Plausible](https://plausible.io/) — pago mas leve e sem cookies
- [Umami](https://umami.is/) — self-hosted, gratuito, open source
- [Fathom](https://usefathom.com/) — similar ao Plausible

### 4. Automação do processo de publicação de posts

Atualmente, publicar um post exige: criar o arquivo `.md`, fazer commit e push. Uma melhoria seria integrar um CMS headless leve como [Decap CMS](https://decapcms.org/) (antigo Netlify CMS) ou [Keystatic](https://keystatic.com/) que funcionam com arquivos locais e permitem edição via UI visual, mantendo os arquivos Markdown no repositório.

### 5. Exportação do CV como componente Astro nativo

A página de CV (`cv.astro`) já renderiza toda a informação profissional a partir dos JSONs de dados. Uma variante dessa página com layout otimizado para impressão (usando `@media print` CSS) poderia substituir a necessidade de manter um PDF separado manualmente.

---

## Resumo Executivo

| Categoria           | Total | ✅ Corrigidos | ⏳ Pendentes | Mais urgente pendente                  |
| ------------------- | ----- | ------------- | ------------ | -------------------------------------- |
| 🔴 Bugs críticos    | 2     | 1             | 1            | Imagens de projetos (ação manual)      |
| 🟠 Bugs importantes | 6     | 5             | 1            | twitter:creator (requer handle)        |
| 🟡 Bugs menores     | 2     | 1             | 1            | twitter:creator                        |
| Melhorias de código | 6     | 4             | 2            | Timeline expandível; otimização de img |
| Melhorias perf/SEO  | 2     | 2             | 0            | —                                      |
| Features prioritárias | 4   | 2             | 2            | Download PDF; formulário de contato    |
| Features médias     | 5     | 0             | 5            | Dark mode; ToC; posts relacionados     |
| Features futuras    | 4     | 0             | 4            | Busca; paginação; disponibilidade      |

---

*Documento gerado com GitHub Copilot a partir de análise estática completa do código-fonte.*

---

## Status de Implementação

> Atualizado em 18/03/2026 — após sessão de implementação automatizada.

### ✅ Implementados nesta sessão

| Item | Tipo | O que foi feito |
|------|------|-----------------|
| Bug #2 | OG fonts | Fontes Inter TTF baixadas para `src/assets/fonts/`, `og-image.ts` agora usa `readFileSync` local |
| Bug #3 | RSS autodiscovery | Adicionado `<link rel="alternate" type="application/rss+xml">` ao `BaseHead.astro` |
| Bug #4 | PDF button | Botão trocado de `href="#"` para `<button>` desabilitado visualmente |
| Bug #5 | JetBrains Mono | Instalado `@fontsource-variable/jetbrains-mono`, importado no `global.css` |
| Bug #6 | Path alias | Adicionado `@utils/*` ao `tsconfig.json` |
| Bug #7 | Tags clicáveis | Criado `src/pages/blog/tags/[tag].astro`; tags agora são `<a>` com hover em blog index, BlogLayout header e footer |
| Bug #8 | Email ofuscado | Email removido do HTML; botão usa JS para construir `mailto:` em runtime |
| Bug #9 | modified_time | `updatedDate` propagado de BlogLayout → BaseLayout → BaseHead; meta tag `article:modified_time` adicionada |
| Melhoria #1 | Icon component | Criado `Icon.astro` com 26 ícones; migrados todos os SVGs inline de 9 componentes/páginas |
| Melhoria #3 | Reading time | Ajustado de 200 WPM para 250 WPM |
| Melhoria #4 | Self-host fonts | Instalado `@fontsource-variable/inter`; removidos 4 links do Google Fonts CDN |
| Melhoria #5 | aria-labelledby | `Section.astro` agora gera `id` automático e associa ao `<section>` via `aria-labelledby` |
| Melhoria #7 | View Transitions | Adicionado `ClientRouter` do Astro ao `BaseLayout.astro`; scripts atualizados com `astro:page-load` |
| Melhoria #8 | Sitemap config | Filtro de `/og/`, `changefreq: 'weekly'`, `priority: 0.7`, `lastmod` configurados |
| Feature #1 | Página 404 | Criado `src/pages/404.astro` com layout consistente e links de navegação |
| Feature #4 | Tags page | Criado `src/pages/blog/tags/[tag].astro` com `getStaticPaths` e contagem de artigos |

### ⏳ Pendentes (requerem ação manual ou decisão do autor)

| Item | Motivo |
|------|--------|
| Bug #1 — Imagens de projetos | Usuário precisa fornecer/criar as imagens reais |
| Bug #10 — twitter:creator | Requer handle do Twitter/X do autor |
| Melhoria #2 — Image optimization | Depende de imagens reais serem adicionadas |
| Melhoria #6 — Timeline expandível | Melhoria de UX que requer decisão de design |
| Feature #2 — PDF do CV | Requer geração/design do PDF |
| Feature #3 — Formulário de contato | Requer escolha de serviço (Formspree, Web3Forms, etc.) |
| Features #5-14 | Dark mode, ToC, posts relacionados, busca, etc. — features de evolução futura |

### Arquivos criados nesta sessão

- `src/components/common/Icon.astro` — Componente centralizado de ícones (26 ícones)
- `src/pages/blog/tags/[tag].astro` — Página de filtro por tag
- `src/pages/404.astro` — Página 404 personalizada
- `src/assets/fonts/Inter-Regular.ttf` — Fonte Inter para OG images
- `src/assets/fonts/Inter-Bold.ttf` — Fonte Inter Bold para OG images

### Arquivos modificados nesta sessão

- `astro.config.mjs` — Sitemap config
- `tsconfig.json` — Path alias @utils/*
- `package.json` — Fontsource dependencies
- `src/styles/global.css` — Fontsource imports
- `src/utils/og-image.ts` — Local fonts
- `src/utils/reading-time.ts` — 250 WPM
- `src/components/seo/BaseHead.astro` — RSS, updatedDate, remoção Google Fonts CDN
- `src/components/common/Section.astro` — aria-labelledby
- `src/components/common/Header.astro` — Icon component
- `src/components/common/Footer.astro` — Icon component
- `src/components/projects/ProjectCard.astro` — Icon component
- `src/components/about/TimelineItem.astro` — Icon component
- `src/components/blog/PostCard.astro` — (sem mudanças, tags dentro de `<a>`)
- `src/layouts/BaseLayout.astro` — updatedDate, ClientRouter (View Transitions)
- `src/layouts/BlogLayout.astro` — Icon, updatedDate, tags clicáveis, astro:page-load
- `src/pages/index.astro` — Icon component
- `src/pages/sobre.astro` — Icon component
- `src/pages/cv.astro` — Icon, botão PDF desabilitado
- `src/pages/contato.astro` — Icon, email ofuscado, astro:page-load
- `src/pages/blog/index.astro` — Icon, tags clicáveis

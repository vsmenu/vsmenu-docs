# Convenções de Documentação 📐

Este documento define as convenções e padrões para criação e manutenção da documentação do VSmenu.

## 📁 Estrutura de Arquivos

### Nomenclatura de Arquivos
- Use **kebab-case** para nomes de arquivos: `getting-started.md`, `api-endpoints.md`
- Sempre inclua extensão `.md` para arquivos markdown
- Nomes em **inglês** quando possível (termos técnicos)
- Um tópico por arquivo
- Arquivos devem ser descritivos e concisos

**Exemplos:**
```
✅ getting-started.md
✅ api-authentication.md
✅ deploy-production.md

❌ GettingStarted.md
❌ api_authentication.md
❌ deployProduction.md
```

### Estrutura de Pastas
```
docs/
├── index.md                    # Sempre tenha um index.md na raiz
├── secao/
│   ├── index.md                # Cada pasta deve ter um index.md
│   ├── topico-1.md
│   ├── topico-2.md
│   └── subsecao/
│       ├── index.md
│       └── topico-3.md
└── public/                     # Assets públicos
    ├── images/
    └── diagrams/
```

### Assets (Imagens e Diagramas)
- **Imagens:** `/public/images/` ou `/docs/images/`
- **Diagramas:** `/public/diagrams/`
- **Nomenclatura:** `nome-descritivo.extensao`
- **Formatos preferidos:**
  - Imagens: PNG, WEBP, SVG
  - Diagramas: SVG, PNG
  - Otimize imagens antes de commitar

## ✍️ Convenções de Markdown

### Front Matter
Cada arquivo deve começar com front matter YAML:

```yaml
---
title: Título da Página
description: Descrição curta (120-160 caracteres)
---
```

**Campos opcionais:**
```yaml
---
title: Título da Página
description: Descrição curta
author: Nome do Autor
date: 2024-11-15
tags: [tag1, tag2]
sidebar: auto
---
```

### Hierarquia de Headers

```markdown
# H1 - Título Principal (apenas UM por página)
## H2 - Seções Principais
### H3 - Subseções
#### H4 - Detalhes (evite H5/H6)
```

**Regras:**
- Apenas **um H1** por página (título principal)
- Não pule níveis (H2 → H4 ❌)
- Use ordem hierárquica (H1 → H2 → H3 → H4)
- Headers devem ser descritivos

### Code Blocks

Sempre especifique a linguagem:

````markdown
```javascript
// Código JavaScript
const example = 'código aqui';
```

```bash
# Comandos de terminal
npm install
```

```typescript
// TypeScript com tipos
interface User {
  id: number;
  name: string;
}
```
````

**Linguagens comuns:**
- `javascript`, `typescript`
- `bash`, `shell`
- `php`, `python`, `java`
- `json`, `yaml`, `xml`
- `html`, `css`, `scss`
- `sql`, `dockerfile`

### Links

#### Links Internos (Relativos)
```markdown
<!-- Mesmo diretório -->
[Link](./outro-arquivo.md)

<!-- Diretório pai -->
[Link](../arquivo.md)

<!-- Raiz -->
[Link](/secao/arquivo.md)

<!-- Âncora -->
[Link](#nome-da-secao)
```

#### Links Externos (Absolutos)
```markdown
[VitePress](https://vitepress.dev)
[GitHub](https://github.com/vsmenu)
```

**Boas práticas:**
- Use links relativos para documentação interna
- Links externos devem abrir em nova aba (configurado no VitePress)
- Verifique links quebrados regularmente

### Listas

**Lista não ordenada:**
```markdown
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
```

**Lista ordenada:**
```markdown
1. Primeiro passo
2. Segundo passo
3. Terceiro passo
```

**Lista de tarefas:**
```markdown
- [x] Tarefa concluída
- [ ] Tarefa pendente
- [ ] Outra tarefa
```

### Tabelas

```markdown
| Header 1     | Header 2     | Header 3     |
|--------------|--------------|--------------|
| Cell 1       | Cell 2       | Cell 3       |
| Cell 4       | Cell 5       | Cell 6       |
```

**Com alinhamento:**
```markdown
| Esquerda | Centro | Direita |
|:---------|:------:|--------:|
| Texto    | Texto  | Texto   |
```

### Admonitions (Callouts)

```markdown
::: tip Título Opcional
Dica ou informação útil
:::

::: info Informação
Contexto adicional
:::

::: warning Atenção
Aviso importante
:::

::: danger Perigo
Alerta crítico
:::
```

### Ênfases

```markdown
**Negrito** - para ênfase forte
*Itálico* - para ênfase suave
`Código inline` - para código, comandos, variáveis
~~Tachado~~ - para texto obsoleto
```

## 🎨 Guia de Estilo

### Tom e Voz
- ✅ Use linguagem clara e objetiva
- ✅ Prefira voz ativa: "Execute o comando" vs "O comando deve ser executado"
- ✅ Seja direto ao ponto
- ✅ Use exemplos práticos
- ❌ Evite jargões desnecessários
- ❌ Evite humor que pode não traduzir bem

### Linguagem
- **Idioma:** Português brasileiro (documentação) e inglês (código)
- **Termos técnicos:** Use inglês quando apropriado
- **Consistência:** Use os mesmos termos ao longo da documentação

### Formatação
- Espaço entre seções
- Use listas para múltiplos itens
- Quebre parágrafos longos (máx 3-4 linhas)
- Use emojis com moderação para navegação 🎯
- Mantenha linhas de código com máx 80-100 caracteres

## 🔤 Convenções de Código

### Exemplos de Código
- Sempre forneça **contexto**
- Use **comentários** para explicar
- Mostre **input e output** esperado
- Inclua **imports necessários**
- Código deve ser **executável** quando possível

### Variáveis de Exemplo
Use valores realistas mas genéricos:
- ❌ `senha123`, `email@email.com`
- ✅ `seu-token-aqui`, `usuario@exemplo.com`

## 📝 Commits

Siga [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```bash
docs: adiciona guia de autenticação
docs(api): documenta endpoint de produtos
fix: corrige links quebrados em getting-started
style: melhora formatação em architecture.md
refactor: reorganiza estrutura de pastas
```

**Tipos:**
- `docs:` - Mudanças na documentação
- `fix:` - Correção de erros
- `feat:` - Nova documentação/feature
- `style:` - Formatação, typos
- `refactor:` - Reorganização de conteúdo
- `chore:` - Manutenção, deps

## ✅ Checklist de Qualidade

Antes de commitar documentação, verifique:

- [ ] Front matter presente e correto
- [ ] Apenas um H1 por página
- [ ] Code blocks com linguagem especificada
- [ ] Links funcionando (internos e externos)
- [ ] Imagens otimizadas e com alt text
- [ ] Ortografia revisada
- [ ] Formatação consistente
- [ ] Exemplos testados
- [ ] Mobile-friendly (teste responsividade)

## 🔧 Ferramentas

### Linting
```bash
# Markdown linting
npm run lint:md

# Verificar links
npm run check-links

# Spell check
npm run spell-check
```

### Preview Local
```bash
# Servidor de desenvolvimento
npm run docs:dev

# Build de produção
npm run docs:build
npm run docs:preview
```

## 📚 Referências

- [VitePress Documentation](https://vitepress.dev)
- [Markdown Guide](https://www.markdownguide.org/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

---

**Dúvidas?** Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues) ou consulte o [Guia de Contribuição](/contributing/).


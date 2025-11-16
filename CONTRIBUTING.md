# Guia de Contribuição 🤝

Obrigado por considerar contribuir com a documentação do VSmenu! Este documento fornece diretrizes e melhores práticas.

## 📋 Índice

1. [Como Começar](#como-começar)
2. [Tipos de Contribuição](#tipos-de-contribuição)
3. [Fluxo de Trabalho](#fluxo-de-trabalho)
4. [Padrões de Documentação](#padrões-de-documentação)
5. [Convenções de Commit](#convenções-de-commit)
6. [Revisão de Pull Requests](#revisão-de-pull-requests)
7. [Guia de Estilo](#guia-de-estilo)

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- Git
- Editor de texto (recomendado: VS Code)

### Setup do Ambiente

```bash
# 1. Fork o repositório
# Clique em "Fork" no canto superior direito do GitHub

# 2. Clone seu fork
git clone https://github.com/SEU-USERNAME/vsmenu-docs.git
cd vsmenu-docs

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/vsmenu/vsmenu-docs.git

# 4. Instale as dependências
npm install

# 5. Execute o servidor de desenvolvimento
npm run docs:dev

# 6. Acesse no navegador
# http://localhost:5173
```

## 🎯 Tipos de Contribuição

### 1. Corrigir Erros

- Typos e erros de digitação
- Links quebrados
- Erros técnicos
- Problemas de formatação

### 2. Melhorar Documentação Existente

- Adicionar exemplos práticos
- Clarificar instruções confusas
- Atualizar informações desatualizadas
- Adicionar diagramas e imagens
- Melhorar explicações técnicas

### 3. Criar Nova Documentação

- Novos guias de desenvolvimento
- Novos tutoriais passo a passo
- Documentação de novas features
- Tradução de conteúdo

### 4. Melhorar Navegação

- Reorganizar estrutura de conteúdo
- Melhorar links internos
- Adicionar índices e sumários
- Otimizar busca

## 🔄 Fluxo de Trabalho

### 1. Crie ou Encontre uma Issue

Antes de começar, verifique se já existe uma issue relacionada. Se não existir, crie uma nova descrevendo:
- O que você pretende fazer
- Por que é necessário
- Como planeja implementar

### 2. Crie uma Branch

```bash
# Atualize sua main primeiro
git checkout main
git pull upstream main

# Crie uma branch descritiva
git checkout -b docs/descricao-curta

# Exemplos de nomes de branch:
# docs/add-api-authentication
# fix/broken-link-getting-started
# improve/architecture-diagrams
```

### 3. Faça suas Alterações

- Edite os arquivos markdown em `docs/`
- Teste localmente com `npm run docs:dev`
- Verifique links e formatação
- Siga os [padrões de documentação](#padrões-de-documentação)

### 4. Commit suas Alterações

```bash
git add .
git commit -m "docs: adiciona documentação de autenticação"
```

Veja [Convenções de Commit](#convenções-de-commit) para mais detalhes.

### 5. Push para seu Fork

```bash
git push origin docs/descricao-curta
```

### 6. Abra um Pull Request

1. Vá para o repositório original no GitHub
2. Clique em "Pull Request"
3. Use um título descritivo seguindo [Conventional Commits](https://www.conventionalcommits.org/)
4. Descreva o que foi alterado e por quê
5. Referencie a issue relacionada (ex: `Closes #123`)
6. Adicione screenshots se aplicável

## 📝 Padrões de Documentação

### Estrutura de Arquivos

- **Um tópico por arquivo** - Mantenha arquivos focados em um único assunto
- **Nomes em kebab-case** - Use `getting-started.md`, não `GettingStarted.md`
- **Sempre incluir `index.md`** - Cada pasta deve ter um `index.md`

### Front Matter

Cada arquivo markdown deve começar com front matter YAML:

```yaml
---
title: Título da Página
description: Descrição curta e clara (120-160 caracteres)
---
```

### Hierarquia de Headers

```markdown
# H1 - Título Principal (apenas UM por página)

## H2 - Seções Principais

### H3 - Subseções

#### H4 - Detalhes (evite H5/H6)
```

**Importante:**
- Apenas um H1 por página
- Não pule níveis de hierarquia
- Use ordem lógica e progressiva

### Links

#### Links Internos (Relativos)

```markdown
<!-- Mesmo diretório -->
[Link](./outro-arquivo.md)

<!-- Diretório pai -->
[Link](../arquivo.md)

<!-- Raiz da documentação -->
[Link](/secao/arquivo.md)

<!-- Âncora na mesma página -->
[Link](#nome-da-secao)
```

#### Links Externos (Absolutos)

```markdown
[VitePress](https://vitepress.dev)
[GitHub VSmenu](https://github.com/vsmenu)
```

### Code Blocks

Sempre especifique a linguagem para syntax highlighting:

````markdown
```javascript
// Código JavaScript
const example = 'sempre especifique a linguagem';
console.log(example);
```

```bash
# Comandos de terminal
npm install
npm run docs:dev
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
- `javascript`, `typescript`, `jsx`, `tsx`
- `bash`, `shell`, `sh`
- `php`, `python`, `java`, `go`
- `json`, `yaml`, `xml`, `toml`
- `html`, `css`, `scss`, `vue`
- `sql`, `dockerfile`

### Admonitions (Callouts)

Use admonitions para destacar informações importantes:

```markdown
::: tip Dica
Informação útil ou boa prática
:::

::: warning Atenção
Algo importante que requer atenção
:::

::: danger Perigo
Alerta crítico ou ação irreversível
:::

::: info Informação
Informação complementar ou contexto adicional
:::
```

### Imagens

```markdown
![Texto alternativo descritivo](/images/exemplo.png)
```

**Boas práticas:**
- Use texto alternativo descritivo
- Otimize imagens antes de commitar
- Coloque imagens em `/docs/images/` ou `/docs/public/`
- Prefira PNG para screenshots, SVG para diagramas

### Tabelas

```markdown
| Header 1     | Header 2     | Header 3     |
|--------------|--------------|--------------|
| Cell 1       | Cell 2       | Cell 3       |
| Cell 4       | Cell 5       | Cell 6       |
```

**Com alinhamento:**

```markdown
| Esquerda     | Centro       | Direita      |
|:-------------|:------------:|-------------:|
| Texto        | Texto        | Texto        |
```

## 🎨 Guia de Estilo

### Linguagem

- ✅ **Use linguagem clara e objetiva** - Evite jargões desnecessários
- ✅ **Prefira voz ativa** - "Execute o comando" em vez de "O comando deve ser executado"
- ✅ **Seja inclusivo** - Use linguagem neutra e respeitosa
- ✅ **Use exemplos práticos** - Sempre que possível, mostre exemplos reais
- ❌ **Evite humor ambíguo** - O que é engraçado para uns pode não ser para outros
- ❌ **Evite suposições** - Explique conceitos que podem não ser óbvios

### Formatação

- Use **negrito** para ênfase importante
- Use *itálico* para conceitos ou termos técnicos na primeira menção
- Use `código inline` para comandos, variáveis, nomes de arquivos, valores
- Use listas para múltiplos itens relacionados
- Use blocos de código para código multi-linha
- Mantenha parágrafos curtos (3-4 linhas no máximo)

### Exemplos de Código

**Sempre forneça:**
- Contexto do que o código faz
- Comentários explicativos quando necessário
- Input e output esperado
- Imports necessários (se aplicável)

**Exemplo bom:**

````markdown
Para criar um novo pedido, use o endpoint POST `/orders`:

```javascript
// Exemplo de criação de pedido
const response = await fetch('https://api.vsmenu.io/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_id: 123,
    items: [
      { product_id: 1, quantity: 2, price: 29.90 }
    ]
  })
});

const data = await response.json();
console.log(data);
// Output: { success: true, order_id: 456, ... }
```
````

## 💬 Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
tipo(escopo): descrição curta

[corpo opcional]

[footer opcional]
```

### Tipos de Commit

- **docs:** Mudanças na documentação
- **fix:** Correção de erros na documentação
- **feat:** Nova documentação ou seção
- **style:** Formatação, typos (sem mudança de conteúdo)
- **refactor:** Reorganização de conteúdo
- **chore:** Manutenção, deps, configurações

### Exemplos

```bash
docs: adiciona guia de autenticação
docs(api): documenta endpoint de produtos
fix: corrige links quebrados em getting-started
style: melhora formatação em architecture.md
feat(tutorials): adiciona tutorial de WebSocket
refactor: reorganiza estrutura de guias
chore: atualiza dependências do VitePress
```

### Mensagens de Commit

**Boas práticas:**
- Use modo imperativo: "adiciona" não "adicionado" ou "adicionando"
- Primeira letra minúscula após o tipo
- Sem ponto final
- Máximo 50 caracteres no título
- Corpo opcional com mais detalhes (se necessário)

## 👀 Revisão de Pull Requests

### O que Revisamos

- ✅ **Precisão técnica** - Informações corretas e atualizadas
- ✅ **Clareza e legibilidade** - Fácil de entender
- ✅ **Formatação e estilo** - Segue os padrões
- ✅ **Links funcionando** - Todos os links acessíveis
- ✅ **Exemplos funcionais** - Código de exemplo funciona
- ✅ **Gramática e ortografia** - Texto bem escrito

### Timeline Esperado

- **PRs simples** (typos, links): 1-2 dias
- **PRs médios** (melhorias): 2-3 dias
- **PRs complexos** (novo conteúdo): 3-5 dias

### Processo de Review

1. **Review automático** - CI/CD verifica build e linting
2. **Review manual** - Mantenedor revisa conteúdo
3. **Feedback** - Comentários e sugestões
4. **Ajustes** - Contributor faz alterações se necessário
5. **Aprovação** - PR é aprovado
6. **Merge** - PR é integrado ao projeto

### Feedback Construtivo

Ao revisar PRs de outros:
- Seja respeitoso e construtivo
- Explique o "porquê" das sugestões
- Aprecie o esforço do contributor
- Ofereça soluções, não apenas críticas
- Use linguagem encorajadora

## ✅ Checklist do PR

Antes de abrir um Pull Request, verifique:

- [ ] Servidor local funciona sem erros (`npm run docs:dev`)
- [ ] Build de produção funciona (`npm run docs:build`)
- [ ] Todos os links estão funcionando
- [ ] Markdown está formatado corretamente
- [ ] Front matter está presente em arquivos novos
- [ ] Imagens estão otimizadas (se aplicável)
- [ ] Commits seguem Conventional Commits
- [ ] PR está linkado a uma issue
- [ ] Descrição do PR está completa e clara
- [ ] Screenshots adicionados (se relevante)
- [ ] Documentação testada no navegador

## 🐛 Reportar Bugs

Encontrou um erro na documentação? Ajude-nos a melhorar!

**Use o template de issue e inclua:**
- Descrição clara do problema
- Link para a página com problema
- Passos para reproduzir (se aplicável)
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Navegador e OS (se relevante)

## 💡 Sugerir Melhorias

Tem uma ideia para melhorar a documentação?

**Abra uma issue incluindo:**
- Descrição da melhoria
- Motivação (por que é importante?)
- Contexto (onde se aplica?)
- Exemplos ou mockups (se aplicável)

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos:
- README do projeto
- Página de contribuidores no GitHub
- Release notes

Sua contribuição, por menor que seja, é valiosa! 💙

## 📞 Precisa de Ajuda?

Tem dúvidas sobre como contribuir?

- 💬 **Discussões:** [GitHub Discussions](https://github.com/vsmenu/vsmenu-docs/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/vsmenu/vsmenu-docs/issues)
- 📧 **Email:** contato@vsmenu.io

## 📚 Recursos Úteis

- [VitePress Documentation](https://vitepress.dev)
- [Markdown Guide](https://www.markdownguide.org/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [GitHub Docs - Contributing](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions)

## 📖 Documentação Relacionada

- [CONVENTIONS.md](./CONVENTIONS.md) - Convenções detalhadas
- [DOCUMENT-TEMPLATE.md](./DOCUMENT-TEMPLATE.md) - Template de documento
- [STRUCTURE.md](./STRUCTURE.md) - Estrutura do projeto

---

**Obrigado por contribuir com o VSmenu! 🎉**

Sua contribuição ajuda a tornar nossa documentação melhor para todos.

Happy documenting! 📝✨


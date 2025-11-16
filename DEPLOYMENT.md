# 🚀 Guia de Deployment - VSmenu Docs

Este documento descreve como funciona o processo de deploy automático da documentação VSmenu.

## 📋 Visão Geral

A documentação é automaticamente publicada no GitHub Pages sempre que há um push na branch `main`. O processo é totalmente automatizado via GitHub Actions.

## 🔧 Configuração Inicial

### 1. Habilitar GitHub Pages

Para habilitar o GitHub Pages pela primeira vez:

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione: `GitHub Actions`
4. Salve as configurações

![GitHub Pages Settings](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/pages-source-dropdown.webp)

### 2. Configurar Base URL

O base URL está configurado em `docs/.vitepress/config.ts`:

```typescript
// Para GitHub Pages padrão (vsmenu.github.io/vsmenu-docs/)
base: '/vsmenu-docs/',

// Para custom domain (docs.vsmenu.io)
base: '/',
```

Se você configurar um custom domain, altere o base para `/`.

### 3. Custom Domain (Opcional)

Para usar um domínio customizado como `docs.vsmenu.io`:

#### Passo 1: Configurar DNS
Adicione os seguintes registros DNS:

```
Type: CNAME
Name: docs
Value: vsmenu.github.io
```

#### Passo 2: Configurar no GitHub
1. Acesse **Settings** → **Pages**
2. Em **Custom domain**, adicione: `docs.vsmenu.io`
3. Marque **Enforce HTTPS**
4. Aguarde a verificação DNS (pode levar até 24h)

#### Passo 3: Atualizar config.ts
```typescript
base: '/',  // Alterar de '/vsmenu-docs/' para '/'
```

## 🔄 Workflows do GitHub Actions

Temos 3 workflows configurados:

### 1. CI - Build and Lint (`ci.yml`)

**Trigger:** Push ou Pull Request em `main` ou `develop`

**Ações:**
- ✅ Build da documentação
- ✅ Lint de arquivos Markdown
- ✅ Verificação de links (apenas em PRs)
- ✅ Upload de artifacts

**Status:** Os PRs só podem ser merged se o CI passar com sucesso.

### 2. Deploy (`deploy.yml`)

**Trigger:** Push na branch `main`

**Ações:**
- ✅ Build da documentação
- ✅ Deploy no GitHub Pages
- ✅ Atualização automática do site

**URL de Deploy:** https://vsmenu.github.io/vsmenu-docs/

### 3. PR Comment (`pr-comment.yml`)

**Trigger:** Abertura ou atualização de Pull Request

**Ações:**
- ✅ Adiciona comentário automático no PR
- ✅ Checklist de revisão
- ✅ Instruções de teste local

## 📝 Processo de Deploy

### Deploy em Produção

```bash
# 1. Certifique-se de estar na branch main
git checkout main

# 2. Faça suas alterações
git add .
git commit -m "docs: atualiza documentação X"

# 3. Push para o repositório
git push origin main

# 4. O deploy acontece automaticamente! ✨
```

### Verificar Status do Deploy

1. Acesse: https://github.com/vsmenu/vsmenu-docs/actions
2. Veja o status do workflow "Deploy to GitHub Pages"
3. Verde ✅ = Deploy bem-sucedido
4. Vermelho ❌ = Erro no deploy (verifique os logs)

### Tempo de Deploy

- **Build:** ~1-2 minutos
- **Deploy:** ~1 minuto
- **Propagação:** Imediato

**Total:** ~3 minutos do push até o site estar atualizado

## 🧪 Testar Antes de Deploy

Sempre teste localmente antes de fazer push:

```bash
# 1. Build local
npm run docs:build

# 2. Preview do build
npm run docs:preview

# 3. Acesse http://localhost:4173
```

### Testes Automatizados

```bash
# Lint Markdown
npm run lint:md

# Verificar links
npm run check-links

# Build (teste completo)
npm test
```

## 🔍 Troubleshooting

### Erro: "Page build failed"

**Causa:** Erro no build do VitePress

**Solução:**
1. Verifique os logs do workflow
2. Teste localmente: `npm run docs:build`
3. Corrija os erros e faça novo push

### Erro: "404 - Page not found"

**Causa:** Base URL incorreto

**Solução:**
1. Verifique o `base` em `config.ts`
2. Deve ser `/vsmenu-docs/` para GitHub Pages padrão
3. Ou `/` se estiver usando custom domain

### Site não atualiza após deploy

**Causa:** Cache do navegador

**Solução:**
1. Force refresh: `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
2. Limpe o cache do navegador
3. Teste em aba anônima

### Links quebrados após deploy

**Causa:** Links relativos incorretos

**Solução:**
1. Use links com `/` no início: `/getting-started/`
2. Ou use links relativos corretos: `../getting-started/`
3. Execute `npm run check-links` antes do commit

## 📊 Monitoramento

### Badges de Status

O README.md contém badges que mostram o status:

```markdown
[![CI](https://github.com/vsmenu/vsmenu-docs/actions/workflows/ci.yml/badge.svg)](...)
[![Deploy](https://github.com/vsmenu/vsmenu-docs/actions/workflows/deploy.yml/badge.svg)](...)
```

### GitHub Actions

Monitore os workflows em:
- https://github.com/vsmenu/vsmenu-docs/actions

### Analytics (Futuro)

Planejamos adicionar:
- Google Analytics
- Plausible Analytics
- Vercel Analytics

## 🔐 Segurança

### Secrets

Não são necessários secrets adicionais. O GitHub Actions usa automaticamente:
- `GITHUB_TOKEN` - Gerado automaticamente pelo GitHub
- `GITHUB_PAGES_TOKEN` - Permissões configuradas no workflow

### Permissões

O workflow de deploy tem as seguintes permissões:

```yaml
permissions:
  contents: read      # Ler código do repositório
  pages: write        # Escrever no GitHub Pages
  id-token: write     # Gerar token de deploy
```

## 🎯 Ambientes

### Produção
- **URL:** https://vsmenu.github.io/vsmenu-docs/
- **Branch:** `main`
- **Deploy:** Automático

### Desenvolvimento
- **URL:** http://localhost:5173
- **Branch:** Qualquer
- **Comando:** `npm run docs:dev`

### Preview (Staging)
- **URL:** http://localhost:4173
- **Branch:** Qualquer
- **Comando:** `npm run docs:preview`

## 📚 Referências

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [VitePress Deploy Guide](https://vitepress.dev/guide/deploy)
- [Custom Domain Configuration](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 💡 Dicas

1. **Sempre teste localmente** antes de fazer push
2. **Use commits semânticos** (ex: `docs: adiciona guia X`)
3. **Faça deploys frequentes** - É grátis e automático!
4. **Monitore os workflows** - Verifique se o deploy foi bem-sucedido
5. **Use PRs** - Para mudanças significativas, abra um PR primeiro

## 🆘 Suporte

Se tiver problemas com o deploy:

1. Verifique os [logs do workflow](https://github.com/vsmenu/vsmenu-docs/actions)
2. Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues)
3. Entre em contato com os mantenedores

---

**✨ Deploy automatizado com sucesso!**


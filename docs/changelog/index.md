---
title: Changelog
description: Histórico de mudanças do VSmenu
---

# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Em Desenvolvimento
- Estrutura inicial da documentação
- Setup VitePress
- Organização de conteúdo

## [0.1.0] - 2024-11-15

### Adicionado
- Estrutura inicial do projeto VSmenu Docs
- Configuração VitePress
- Páginas iniciais:
  - Getting Started
  - Architecture
  - API Documentation
  - Guides
  - Tutorials
  - Business Rules
  - Testing
  - Deployment
  - Contributing
- Sistema de navegação
- Design e branding VSmenu
- Assets (logo, favicon)

### Infraestrutura
- Setup GitHub repository
- Configuração de CI/CD
- Deploy automático

## Tipos de Mudanças

- **Adicionado** - para novas funcionalidades
- **Modificado** - para mudanças em funcionalidades existentes
- **Depreciado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correções de bugs
- **Segurança** - para vulnerabilidades corrigidas

## Como Contribuir

Ao fazer alterações significativas:
1. Adicione uma entrada na seção `[Unreleased]`
2. Use as categorias apropriadas
3. Seja descritivo e objetivo
4. Inclua links para PRs/issues quando relevante

### Formato de Entrada

```markdown
### Categoria
- Descrição da mudança ([#123](link-para-pr))
- Outra mudança importante
```

## Versionamento

Seguimos Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR** - Mudanças incompatíveis na API
- **MINOR** - Novas funcionalidades (compatíveis)
- **PATCH** - Correções de bugs (compatíveis)

## Releases

### Como Criar um Release

```bash
# Atualize o CHANGELOG
# Atualize a versão no package.json
npm version minor

# Commit e tag
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --tags
```

## Links Úteis

- [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)

---

[Unreleased]: https://github.com/vsmenu/vsmenu-docs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/vsmenu/vsmenu-docs/releases/tag/v0.1.0


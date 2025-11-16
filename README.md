# VSmenu Documentation 📚

> Central de documentação técnica do projeto VSmenu 2.0 - Sistema completo de gestão para restaurantes

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/vsmenu/vsmenu-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/vsmenu/vsmenu-docs/actions/workflows/ci.yml)
[![Deploy](https://github.com/vsmenu/vsmenu-docs/actions/workflows/deploy.yml/badge.svg)](https://github.com/vsmenu/vsmenu-docs/actions/workflows/deploy.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![VitePress](https://img.shields.io/badge/Powered%20by-VitePress-646cff.svg)](https://vitepress.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)

## 🌐 Acesse a Documentação

**📖 Documentação Online:** [https://vsmenu.github.io/vsmenu-docs/](https://vsmenu.github.io/vsmenu-docs/)

## 📋 Sobre

Este repositório contém toda a documentação técnica e arquitetural do ecossistema VSmenu 2.0, incluindo:

- 🏗️ **Arquitetura** - Visão geral da arquitetura do sistema, componentes e decisões arquiteturais (ADRs)
- 🔌 **API** - Documentação completa das APIs REST e WebSocket, endpoints e exemplos de uso
- 📱 **Guias** - Guias de desenvolvimento específicos para cada aplicação do ecossistema
- 📚 **Tutoriais** - Tutoriais passo a passo para iniciantes, intermediários e avançados
- 🎯 **Regras de Negócio** - Documentação detalhada das regras de negócio do sistema
- 🧪 **Testes** - Estratégias e guias de testes (unitários, integração, E2E)
- 🚀 **Deploy** - Guias de implantação para ambientes local, staging e produção
- 🤝 **Contribuindo** - Como contribuir com o projeto

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **Git**

### Executar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/vsmenu/vsmenu-docs.git
cd vsmenu-docs

# 2. Instale as dependências
npm install

# 3. Execute o servidor de desenvolvimento
npm run docs:dev

# 4. Acesse no navegador
# http://localhost:5173
```

A documentação será recarregada automaticamente quando você editar os arquivos.

### Build de Produção

```bash
# Build
npm run docs:build

# Preview do build
npm run docs:preview
```

Os arquivos otimizados serão gerados em `docs/.vitepress/dist/`.

### Linting e Validação

```bash
# Verificar formatação Markdown
npm run lint:md

# Corrigir automaticamente erros de Markdown
npm run lint:md:fix

# Verificar links quebrados
npm run check-links

# Rodar todos os testes (build)
npm test
```

## 📁 Estrutura do Projeto

```text
vsmenu-docs/
├── docs/                           # Conteúdo da documentação
│   ├── .vitepress/                 # Configuração VitePress
│   │   ├── config.ts               # Configuração principal
│   │   └── theme/                  # Tema customizado (futuro)
│   ├── getting-started/            # 🚀 Primeiros passos
│   │   └── index.md
│   ├── architecture/               # 🏗️ Arquitetura
│   │   ├── decisions/              # ADRs
│   │   ├── diagrams/               # Diagramas
│   │   └── index.md
│   ├── api/                        # 🔌 Documentação da API
│   │   ├── endpoints/              # Endpoints por módulo
│   │   └── index.md
│   ├── guides/                     # 📚 Guias de desenvolvimento
│   │   ├── api/                    # Backend (Laravel)
│   │   ├── web/                    # Frontend Web (Vue)
│   │   ├── desktop/                # Desktop (Electron)
│   │   ├── mobile-waiter/          # Mobile Garçom (React Native)
│   │   ├── mobile-deliverer/       # Mobile Entregador (React Native)
│   │   ├── design-system/          # Design System
│   │   └── index.md
│   ├── tutorials/                  # 🎯 Tutoriais
│   │   ├── beginner/               # Iniciante
│   │   ├── intermediate/           # Intermediário
│   │   ├── advanced/               # Avançado
│   │   └── index.md
│   ├── business-rules/             # 📋 Regras de Negócio
│   │   └── index.md
│   ├── testing/                    # 🧪 Testes
│   │   └── index.md
│   ├── deployment/                 # 🚀 Deploy
│   │   └── index.md
│   ├── contributing/               # 🤝 Contribuindo
│   │   └── index.md
│   ├── changelog/                  # 📝 Changelog
│   │   └── index.md
│   ├── images/                     # Imagens
│   │   └── vsmenu-logo.png
│   └── index.md                    # Home page
├── .github/
│   └── workflows/                  # GitHub Actions (futuro)
├── CONVENTIONS.md                  # Convenções de documentação
├── DOCUMENT-TEMPLATE.md            # Template de documento
├── STRUCTURE.md                    # Documentação da estrutura
├── LICENSE                         # Licença MIT
├── package.json
└── README.md                       # Este arquivo
```

## 🤝 Como Contribuir

Adoramos contribuições! Existem várias formas de contribuir com a documentação do VSmenu:

### Tipos de Contribuição

1. **🐛 Reportar Erros**
   - Typos, links quebrados, erros técnicos
   - Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues/new)

2. **📝 Melhorar Documentação**
   - Adicionar exemplos, clarificar instruções
   - Atualizar informações desatualizadas

3. **✨ Criar Novo Conteúdo**
   - Novos guias, tutoriais
   - Documentação de novas features

4. **🎨 Melhorar Design/UX**
   - Sugestões de melhorias visuais
   - Reorganização de conteúdo

### Fluxo de Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b docs/minha-contribuicao`
3. Faça suas alterações
4. Commit: `git commit -m "docs: adiciona documentação X"`
5. Push: `git push origin docs/minha-contribuicao`
6. Abra um Pull Request

### Convenções

- Use markdown para toda documentação
- Siga o [guia de estilo](./CONVENTIONS.md)
- Use o [template de documento](./DOCUMENT-TEMPLATE.md)
- Commits seguem [Conventional Commits](https://www.conventionalcommits.org/)

📖 **Leia o guia completo:** [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| [VitePress](https://vitepress.dev) | 1.6.4 | Framework de documentação |
| [Vue 3](https://vuejs.org) | 3.5+ | Componentes customizados |
| [TypeScript](https://www.typescriptlang.org) | Latest | Configurações type-safe |
| [Mermaid](https://mermaid.js.org) | 11.12+ | Diagramas em markdown |
| [Node.js](https://nodejs.org) | 18+ | Runtime |

### Funcionalidades

- ✅ **Busca Local** - Busca rápida com Ctrl+K / Cmd+K
- ✅ **Dark Mode** - Tema claro e escuro
- ✅ **Responsivo** - Mobile, tablet e desktop
- ✅ **TOC Automático** - Table of contents em cada página
- ✅ **Syntax Highlighting** - Code blocks com highlight
- ✅ **Navegação Hierárquica** - Sidebar organizada
- ✅ **Links Internos** - Navegação fluida entre páginas
- ✅ **Edit on GitHub** - Link para editar cada página

## 📦 Repositórios Relacionados

O VSmenu 2.0 é composto por múltiplas aplicações:

### Backend

- 🔧 [vsmenu-api](https://github.com/vsmenu/vsmenu-api) - API Backend (Laravel 11)
- ☁️ [vsmenu-infrastructure](https://github.com/vsmenu/vsmenu-infrastructure) - Infraestrutura como Código (Terraform)

### Frontend

- 🌐 [vsmenu-delivery-web](https://github.com/vsmenu/vsmenu-delivery-web) - App Web Delivery (Vue 3)
- 💻 [vsmenu-desktop](https://github.com/vsmenu/vsmenu-desktop) - App Desktop Interno (Electron + Vue 3)

### Mobile

- 📱 [vsmenu-mobile-waiter](https://github.com/vsmenu/vsmenu-mobile-waiter) - App Mobile Garçom (React Native)
- 🚚 [vsmenu-mobile-deliverer](https://github.com/vsmenu/vsmenu-mobile-deliverer) - App Mobile Entregador (React Native)

### Design

- 🎨 [vsmenu-design-system](https://github.com/vsmenu/vsmenu-design-system) - Design System e Componentes

### Documentação

- 📚 [vsmenu-documentos](https://github.com/vsmenu/vsmenu-documentos) - Documentos de planejamento e arquitetura

## 📚 Documentação de Referência

### Arquivos Importantes

- **[CONVENTIONS.md](./CONVENTIONS.md)** - Convenções de documentação (nomenclatura, markdown, commits)
- **[DOCUMENT-TEMPLATE.md](./DOCUMENT-TEMPLATE.md)** - Template padrão para novos documentos
- **[STRUCTURE.md](./STRUCTURE.md)** - Documentação detalhada da estrutura de pastas
- **[LICENSE](./LICENSE)** - Licença MIT do projeto

### Documentos Técnicos

O repositório [vsmenu-documentos](https://github.com/vsmenu/vsmenu-documentos) contém documentos técnicos importantes:

- **DOC-001** - Visão Geral do Produto
- **DOC-002** - Requisitos Funcionais e Não Funcionais
- **DOC-003** - Arquitetura de Software
- **DOC-006** - Padrões de Interface e Design System
- **DOC-008** - Estratégia de Versionamento e Documentação

## 🎯 Status do Projeto

### ✅ Implementado

- [x] Setup VitePress
- [x] Estrutura de pastas completa
- [x] Sistema de navegação hierárquica
- [x] Busca local configurada
- [x] Páginas iniciais criadas
- [x] Convenções documentadas
- [x] Template de documento
- [x] Dark mode
- [x] Responsividade

### 🚧 Em Desenvolvimento

- [x] Setup CI/CD (GitHub Actions)
- [x] Deploy automático (GitHub Pages)
- [x] Tema e branding customizado
- [x] README e Contributing guidelines
- [x] Code of Conduct

### 📅 Planejado

- [ ] Conteúdo completo de todas as seções
- [ ] Guias específicos por aplicação
- [ ] Tutoriais práticos
- [ ] Documentação completa da API
- [ ] Diagramas de arquitetura
- [ ] Vídeos tutoriais

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

A licença MIT permite:

- ✅ Uso comercial
- ✅ Modificação
- ✅ Distribuição
- ✅ Uso privado

## 👥 Equipe

Desenvolvido e mantido pela equipe VSmenu.

### Mantenedores

- [@valdirsb](https://github.com/valdirsb) - Project Lead

### Contribuidores

Obrigado a todos os [contribuidores](https://github.com/vsmenu/vsmenu-docs/graphs/contributors) que ajudam a melhorar esta documentação! 🙏

## 📞 Contato e Suporte

- 🐛 **Reportar Bugs:** [GitHub Issues](https://github.com/vsmenu/vsmenu-docs/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/vsmenu/vsmenu-docs/discussions)
- 📧 **Email:** <contato@vsmenu.io>
- 🌐 **Website:** [vsmenu.io](https://vsmenu.io) (em breve)

## 🔗 Links Úteis

- 📖 [Documentação VitePress](https://vitepress.dev)
- 📝 [Markdown Guide](https://www.markdownguide.org/)
- 🎨 [Mermaid Diagrams](https://mermaid.js.org/)
- 🎯 [Conventional Commits](https://www.conventionalcommits.org/)

---

<div align="center">

**⭐ Se esta documentação foi útil, considere dar uma estrela no repositório!**

Feito com ❤️ pela equipe VSmenu

</div>

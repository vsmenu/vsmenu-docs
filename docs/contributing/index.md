---
title: Contribuindo
description: Como contribuir com o projeto VSmenu
---

# Guia de Contribuição 🤝

Obrigado por considerar contribuir com o VSmenu! Este guia irá ajudá-lo a fazer contribuições efetivas.

## 🎯 Formas de Contribuir

Existem várias formas de contribuir com o projeto:

### 1. 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues/new) descrevendo:

- O que você esperava que acontecesse
- O que realmente aconteceu
- Passos para reproduzir
- Ambiente (SO, versões, etc)

### 2. 💡 Sugerir Melhorias

Tem uma ideia? Abra uma [issue](https://github.com/vsmenu/vsmenu-docs/issues/new) com:

- Descrição da melhoria
- Motivação e benefícios
- Exemplos de uso

### 3. 📝 Melhorar Documentação

A documentação sempre pode melhorar:

- Corrigir erros de digitação
- Adicionar exemplos
- Melhorar explicações
- Traduzir conteúdo

### 4. 💻 Contribuir com Código

Desenvolva novas funcionalidades ou correções.

## 🔄 Processo de Contribuição

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU-USERNAME/vsmenu-docs.git
cd vsmenu-docs

# Adicione o upstream
git remote add upstream https://github.com/vsmenu/vsmenu-docs.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch descritiva
git checkout -b docs/melhoria-secao-api
# ou
git checkout -b fix/corrige-link-quebrado
```

### 3. Faça suas Alterações

- Edite os arquivos necessários
- Teste localmente: `npm run docs:dev`
- Siga as convenções de código

### 4. Commit

```bash
# Commit com mensagem descritiva
git add .
git commit -m "docs: melhora documentação da API de produtos"
```

**Convenção de Commits:**

- `docs:` - Mudanças na documentação
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `test:` - Adiciona ou modifica testes
- `chore:` - Manutenção geral

### 5. Push e Pull Request

```bash
# Push para seu fork
git push origin docs/melhoria-secao-api

# Abra um PR no GitHub
# Preencha o template do PR
```

## 📋 Checklist do Pull Request

Antes de abrir um PR, verifique:

- [ ] Código compila sem erros
- [ ] Testes passam (se aplicável)
- [ ] Documentação atualizada
- [ ] Commits seguem convenção
- [ ] PR tem descrição clara
- [ ] Issue relacionada está linkada
- [ ] Screenshots adicionados (se aplicável)

## ✍️ Convenções de Escrita

### Markdown

- Use headers hierárquicos (H1, H2, H3...)
- Adicione front matter YAML em cada arquivo
- Use code blocks com linguagem especificada
- Adicione links relativos entre docs

### Estilo

- Seja claro e objetivo
- Use exemplos práticos
- Prefira listas para múltiplos itens
- Use emojis com moderação 🎯

## 🧪 Testando Localmente

```bash
# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run docs:dev

# Acesse: http://localhost:5173

# Build de produção (opcional)
npm run docs:build
npm run docs:preview
```

## 👀 Revisão de Código

Todos os PRs passam por revisão:

1. **Automática:** CI/CD executa testes e linting
2. **Manual:** Mantenedores revisam o código
3. **Feedback:** Sugestões e melhorias
4. **Aprovação:** Após ajustes, PR é aprovado
5. **Merge:** PR é integrado ao projeto

**Timeline Esperado:**

- PRs simples: 1-2 dias
- PRs complexos: 3-5 dias

## 🏷️ Labels

Entenda as labels usadas:

| Label | Significado |
|-------|-------------|
| `good first issue` | Bom para iniciantes |
| `help wanted` | Ajuda necessária |
| `priority: high` | Alta prioridade |
| `priority: medium` | Média prioridade |
| `priority: low` | Baixa prioridade |
| `type: bug` | Correção de bug |
| `type: feature` | Nova funcionalidade |
| `type: docs` | Documentação |

## 🎯 Desenvolvimento por Repositório

### vsmenu-docs (Documentação)

- VitePress + Vue 3
- Markdown para conteúdo
- Nenhuma instalação backend necessária

### vsmenu-api (Backend)

- Laravel 11 + PostgreSQL
- Docker Compose para desenvolvimento
- PHPUnit para testes

### vsmenu-delivery-web (Web)

- Vue 3 + TypeScript
- Vite para build
- Vitest para testes

### vsmenu-desktop (Desktop)

- Electron + Vue 3
- SQLite para armazenamento local
- Jest para testes

### vsmenu-mobile-* (Mobile)

- React Native + TypeScript
- Expo para desenvolvimento
- Jest para testes

## 📞 Precisa de Ajuda?

- 💬 [Discussões no GitHub](https://github.com/vsmenu/vsmenu-docs/discussions)
- 📧 Entre em contato com os mantenedores
- 📖 Leia a [documentação completa](/)

## 🙏 Reconhecimento

Todos os contribuidores são reconhecidos:

- README do projeto
- Página de contribuidores
- Release notes

## 📜 Código de Conduta

Ao contribuir, você concorda em seguir nosso [Código de Conduta](https://github.com/vsmenu/vsmenu-docs/blob/main/CODE_OF_CONDUCT.md).

Esperamos:

- ✅ Respeito e empatia
- ✅ Comunicação clara e construtiva
- ✅ Foco no melhor para a comunidade
- ❌ Comportamento inadequado ou ofensivo

---

Obrigado por ajudar a tornar o VSmenu melhor! 💙

**Happy coding!** 🚀

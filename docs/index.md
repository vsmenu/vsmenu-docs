---
layout: home

hero:
  name: "VSmenu"
  text: "Documentação Técnica"
  tagline: Sistema completo de gestão para restaurantes - Documentação oficial do projeto VSmenu 2.0
  image:
    src: /images/vsmenu-logo.png
    alt: VSmenu Logo
  actions:
    - theme: brand
      text: Começar
      link: /getting-started/
    - theme: alt
      text: Ver no GitHub
      link: https://github.com/vsmenu

features:
  - icon: 🏗️
    title: Arquitetura Moderna
    details: Sistema multi-tenant com arquitetura de microserviços, APIs RESTful e comunicação em tempo real via WebSocket
  
  - icon: 🚀
    title: Multi-Plataforma
    details: Web, Desktop (Electron), Mobile iOS/Android - tudo integrado e sincronizado
  
  - icon: 📱
    title: Apps Especializados
    details: Aplicativos dedicados para garçons, entregadores, clientes e gestão interna
  
  - icon: 🔄
    title: Sincronização Offline
    details: Trabalhe offline no desktop e sincronize automaticamente quando voltar online
  
  - icon: 🎨
    title: Design System
    details: Componentes reutilizáveis e consistentes baseados no VSmenu Design System
  
  - icon: 🔐
    title: Segurança
    details: Autenticação robusta, multi-tenancy isolado e controle granular de permissões
  
  - icon: 📊
    title: APIs Completas
    details: Documentação detalhada de todas as APIs REST e eventos WebSocket
  
  - icon: 🧪
    title: Testado
    details: Estratégias completas de testes unitários, integração e E2E
  
  - icon: 🚀
    title: Deploy Simplificado
    details: Infraestrutura como código (IaC) com Terraform e CI/CD automatizado
---

## 🎯 Visão Geral

O **VSmenu 2.0** é um sistema completo e moderno de gestão para restaurantes, desenvolvido com as melhores práticas e tecnologias atuais. Este é o repositório central de toda a documentação técnica do projeto.

### 📦 Ecossistema VSmenu

O projeto é composto por múltiplos repositórios integrados:

- **[vsmenu-api](https://github.com/vsmenu/vsmenu-api)** - Backend API (Laravel)
- **[vsmenu-delivery-web](https://github.com/vsmenu/vsmenu-delivery-web)** - Frontend Web (Vue 3)
- **[vsmenu-desktop](https://github.com/vsmenu/vsmenu-desktop)** - App Desktop (Electron + Vue)
- **[vsmenu-mobile-waiter](https://github.com/vsmenu/vsmenu-mobile-waiter)** - App Mobile Garçom (React Native)
- **[vsmenu-mobile-deliverer](https://github.com/vsmenu/vsmenu-mobile-deliverer)** - App Mobile Entregador (React Native)
- **[vsmenu-design-system](https://github.com/vsmenu/vsmenu-design-system)** - Design System
- **[vsmenu-infrastructure](https://github.com/vsmenu/vsmenu-infrastructure)** - Infraestrutura IaC

### 🚀 Quick Start

```bash
# Clone a documentação
git clone https://github.com/vsmenu/vsmenu-docs.git
cd vsmenu-docs

# Instale as dependências
npm install

# Execute localmente
npm run docs:dev
```

### 📚 O que você encontrará

- **[Começando](/getting-started/)** - Guia para iniciar com o VSmenu
- **[Arquitetura](/architecture/)** - Visão geral da arquitetura do sistema
- **[API](/api/)** - Documentação completa das APIs
- **[Guias](/guides/)** - Guias de desenvolvimento por aplicação
- **[Tutoriais](/tutorials/)** - Tutoriais práticos passo a passo

### 🤝 Contribuindo

Ajude a melhorar esta documentação! Veja nosso [Guia de Contribuição](https://github.com/vsmenu/vsmenu-docs/blob/main/CONTRIBUTING.md).

---

<div style="text-align: center; margin-top: 2rem;">
  <p>Feito com ❤️ pela equipe VSmenu</p>
</div>


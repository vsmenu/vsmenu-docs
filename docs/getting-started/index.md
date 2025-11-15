---
title: Começando com VSmenu
description: Guia inicial para começar a trabalhar com o projeto VSmenu 2.0
---

# Começando com VSmenu

Bem-vindo à documentação do VSmenu 2.0! Este guia irá ajudá-lo a começar rapidamente com o projeto.

## 🎯 O que é o VSmenu?

VSmenu 2.0 é um **sistema completo de gestão para restaurantes** que oferece:

- 🍽️ **Gestão de Cardápio** - Controle completo de produtos, categorias e preços
- 📱 **Pedidos Multi-Canal** - App mobile, web, delivery e presencial
- 👨‍🍳 **Controle de Cozinha** - Gerenciamento de pedidos em tempo real
- 🚚 **Delivery Integrado** - Sistema completo de entrega
- 💰 **Gestão Financeira** - Controle de vendas, pagamentos e relatórios
- 📊 **Relatórios** - Analytics e insights de negócio

## 🏗️ Arquitetura

O VSmenu é construído com uma arquitetura moderna e escalável:

```
┌─────────────────────────────────────────────────────────┐
│                    Aplicações Cliente                    │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Web (Vue)   │ Desktop (El) │ Mobile (RN)  │ Mobile (RN)│
│   Delivery   │   Interno    │   Garçom     │ Entregador │
└──────────────┴──────────────┴──────────────┴────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    API Backend (Laravel)│
              │    + WebSocket          │
              └─────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  PostgreSQL      │      │  Redis Cache     │
    │  (Banco de Dados)│      │  + WebSocket     │
    └──────────────────┘      └──────────────────┘
```

## 🛠️ Tecnologias Principais

### Backend
- **Laravel 11** - Framework PHP
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e WebSocket
- **Sanctum** - Autenticação API

### Frontend Web
- **Vue 3** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Pinia** - State management
- **Tailwind CSS** - Estilização

### Mobile
- **React Native** - Apps multiplataforma
- **TypeScript** - Tipagem estática
- **Redux** - State management

### Desktop
- **Electron** - App desktop
- **Vue 3** - Interface
- **SQLite** - Banco local offline

### Infraestrutura
- **Google Cloud Platform** - Cloud provider
- **Kubernetes (GKE)** - Orquestração
- **Terraform** - IaC
- **GitHub Actions** - CI/CD

## 📚 Próximos Passos

Explore a documentação:

1. 📖 **[Arquitetura](/architecture/)** - Entenda a arquitetura completa
2. 🔌 **[API](/api/)** - Consulte a documentação da API
3. 🎨 **[Design System](/guides/)** - Veja os componentes disponíveis
4. 🧪 **[Tutoriais](/tutorials/)** - Aprenda com exemplos práticos

## 🤝 Precisa de Ajuda?

- 📝 [Abra uma issue](https://github.com/vsmenu/vsmenu-docs/issues)
- 💬 [Discussões no GitHub](https://github.com/vsmenu/vsmenu-docs/discussions)
- 📧 Entre em contato com a equipe

---

Pronto para começar? Continue explorando a documentação! 🚀


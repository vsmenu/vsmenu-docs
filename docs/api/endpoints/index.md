---
title: Endpoints da API
description: Documentação detalhada dos endpoints da API VSmenu
---

# Endpoints da API

Documentação completa de todos os endpoints da API VSmenu organizados por módulo.

## 🎯 Organização

Os endpoints estão organizados por módulo funcional do sistema.

## 📋 Módulos

::: info Em Desenvolvimento
Documentação detalhada dos endpoints está sendo criada.
:::

### Autenticação
```http
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

### Produtos
```http
GET    /products
GET    /products/{id}
POST   /products
PUT    /products/{id}
DELETE /products/{id}
```

### Categorias
```http
GET    /categories
GET    /categories/{id}
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}
```

### Pedidos
```http
GET    /orders
GET    /orders/{id}
POST   /orders
PUT    /orders/{id}
PATCH  /orders/{id}/status
DELETE /orders/{id}
```

### Clientes
```http
GET    /customers
GET    /customers/{id}
POST   /customers
PUT    /customers/{id}
DELETE /customers/{id}
```

### Mesas
```http
GET    /tables
GET    /tables/{id}
POST   /tables
PUT    /tables/{id}
PATCH  /tables/{id}/status
```

### Usuários
```http
GET    /users
GET    /users/{id}
POST   /users
PUT    /users/{id}
DELETE /users/{id}
```

### Relatórios
```http
GET    /reports/sales
GET    /reports/products
GET    /reports/orders
```

## 📚 Documentação Completa

Para documentação interativa completa (Swagger/OpenAPI):

::: tip Em Breve
API interativa estará disponível em `https://api.vsmenu.io/docs`
:::

## 🔑 Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem autenticação via Bearer Token:

```http
Authorization: Bearer {seu-token}
```

## 🌐 Base URLs

```
Produção:  https://api.vsmenu.io/v1
Staging:   https://staging-api.vsmenu.io/v1
Local:     http://localhost:8000/api/v1
```

## 🤝 Contribuindo

Quer documentar um endpoint? Veja o [Guia de Contribuição](/contributing/).

---

**Voltar para:** [API](/api/)


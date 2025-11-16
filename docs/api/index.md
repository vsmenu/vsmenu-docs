---
title: API
description: Documentação da API REST do VSmenu 2.0
---

# Documentação da API

Documentação completa da API REST do VSmenu 2.0.

## 🔌 Visão Geral

A API do VSmenu fornece acesso programático a todas as funcionalidades do sistema através de endpoints RESTful seguindo os padrões da indústria.

### Base URL

```
Production: https://api.vsmenu.io/v1
Staging: https://staging-api.vsmenu.io/v1
```

### Autenticação

A API utiliza **Laravel Sanctum** para autenticação baseada em tokens:

```http
Authorization: Bearer {seu-token-aqui}
```

### Formato de Resposta

Todas as respostas seguem o formato JSON:

```json
{
  "success": true,
  "data": {},
  "message": "Operação realizada com sucesso"
}
```

## 📚 Endpoints Principais

### Autenticação

```http
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
GET  /auth/me
```

### Produtos

```http
GET    /products
GET    /products/{id}
POST   /products
PUT    /products/{id}
DELETE /products/{id}
```

### Pedidos

```http
GET    /orders
GET    /orders/{id}
POST   /orders
PUT    /orders/{id}
PATCH  /orders/{id}/status
```

### Clientes

```http
GET    /customers
GET    /customers/{id}
POST   /customers
PUT    /customers/{id}
```

## 🔔 WebSocket Events

Eventos em tempo real disponíveis:

- `order.created` - Novo pedido criado
- `order.updated` - Pedido atualizado
- `order.status_changed` - Status do pedido alterado
- `table.updated` - Mesa atualizada
- `notification.new` - Nova notificação

## 📖 Documentação Interativa

::: tip Em Desenvolvimento
A documentação interativa completa (Swagger/OpenAPI) estará disponível em breve.
:::

## 🧪 Exemplos

### Criar um Pedido

```javascript
const response = await fetch('https://api.vsmenu.io/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer seu-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_id: 123,
    items: [
      { product_id: 1, quantity: 2, price: 29.90 },
      { product_id: 5, quantity: 1, price: 15.00 }
    ],
    delivery_address_id: 456,
    payment_method: 'credit_card'
  })
});

const data = await response.json();
console.log(data);
```

---

::: tip Em Desenvolvimento
A documentação completa da API está sendo construída. Contribuições são bem-vindas!
:::

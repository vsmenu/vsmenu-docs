---
title: Diagramas de Arquitetura
description: Diagramas visuais da arquitetura do sistema VSmenu
---

# Diagramas de Arquitetura

Diagramas visuais para compreender a arquitetura do VSmenu 2.0.

## 🎯 Diagramas Disponíveis

::: info Em Desenvolvimento
Diagramas detalhados estão sendo criados.
:::

### Diagrama de Alto Nível

```mermaid
graph TB
    subgraph "Clientes"
        WEB[Web App]
        DESK[Desktop App]
        MOB_W[Mobile Garçom]
        MOB_D[Mobile Entregador]
    end
    
    subgraph "Backend"
        API[API Laravel]
        WS[WebSocket]
        QUEUE[Job Queue]
    end
    
    subgraph "Dados"
        DB[(PostgreSQL)]
        REDIS[(Redis)]
        S3[(Cloud Storage)]
    end
    
    WEB --> API
    DESK --> API
    MOB_W --> API
    MOB_D --> API
    
    WEB -.-> WS
    DESK -.-> WS
    MOB_W -.-> WS
    
    API --> DB
    API --> REDIS
    API --> S3
    WS --> REDIS
```

### Diagramas Planejados

- **Diagrama de Componentes** - Visão detalhada dos componentes
- **Diagrama de Sequência** - Fluxos principais do sistema
- **Diagrama de Implantação** - Infraestrutura GCP/Kubernetes
- **Diagrama de Dados** - Modelo de dados (ER)
- **Diagrama de Integração** - APIs e integrações externas

## 📊 Ferramentas

Diagramas criados com:

- **Mermaid** - Diagramas em markdown
- **Draw.io** - Diagramas complexos
- **PlantUML** - Diagramas UML

## 🤝 Contribuindo

Quer adicionar ou melhorar diagramas? Veja o [Guia de Contribuição](/contributing/).

---

**Voltar para:** [Arquitetura](/architecture/)

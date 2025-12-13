---
title: Architecture Decision Records (ADRs)
description: Registros completos de decisões arquiteturais do VSmenu 2.0
---

# Architecture Decision Records (ADRs)

Documentação detalhada das decisões arquiteturais importantes tomadas no desenvolvimento do VSmenu 2.0.

## 🎯 O que são ADRs?

**Architecture Decision Records (ADRs)** são documentos que capturam decisões arquiteturais importantes, registrando:

- **Contexto**: Por que precisamos tomar esta decisão?
- **Decisão**: O que decidimos fazer?
- **Alternativas**: Que outras opções consideramos?
- **Consequências**: Quais são os impactos positivos e negativos?
- **Status**: Proposta, Aceita, Rejeitada, Depreciada, Substituída

ADRs são imutáveis - uma vez aceitos, não são modificados. Novas decisões que supersede antigas criam novos ADRs.

## 📋 Índice de ADRs

| ADR | Título | Status | Data |
|-----|--------|--------|------|
| [ADR-001](#adr-001) | Escolha do Framework Backend (Laravel) | ✅ Aceito | 2024-10 |
| [ADR-002](#adr-002) | Arquitetura Offline-First no Desktop | ✅ Aceito | 2024-10 |
| [ADR-003](#adr-003) | Multi-tenancy por Subdomínio | ✅ Aceito | 2024-10 |
| [ADR-004](#adr-004) | Flutter para Mobile Apps | ✅ Aceito | 2024-10 |
| [ADR-005](#adr-005) | Vue.js 3 para Frontend Web | ✅ Aceito | 2024-10 |
| [ADR-006](#adr-006) | Google Cloud Platform (GCP) | ✅ Aceito | 2024-10 |
| [ADR-007](#adr-007) | Clean Architecture + DDD no Backend | ✅ Aceito | 2024-10 |
| [ADR-008](#adr-008) | Event Sourcing para Sincronização | ✅ Aceito | 2024-10 |
| [ADR-009](#adr-009) | MySQL como Banco de Dados Principal | ✅ Aceito | 2024-11 |
| [ADR-010](#adr-010) | Monorepo vs Multirepo | ✅ Aceito | 2024-11 |

---

## ADR-001: Escolha do Framework Backend (Laravel) {#adr-001}

**Status:** ✅ Aceito

**Data:** Outubro 2024

**Decisores:** Equipe de Arquitetura

### Contexto

Precisávamos escolher um framework backend robusto, maduro e produtivo para construir a API central do VSmenu 2.0. A API seria o coração do sistema, gerenciando:

- Autenticação e autorização
- Multi-tenancy
- Lógica de negócio complexa
- Integrações externas
- Real-time via WebSocket
- Background jobs

### Decisão

**Escolhemos Laravel 10+ com PHP 8.2+** como framework backend.

### Alternativas Consideradas

#### 1. Node.js + Express.js

**Prós:**
- JavaScript full-stack
- Performance assíncrona
- Ecossistema npm rico
- Ótimo para real-time

**Contras:**
- Menos estruturado que Laravel
- Necessidade de escolher muitas bibliotecas
- Callback hell / Promise complexity
- Menos maduro para DDD/Clean Architecture

#### 2. Python + Django/FastAPI

**Prós:**
- Excelente para ML/Data Science
- Django admin poderoso
- FastAPI moderno e rápido

**Contras:**
- Menor comunidade no Brasil
- Deploy mais complexo
- Menos familiaridade da equipe

#### 3. Go + Gin/Echo

**Prós:**
- Performance excepcional
- Binários compilados
- Concorrência nativa

**Contras:**
- Curva de aprendizado
- Verbosidade
- Menos bibliotecas prontas
- Equipe sem experiência

### Consequências

#### Positivas ✅

1. **Produtividade**: Laravel acelera desenvolvimento com convenções e ferramentas
2. **Eloquent ORM**: Simplifica operações de banco com Active Record
3. **Sanctum**: Autenticação API out-of-the-box
4. **Broadcasting**: WebSocket integrado
5. **Queue**: Sistema de filas robusto
6. **Ecosystem**: Pacotes maduros (Telescope, Horizon, etc)
7. **Comunidade**: Grande comunidade brasileira
8. **Equipe**: Familiaridade da equipe

#### Negativas ⚠️

1. **Performance**: PHP é mais lento que Go/Node para operações CPU-intensive
2. **Async**: Suporte assíncrono limitado
3. **Tipagem**: Tipagem mais fraca que TypeScript/Go (mitigado com PHP 8.2+)
4. **Memory**: Consome mais memória que Go

#### Riscos 🔺

- **Lock-in**: Acoplamento ao ecossistema Laravel (mitigado com Clean Architecture)
- **Escalabilidade**: Precisa de mais recursos que alternativas (mitigado com Kubernetes)

### Implementação

- Laravel 10+
- PHP 8.2+ com tipos estritos
- Clean Architecture para reduzir lock-in
- Docker para padronização
- Kubernetes para escala horizontal

---

## ADR-002: Arquitetura Offline-First no Desktop {#adr-002}

**Status:** ✅ Aceito

**Data:** Outubro 2024

**Decisores:** Equipe de Arquitetura

### Contexto

Restaurantes frequentemente têm conexão instável ou inexistente. O sistema Desktop precisa funcionar 100% offline para:

- Registrar vendas no PDV
- Gerenciar mesas e comandas
- Controlar estoque
- Gerar relatórios locais

### Decisão

**Implementar arquitetura offline-first** com SQLite local + sincronização bidirecional com API quando online.

### Alternativas Consideradas

#### 1. Online-only

**Prós:**
- Simples de implementar
- Dados sempre sincronizados
- Sem complexidade de sync

**Contras:**
- ❌ Não funciona sem internet (BLOQUEADOR)
- ❌ Dependência total da cloud
- ❌ Latência em operações

#### 2. Cache Local Simples

**Prós:**
- Funciona offline para leitura
- Simples de implementar

**Contras:**
- ❌ Não permite criação/edição offline
- ❌ Dados podem ficar desatualizados
- ❌ Não resolve o problema principal

#### 3. Offline-First com Event Sourcing

**Prós:**
- ✅ Funciona 100% offline
- ✅ Sincronização bidirecional
- ✅ Histórico completo de mudanças
- ✅ Resolução de conflitos robusta

**Contras:**
- Complexidade de implementação
- Necessidade de resolução de conflitos

### Decisão Final

**Arquitetura Offline-First com Event Sourcing** (Alternativa 3)

### Consequências

#### Positivas ✅

1. **Resiliência**: Sistema funciona sem internet
2. **UX**: Sem latência de rede
3. **Confiabilidade**: Não depende de conexão estável
4. **Autonomia**: Restaurante opera independente

#### Negativas ⚠️

1. **Complexidade**: Sincronização é complexa
2. **Conflitos**: Necessidade de resolver conflitos
3. **Storage**: Dados locais ocupam espaço
4. **Manutenção**: Migrations locais + remotas

#### Riscos 🔺

- **Data Loss**: Falha no hardware local (mitigado com backups automáticos)
- **Conflitos**: Edições concorrentes (mitigado com Event Sourcing + timestamps)
- **Sync Bugs**: Bugs na sincronização (mitigado com testes extensivos)

### Implementação

- **SQLite** para banco local
- **Event Queue** para eventos pendentes
- **Timestamp + Hash** para resolução de conflitos
- **Retry Logic** com exponential backoff
- **Background Sync** quando online

---

## ADR-003: Multi-tenancy por Subdomínio {#adr-003}

**Status:** ✅ Aceito

**Data:** Outubro 2024

**Decisores:** Equipe de Arquitetura

### Contexto

O Delivery Web precisa servir múltiplos restaurantes isolados na mesma aplicação. Cada restaurante precisa:

- URL personalizada
- Branding próprio
- Dados completamente isolados
- Configurações customizáveis

### Decisão

**Implementar multi-tenancy por subdomínio**: `{tenant}.vsmenu.io`

### Alternativas Consideradas

#### 1. Banco Separado por Tenant

**Prós:**
- Isolamento total
- Performance independente
- Segurança máxima

**Contras:**
- ❌ Custo alto (múltiplos bancos)
- ❌ Dif ícil de gerenciar
- ❌ Migrations complexas
- ❌ Não escala bem

#### 2. Schema Separado por Tenant

**Prós:**
- Isolamento bom
- Um banco só
- Performance ok

**Contras:**
- ❌ Limites de schemas (PostgreSQL)
- ❌ Migrations por schema
- ❌ Complexo de gerenciar

#### 3. Linha Compartilhada com tenant_id

**Prós:**
- ✅ Simples de implementar
- ✅ Um banco, um schema
- ✅ Query scoping automático
- ✅ Escala horizontalmente

**Contras:**
- Risco de vazamento de dados (mitigado com middleware)
- Performance pode degradar com muitos tenants (mitigado com índices)

#### 4. Subdomínio + tenant_id

**Prós:**
- ✅ URL personalizada
- ✅ Branding individual
- ✅ SEO otimizado
- ✅ Simples de implementar

**Contras:**
- Necessidade de DNS wildcard
- SSL wildcard ou Let's Encrypt

### Decisão Final

**Multi-tenancy por Subdomínio (Alternativa 4)** com tenant_id no banco

### Consequências

#### Positivas ✅

1. **UX**: Cada restaurante tem sua URL
2. **Branding**: Personalizável por tenant
3. **SEO**: Melhor ranqueamento
4. **Simplicidade**: Fácil de implementar
5. **Escalabilidade**: Escala bem

#### Negativas ⚠️

1. **DNS**: Necessidade de DNS wildcard
2. **SSL**: Certificado wildcard ou automação
3. **Vazamento**: Risco de query sem tenant (mitigado)

#### Riscos 🔺

- **Data Leak**: Query sem tenant_id (mitigado com Global Scopes + Middleware)
- **Performance**: N+1 queries (mitigado com eager loading)

### Implementação

- **Middleware** detecta tenant via subdomínio
- **Global Scopes** no Eloquent para query automático
- **Tenant Context** em Service Container
- **DNS Wildcard** + Let's Encrypt
- **Testes** para garantir isolamento

---

## ADR-004: Flutter para Mobile Apps {#adr-004}

**Status:** ✅ Aceito

**Data:** Outubro 2024

**Decisores:** Equipe de Arquitetura

### Contexto

Precisamos desenvolver 2 apps mobile (Garçom e Entregador) para iOS e Android com:

- Performance nativa
- UI consistente
- Desenvolvimento ágil
- Código compartilhado

### Decisão

**Escolhemos Flutter 3.16+** para desenvolvimento mobile.

### Alternativas Consideradas

#### 1. React Native

**Prós:**
- JavaScript (familiaridade)
- Comunidade grande
- Hot reload
- Expo para dev rápido

**Contras:**
- Performance menor que Flutter
- Dependências nativas problemáticas
- Debugging mais difícil

#### 2. Native (Swift + Kotlin)

**Prós:**
- Performance máxima
- Acesso total à plataforma
- UI 100% nativa

**Contras:**
- ❌ Código duplicado
- ❌ 2x tempo de desenvolvimento
- ❌ 2 equipes necessárias
- ❌ Custo alto

#### 3. Flutter

**Prós:**
- ✅ Código compartilhado iOS/Android
- ✅ Performance próxima do nativo
- ✅ Hot reload excepcional
- ✅ UI consistente
- ✅ BLoC pattern maduro

**Contras:**
- Dart (nova linguagem para equipe)
- Menos bibliotecas que RN

### Decisão Final

**Flutter 3.16+**

### Consequências

#### Positivas ✅

1. **Produtividade**: Um código, duas plataformas
2. **Performance**: Compilação AOT
3. **UI**: Widgets consistentes
4. **Hot Reload**: Desenvolvimento ágil
5. **BLoC**: State management maduro

#### Negativas ⚠️

1. **Aprendizado**: Equipe precisa aprender Dart
2. **Size**: Apps maiores que nativos
3. **Bibliotecas**: Menos que JavaScript

### Implementação

- Flutter 3.16+
- Clean Architecture
- BLoC Pattern
- GetIt (DI)
- Dio (HTTP)

---

## ADR-005: Vue.js 3 para Frontend Web {#adr-005}

**Status:** ✅ Aceito

**Data:** Outubro 2024

### Contexto

Precisamos de framework frontend para:

- Delivery Web (multi-tenant)
- Sales Panel (dashboards)
- Landing Page (SEO)
- Consistência com Desktop (Electron)

### Decisão

**Vue.js 3 com Composition API**

### Alternativas

1. **React**: Mais popular, mas mais complexo
2. **Angular**: Muito pesado para nossa escala
3. **Svelte**: Muito novo, comunidade pequena
4. **Vue.js 3**: ✅ Escolhido

### Consequências Positivas

- Curva de aprendizado suave
- Composition API moderna
- Vite para build rápido
- Reutilização com Electron

---

## ADR-006: Google Cloud Platform (GCP) {#adr-006}

**Status:** ✅ Aceito

**Data:** Outubro 2024

### Decisão

**GCP como cloud provider principal**

### Alternativas

1. **AWS**: Mais completo, mais caro, mais complexo
2. **Azure**: Forte em .NET, não nosso caso
3. **GCP**: ✅ Melhor custo-benefício, Kubernetes nativo

### Consequências

- GKE (Kubernetes Engine)
- Cloud SQL (MySQL gerenciado)
- Memorystore (Redis gerenciado)
- Cloud Storage
- Cloud CDN

---

## ADR-007: Clean Architecture + DDD no Backend {#adr-007}

**Status:** ✅ Aceito

**Data:** Outubro 2024

### Decisão

**Implementar Clean Architecture com Domain-Driven Design**

### Camadas

1. **Domain**: Entidades, Value Objects, Regras puras
2. **Application**: Use Cases, DTOs
3. **Infrastructure**: Repositories, Cache, Queue
4. **Presentation**: Controllers, Middleware

### Consequências

- Testabilidade alta
- Baixo acoplamento
- Manutenibilidade
- Mais camadas (complexidade inicial)

---

## ADR-008: Event Sourcing para Sincronização {#adr-008}

**Status:** ✅ Aceito

**Data:** Outubro 2024

### Decisão

**Event Sourcing para sincronização Desktop ↔ API**

### Estratégia

- Eventos gravados localmente
- Queue de eventos pendentes
- Sync quando online
- Resolução de conflitos por timestamp + hash

### Consequências

- Auditoria completa
- Resolução de conflitos robusta
- Complexidade adicional

---

## ADR-009: MySQL como Banco de Dados Principal {#adr-009}

**Status:** ✅ Aceito

**Data:** Novembro 2024

### Decisão

**MySQL 8.0 no Cloud SQL**

### Alternativas

1. **PostgreSQL**: Mais features, mas menos familiaridade da equipe
2. **MySQL**: ✅ Maturidade, performance, familiaridade

### Consequências

- Suporte JSON nativo (8.0+)
- Performance excelente
- Cloud SQL gerenciado
- Replicação built-in

---

## ADR-010: Multirepo vs Monorepo {#adr-010}

**Status:** ✅ Aceito

**Data:** Novembro 2024

### Decisão

**Multirepo** - repositórios separados por aplicação

### Justificativa

- Aplicações independentes com stacks diferentes
- Equipes podem trabalhar isoladamente
- Deploy independente
- CI/CD mais simples

### Repositórios

1. vsmenu-api
2. vsmenu-delivery-web
3. vsmenu-desktop
4. vsmenu-mobile-waiter
5. vsmenu-mobile-deliverer
6. vsmenu-sales-panel
7. vsmenu-landing
8. vsmenu-design-system
9. vsmenu-infrastructure
10. vsmenu-docs (este repositório)

---

## 📝 Template para Novos ADRs

Use este template ao criar novos ADRs:

```markdown
## ADR-XXX: [Título da Decisão]

**Status:** 🟡 Proposta | ✅ Aceito | ❌ Rejeitado | 🔄 Depreciado | ↪️ Substituído

**Data:** Mês/Ano

**Decisores:** Nome(s)

### Contexto

[Descreva o contexto e o problema a ser resolvido]

### Decisão

[Descreva a decisão tomada]

### Alternativas Consideradas

#### Alternativa 1: [Nome]

**Prós:**
- ...

**Contras:**
- ...

#### Alternativa 2: [Nome]

**Prós:**
- ...

**Contras:**
- ...

### Consequências

#### Positivas ✅
1. ...

#### Negativas ⚠️
1. ...

#### Riscos 🔺
- ...

### Implementação

[Como será implementado]

### Referências

- [Links relevantes]
```

## 📚 Referências

- [Architecture Decision Records](https://adr.github.io/)
- [Joel Parker Henderson ADR Templates](https://github.com/joelparkerhenderson/architecture-decision-record)
- [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar)
- [Martin Fowler - ADR](https://martinfowler.com/articles/scaling-architecture-conversationally.html)

## 🤝 Contribuindo

Para propor um novo ADR:

1. Crie uma issue descrevendo a decisão
2. Use o template acima
3. Abra PR com discussão
4. Após aprovação, status vira "Aceito"

---

[⬅️ Voltar para Arquitetura](../index.md)

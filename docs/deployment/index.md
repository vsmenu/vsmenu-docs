---
title: Deploy e Implantação
description: Guias de deploy para os ambientes do VSmenu 2.0
---

# Deploy e Implantação

Guias completos para implantação do VSmenu em diferentes ambientes.

## 🎯 Visão Geral

O VSmenu utiliza estratégias modernas de deploy para garantir disponibilidade, escalabilidade e confiabilidade.

## 🌍 Ambientes

### Desenvolvimento (Local)

Ambiente para desenvolvimento local em sua máquina.

**Requisitos:**

- Docker & Docker Compose
- Node.js 18+
- PHP 8.2+
- PostgreSQL 15+

**Setup:**

```bash
# Clone os repositórios
git clone https://github.com/vsmenu/vsmenu-api.git
git clone https://github.com/vsmenu/vsmenu-delivery-web.git

# Configure as variáveis de ambiente
cp .env.example .env

# Suba os serviços
docker-compose up -d
```

::: tip Dica
Use o Docker Compose para subir todos os serviços de uma vez!
:::

### Staging

Ambiente de homologação para testes antes da produção.

**Características:**

- Dados de teste
- Integração com serviços sandbox
- Acesso restrito

**URL:** `https://staging.vsmenu.io`

::: info Em Desenvolvimento
Documentação detalhada em construção.
:::

### Produção

Ambiente de produção com dados reais.

**Características:**

- Alta disponibilidade
- Backup automático
- Monitoramento 24/7
- Rollback automático em falhas

**URL:** `https://app.vsmenu.io`

::: warning Atenção
Deploy em produção requer aprovação e segue processo rigoroso.
:::

## 🚀 Processo de Deploy

### 1. Desenvolvimento

```bash
# Desenvolva em branch feature
git checkout -b feature/nova-funcionalidade

# Commit e push
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 2. Pull Request

- Abra PR para a branch `develop`
- Aguarde revisão de código
- CI/CD executa testes automaticamente

### 3. Staging

```bash
# Merge para develop dispara deploy automático no staging
git checkout develop
git merge feature/nova-funcionalidade
git push origin develop
```

### 4. Produção

```bash
# Após validação no staging, merge para main
git checkout main
git merge develop
git tag v1.2.3
git push origin main --tags
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Todos os repositórios utilizam GitHub Actions para automação:

**Pipeline:**

1. **Lint** - Verificação de código
2. **Test** - Execução de testes
3. **Build** - Build da aplicação
4. **Deploy** - Deploy automático

### Infraestrutura

- **Cloud Provider:** Google Cloud Platform (GCP)
- **Orquestração:** Kubernetes (GKE)
- **IaC:** Terraform
- **Monitoramento:** Grafana + Prometheus

## 📦 Deploy por Aplicação

### Backend (API)

```bash
# Build da imagem Docker
docker build -t vsmenu-api:latest .

# Deploy no Kubernetes
kubectl apply -f k8s/deployment.yaml
```

### Frontend Web

```bash
# Build de produção
npm run build

# Deploy (automático via GitHub Actions)
# ou manual via Vercel/Netlify
```

### Mobile

```bash
# Android
npm run build:android:release

# iOS
npm run build:ios:release

# Upload para lojas
fastlane deploy
```

### Desktop

```bash
# Build para todas as plataformas
npm run build:all

# Gera instaladores
npm run package
```

## 🛡️ Segurança

- Secrets gerenciados via GitHub Secrets
- Variáveis de ambiente por ambiente
- HTTPS obrigatório
- Certificados renovados automaticamente

## 📊 Monitoramento

Após o deploy, monitore:

- Logs de aplicação
- Métricas de performance
- Alertas de erro
- Uso de recursos

## 🔙 Rollback

Em caso de problemas:

```bash
# Kubernetes (rollback automático)
kubectl rollout undo deployment/vsmenu-api

# Manual (via tag anterior)
git checkout v1.2.2
# seguir processo de deploy
```

## 🤝 Contribuindo

Melhorias no processo de deploy são bem-vindas! Veja o [Guia de Contribuição](/contributing/).

---

Próximo: [Guias de Desenvolvimento](/guides/)

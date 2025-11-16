import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "VSmenu Docs",
  description: "Documentação completa do sistema VSmenu 2.0",
  lang: 'pt-BR',
  
  // Base URL para GitHub Pages
  // Se estiver usando custom domain (docs.vsmenu.io), use '/'
  // Se estiver usando GitHub Pages padrão, use '/vsmenu-docs/'
  base: '/vsmenu-docs/',
  
  // Clean URLs
  cleanUrls: true,
  
  // Last updated
  lastUpdated: true,
  
  // Markdown config
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  themeConfig: {
    // Logo
    logo: '/images/vsmenu-logo.png',
    siteTitle: 'VSmenu Docs',

    // Top Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Arquitetura', link: '/architecture/' },
      { text: 'API', link: '/api/' },
      { 
        text: 'Guias', 
        link: '/guides/',
        activeMatch: '/guides/'
      },
      { 
        text: 'Mais',
        items: [
          { text: 'Tutoriais', link: '/tutorials/' },
          { text: 'Regras de Negócio', link: '/business-rules/' },
          { text: 'Testes', link: '/testing/' },
          { text: 'Deploy', link: '/deployment/' },
          { text: 'Contribuir', link: '/contributing/' },
          { text: 'Changelog', link: '/changelog/' }
        ]
      }
    ],

    // Sidebar Navigation
    sidebar: {
      // Getting Started
      '/getting-started/': [
        {
          text: '🚀 Getting Started',
          items: [
            { text: 'Overview', link: '/getting-started/' },
            { text: 'Instalação', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Pré-requisitos', link: '/getting-started/prerequisites' }
          ]
        }
      ],

      // Architecture
      '/architecture/': [
        {
          text: '🏗️ Arquitetura',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Visão Geral', link: '/architecture/overview' },
            { text: 'Componentes', link: '/architecture/components' },
            { text: 'Fluxo de Dados', link: '/architecture/data-flow' }
          ]
        },
        {
          text: '📋 ADRs',
          collapsed: true,
          items: [
            { text: 'Architecture Decisions', link: '/architecture/decisions/' }
          ]
        },
        {
          text: '📊 Diagramas',
          collapsed: true,
          items: [
            { text: 'Diagramas', link: '/architecture/diagrams/' }
          ]
        }
      ],

      // API
      '/api/': [
        {
          text: '🔌 API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Autenticação', link: '/api/authentication' },
            { text: 'Webhooks', link: '/api/webhooks' },
            { text: 'WebSockets', link: '/api/websockets' }
          ]
        },
        {
          text: '📍 Endpoints',
          collapsed: false,
          items: [
            { text: 'Endpoints por Módulo', link: '/api/endpoints/' }
          ]
        }
      ],

      // Guides
      '/guides/': [
        {
          text: '📚 Guias',
          items: [
            { text: 'Overview', link: '/guides/' }
          ]
        },
        {
          text: '🔧 Backend',
          collapsed: false,
          items: [
            { text: 'vsmenu-api', link: '/guides/api/' }
          ]
        },
        {
          text: '🌐 Frontend',
          collapsed: false,
          items: [
            { text: 'vsmenu-delivery-web', link: '/guides/web/' }
          ]
        },
        {
          text: '💻 Desktop',
          collapsed: false,
          items: [
            { text: 'vsmenu-desktop', link: '/guides/desktop/' }
          ]
        },
        {
          text: '📱 Mobile',
          collapsed: false,
          items: [
            { text: 'Mobile Garçom', link: '/guides/mobile-waiter/' },
            { text: 'Mobile Entregador', link: '/guides/mobile-deliverer/' }
          ]
        },
        {
          text: '🎨 Design',
          collapsed: false,
          items: [
            { text: 'Design System', link: '/guides/design-system/' }
          ]
        }
      ],

      // Tutorials
      '/tutorials/': [
        {
          text: '🎯 Tutoriais',
          items: [
            { text: 'Overview', link: '/tutorials/' }
          ]
        },
        {
          text: '📗 Iniciante',
          collapsed: false,
          items: [
            { text: 'Tutoriais Iniciantes', link: '/tutorials/beginner/' }
          ]
        },
        {
          text: '📘 Intermediário',
          collapsed: false,
          items: [
            { text: 'Tutoriais Intermediários', link: '/tutorials/intermediate/' }
          ]
        },
        {
          text: '📕 Avançado',
          collapsed: false,
          items: [
            { text: 'Tutoriais Avançados', link: '/tutorials/advanced/' }
          ]
        }
      ],

      // Business Rules
      '/business-rules/': [
        {
          text: '📋 Regras de Negócio',
          items: [
            { text: 'Overview', link: '/business-rules/' },
            { text: 'Produtos', link: '/business-rules/products' },
            { text: 'Pedidos', link: '/business-rules/orders' },
            { text: 'Mesas', link: '/business-rules/tables' },
            { text: 'Delivery', link: '/business-rules/delivery' },
            { text: 'Clientes', link: '/business-rules/customers' },
            { text: 'Pagamentos', link: '/business-rules/payments' },
            { text: 'Estoque', link: '/business-rules/inventory' }
          ]
        }
      ],

      // Testing
      '/testing/': [
        {
          text: '🧪 Testes',
          items: [
            { text: 'Overview', link: '/testing/' },
            { text: 'Testes Unitários', link: '/testing/unit-tests' },
            { text: 'Testes de Integração', link: '/testing/integration-tests' },
            { text: 'Testes E2E', link: '/testing/e2e-tests' }
          ]
        }
      ],

      // Deployment
      '/deployment/': [
        {
          text: '🚀 Deploy',
          items: [
            { text: 'Overview', link: '/deployment/' },
            { text: 'Ambiente Local', link: '/deployment/local' },
            { text: 'Ambiente Staging', link: '/deployment/staging' },
            { text: 'Ambiente Produção', link: '/deployment/production' }
          ]
        }
      ],

      // Contributing
      '/contributing/': [
        {
          text: '🤝 Contribuindo',
          items: [
            { text: 'Guia de Contribuição', link: '/contributing/' },
            { text: 'Estilo de Código', link: '/contributing/code-style' },
            { text: 'Git Workflow', link: '/contributing/git-workflow' },
            { text: 'Pull Requests', link: '/contributing/pull-requests' }
          ]
        }
      ],

      // Changelog
      '/changelog/': [
        {
          text: '📝 Changelog',
          items: [
            { text: 'Histórico de Mudanças', link: '/changelog/' }
          ]
        }
      ]
    },

    // Social Links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vsmenu' }
    ],

    // Edit Link
    editLink: {
      pattern: 'https://github.com/vsmenu/vsmenu-docs/edit/main/docs/:path',
      text: 'Editar esta página no GitHub'
    },

    // Last Updated
    lastUpdated: {
      text: 'Atualizado em',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // Footer
    footer: {
      message: 'Documentação do VSmenu 2.0',
      copyright: 'Copyright © 2024 VSmenu'
    },

    // Search (Local Search)
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Buscar',
                buttonAriaLabel: 'Buscar documentação'
              },
              modal: {
                noResultsText: 'Nenhum resultado encontrado',
                resetButtonTitle: 'Limpar busca',
                footer: {
                  selectText: 'selecionar',
                  navigateText: 'navegar',
                  closeText: 'fechar'
                }
              }
            }
          }
        }
      }
    },

    // Outline (Table of Contents)
    outline: {
      level: [2, 3],
      label: 'Nesta página'
    },

    // Doc Footer (Previous/Next Links)
    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    },

    // Sidebar Menu Label (Mobile)
    sidebarMenuLabel: 'Menu',
    
    // Return to top label
    returnToTopLabel: 'Voltar ao topo',

    // Dark mode switch
    darkModeSwitchLabel: 'Aparência',
    lightModeSwitchTitle: 'Trocar para modo claro',
    darkModeSwitchTitle: 'Trocar para modo escuro'
  }
})

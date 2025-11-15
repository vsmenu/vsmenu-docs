import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "VSmenu Documentation",
  description: "Documentação técnica completa do projeto VSmenu 2.0 - Sistema de gestão para restaurantes",
  lang: 'pt-BR',
  
  // Base URL - ajustar conforme deploy (GitHub Pages ou custom domain)
  base: '/',
  
  // Head tags
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#FFD600' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'pt_BR' }],
    ['meta', { name: 'og:site_name', content: 'VSmenu Documentation' }],
    ['meta', { name: 'og:image', content: '/logo.svg' }],
  ],

  // Theme config
  themeConfig: {
    logo: '/images/logo.svg',
    
    // Navigation
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Começar', link: '/getting-started/' },
      { text: 'Arquitetura', link: '/architecture/' },
      { text: 'API', link: '/api/' },
      { text: 'Guias', link: '/guides/' },
      { text: 'Tutoriais', link: '/tutorials/' }
    ],

    // Sidebar
    sidebar: {
      '/getting-started/': [
        {
          text: 'Começando',
          items: [
            { text: 'Introdução', link: '/getting-started/' },
          ]
        }
      ],
      '/architecture/': [
        {
          text: 'Arquitetura',
          items: [
            { text: 'Visão Geral', link: '/architecture/' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: 'Introdução', link: '/api/' },
          ]
        }
      ],
      '/guides/': [
        {
          text: 'Guias',
          items: [
            { text: 'Visão Geral', link: '/guides/' },
          ]
        }
      ],
      '/tutorials/': [
        {
          text: 'Tutoriais',
          items: [
            { text: 'Visão Geral', link: '/tutorials/' },
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vsmenu' }
    ],

    // Footer
    footer: {
      message: 'Documentação do projeto VSmenu 2.0',
      copyright: 'Copyright © 2025 VSmenu'
    },

    // Search
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Buscar',
                buttonAriaLabel: 'Buscar'
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

    // Edit link
    editLink: {
      pattern: 'https://github.com/vsmenu/vsmenu-docs/edit/main/docs/:path',
      text: 'Editar esta página no GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Atualizado em',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // Outline
    outline: {
      level: [2, 3],
      label: 'Nesta página'
    },

    // Previous/Next links
    docFooter: {
      prev: 'Anterior',
      next: 'Próximo'
    },

    // Dark mode toggle
    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Mudar para tema claro',
    darkModeSwitchTitle: 'Mudar para tema escuro',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Voltar ao topo'
  },

  // Markdown config
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})


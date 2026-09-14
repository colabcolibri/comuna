# Especificação de Arquitetura & Design System: Projeto Alumni (Next.js + TypeScript)

> **Objetivo:** Criar uma plataforma de Alumni modular, leve, bonita e extensível por plugins (liga/desliga), capaz de atender ~1.000 membros com alta performance, suporte nativo a i18n, temas totalmente customizáveis e arquitetura orientada a domínios (Domain-Driven).

---

## 🎨 1. Design System & Sistema de Temas Dinâmicos

O sistema de temas suporta múltiplos temas alternáveis (ex: `default`, `corporate`, `classic`, `dark-emerald`) onde cada tema define 4 camadas principais de cores:

### 🟢 Camadas de Cores (CSS Tokens)
- `--color-primary`: Cor principal da marca (Botões de ação principal, navegação ativa, destaques primários).
- `--color-secondary`: Cor secundária de apoio (Headers secundários, status de sucesso/conexão, áreas ativas).
- `--color-tertiary`: Cor terciária (Cards de destaque, filtros ativos, categorias de membros).
- `--color-quaternary`: Cor quaternária para detalhes finos (Bordas de foco, badges de detalhe, micro-interações, tooltips).

### 🎨 Temas Pré-Configurados (`themes.json` / CSS Vars)
```css
/* Exemplo de Tokenizacao em globals.css */
:root[data-theme="default"] {
  --color-primary: 243 75% 59%;     /* Indigo Moderno */
  --color-secondary: 160 84% 39%;   /* Emerald */
  --color-tertiary: 217 91% 60%;    /* Blue Accent */
  --color-quaternary: 280 65% 60%;  /* Purple Detail */
}

:root[data-theme="corporate"] {
  --color-primary: 215 25% 27%;     /* Slate/Navy */
  --color-secondary: 38 92% 50%;    /* Amber Accent */
  --color-tertiary: 199 89% 48%;    /* Cyan */
  --color-quaternary: 15 86% 59%;   /* Coral Detail */
}
```

### 🔤 Padronização de Fontes (Tailwind Typography)
- **Sans:** `var(--font-sans)` (Inter / Geist)
- **Mono:** `var(--font-mono)` (Geist Mono / JetBrains Mono)

---

## 🌍 2. Arquitetura de Internacionalização (i18n na Veia)

O projeto nasce com **i18n nativo desde o dia 1** usando `next-intl` (ou `react-i18next` com App Router):

- **Arquivos de Tradução por Domínio:**
```
locales/
├── pt-BR/
│   ├── common.json
│   ├── directory.json
│   ├── events.json
│   └── chat.json
└── en-US/
    ├── common.json
    ├── directory.json
    ├── events.json
    └── chat.json
```
- **Fallback Automático:** Se uma chave de tradução faltar em um módulo novo, o sistema faz fallback gracioso para o idioma padrão (`pt-BR`).

---

## 🧱 3. Arquitetura de Pastas Orientada a Domínios (Domain-Driven) + Plugins

A aplicação é dividida rigorosamente em **Domínios/Módulos**, onde cada domínio contém seus próprios componentes, rotas, traduções e regras de negócio de forma autocontida.

```
alumni/
├── ARCHITECTURE.md
├── locales/                          # Dicionários de Idiomas (i18n)
│   ├── pt-BR/
│   └── en-US/
├── src/
│   ├── app/                          # Next.js App Router (Roteamento Core)
│   │   ├── [locale]/                 # Prefix de Idioma na URL (/pt-BR/..., /en-US/...)
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   └── api/
│   ├── core/                         # Núcleo Global da Plataforma
│   │   ├── theme/                    # Theme Provider & Tokens (primary..quaternary)
│   │   ├── i18n/                     # Provider & Utilities de Internacionalização
│   │   ├── db/                       # Prisma Client & Schemas Relacionais Isolados
│   │   └── plugin-engine/            # Gerenciador de Liga/Desliga de Módulos
│   └── domains/                      # DOMÍNIOS / MÓDULOS EXPANSÍVEIS (PLUGINS)
│       ├── directory/                # Domínio: Diretório de Ex-Alunos
│       │   ├── components/
│       │   ├── services/
│       │   ├── schema.prisma
│       │   └── index.ts (manifesto)
│       ├── events/                   # Domínio: Eventos
│       ├── map/                      # Domínio: Mapa Interativo
│       └── chat/                     # Domínio: Frame de Chat
```

---

## 🔌 4. Manifesto de um Domínio/Módulo Plugin

Todo novo módulo criado registra um manifesto exportado que define suas permissões, chaves de i18n, estado de ativação e rotas:

```typescript
export interface DomainPluginManifest {
  id: string;                    // Ex: 'events'
  nameKey: string;               // Chave i18n para o nome (ex: 'events.module_name')
  enabled: boolean;              // Estado (Liga / Desliga)
  themeColors?: {                // Possibilidade do módulo aplicar detalhes quaternary próprios
    quaternaryOverride?: string;
  };
  navigation: {
    icon: string;
    translationKey: string;
    path: string;
  }[];
  widgets: {
    slot: 'dashboard_top' | 'sidebar' | 'floating_chat';
    component: React.ComponentType;
  }[];
}
```

---

## 🗄️ 5. Banco de Dados Relacional e Isolado por Domínio

- **Core Tables:** `users`, `roles`, `sessions`, `active_plugins`.
- **Domain Tables:** Cada plugin prefixa suas tabelas (ex: `domain_events`, `domain_chat_messages`).
- **Garantia:** Desativar um plugin no painel desabilita a renderização das telas e APIs do domínio **sem corromper o banco de dados principal nem a aplicação**.


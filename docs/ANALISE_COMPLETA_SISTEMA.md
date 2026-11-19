# Análise Completa do Sistema — Segurança, Banco de Dados, Queries, Qualidade e Usabilidade

> **Data da Auditoria:** 2026-11-19  
> **Escopo:** Monorepo completo (`apps/web`, `apps/admin`, `packages/core/*`, `packages/modules/*`, `db/migrations/*` e contratos `docs/00`–`10`)  
> **Agentes Meridian consultados:** `@security-champion` (Janus), `@data-engineer` (Mnemosyne), `@technical-architect` (Daedalus), `@code-investigator` (Hermes)

---

## Sumário Executivo

O **Community Platform** possui uma arquitetura **muito bem desenhada na fundação**: separação clara entre `apps/web` e `apps/admin`, modelo multi-tenant orientado por `community_id`, sistema de plugins first-party (`directory`, `showcase`, `contact-mediated`, `map`, `talent`), uso explícito do driver `pg` sem magia de ORM, e desenho de Row-Level Security (RLS) com role `community_app` (`NOBYPASSRLS`).

Contudo, ao auditar a **implementação real contra a arquitetura e boas práticas de engenharia**, identificamos **falhas críticas e altas** onde os mecanismos de proteção (RLS, conexões do pool, transações, índices, higienização de URLs e contratos RBAC) são **parcialmente contornados ou subutilizados** no código atual.

| Eixo | Maturidade Atual | Principais Achados |
| :--- | :---: | :--- |
| **1. Conexão e Isolamento de Banco (`pg` + RLS)** | 🟠 **Média-Baixa** | `withOpsContext` não assume `SET LOCAL ROLE community_app`; dezenas de funções usam `query()` direto no pool (role dona do banco = `BYPASSRLS`); `poolConfig` sem limites explícitos de conexões/timeouts. |
| **2. Segurança (AppSec, Auth, RBAC, XSS)** | 🔴 **Crítica / Alta** | XSS via `javascript:` em links de perfil (`contacts.*`); rota legada `/api/contact/[membershipId]` sem rate-limit e sem checagem de vitrine; race condition em `consumeOtp`; revogação de usuário suspenso ignorada pelo JWT de 30 dias; divergência RBAC entre doc `07` e código em rotas `/api/admin/*`. |
| **3. Aproveitamento do Banco e Schema** | 🟠 **Média** | Faltam `ON DELETE CASCADE` em FKs do núcleo (causa erro `23503` ao remover membro); tabelas `cards`, `offerings` e `messages` **sem RLS**; ausência de índices (`trgm`, `user_id`, `cohort_id`) para os filtros reais. |
| **4. Qualidade e Eficiência das Queries** | 🟠 **Média** | `directoryScopeSql` / `showcaseScopeSql` executam 4 subqueries correlacionadas no catálogo por linha; bug de JOIN em `plugin_talent.categories` sem `community_id`; waterfalls de 5 a 7 round-trips sequenciais por request; loops `N+1` fora de transação. |
| **5. Qualidade de Uso, Facilidade (UX) e DX** | 🟡 **Média-Alta** | `ProfileForm` em Client Component com waterfall de 3 `fetch` no `useEffect`; `TalentOffers` engole erros silenciosamente sem `toast`; perda de estado não salvo ao trocar aba/avatar; `ignoreBuildErrors: true` nos dois `next.config.ts`. |

---

## 1. Conexão com Banco de Dados Estruturada e Segura

### 1.1. Bypass acidental de RLS em `query()` e `withOpsContext()` (Severidade: Alta)
- **Onde:** [pool.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/db/src/pool.ts#L30-L47), [with-app-context.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/db/src/with-app-context.ts#L9-L32), [with-ops-context.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/db/src/with-ops-context.ts#L4-L22).
- **Diagnóstico:**
  1. O pool conecta com a credencial de `DATABASE_URL` (a role **dona** das tabelas e schemas criada nas migrations). No PostgreSQL, o dono da tabela (`table owner`) **ignora RLS por padrão**, a menos que a tabela tenha `FORCE ROW LEVEL SECURITY` **ou** a transação faça `SET LOCAL ROLE community_app`.
  2. Apenas `withAppContext` executa `SET LOCAL ROLE community_app`.
  3. `withOpsContext` faz apenas `SELECT set_config('app.ops', '1', true)` **sem** `SET LOCAL ROLE community_app`.
  4. Mais grave: a função `query()` exportada por `@community/db` roda diretamente no pool (como owner do banco, sem `SET LOCAL ROLE`, sem `app.user_id` e sem `app.community_id`) e é amplamente usada em rotas públicas e administrativas (`listPublicProfiles`, `loadOfferingsPublic`, `ops-catalog-*`, `communities.ts`, `cohorts.ts`).
- **Risco:** Qualquer tabela sem `FORCE ROW LEVEL SECURITY` ou sem policy restritiva explícita fica totalmente aberta para `query()`, anulando a defesa em profundidade prometida pelo RLS em [06_database.md](file:///Users/sergiolucianojr/Code/alumni/docs/06_database.md#L19).
- **Recomendação:**
  - Restringir `query()` cru apenas a `healthCheck` e bootstrap; criar `withPublicContext(communityId, fn)` que faça `SET LOCAL ROLE community_app` e popule `app.community_id` e `app.surface = 'public'`.
  - Adicionar `SET LOCAL ROLE community_app` dentro de `withOpsContext`.

### 1.2. Configuração do Pool (`pg.Pool`) sem limites e sem proteção contra vazamento em Dev/HMR (Severidade: Média)
- **Onde:** [pool.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/db/src/pool.ts#L4-L40).
- **Diagnóstico:**
  - `let pool: Pool | null = null;` é guardado em escopo de módulo ao invés de `globalThis`. No Next.js (especialmente em dev com Turbopack/HMR e potencialmente entre bundles isolados de Server Components e Route Handlers), múltiplas instâncias de `Pool` são criadas, esgotando `max_connections` do Postgres.
  - `poolConfig` não define `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`, nem `statement_timeout` / `lock_timeout`.
  - Quando `PGSSL=1` sem `PGSSL_REJECT_UNAUTHORIZED=1`, `rejectUnauthorized` fica `false` por padrão ([pool.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/db/src/pool.ts#L17)), deixando conexões SSL vulneráveis a MITM se o operador esquecer a segunda variável.
- **Recomendação:**
  - Armazenar o singleton em `globalThis.__communityPgPool`.
  - Parametrizar `max` (ex.: `15` por processo), `connectionTimeoutMillis: 5000`, `idleTimeoutMillis: 30000` e `statement_timeout: 10000`.
  - Inverter o default de `PGSSL_REJECT_UNAUTHORIZED` para `true` (`!== '0'`).

---

## 2. Segurança (AppSec, Autenticação, Autorização e Privacidade)

### 2.1. Stored XSS via URLs `javascript:` em Contatos do Perfil (Severidade: Crítica)
- **Onde:** [person-profile.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/identity/src/person-profile.ts#L46-L53), [list-view.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/list-view.ts#L100-L114), [PersonInspect.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/components/app/PersonInspect.tsx#L150-L158).
- **Diagnóstico:**
  - Ao contrário de `plugin_talent.offerings` (que valida `/^https:\/\/\S+$/i` em [offerings.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/talent/src/offerings.ts#L29)), a função `parseContacts()` apenas faz `String(row.linkedin || '').trim()` sem validar o protocolo da URL.
  - Da mesma forma, campos customizados do catálogo com `type === 'url'` passam por `coerceAttribute` ([catalog.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/catalog.ts#L232-L235)) apenas como `typeof raw === 'string'`.
  - Em `PersonInspect.tsx`, os links são renderizados diretamente em `<a href={item.href}>`. Se um membro malicioso enviar via `PUT /api/profiles/me` o payload `{"contacts": {"linkedin": "javascript:alert(document.cookie)"}}`, qualquer membro ou visitante que clicar no link executará JS arbitrário no contexto da aplicação.
- **Recomendação:** Validar estritamente todas as URLs (`contacts.linkedin`, `contacts.github`, `contacts.portfolio`, `avatar_url` no `PUT /api/profiles/me`, e campos `type: 'url'` em `coerceAttribute`) exigindo esquema `https://` (ou `http://` apenas para localhost).

### 2.2. Rota Legada `/api/contact/[membershipId]` Exposta sem Proteções (Severidade: Alta)
- **Onde:** [apps/web/src/app/api/contact/[membershipId]/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/contact/%5BmembershipId%5D/route.ts#L7-L62) vs [apps/web/src/app/api/profiles/[id]/contact/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/profiles/%5Bid%5D/contact/route.ts#L23-L100).
- **Diagnóstico:**
  - Existem duas rotas públicas de contato mediado. Enquanto `/api/profiles/[id]/contact` possui rate-limit por IP, verifica `showcaseScopeSql` (se o membro realmente está listado na vitrine) e grava auditoria em `plugin_contact.messages`, a rota legada `/api/contact/[membershipId]`:
    1. **Não tem rate limit** (permite spam ilimitado de e-mails via SMTP da plataforma).
    2. **Não verifica `showcaseScopeSql` nem `network_status = 'active'`** (qualquer atacante que descubra/enumere um UUID de `membership_id`, inclusive de membro `private`, `pending_approval` ou `suspended`, consegue disparar e-mail para ele).
    3. **Não persiste a mensagem** em `plugin_contact.messages` (envia e-mail sem rastro no banco).
- **Recomendação:** Remover `/api/contact/[membershipId]/route.ts` (ou redirecionar para a lógica unificada com rate limit, validação de audiência e persistência).

### 2.3. Race Condition em `consumeOtp` (Brute-Force Paralelo) e Falta de Checagem de `status = 'suspended'` (Severidade: Alta)
- **Onde:** [consume-otp.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/auth/src/consume-otp.ts#L14-L49), [from-request.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/auth/src/from-request.ts#L6-L34).
- **Diagnóstico:**
  1. `consumeOtp` faz `SELECT id, code_hash, attempts ... LIMIT 1` sem `FOR UPDATE` e fora de transação. Em seguida verifica em memória e faz `UPDATE ... SET attempts = attempts + 1`. Requisições concorrentes leem o mesmo `attempts = 0` simultaneamente, permitindo testar dezenas de códigos em paralelo antes do contador atingir 5.
  2. Na linha 36 de `consume-otp.ts`, `SELECT id, global_role FROM auth_core.users WHERE email = $1` **não verifica `status = 'active'`**. Um usuário com `auth_core.users.status = 'suspended'` consegue fazer login normalmente.
  3. O JWT de membro dura **30 dias** ([session.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/auth/src/session.ts#L27)) e `memberFromRequest` apenas valida a assinatura criptográfica do JWT sem checar o banco. Se um membro ou coordenador for suspenso ou demitido, seu token continua válido por até 30 dias (ou 7 dias no ops para `super_admin`).
- **Recomendação:**
  - No `consumeOtp`: usar update atômico ou transação com `SELECT ... FOR UPDATE`, e rejeitar usuários com `status <> 'active'`.
  - Em `issueOtp`: normalizar o e-mail (`normalizeEmail(email)`) antes de gravar/contar em `verification_tokens` (atualmente `User@x.com` e `user@x.com` contam separado no rate limit de banco em [issue-otp.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/auth/src/issue-otp.ts#L13-L28)).

### 2.4. Rate Limiting em Memória (`Map`) e Spoofing de `x-forwarded-for` (Severidade: Média-Alta)
- **Onde:** [apps/web/src/app/api/auth/request-otp/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/auth/request-otp/route.ts#L6-L30), [apps/admin/app/api/admin/auth/request-otp/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/admin/app/api/admin/auth/request-otp/route.ts#L8-L24), [apps/web/src/app/api/profiles/[id]/contact/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/profiles/%5Bid%5D/contact/route.ts#L8-L25).
- **Diagnóstico:**
  - Os três limitadores de IP usam `const ipHits = new Map<string, number[]>()`.
  - Além de nunca limparem chaves antigas (causando **memory leak** sob ataque distribuído de IPs), eles leem o **primeiro** IP de `x-forwarded-for`: `req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()`. Qualquer cliente pode enviar `X-Forwarded-For: <ip-aleatorio>` a cada requisição e contornar 100% do rate limit por IP (e no caso do `/contact`, como não há rate limit no Postgres, o bypass é total).
- **Recomendação:**
  - Para `/contact`: verificar o rate limit diretamente na tabela `plugin_contact.messages` (adicionando coluna `sender_ip` ou limitando por `membership_id` / `sender_email` + janela de tempo no SQL).
  - Para extração de IP: usar o IP confiável do proxy reverso (ex.: `x-real-ip` ou último hop confiável) e limitar tamanho máximo do `Map` (LRU) ou mover a contagem para o Postgres.

### 2.5. Divergência de Autorização (RBAC) entre `07_api_contracts.md` e Código Admin (Severidade: Média-Alta)
- **Onde:** [07_api_contracts.md](file:///Users/sergiolucianojr/Code/alumni/docs/07_api_contracts.md#L98-L123) vs rotas em `apps/admin/app/api/admin/**` e [require-ops.ts](file:///Users/sergiolucianojr/Code/alumni/apps/admin/lib/require-ops.ts#L58-L88).
- **Diagnóstico:**
  - Na tabela de endpoints de `07_api_contracts.md` (linhas 98–123), todas as rotas de mutação do tenant (`PUT /modules/:slug`, `POST /memberships`, `POST /memberships/:id/role`, `DELETE /memberships/:id`, `POST|PATCH|DELETE /fields`, `PUT /lists/:listKey`, `POST|DELETE /cohorts`) estão documentadas com `Auth: Super-admin`.
  - Porém, o texto da linha 28 de `07` e `02_security.md` (linha 74) dizem que o `coordinator` também acessa essas rotas para o seu tenant, e o código usa `requireCommunityOps` / `requireMembershipOps` (que permite `coordinator`!).
  - **Consequência crítica de segurança:** Como `POST /api/admin/memberships/:id/role` e `DELETE /api/admin/memberships/:id` usam `requireMembershipOps`, um `coordinator` pode remover outros coordenadores da mesma comunidade, promover qualquer membro a coordenador, ou **ligar/desligar módulos** (`PUT /modules/:slug`) do tenant.
- **Recomendação:** Alinhar explicitamente `02_security.md`, `07_api_contracts.md` e `require-ops.ts`: definir se ligar/desligar módulos (`PUT /modules/:slug`) e gerir papel de outros coordenadores é exclusivo de `super_admin` (`requireSuperOps`) ou permitido a `coordinator`.

### 2.6. Exposição Pública de Avatares sem Verificação de Audiência (Severidade: Baixa-Média)
- **Onde:** [apps/web/src/app/api/media/person/[userId]/avatar/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/media/person/%5BuserId%5D/avatar/route.ts#L4-L20).
- **Diagnóstico:** Qualquer requisição anônima para `/api/media/person/:userId/avatar` serve os bytes da imagem do disco local sem verificar se o usuário pertence a alguma vitrine pública ou se a requisição está autenticada. Embora documentado em `07` como `"Public se o objecto existir"`, membros que optaram por perfil `private` ou `internal` têm sua foto acessível publicamente caso o `userId` seja conhecido.

---

## 3. Aproveitamento do Banco de Dados (Schema, Constraints, RLS e Índices)

### 3.1. Falta de `ON DELETE CASCADE` / `SET NULL` nas Tabelas do Núcleo — Quebra na Remoção de Membro (Severidade: Alta)
- **Onde:** [20260916020320_core.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20260916020320_core.sql#L37-L94), [20260916020321_plugins.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20260916020321_plugins.sql#L15-L40), [memberships.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/memberships/src/memberships.ts#L220-L228).
- **Diagnóstico:**
  - Em `plugin_directory.cards`: `membership_id uuid PRIMARY KEY REFERENCES network_core.memberships (id)` **NÃO tem `ON DELETE CASCADE`**.
  - Em `plugin_contact.messages`: `membership_id uuid NOT NULL REFERENCES network_core.memberships (id)` **NÃO tem `ON DELETE CASCADE`**.
  - Quando um administrador clica em **"Remover membro"** no Admin (`DELETE /api/admin/memberships/:id` → `removeMembership()`), o comando `DELETE FROM network_core.memberships WHERE id = $1` **falha com erro 500 (`23503 foreign_key_violation`)** para qualquer membro que já tenha salvo seu cartão de perfil (`plugin_directory.cards`) ou recebido mensagem de contato (`plugin_contact.messages`)!
  - O mesmo ocorre em `network_core.memberships (cohort_id)` (que exige um `UPDATE ... SET cohort_id = NULL` manual antes do `DELETE` em `deleteCohort`), `network_core.community_modules (community_id)` e `person_core.profiles (user_id)`.
- **Recomendação:** Criar migration adicionando `ON DELETE CASCADE` em `plugin_directory.cards(membership_id)`, `plugin_contact.messages(membership_id)`, `network_core.community_modules(community_id)`, e `ON DELETE SET NULL` em `network_core.memberships(cohort_id)`.

### 3.2. Tabelas Sensíveis Sem RLS Habilitado (Severidade: Alta)
- **Onde:** [20260916020324_rls.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20260916020324_rls.sql#L34-L37) e [20260916020322_directory_catalog.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20260916020322_directory_catalog.sql#L66-L71).
- **Diagnóstico:**
  - Apenas 5 tabelas possuem RLS ativo: `person_core.profiles`, `network_core.memberships`, `plugin_directory.field_groups`, `plugin_directory.fields` e `plugin_directory.list_fields`.
  - As tabelas **`plugin_directory.cards`**, **`plugin_talent.offerings`**, **`plugin_talent.categories`**, **`plugin_contact.messages`** e **`network_core.cohorts`** possuem `GRANT SELECT, INSERT, UPDATE, DELETE TO community_app`, mas **NÃO possuem RLS habilitado**!
  - Mesmo dentro de `queryAsMember` (`SET LOCAL ROLE community_app`), o banco de dados não impede que uma query mal construída leia ou altere `plugin_directory.cards` ou `plugin_talent.offerings` de outro membro ou de outra comunidade.
- **Recomendação:** Habilitar `ENABLE ROW LEVEL SECURITY` e `FORCE ROW LEVEL SECURITY` em `plugin_directory.cards` e `plugin_talent.offerings`, criando policies baseadas em `app.community_id` (para `SELECT`) e `app.user_id` via `memberships` (para `INSERT/UPDATE/DELETE`), além de `app.ops = '1'`.

### 3.3. Política RLS de `person_core.profiles` Permite Leitura a Membros Não-Aprovados (Severidade: Média)
- **Onde:** [20260916020324_rls.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20260916020324_rls.sql#L40-L56).
- **Diagnóstico:**
  - A policy `profiles_self_or_community` verifica apenas se o *alvo* (`person_core.profiles.user_id`) possui linha em `network_core.memberships` naquela `app.community_id` (sem filtrar `m.network_status = 'active'` e sem verificar no banco se o `app.user_id` solicitante também é um membro `active` daquela comunidade).

### 3.4. Índices Faltantes para Queries Quentes (Severidade: Média-Alta)
- **Onde:** Schema PostgreSQL (`db/migrations/*.sql`).
- **Diagnóstico:**
  1. **`lower(email)` em `auth_core.users`:** O índice existente é `users_email_uq ON auth_core.users (email)`, mas as buscas em [users.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/auth/src/users.ts#L18) e [memberships.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/memberships/src/memberships.ts#L63) usam `WHERE lower(email) = $1`, o que força **Sequential Scan** em `auth_core.users`.
  2. **`network_core.memberships (user_id, network_status)`:** A tabela tem índice em `(community_id, user_id)` e `(community_id, network_status)`, mas **não tem índice começando por `user_id`**. Toda requisição autenticada chama `listMyCommunities(userId)` (`WHERE m.user_id = $1 AND m.network_status = 'active'`) e `listCoordinatorCommunityIds(userId)`, além da policy RLS de `profiles` (`WHERE m.user_id = person_core.profiles.user_id AND m.community_id = ...`). Sem índice em `(user_id, community_id)` / `(user_id, network_status)`, toda requisição faz Seq Scan em `memberships`!
  3. **`person_core.profiles USING gin (languages jsonb_path_ops)`:** O filtro de idiomas no diretório usa `p.languages @> $X::jsonb` ([people-list-sql.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/people-list-sql.ts#L98)), mas só `cards.custom_attributes` tem índice GIN; `profiles.languages` não tem.
  4. **`pg_trgm` para buscas `ILIKE '%termo%'`:** As buscas no diretório (`p.full_name ILIKE $X`, `c.headline::text ILIKE $X`), em `listMemberships` e `listNetworkPeople` usam wildcard à esquerda (`%termo%`), que não usa B-Tree padrão.

---

## 4. Qualidade, Corretude e Performance das Queries SQL

### 4.1. Bug no JOIN de Busca de Talentos (`plugin_talent.categories`) em Multi-Tenant (Severidade: Alta)
- **Onde:** [people-list-sql.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/people-list-sql.ts#L82).
- **Diagnóstico:**
  ```sql
  OR EXISTS (
    SELECT 1 FROM plugin_talent.offerings o
    LEFT JOIN plugin_talent.categories cat ON cat.id = o.category_id
    WHERE o.membership_id = m.id ...
  ```
  - Após a migration [20261021140433_talent_categories_per_community.sql](file:///Users/sergiolucianojr/Code/alumni/db/migrations/20261021140433_talent_categories_per_community.sql#L11), a chave primária de `plugin_talent.categories` passou a ser composta: **`PRIMARY KEY (community_id, id)`** (e a FK em `offerings` é `(community_id, category_id)`).
  - Fazer `LEFT JOIN plugin_talent.categories cat ON cat.id = o.category_id` **sem** `AND cat.community_id = o.community_id` faz produto cruzado com os rótulos de categorias de **todas as outras comunidades**! Se outra comunidade tiver renomeado a categoria `other` ou `mentorship` para um termo X, a busca na comunidade A retornará falso-positivo baseado no label da comunidade B, além multiplicar linhas avaliadas no `EXISTS`.
- **Correção:** `LEFT JOIN plugin_talent.categories cat ON cat.community_id = o.community_id AND cat.id = o.category_id`.

### 4.2. Subqueries Correlacionadas Repetidas em `directoryScopeSql` e `showcaseScopeSql` (Severidade: Alta)
- **Onde:** [audience.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/audience.ts#L88-L128).
- **Diagnóstico:**
  - Para **cada membro** avaliado na listagem do Diretório ou da Vitrine (e novamente no `SELECT count(*)`), o predicado SQL executa até **4 subqueries `EXISTS` independentes** fazendo JOIN entre `plugin_directory.fields` e `plugin_directory.field_groups`:
    1. `fieldCeiling(community, 'headline', ...)`
    2. `fieldCeiling(community, 'bio', ...)`
    3. `fieldCeiling(community, 'availability_status', ...)` *(Obs.: `availability_status` foi removido do catálogo nas migrations de 18/09, tornando esse ramo peso morto que sempre faz scan à toa!)*
    4. `EXISTS (SELECT 1 FROM jsonb_each_text(c.attribute_audience) aud JOIN fields f ... JOIN field_groups g ...)`
  - Como `listDirectoryMembers` e `listPublicProfiles` **já carregaram `listFields`** na query imediatamente anterior (`LIST_FIELDS_SQL`), os tetos (`exposure`) dos campos daquela comunidade já são conhecidos em memória no Node.js!
- **Recomendação:** Resolver os tetos de `headline`, `bio` e a lista de `fields.name` permitidos em memória (a partir de `listFields` já carregado) e passar como parâmetros (`$X::text[]`) para a query, eliminando todos os JOINs de catálogo dentro do `WHERE` da listagem de pessoas.

### 4.3. Waterfall de 5 a 6 Queries Sequenciais por Request de Listagem (Severidade: Média-Alta)
- **Onde:** [directory-members.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/lib/server/directory-members.ts#L25-L68), [public-profiles.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/lib/server/public-profiles.ts#L31-L88) e [DirectoryPage](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/(workspace)/c/%5Bslug%5D/directory/page.tsx#L18-L35).
- **Diagnóstico:**
  - Ao abrir `/c/[slug]/directory`, o servidor executa **em série (sequencialmente)**:
    1. `getCommunityBySlug(slug)`
    2. `listMyCommunities(session.sub)`
    3. `listDirectoryCatalog(ctx)` (que por sua vez faz 4 queries sequenciais: `isEnabled`, `field_groups/fields`, `listEnabled`, `listCohorts`)
    4. `listDirectoryMembers(ctx, query)` (que faz mais **7 queries sequenciais**: `isEnabled('directory')`, `LIST_FIELDS_SQL`, `isEnabled('talent')`, `SELECT settings FROM communities`, `memberTalentCategories`, `built.countText`, `built.text`, `offeringsByMembership`, `countriesQuery`)
    5. `listCohorts(member.ctx.communityId)` (chamado **pela segunda vez** no mesmo request!)
  - **Total:** **14 round-trips sequenciais ao Postgres** (cada `queryAsMember` abre `BEGIN`, roda 3 comandos de contexto RLS, executa a query e dá `COMMIT` — ou seja, **~55 comandos SQL** para renderizar uma única página!).
- **Recomendação:**
  - Usar `withAppContext(ctx, async (client) => ...)` **uma única vez** por operação de domínio para reutilizar a mesma transação/conexão sem repetir `BEGIN / SET LOCAL ROLE / set_config / COMMIT` 10 vezes.
  - Remover a chamada duplicada de `listDirectoryCatalog` e `listCohorts` em `DirectoryPage` (ou paralelizar leituras independentes).
  - Unificar `count(*)` na própria query de listagem usando window function `count(*) OVER()::int AS total_count` (quando a página retornar linhas), economizando a query `countText`.

### 4.4. Mutações Multi-Statement Fora de Transação e Loops `N+1` (Severidade: Média-Alta)
- **Onde:**
  1. [apps/admin/app/api/admin/communities/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/admin/app/api/admin/communities/route.ts#L34-L39): `POST /api/admin/communities` executa `createCommunity`, `enableFirstPartyModules`, `ensureDisabledModule`, `seedCommunityCatalog` e `ensureDefaultTalentCategories` em conexões separadas sem transação. Se falhar no meio, cria uma comunidade órfã/incompleta no banco.
  2. [apps/web/src/app/api/talent/offerings/[id]/featured/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/talent/offerings/%5Bid%5D/featured/route.ts#L18-L35): Executa 3 `queryAsMember` separados (3 transações independentes): verifica posse, zera `featured_on_card = false`, e seta `featured_on_card = true`. Se a 3ª falhar ou houver concorrência, o membro fica sem destaque. Pode ser uma única query: `UPDATE plugin_talent.offerings SET featured_on_card = (id = $1) WHERE membership_id = $2`.
  3. [ops-catalog-order.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/ops-catalog-order.ts#L4-L14) e [ops-list-fields.ts](file:///Users/sergiolucianojr/Code/alumni/packages/modules/directory/src/ops-list-fields.ts#L102-L128): `persistGroupOrder`, `persistFieldOrder`, `resetCatalogOrder` e `saveOpsListFields` executam `await query('UPDATE ...')` dentro de um loop `for` sem transação (`N+1` round-trips). Podem usar `UNNEST($1::uuid[], $2::int[])` em um único statement transacional.
  4. [cohorts.ts](file:///Users/sergiolucianojr/Code/alumni/packages/core/memberships/src/cohorts.ts#L53-L62): `deleteCohort` primeiro roda `UPDATE memberships SET cohort_id = NULL WHERE cohort_id = $1` (sem filtrar `community_id`!) e só depois verifica se a cohort pertencia à `community_id` no `DELETE`. Se um coordenador da comunidade A passar o `cohortId` da comunidade B, ele **desvincula todos os membros da turma da comunidade B** antes de receber `404 CohortNotFoundError`!

---

## 5. Qualidade do Uso, Facilidade (UX) e Developer Experience (DX)

### 5.1. `ProfileForm` Carregado via `useEffect` + `fetch` no Cliente (Anti-Padrão documentado em `data-access.md`) (Severidade: Média)
- **Onde:** [apps/web/src/app/(workspace)/c/[slug]/profile/page.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/(workspace)/c/%5Bslug%5D/profile/page.tsx#L1-L10), [ProfileForm.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/components/app/ProfileForm.tsx#L90-L146).
- **Diagnóstico:**
  - `docs/architecture/data-access.md` proíbe explicitamente `useEffect` + `fetch` para carregamento inicial de páginas.
  - No entanto, `c/[slug]/profile/page.tsx` é marcado como `'use client'` e monta `<ProfileForm>`, que dispara 3 requisições (`fetch('/api/directory/catalog')`, `fetch('/api/profiles/me')`, `fetch('/api/memberships/me')`) + `<TalentOffers>` que dispara uma 4ª requisição (`fetch('/api/talent/offerings')`) no browser após a hidratação.
  - Isso gera flash de `<Skeleton>`, atraso perceptível na navegação e 4 chamadas HTTP extras que poderiam vir prontas do Server Component.

### 5.2. Falhas Silenciosas e Fricção de Usabilidade na Edição de Perfil e Talentos (Severidade: Média)
- **Onde:** [TalentOffers.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/components/app/TalentOffers.tsx#L99-L123), [FieldControl.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/components/app/FieldControl.tsx#L260-L277), [ProfileForm.tsx](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/components/app/ProfileForm.tsx#L148-L191).
- **Diagnóstico:**
  1. **Erros silenciosos em Talentos (`TalentOffers.tsx`):** Na função `save()` (linha 106), se `POST /api/talent/offerings` retornar erro `400` (ex.: link sem `https://`, descrição longa, limite de 20 ofertas ou audiência acima do teto), o código faz apenas `if (!response.ok) return;` **sem mostrar nenhum `toast.error` ou mensagem no formulário**! O usuário clica em "Salvar" e nada acontece. O mesmo ocorre em `remove()` e `setFeatured()`.
  2. **Perda de alterações ao enviar Avatar:** Quando um novo usuário (que ainda não tem linha em `person_core.profiles`) preenche seu nome no formulário e, antes de clicar em "Salvar", faz upload da foto de avatar, a rota `POST /api/profiles/me/avatar` ([avatar/route.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/src/app/api/profiles/me/avatar/route.ts#L42-L48)) cria o perfil com o prefixo do e-mail (`member.email.split('@')[0]`), e o formulário não avisa quando há alterações pendentes (`dirty state` / `beforeunload`).
  3. **Falta de feedback de erro no Admin (`community-members.tsx` e `people-panel.tsx`):** Em `CommunityMembers`, as ações `setRole`, `setStatus`, `setCohort` e `remove` (linhas 128–166) não verificam `if (!res.ok)` nem exibem `toast.error`, recarregando a lista silenciosamente mesmo se a API falhar (como na falha de FK ao remover membro com card).

### 5.3. `typescript.ignoreBuildErrors: true` Habilitado nas Duas Apps (Severidade: Média)
- **Onde:** [apps/web/next.config.ts](file:///Users/sergiolucianojr/Code/alumni/apps/web/next.config.ts#L39-L41), [apps/admin/next.config.ts](file:///Users/sergiolucianojr/Code/alumni/apps/admin/next.config.ts#L39-L41).
- **Diagnóstico:** Ambas as aplicações ignoram erros de TypeScript durante o build de produção (`next build`), o que permite que quebras de contrato entre pacotes `@community/*` e as apps passem despercebidas no deploy.

---

## 6. Plano de Ação Recomendado (Priorizado)

### Prioridade P0 — Correções Imediatas (Segurança e Bugs Quebradores)
1. **Sanitizar URLs no Backend (`person-profile.ts`, `catalog.ts`, `person-write.ts`):** Rejeitar ou limpar qualquer URL em `contacts.*`, `avatar_url` e campos `type: 'url'` que não comece com `https://` (ou caminho relativo `/api/media/...` para avatar).
2. **Corrigir `deleteCohort` (`cohorts.ts`):** Filtrar `community_id` antes de limpar `memberships.cohort_id` (ou usar `ON DELETE SET NULL` na FK com transação única).
3. **Corrigir FKs sem `ON DELETE CASCADE` (`db/migrations/`):** Adicionar `ON DELETE CASCADE` em `plugin_directory.cards(membership_id)` e `plugin_contact.messages(membership_id)` para destravar a exclusão de membros no Admin.
4. **Eliminar ou proteger `/api/contact/[membershipId]`:** Unificar na rota `/api/profiles/[id]/contact` com checagem de vitrine, persistência em `plugin_contact.messages` e rate limit baseado no banco.
5. **Corrigir JOIN de `plugin_talent.categories` (`people-list-sql.ts`):** Adicionar `AND cat.community_id = o.community_id` no `LEFT JOIN`.
6. **Transação e Lock em `consumeOtp` + Checagem de `status = 'active'`:** Evitar brute-force concorrente, normalizar e-mail no `issueOtp` e bloquear login de contas `suspended`.

### Prioridade P1 — Estrutura de Banco, RLS e Performance de Queries
7. **Fortalecer `@community/db` (`pool.ts`, `with-ops-context.ts`):**
   - Singleton do pool em `globalThis`, limites explícitos (`max`, timeouts) e `rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== '0'`.
   - Adicionar `SET LOCAL ROLE community_app` em `withOpsContext`.
   - Habilitar RLS em `plugin_directory.cards` e `plugin_talent.offerings`.
8. **Criar Índices Essenciais (`db/migrations/`):**
   - `CREATE UNIQUE INDEX users_email_lower_uq ON auth_core.users (lower(email));`
   - `CREATE INDEX memberships_user_status_idx ON network_core.memberships (user_id, network_status);`
   - `CREATE INDEX profiles_languages_gin ON person_core.profiles USING gin (languages jsonb_path_ops);`
9. **Otimizar `peopleListQuery` e `listDirectoryMembers` / `listPublicProfiles`:**
   - Remover `fieldCeiling` correlacionado em SQL (usar os `listFields` já carregados).
   - Executar as leituras dentro de um único bloco `withAppContext` para reduzir os ~55 comandos SQL por página para 1 transação enxuta.
   - Envolver mutações multi-step (`POST /api/admin/communities`, `featured/route.ts`, `saveOpsListFields`, `resetCatalogOrder`) em transações reais.

### Prioridade P2 — Qualidade de Uso (UX), Governança RBAC e Build
10. **Exibir feedback de erro (`toast.error`)** em `TalentOffers.tsx` e nas ações de tabela de `CommunityMembers.tsx` / `PeoplePanel.tsx`.
11. **Alinhar contrato RBAC (`02_security.md`, `07_api_contracts.md`, `require-ops.ts`):** Decidir e travar quais rotas admin exigem `requireSuperOps` vs `requireCommunityOps`.
12. **Remover `ignoreBuildErrors: true`** de `apps/web/next.config.ts` e `apps/admin/next.config.ts`.

-- Core: identity, person, community membership.

-- Registro de migrations aplicadas (também garantida pelo runner antes de rodar os .sql).
CREATE TABLE IF NOT EXISTS public.schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE SCHEMA IF NOT EXISTS auth_core;
CREATE SCHEMA IF NOT EXISTS person_core;
CREATE SCHEMA IF NOT EXISTS network_core;

CREATE TABLE IF NOT EXISTS auth_core.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  global_role text NOT NULL DEFAULT 'user'
    CHECK (global_role IN ('user', 'super_admin')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON auth_core.users (email);

CREATE TABLE IF NOT EXISTS auth_core.verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS verification_tokens_email_expires_idx
  ON auth_core.verification_tokens (email, expires_at);

CREATE TABLE IF NOT EXISTS person_core.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth_core.users (id),
  full_name text NOT NULL,
  avatar_url text,
  preferred_locale text NOT NULL DEFAULT 'pt-BR',
  gender text,
  birth_country text,
  current_country text,
  birth_city jsonb,
  current_city jsonb,
  languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  contacts jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_gender_chk
    CHECK (gender IS NULL OR gender IN ('woman', 'man', 'non_binary', 'prefer_not')),
  CONSTRAINT profiles_birth_city_object_chk
    CHECK (birth_city IS NULL OR jsonb_typeof(birth_city) = 'object'),
  CONSTRAINT profiles_current_city_object_chk
    CHECK (current_city IS NULL OR jsonb_typeof(current_city) = 'object'),
  CONSTRAINT profiles_languages_array_chk
    CHECK (jsonb_typeof(languages) = 'array'),
  CONSTRAINT profiles_contacts_object_chk
    CHECK (jsonb_typeof(contacts) = 'object')
);

CREATE TABLE IF NOT EXISTS network_core.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'alumni',
  is_public_showcase boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS communities_slug_uq ON network_core.communities (slug);

CREATE TABLE IF NOT EXISTS network_core.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id),
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS network_core.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id),
  user_id uuid NOT NULL REFERENCES auth_core.users (id),
  cohort_id uuid REFERENCES network_core.cohorts (id),
  network_role text NOT NULL DEFAULT 'member'
    CHECK (network_role IN ('member', 'coordinator')),
  network_status text NOT NULL DEFAULT 'pending_approval'
    CHECK (network_status IN ('pending_approval', 'active', 'suspended')),
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS memberships_community_user_uq
  ON network_core.memberships (community_id, user_id);

CREATE INDEX IF NOT EXISTS memberships_community_status_idx
  ON network_core.memberships (community_id, network_status);

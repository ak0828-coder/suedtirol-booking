-- Club AI settings for document verification
alter table public.clubs
  add column if not exists ai_doc_enabled boolean not null default true,
  add column if not exists ai_doc_mode text not null default 'buffer_30';

-- ai_doc_mode values: 'buffer_30' | 'ai_only'

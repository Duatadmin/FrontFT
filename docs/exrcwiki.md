Design Document: Exercise Directory
Project Isinka · Exercise Wiki Module · Version 1.0 (10 June 2025)

0 Goals & Success Metrics
Goal	Metrics
Fast discovery and exploration of 1 400 + exercises	⟨T<sub>search</sub> ≤ 200 ms⟩, ⟨Card CTR ≥ 35 %⟩
Consistent UX across Isinka platform	100 % components from design system, Lighthouse Perf ≥ 90
Scalable to 10 000 + exercises & AI-recommendations	P95 API ≤ 150 ms @ 1 000 RPS

1 Tech Stack & High-Level Architecture
Layer	Technologies	Why
Client	Next.js 14 / React 18, shadcn/ui (Radix UI + TailwindCSS), TanStack Query, Zustand, Framer Motion	SSR/SEO, tight Supabase integration, design-system compliance
BFF (optional)	Next.js App Router API-routes or isolated Fastify gateway	Caching, aggregation, rate-limiting
Database	Supabase (PostgreSQL 14)	Already in use; row-level security
Search	Supabase pgvector + trigram index + materialized view	Hybrid semantic & full-text search
CDN	Supabase Storage + Cloudflare R2 / Images	Caching gifs/images
CI/CD	GitHub Actions → Supabase Preview → Vercel / Supabase Functions	Preview environments, test automation
Monitoring	Sentry, Logflare, Supabase APM	End-to-end tracing

2 Data Model (PostgreSQL)
2.1 Normalization & Relations
Read-heavy ( > 95 %) workload → keep catalogue denormalised (single table), add “many-to-many” only for tags or user collections.

pgsql
Копировать
Редактировать
public.exercise_wiki                    -- base table (1 400 rows)
    ├─ PK exercise_id text
    ├─ … (columns as provided)
    └─ embedding vector(768)           -- pgvector v0.5.1

public.muscle_groups   (optional)
public.equipment_types (optional)
2.2 Indexes
sql
Копировать
Редактировать
-- Full-text search
CREATE INDEX idx_exercises_fts ON exercise_wiki
USING gin (
  to_tsvector('simple',
      coalesce(name,'') || ' ' ||
      coalesce(bodypart,'') || ' ' ||
      coalesce(target,''))
);

-- Semantic search
CREATE INDEX idx_exercises_embedding
ON exercise_wiki
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Filter indexes
CREATE INDEX idx_exercises_equipment ON exercise_wiki (equipment);
CREATE INDEX idx_exercises_bodypart  ON exercise_wiki (bodypart);
CREATE INDEX idx_exercises_tier      ON exercise_wiki (tier);
3 API Contract
Verb	Path	Params	Description	Response
GET	/api/exercises	q, bodypart[], equipment[], tier[], limit, offset, sort	Combined search + filters	[{…cardFields}]
GET	/api/exercises/{id}		Exercise details	{…fullFields}
POST	/rpc/semantic_search	query_embedding, k	k-NN semantic search	[{id, score}]
GET	/api/stats		Aggregate counts	{counts:{bodypart:…}}

Start with Supabase REST for speed; migrate heavy calls to Edge Functions (Deno) or Postgres RPC as needed.

4 Front-End Folder Structure
pgsql
Копировать
Редактировать
app
 ├─ (exercise)/[id]/page.tsx        – details page
 ├─ (exercise)/layout.tsx           – shell + breadcrumbs
 ├─ (wiki)/page.tsx                 – catalogue
 ├─ components/
 │   ├─ ExerciseCard.tsx
 │   ├─ ExerciseFilters.tsx
 │   ├─ MuscleBadge.tsx
 │   └─ …
 ├─ lib/
 │   ├─ api.ts                      – TanStack Query wrapper
 │   ├─ enums.ts
 │   └─ embeddings.ts
 └─ store/
     └─ wikiStore.ts                – Zustand slice
5 UX / UI Geometry
5.1 Catalogue Page Grid
css
Копировать
Редактировать
┌──────────────────────────────────────────────┐
│   Header (search bar + quick filters)       │
├─────────────┬───────────────────────────────┤
│  Sidebar    │  Masonry/Grid 3–4 columns     │
│  Filters    │  • ExerciseCard …            │
│             │  • Infinite scroll / pager    │
└─────────────┴───────────────────────────────┘
ExerciseCard — 280 × 350 px, image (16:9 gif/poster), name, tags (bodypart, equipment, tier), badge “Compound / Isolation”.

Hover → quick preview (popover gif).

Details Page — tabs: “How-to”, “Tips”, “Pros & Cons”, “Muscles” (SVG body heat-map), “Related”.

5.2 Filters & Search Bar
Filter	Control	URL Param
Body Part	Multi-checkbox	bodypart=Chest,Back
Equipment	Multi-checkbox	equipment=Dumbbell
Tier	Radio A/B/C	tier=A
Compound / Isolation	Toggle	is_compound=true
Search	Debounced input 300 ms	q=bench%20press

URL params → Zustand store → TanStack Query key [‘exercises’, filters].

6 Data Flow (sequence)
sql
Копировать
Редактировать
User → [SearchBox] → (debounce) → store.setFilters()
store → <ExerciseGrid/> → useQuery(filters) → fetch
fetch (Edge Fn) → Postgres (FTS or k-NN) → rows → cards
→ IntersectionObserver → prefetch next page
7 Component APIs
tsx
Копировать
Редактировать
interface ExerciseCardProps {
  id: string;
  name: string;
  gifUrl?: string;
  bodypart?: string;
  equipment: string;
  tier?: 'A' | 'B' | 'C';
  isCompound: boolean;
}
ExerciseCard – lazy-load gif after first hover; safe for SSR.

MuscleHeatmap – SVG with CSS fills (#muscle_group & key_muscles).

8 Search & Ranking
Baseline — tsvector + ILIKE on name / target.

Advanced — pgvector embedding:

Store OpenAI text-embedding-3-small vectors.

Function semantic_search(query text, k int) returns top-k.

Merge scores: 0.4 × FTS + 0.5 × Vector + 0.1 × Recency.

9 Caching & Performance
Layer	Strategy
CDN	Stale-While-Revalidate 24 h for JSON & gifs
Browser	SWR (TanStack Query) keepPreviousData, retry 1
Edge	Supabase Edge Function responseCache = 60 s

10 Accessibility & i18n
Localisation via next-intl; exercise names translatable.

alt text for gifs; full keyboard navigation (Roving TabIndex).

WCAG 2.1 AA compliance.

11 Testing
Type	Tool	Coverage
Unit	Vitest + React Testing Library	80 % components
E2E	Playwright	search & navigation flows
VRT	Chromatic	visual regression

12 DevOps & Continuous Delivery
PR → GitHub Actions

Lint (ESLint, tsc)

Vitest

Build → Vercel Preview

Merge → main

Vercel production deploy

Supabase migrations via Migra/sqlc (zero-downtime)

Monitoring — Sentry releases + Supabase Logflare.

13 Migration Plan
Phase	Tasks	Owners	Days
1. Prep	Create indexes, add embeddings	CTO / DBA	2
2. API Layer	Edge Functions, SWR protocol	Backend Eng.	3
3. UI MVP	Catalogue + cards	FE Team	5
4. Details & Filters	Tabs, heat-map, filters	FE Team	4
5. Search v2	k-NN ranking	ML / Search Eng.	3
6. QA & Polish	Lighthouse, tests	QA	3
Total			20 workdays

14 Risks & Mitigation
Risk	Likelihood	Impact	Mitigation
Large gifs (up to 5 MB) → slow TTI	Medium	High	WebP posters, lazy-load, auto-convert
pgvector index > 1 GB	Low	Medium	Deduplicate, switch to HNSW if > 10k
Traffic spikes (>1k RPS)	Medium	Medium	Edge caching, read-replicas
BFF tech debt	Medium	Low	RFC before merge, clear code ownership

15 Next Steps
Confirm filter set (tier, glute_region, etc.).

Define SVG masks for muscle heat-map.

Collect 20 sample gifs for performance tests.

Create Figma mock-ups (if not yet).

Kick off Sprint #1 per § 13.
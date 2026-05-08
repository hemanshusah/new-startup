-- ============================================================
-- MIGRATION 015: Startup School — Modules & Lessons
-- ============================================================
-- Product: school (product_slug = 'school')
-- Two tables: school_modules, school_lessons
-- RLS: admins full CRUD, public SELECT on published rows only
-- ============================================================

-- ── school_modules ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.school_modules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL DEFAULT 'school',
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  order_index  INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.school_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_school_modules_updated_at
  BEFORE UPDATE ON public.school_modules
  FOR EACH ROW EXECUTE FUNCTION public.school_modules_updated_at();

-- RLS
ALTER TABLE public.school_modules ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published modules
CREATE POLICY school_modules_select_published
  ON public.school_modules FOR SELECT
  USING (is_published = true);

-- Admin: full access via service role (bypasses RLS)
-- No admin-specific policy needed — service client bypasses RLS


-- ── school_lessons ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.school_lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    UUID NOT NULL REFERENCES public.school_modules(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL DEFAULT 'school',
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL,
  subtitle     TEXT,
  content      TEXT DEFAULT '',
  youtube_url  TEXT,
  group_label  TEXT,
  order_index  INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, slug)
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.school_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_school_lessons_updated_at
  BEFORE UPDATE ON public.school_lessons
  FOR EACH ROW EXECUTE FUNCTION public.school_lessons_updated_at();

-- RLS
ALTER TABLE public.school_lessons ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published lessons (whose module is also published)
CREATE POLICY school_lessons_select_published
  ON public.school_lessons FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.school_modules m
      WHERE m.id = module_id AND m.is_published = true
    )
  );


-- ── Seed Data: 6 Modules + Placeholder Lessons ─────────────

-- Module 1: Introduction
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('Introduction', 'introduction', 'Get started with Startup School and understand what pre-incubation means.', 1, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'introduction'), 'Welcome to Startup School', 'welcome', 'Your journey starts here', 'Start here', 1, true, '## Welcome

Welcome to Startup School — a structured, self-paced pre-incubation program designed for first-time founders in India.

## What to Expect

This platform will guide you through the fundamentals of building a startup, from validating your idea to pitching to investors.

## How to Navigate

Use the sidebar on the left to browse modules and lessons. Each module builds on the previous one, so we recommend going in order.'),
  ((SELECT id FROM public.school_modules WHERE slug = 'introduction'), 'What is Pre-Incubation?', 'what-is-pre-incubation', 'Understanding the earliest stage of startup building', 'Start here', 2, true, '## What is Pre-Incubation?

Pre-incubation is the phase before you join a formal incubator or accelerator. It is where you validate your idea, understand your market, and build a minimum viable product.

## Why It Matters

Most startups fail because they skip this phase. Pre-incubation helps you test assumptions before investing significant time and money.'),
  ((SELECT id FROM public.school_modules WHERE slug = 'introduction'), 'Is this for you?', 'is-this-for-you', 'Check if this program fits your stage', 'Start here', 3, true, '## Is This For You?

This program is designed for aspiring founders who have an idea but have not yet built a product or formed a company.

## Ideal For

- College students exploring entrepreneurship
- Working professionals considering a startup
- Early-stage founders still validating their idea'),
  ((SELECT id FROM public.school_modules WHERE slug = 'introduction'), 'How to use this platform', 'how-to-use', 'A quick guide to navigating Startup School', 'Start here', 4, true, '## How to Use This Platform

Each module contains several lessons. Work through them in order for the best experience.

## Tips

- Read the overview page of each module first
- Complete the exercises at the end of each lesson
- Use the search (Cmd+K) to find specific topics quickly');


-- Module 2: Idea Validation
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('Idea Validation', 'idea-validation', 'Test your assumptions before building anything.', 2, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'idea-validation'), 'Module Overview', 'overview', 'What you will learn in Idea Validation', 'Foundation', 1, true, '## Idea Validation

In this module, you will learn how to test whether your startup idea solves a real problem for real people.

## What You Will Learn

- How to write a clear problem statement
- How to talk to potential customers
- How to map and test your assumptions'),
  ((SELECT id FROM public.school_modules WHERE slug = 'idea-validation'), 'Writing Problem Statements', 'problem-statements', 'Learn to articulate the problem your startup solves', 'Foundation', 2, true, '## Writing Problem Statements

A good problem statement is the foundation of every successful startup. It clearly defines who has the problem, what the problem is, and why it matters.

## The Format

[Target customer] struggle with [problem] because [root cause].

## Example

"First-time founders in India struggle to find relevant grants and funding opportunities because information is scattered across dozens of government and private portals."'),
  ((SELECT id FROM public.school_modules WHERE slug = 'idea-validation'), 'Customer Discovery 101', 'customer-discovery', 'Learn to talk to potential customers the right way', 'Foundation', 3, true, '## Customer Discovery 101

Customer discovery is the process of talking to potential users to understand their problems, needs, and behaviours.

## Key Principles

- Ask open-ended questions
- Do not pitch your solution — listen instead
- Look for patterns across multiple conversations'),
  ((SELECT id FROM public.school_modules WHERE slug = 'idea-validation'), 'Assumption Mapping', 'assumption-mapping', 'Identify and prioritise your riskiest assumptions', 'Foundation', 4, true, '## Assumption Mapping

Every startup is built on assumptions. The goal is to identify the riskiest ones and test them first.

## How to Map Assumptions

1. List everything you are assuming about your customer, problem, and solution
2. Rank each assumption by risk (high, medium, low)
3. Design simple experiments to test the highest-risk assumptions first');


-- Module 3: Market Research
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('Market Research', 'market-research', 'Understand your market size, competitors, and target users.', 3, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'market-research'), 'Module Overview', 'overview', 'What you will learn in Market Research', 'Research Methods', 1, true, '## Market Research

This module teaches you how to understand the size and shape of your market.

## Topics Covered

- TAM, SAM, and SOM analysis
- Competitor analysis frameworks
- Creating user personas'),
  ((SELECT id FROM public.school_modules WHERE slug = 'market-research'), 'Understanding TAM, SAM & SOM', 'tam-sam-som', 'Size your market opportunity correctly', 'Research Methods', 2, true, '## TAM, SAM & SOM

These three metrics help you understand the size of your market opportunity.

## Definitions

- **TAM** (Total Addressable Market) — The total revenue opportunity if you captured 100% of the market
- **SAM** (Serviceable Addressable Market) — The portion of TAM you can realistically target
- **SOM** (Serviceable Obtainable Market) — The portion of SAM you can capture in the near term'),
  ((SELECT id FROM public.school_modules WHERE slug = 'market-research'), 'Competitor Analysis Framework', 'competitor-analysis', 'Map the competitive landscape', 'Research Methods', 3, true, '## Competitor Analysis

Understanding your competitors helps you find gaps in the market and position your product effectively.

## Framework

1. Identify direct and indirect competitors
2. Analyse their strengths and weaknesses
3. Find your unique positioning'),
  ((SELECT id FROM public.school_modules WHERE slug = 'market-research'), 'User Persona Creation', 'user-personas', 'Build detailed profiles of your target users', 'Research Methods', 4, true, '## User Personas

A user persona is a fictional representation of your ideal customer, based on real research and data.

## What to Include

- Demographics (age, location, occupation)
- Goals and motivations
- Pain points and frustrations
- How they currently solve the problem');


-- Module 4: MVP Building
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('MVP Building', 'mvp-building', 'Build your minimum viable product the lean way.', 4, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'mvp-building'), 'Module Overview', 'overview', 'What you will learn about building MVPs', 'Building Lean', 1, true, '## MVP Building

This module covers how to build a minimum viable product — the simplest version of your idea that lets you start learning from real users.

## Topics Covered

- The Lean Canvas framework
- Prototyping methods
- No-code MVP tools'),
  ((SELECT id FROM public.school_modules WHERE slug = 'mvp-building'), 'The Lean Canvas', 'lean-canvas', 'A one-page business model for startups', 'Building Lean', 2, true, '## The Lean Canvas

The Lean Canvas is a one-page business plan adapted for startups. It helps you document your hypotheses quickly.

## The 9 Blocks

1. Problem
2. Customer Segments
3. Unique Value Proposition
4. Solution
5. Channels
6. Revenue Streams
7. Cost Structure
8. Key Metrics
9. Unfair Advantage'),
  ((SELECT id FROM public.school_modules WHERE slug = 'mvp-building'), 'Prototyping Methods', 'prototyping', 'From paper sketches to clickable mockups', 'Building Lean', 3, true, '## Prototyping Methods

Prototyping lets you test your solution before writing any code.

## Types of Prototypes

- **Paper prototypes** — Quick sketches of your interface
- **Wireframes** — Digital low-fidelity layouts
- **Clickable mockups** — Interactive prototypes using tools like Figma'),
  ((SELECT id FROM public.school_modules WHERE slug = 'mvp-building'), 'No-Code MVP Tools', 'no-code-tools', 'Build without coding using modern tools', 'Building Lean', 4, true, '## No-Code MVP Tools

You do not need to be a developer to build an MVP. Many successful startups started with no-code tools.

## Popular Tools

- **Notion** — Internal tools and documentation
- **Airtable** — Database and workflow management
- **Webflow** — Website builder
- **Bubble** — Full web applications without code');


-- Module 5: Business Model
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('Business Model', 'business-model', 'Understand how to make money from your startup.', 5, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'business-model'), 'Module Overview', 'overview', 'What you will learn about business models', 'Monetisation', 1, true, '## Business Model

This module covers how startups generate revenue and build sustainable businesses.

## Topics Covered

- Different revenue model types
- Unit economics basics'),
  ((SELECT id FROM public.school_modules WHERE slug = 'business-model'), 'Revenue Model Types', 'revenue-models', 'Explore different ways startups make money', 'Monetisation', 2, true, '## Revenue Model Types

Choosing the right revenue model is critical for your startup''s sustainability.

## Common Models

- **Subscription** — Monthly or annual recurring fee (SaaS)
- **Freemium** — Free basic tier with paid upgrades
- **Marketplace** — Commission on transactions
- **Advertising** — Free product monetised through ads
- **Licensing** — One-time or periodic fee for usage rights'),
  ((SELECT id FROM public.school_modules WHERE slug = 'business-model'), 'Unit Economics Basics', 'unit-economics', 'Know your numbers before you scale', 'Monetisation', 3, true, '## Unit Economics

Unit economics help you understand if your business model works at the individual customer level.

## Key Metrics

- **CAC** (Customer Acquisition Cost) — How much it costs to acquire one customer
- **LTV** (Lifetime Value) — Total revenue from one customer over their lifetime
- **LTV:CAC Ratio** — Should be at least 3:1 for a healthy business');


-- Module 6: Pitching
INSERT INTO public.school_modules (title, slug, description, order_index, is_published)
VALUES ('Pitching', 'pitching', 'Learn to present your startup to investors and stakeholders.', 6, true);

INSERT INTO public.school_lessons (module_id, title, slug, subtitle, group_label, order_index, is_published, content)
VALUES
  ((SELECT id FROM public.school_modules WHERE slug = 'pitching'), 'Module Overview', 'overview', 'What you will learn about pitching', 'Investor Ready', 1, true, '## Pitching

This module prepares you to present your startup idea clearly and convincingly to investors, mentors, and partners.

## Topics Covered

- Pitch deck structure
- Storytelling for founders
- Handling investor questions'),
  ((SELECT id FROM public.school_modules WHERE slug = 'pitching'), 'Pitch Deck Structure', 'pitch-deck-structure', 'Build a compelling investor presentation', 'Investor Ready', 2, true, '## Pitch Deck Structure

A pitch deck is a 10-15 slide presentation that tells the story of your startup.

## Standard Slides

1. Title / Hook
2. Problem
3. Solution
4. Market Size (TAM/SAM/SOM)
5. Business Model
6. Traction
7. Team
8. Competition
9. Financials
10. Ask (what you need)'),
  ((SELECT id FROM public.school_modules WHERE slug = 'pitching'), 'Storytelling for Founders', 'storytelling', 'Tell your startup story in a way that resonates', 'Investor Ready', 3, true, '## Storytelling for Founders

Investors fund stories, not just spreadsheets. Your ability to tell a compelling story can make or break your pitch.

## Story Structure

1. **The Hook** — Start with a surprising fact or personal anecdote
2. **The Problem** — Make the pain real and relatable
3. **The Journey** — How you discovered the solution
4. **The Vision** — Where this is going'),
  ((SELECT id FROM public.school_modules WHERE slug = 'pitching'), 'Handling Investor Questions', 'investor-questions', 'Prepare for the tough questions investors will ask', 'Investor Ready', 4, true, '## Handling Investor Questions

After your pitch, investors will ask hard questions. Being prepared is half the battle.

## Common Questions

- Why now? Why is this the right time for this idea?
- Why you? What makes your team uniquely qualified?
- What happens if a big competitor enters this space?
- What are your key metrics and how are they trending?

## Tips

- Be honest about what you do not know
- Have data ready to back up your claims
- Practice your answers out loud before the meeting');

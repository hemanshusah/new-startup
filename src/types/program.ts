export type ProgramType = 'grant' | 'incubation' | 'accelerator' | 'contest' | 'funding' | 'seed'
export type ProgramStatus = 'active' | 'closed' | 'upcoming'

export interface Program {
  id: string
  slug: string
  title: string
  organisation: string
  type: ProgramType
  status: ProgramStatus
  deadline: string // ISO date string e.g. '2026-06-30'
  amount_min: number | null
  amount_max: number | null
  amount_display: string | null
  equity: string | null
  mode: string | null
  stage: string | null
  duration: string | null
  cohort_size: string | null
  description_short: string
  about: string | null
  what_you_get: string[] | null
  eligibility: string[] | null
  how_to_apply: string | null
  apply_url: string | null
  sectors: string[] | null
  state: string | null
  is_india: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  published: boolean
}

/** Lightweight version used for the listing page — only the columns fetched in the server query */
export type ProgramListItem = Pick<
  Program,
  | 'id'
  | 'slug'
  | 'title'
  | 'organisation'
  | 'type'
  | 'deadline'
  | 'amount_display'
  | 'description_short'
  | 'is_featured'
  | 'sectors'
  | 'stage'
  | 'is_india'
  | 'amount_min'
  | 'amount_max'
  | 'state'
>

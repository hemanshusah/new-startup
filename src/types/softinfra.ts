export type SoftInfraFormat = 'card-sm' | 'card-dark' | 'card-wide' | 'inline' | 'sidebar' | 'newsletter'
export type SoftInfraPlacement = 'listing-grid' | 'listing-inline' | 'detail-inline' | 'detail-sidebar'

export interface SoftInfra {
  id: string
  advertiser: string
  headline: string
  subtext: string
  cta_text: string
  cta_url: string
  icon_emoji: string | null
  image_url: string | null
  format: SoftInfraFormat
  placement: SoftInfraPlacement[]
  slot_index: number | null
  priority: number
  is_active: boolean
  is_image_only: boolean
  start_date: string | null
  end_date: string | null
  click_count: number
  impression_count: number
  unique_view_count: number
  created_at: string
}

export interface SoftInfraSlotMap {
  [slotId: string]: SoftInfra | null
}

/** SoftInfra slots on the listing page */
export type ListingSlotId = 'listing-grid-a' | 'listing-grid-b' | 'listing-grid-c' | 'listing-grid-nl'

/** SoftInfra slots on the detail page */
export type DetailSlotId = 'detail-inline-a' | 'detail-inline-b' | 'detail-sidebar-a' | 'detail-sidebar-b'

export type SlotId = ListingSlotId | DetailSlotId

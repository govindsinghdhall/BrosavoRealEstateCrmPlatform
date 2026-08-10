export const APP_NAME = 'BROSAVO'

export const STORAGE_KEYS = {
  TOKEN: 'recrm_token',
  THEME: 'recrm_theme',
  SIDEBAR: 'recrm_sidebar',
} as const

export const POWERED_BY_URL = 'https://brosavo.com'
export const POWERED_BY_LABEL = 'Brosavo.com'

export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'NEGOTIATION',
  'SITE_VISIT_SCHEDULED',
  'SITE_VISIT_DONE',
  'BOOKED',
  'WON',
  'LOST',
] as const

export const PROPERTY_STATUSES = [
  'AVAILABLE',
  'UNDER_OFFER',
  'SOLD',
  'RENTED',
  'OFF_MARKET',
] as const

export const LISTING_CATEGORIES = [
  'BUY',
  'RENT',
  'COMMERCIAL',
  'NEW_PROJECTS',
  'PG',
  'PLOT',
  'LUXURY',
] as const

export const PROPERTY_TYPES = [
  'APARTMENT',
  'BUILDER_FLOOR',
  'VILLA',
  'PLOT',
  'COMMERCIAL',
  'OFFICE',
  'SHOP',
  'WAREHOUSE',
  'COWORKING_SPACE',
] as const

export const PROPERTY_AGES = [
  'UNDER_CONSTRUCTION',
  'READY_TO_MOVE',
  'NEW',
  'ONE_TO_FIVE_YEARS',
  'FIVE_TO_TEN_YEARS',
  'TEN_PLUS_YEARS',
] as const

export const FURNISHING_OPTIONS = [
  'FULLY_FURNISHED',
  'SEMI_FURNISHED',
  'UNFURNISHED',
] as const

export const FACING_OPTIONS = ['NORTH', 'SOUTH', 'EAST', 'WEST'] as const

export const POSSESSION_STATUSES = [
  'IMMEDIATE',
  'WITHIN_3_MONTHS',
  'WITHIN_6_MONTHS',
  'WITHIN_1_YEAR',
] as const

export const PROPERTY_AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Club House',
  'Power Backup',
  'Lift',
  'Parking',
  'Security',
  'Garden',
  'Kids Play Area',
  'EV Charging',
] as const

export const SITE_VISIT_STATUSES = [
  'SCHEDULED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'RESCHEDULED',
] as const

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PARTIALLY_PAID',
  'FULLY_PAID',
  'CANCELLED',
  'REFUNDED',
] as const

export const USER_ROLES = ['admin', 'manager', 'agent', 'viewer'] as const

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_COLLAPSED_WIDTH = 72

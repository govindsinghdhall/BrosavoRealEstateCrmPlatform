import { z } from 'zod'
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  LISTING_CATEGORIES,
  POSSESSION_STATUSES,
  PROPERTY_AGES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from '@/utils/constants'
import { GURGAON_CITIES, HARYANA_STATES } from '@/utils/propertyMasterData'

export const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  listingCategory: z.enum(LISTING_CATEGORIES),
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.number({ invalid_type_error: 'Select a price' }).min(1, 'Select a price'),
  area: z.number({ invalid_type_error: 'Select area' }).min(1, 'Select area').optional(),
  carpetArea: z.number().min(0).optional(),
  builtUpArea: z.number().min(0).optional(),
  superArea: z.number().min(0).optional(),
  bedrooms: z.number({ invalid_type_error: 'Select BHK' }).min(0).optional(),
  bathrooms: z.number({ invalid_type_error: 'Select bathrooms' }).min(1).optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.enum(GURGAON_CITIES),
  state: z.enum(HARYANA_STATES),
  zipCode: z.string().min(1, 'Select pincode'),
  locality: z.string().min(1, 'Select locality'),
  sector: z.string().min(1, 'Select sector'),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  builderName: z.string().optional(),
  propertyAge: z.enum(PROPERTY_AGES).optional(),
  furnishing: z.enum(FURNISHING_OPTIONS).optional(),
  facing: z.enum(FACING_OPTIONS).optional(),
  possessionStatus: z.enum(POSSESSION_STATUSES).optional(),
  possessionDate: z.string().optional(),
  roiPotential: z.number().min(0).max(100).optional(),
  isVerified: z.boolean(),
  hasRera: z.boolean(),
  reraId: z.string().optional(),
  videoTourUrl: z.string().optional(),
  virtualTourUrl: z.string().optional(),
  brochureUrl: z.string().optional(),
  amenities: z.array(z.string()),
  isActive: z.boolean(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  ownerAddress: z.string().optional(),
  ownerNotes: z.string().optional(),
})

// Custom validation for conditional fields
export const propertySchemaWithConditionalValidation = propertySchema.superRefine((data, ctx) => {
  if (data.type === 'PLOT') {
    // For Plot type, make bedrooms, bathrooms and area optional - no additional validation needed
    return
  } else {
    // For other property types, ensure required fields are present
    if (data.area !== undefined && data.area <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select area',
        path: ['area'],
      })
    }
    if (data.bedrooms !== undefined && data.bedrooms < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select BHK',
        path: ['bedrooms'],
      })
    }
    if (data.bathrooms !== undefined && data.bathrooms <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select bathrooms',
        path: ['bathrooms'],
      })
    }
  }
})

export type PropertyFormData = z.infer<typeof propertySchemaWithConditionalValidation>

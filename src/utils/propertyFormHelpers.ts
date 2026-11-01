import type { PropertyFormData } from '@/schemas/property.schema'
import { capitalize } from '@/utils/formatters'

export function bhkLabel(bedrooms: number): string {
  if (bedrooms === 0) return 'Studio'
  if (bedrooms >= 5) return '5+ BHK'
  return `${bedrooms} BHK`
}

export function buildPropertyTitle(
  data: Pick<PropertyFormData, 'bedrooms' | 'type' | 'locality' | 'sector' | 'listingCategory'>,
): string {
  const typeLabel = capitalize(data.type.replace(/_/g, ' ').toLowerCase())
  const category = capitalize(data.listingCategory.toLowerCase())
  const location = [data.locality, data.sector].filter(Boolean).join(', ')
  
  // For Plot type, don't include BHK in the title
  if (data.type === 'PLOT') {
    return `${typeLabel} for ${category} in ${location}, Gurgaon`
  }
  
  // For other types, check if bedrooms is defined before using bhkLabel
  if (data.bedrooms !== undefined) {
    return `${bhkLabel(data.bedrooms)} ${typeLabel} for ${category} in ${location}, Gurgaon`
  }
  
  return `${typeLabel} for ${category} in ${location}, Gurgaon`
}

export function buildPropertyDescription(data: PropertyFormData): string {
  const typeLabel = capitalize(data.type.replace(/_/g, ' ').toLowerCase())
  const category = capitalize(data.listingCategory.toLowerCase())
  const landmark =
    data.landmark && data.landmark !== 'None / Not Applicable' ? ` near ${data.landmark}` : ''
  const builder = data.builderName ? ` by ${data.builderName}` : ''
  const furnishing = data.furnishing ? `, ${capitalize(data.furnishing.replace(/_/g, ' ').toLowerCase())}` : ''
  const facing = data.facing ? `, ${data.facing.toLowerCase()}-facing` : ''
  const amenities =
    data.amenities.length > 0
      ? ` Amenities include ${data.amenities.slice(0, 5).join(', ')}${data.amenities.length > 5 ? ' and more' : ''}.`
      : ''

  // For Plot type, we don't have bedrooms/bathrooms info, so we'll adjust the description
  if (data.type === 'PLOT') {
    const areaSentence = data.area && data.area > 0 ? `Spread across ${data.area.toLocaleString('en-IN')} sq ft.` : ''
    return (
      `Discover this ${typeLabel} for ${category} in ${data.locality}, ${data.sector}, Gurgaon${landmark}${builder}. ` +
      `${areaSentence} ` +
      `Located in one of Gurgaon's prime corridors with excellent connectivity.${furnishing}${facing} ` +
      `Your trusted partner for premium real estate in Gurgaon.`
    )
  }

  // For other property types, maintain existing behavior
  const bedroomsSentence = data.bedrooms !== undefined ? bhkLabel(data.bedrooms) : ''
  const areaSentence = data.area && data.area > 0 ? `Spread across ${data.area.toLocaleString('en-IN')} sq ft` : ''
  const bathroomsSentence = data.bathrooms !== undefined ? 
    `with ${data.bathrooms} bathroom${data.bathrooms > 1 ? 's' : ''}` : ''
  
  return (
    `Discover this ${bedroomsSentence} ${typeLabel} for ${category} in ${data.locality}, ${data.sector}, Gurgaon${landmark}${builder}. ` +
    `${areaSentence} ${bathroomsSentence}${furnishing}${facing}. ` +
    `Located in one of Gurgaon's prime corridors with excellent connectivity.${amenities} ` +
    `Your trusted partner for premium real estate in Gurgaon.`
  )
}

export function buildPropertyAddress(
  data: Pick<PropertyFormData, 'landmark' | 'locality' | 'sector' | 'zipCode'>,
): string {
  const parts: string[] = []
  if (data.landmark && data.landmark !== 'None / Not Applicable') parts.push(data.landmark)
  if (data.locality) parts.push(data.locality)
  if (data.sector) parts.push(data.sector)
  parts.push('Gurgaon', 'Haryana')
  const base = parts.join(', ')
  return data.zipCode ? `${base} - ${data.zipCode}` : base
}

export function deriveAreaFields(area: number | undefined) {
  if (area === undefined || area <= 0) {
    return {
      carpetArea: 0,
      builtUpArea: 0,
      superArea: 0,
    }
  }
  return {
    carpetArea: Math.round(area * 0.72),
    builtUpArea: Math.round(area * 0.88),
    superArea: area,
  }
}

export function enrichPropertyFormData(formData: PropertyFormData): PropertyFormData {
  const areas = deriveAreaFields(formData.area)
  return {
    ...formData,
    ...areas,
    city: 'Gurgaon',
    state: 'Haryana',
    title: buildPropertyTitle(formData),
    description: buildPropertyDescription(formData),
    address: buildPropertyAddress(formData),
    videoTourUrl: '',
    virtualTourUrl: '',
    brochureUrl: '',
    reraId: formData.hasRera ? formData.reraId : undefined,
  }
}

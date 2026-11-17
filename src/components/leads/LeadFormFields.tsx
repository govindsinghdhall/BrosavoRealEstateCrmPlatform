import { Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import type { Control } from 'react-hook-form'
import { FormTextField } from '@/components/forms/FormTextField'
import { FormSelect } from '@/components/forms/FormSelect'
import { LEAD_STATUSES, PROPERTY_TYPES } from '@/utils/constants'
import { capitalize } from '@/utils/formatters'
import type { LeadFormData } from '@/schemas/lead.schema'

interface LeadFormFieldsProps {
  control: Control<LeadFormData>
  leadSources: { id: number; name: string }[]
  /** Preserves legacy free-text values (e.g. website inquiry messages) when editing. */
  propertyTypeValue?: string
}

function propertyTypeOptions(currentValue?: string) {
  const options = PROPERTY_TYPES.map((type) => ({ value: type, label: capitalize(type) }))
  if (currentValue && !PROPERTY_TYPES.includes(currentValue as (typeof PROPERTY_TYPES)[number])) {
    return [{ value: currentValue, label: currentValue }, ...options]
  }
  return options
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Grid size={{ xs: 12 }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mt: 1, mb: -0.5 }}>
        {children}
      </Typography>
    </Grid>
  )
}

export function LeadFormFields({ control, leadSources, propertyTypeValue }: LeadFormFieldsProps) {
  return (
    <Grid container spacing={2}>
      <SectionTitle>Contact Information</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="firstName" control={control} label="First Name" required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="lastName" control={control} label="Last Name" required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="email" control={control} label="Email" type="email" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="phone" control={control} label="Phone" required />
      </Grid>

      <SectionTitle>Lead Details</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="status" control={control} label="Status" options={LEAD_STATUSES} required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="sourceId"
          control={control}
          label="Lead Source"
          options={leadSources.map((s) => ({ value: s.id, label: s.name }))}
          numeric
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="budget" control={control} label="Budget (INR)" type="number" required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="location" control={control} label="Preferred City / Location" required />
      </Grid>

      <SectionTitle>Requirements</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="propertyType"
          control={control}
          label="Property Type Interest"
          options={propertyTypeOptions(propertyTypeValue)}
          placeholder="Select property type"
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormTextField name="notes" control={control} label="Notes / Inquiry Message" multiline rows={4} />
      </Grid>
    </Grid>
  )
}

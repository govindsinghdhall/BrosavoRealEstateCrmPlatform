import { useEffect } from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { FormCreatableSelect } from '@/components/forms/FormCreatableSelect'
import { FormSelect } from '@/components/forms/FormSelect'
import { FormTextField } from '@/components/forms/FormTextField'
import { TextField } from '@mui/material';
import { FormSwitch } from '@/components/forms/FormSwitch'
import { PropertyImageUpload } from '@/components/properties/PropertyImageUpload'
import type { PropertyFormData } from '@/schemas/property.schema'
import type { Property } from '@/types'
import type { PropertyLookupType } from '@/types/propertyLookup'
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  LISTING_CATEGORIES,
  POSSESSION_STATUSES,
  PROPERTY_AGES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  PROPERTY_AMENITIES,
} from '@/utils/constants'
import {
  AREA_SQFT_OPTIONS,
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  GURGAON_CITIES,
  HARYANA_STATES,
  POSSESSION_QUARTERS,
  ROI_OPTIONS,
  RERA_STATUS_OPTIONS,
  withLegacyOption,
} from '@/utils/propertyMasterData'
import {
  buildPropertyAddress,
  buildPropertyDescription,
  buildPropertyTitle,
} from '@/utils/propertyFormHelpers'
import { capitalize } from '@/utils/formatters'
import { MAX_PROPERTY_PHOTOS } from '@/api/services/properties.service'

export interface PropertyLookupOptionLists {
  locality: string[]
  sector: string[]
  landmark: string[]
  pincode: string[]
  builder: string[]
}

interface PropertyFormFieldsProps {
  control: Control<PropertyFormData>
  watch: UseFormWatch<PropertyFormData>
  setValue: UseFormSetValue<PropertyFormData>
  editingProperty: Property | null
  lookupOptions: PropertyLookupOptionLists
  onCreateLookup: (type: PropertyLookupType, value: string) => Promise<void>
  pendingImages: File[]
  onFilesChange: (files: File[]) => void
  uploading: boolean
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

export function PropertyFormFields({
  control,
  watch,
  setValue,
  editingProperty,
  lookupOptions,
  onCreateLookup,
  pendingImages,
  onFilesChange,
  uploading,
}: PropertyFormFieldsProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const hasRera = watch('hasRera')
  const previewValues = watch()

  const canPreview =
    !!previewValues.locality &&
    !!previewValues.sector &&
    !!previewValues.type &&
    previewValues.area > 0 &&
    previewValues.bathrooms > 0

  const previewTitle = canPreview ? buildPropertyTitle(previewValues) : ''
  const previewAddress =
    previewValues.locality && previewValues.sector ? buildPropertyAddress(previewValues) : ''
  const previewDescription = canPreview
    ? buildPropertyDescription({
        ...previewValues,
        title: previewTitle,
        description: 'listing.',
        address: previewAddress,
      })
    : ''

  useEffect(() => {
    setValue('city', 'Gurgaon')
    setValue('state', 'Haryana')
  }, [setValue])

  useEffect(() => {
    if (!canPreview) return
    setValue('title', previewTitle)
    setValue('description', previewDescription)
    setValue('address', previewAddress)
  }, [canPreview, previewTitle, previewDescription, previewAddress, setValue])

  return (
    <Grid container spacing={2.5} sx={{ '& > .MuiGrid2-root': { minWidth: 0 } }}>
      <SectionTitle>Listing</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="listingCategory"
          control={control}
          label="Listing Category"
          options={LISTING_CATEGORIES.map((v) => ({ value: v, label: capitalize(v) }))}
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="type" control={control} label="Property Type" options={PROPERTY_TYPES} required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="status" control={control} label="Status" options={PROPERTY_STATUSES} required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
  <Controller
    name="price"
    control={control}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        fullWidth
        label="Price"
        type="number"
        required
        value={field.value || ''}
        onChange={(e) => field.onChange(Number(e.target.value))}
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        inputProps={{ min: 0 }}
      />
    )}
  />
</Grid>
      <Grid size={{ xs: 12 }}>
        <FormSwitch name="isActive" control={control} label="Active (visible on website when Available)" />
      </Grid>

      <SectionTitle>Location</SectionTitle>
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          Pick from the list or type a new locality, sector, landmark, or pincode — it is saved automatically
          for future listings.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormCreatableSelect
          name="locality"
          control={control}
          label="Locality"
          options={lookupOptions.locality}
          placeholder="Search or add locality"
          required
          onCreateOption={(value) => onCreateLookup('LOCALITY', value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormCreatableSelect
          name="sector"
          control={control}
          label="Sector"
          options={lookupOptions.sector}
          placeholder="Search or add sector"
          required
          onCreateOption={(value) => onCreateLookup('SECTOR', value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormCreatableSelect
          name="landmark"
          control={control}
          label="Nearby Landmark"
          options={lookupOptions.landmark}
          placeholder="Search or add landmark"
          onCreateOption={(value) => onCreateLookup('LANDMARK', value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormCreatableSelect
          name="zipCode"
          control={control}
          label="Pincode"
          options={lookupOptions.pincode}
          placeholder="Search or add pincode"
          required
          validateNewValue={(value) => (/^\d{6}$/.test(value) ? null : 'Pincode must be 6 digits')}
          onCreateOption={(value) => onCreateLookup('PINCODE', value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="city" control={control} label="City" options={GURGAON_CITIES} required disabled />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="state" control={control} label="State" options={HARYANA_STATES} required disabled />
      </Grid>

      <SectionTitle>Configuration</SectionTitle>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect
          name="bedrooms"
          control={control}
          label="BHK"
          options={BEDROOM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select BHK"
          numeric
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect
          name="bathrooms"
          control={control}
          label="Bathrooms"
          options={BATHROOM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select bathrooms"
          numeric
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect
          name="area"
          control={control}
          label="Super Area (sq ft)"
          options={AREA_SQFT_OPTIONS.map((sqft) => ({
            value: sqft,
            label: `${sqft.toLocaleString('en-IN')} sq ft`,
          }))}
          placeholder="Select area"
          numeric
          required
        />
      </Grid>

      <SectionTitle>Details</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormCreatableSelect
          name="builderName"
          control={control}
          label="Builder"
          options={lookupOptions.builder}
          placeholder="Search or add builder"
          onCreateOption={(value) => onCreateLookup('BUILDER', value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="propertyAge"
          control={control}
          label="Property Age"
          options={PROPERTY_AGES.map((v) => ({ value: v, label: capitalize(v) }))}
          placeholder="Select property age"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect
          name="furnishing"
          control={control}
          label="Furnishing"
          options={FURNISHING_OPTIONS.map((v) => ({ value: v, label: capitalize(v) }))}
          placeholder="Select furnishing"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect name="facing" control={control} label="Facing" options={FACING_OPTIONS} placeholder="Select facing" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSelect
          name="possessionStatus"
          control={control}
          label="Possession Status"
          options={POSSESSION_STATUSES.map((v) => ({ value: v, label: capitalize(v) }))}
          placeholder="Select possession"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="possessionDate"
          control={control}
          label="Expected Possession"
          options={POSSESSION_QUARTERS.map((v) => ({ value: v, label: v }))}
          placeholder="Select timeline"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect
          name="roiPotential"
          control={control}
          label="ROI Potential"
          options={ROI_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Select ROI"
          numeric
        />
      </Grid>

      <SectionTitle>Compliance</SectionTitle>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSwitch name="isVerified" control={control} label="Verified Listing" />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FormSwitch name="hasRera" control={control} label="RERA Registered" />
      </Grid>
      {hasRera && (
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelect
            name="reraId"
            control={control}
            label="RERA Status"
            options={withLegacyOption(RERA_STATUS_OPTIONS, editingProperty?.reraId)}
            placeholder="Select RERA status"
          />
        </Grid>
      )}

      <SectionTitle>Amenities</SectionTitle>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="amenities"
          control={control}
          render={({ field }) => (
            <FormGroup row sx={{ gap: 0.5 }}>
              {PROPERTY_AMENITIES.map((amenity) => {
                const checked = field.value?.includes(amenity) ?? false
                return (
                  <FormControlLabel
                    key={amenity}
                    control={
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(field.value ?? []), amenity]
                            : (field.value ?? []).filter((a) => a !== amenity)
                          field.onChange(next)
                        }}
                      />
                    }
                    label={amenity}
                  />
                )
              })}
            </FormGroup>
          )}
        />
      </Grid>

      <SectionTitle>Owner Information (CRM only)</SectionTitle>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField control={control} name="ownerName" label="Owner Name" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField control={control} name="ownerPhone" label="Owner Phone" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField control={control} name="ownerEmail" label="Owner Email" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField control={control} name="ownerAddress" label="Owner Address" />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormTextField control={control} name="ownerNotes" label="Owner Notes" multiline rows={2} />
      </Grid>

      <SectionTitle>Photos</SectionTitle>
      <Grid size={{ xs: 12 }}>
        <PropertyImageUpload
          existingImages={editingProperty?.images ?? []}
          files={pendingImages}
          onFilesChange={onFilesChange}
          maxPhotos={MAX_PROPERTY_PHOTOS}
          disabled={uploading}
          uploading={uploading && pendingImages.length > 0}
        />
      </Grid>

      <SectionTitle>SEO Preview (auto-generated)</SectionTitle>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#E2E8F0',
            bgcolor: isDark ? alpha('#fff', 0.03) : '#F8FAFC',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
            LISTING TITLE
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} mt={0.5} mb={1.5}>
            {previewTitle || 'Select locality, sector, BHK and type to generate title'}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
            ADDRESS
          </Typography>
          <Typography variant="body2" mb={1.5}>
            {previewAddress || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
            DESCRIPTION
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
            {canPreview
              ? previewDescription
              : 'Description is generated automatically from your selections for consistent SEO.'}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
}

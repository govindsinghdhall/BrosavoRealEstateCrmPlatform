import {
  Alert,
  Box,
  Button,
} from '@mui/material'
import { SideDrawer } from '@/components/common/SideDrawer'
import { PropertyFormFields } from '@/components/properties/PropertyFormFields'
import type { Property } from '@/types'
import type { PropertyFormData } from '@/schemas/property.schema'
import type { PropertyLookupOptionLists } from '@/components/properties/PropertyFormFields'
import type { PropertyLookupType } from '@/types/propertyLookup'
import {
  type Control,
  type UseFormHandleSubmit,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form'

interface PropertyDrawerProps {
  open: boolean
  onClose: () => void
  editingProperty: Property | null
  control: Control<PropertyFormData>
  handleSubmit: UseFormHandleSubmit<PropertyFormData>
  onSubmit: (data: PropertyFormData) => void
  watch: UseFormWatch<PropertyFormData>
  setValue: UseFormSetValue<PropertyFormData>
  lookupOptions: PropertyLookupOptionLists
  onCreateLookup: (
    type: PropertyLookupType,
    value: string
  ) => Promise<void>
  pendingImages: File[]
  onFilesChange: (files: File[]) => void
  isSaving: boolean
  submitError: string
  isPublishedOnWebsite: boolean
}

export function PropertyDrawer({
  open,
  onClose,
  editingProperty,
  control,
  handleSubmit,
  onSubmit,
  watch,
  setValue,
  lookupOptions,
  onCreateLookup,
  pendingImages,
  onFilesChange,
  isSaving,
  submitError,
  isPublishedOnWebsite,
}: PropertyDrawerProps) {
  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={editingProperty ? "Edit Property" : "Add Property"}
      subtitle={
        editingProperty
          ? "Update listing details — changes sync to the website when published"
          : "Create a new listing for the website"
      }
      width={720}
      footer={
        <>
          <Button
            onClick={onClose}
            disabled={isSaving}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={handleSubmit(onSubmit)}
            sx={{
              minWidth: "120px",
              height: "48px",
            }}
          >
            {isSaving
              ? pendingImages.length
                ? `Uploading ${pendingImages.length} photo${pendingImages.length > 1 ? "s" : ""}...`
                : "Saving..."
              : editingProperty
                ? "Update Property"
                : "Create & Publish"}
          </Button>
        </>
      }
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 2 }}
      >
        <Alert
          severity={isPublishedOnWebsite ? "success" : "info"}
          className="formAlert"
        >
          {isPublishedOnWebsite
            ? "This property will appear on the public website automatically."
            : "To publish on the website, set Status to Available and keep Active turned on."}
        </Alert>

        {submitError && (
          <Alert severity="error" className="formAlert">
            {submitError}
          </Alert>
        )}

        <PropertyFormFields
          control={control}
          watch={watch}
          setValue={setValue}
          editingProperty={editingProperty}
          lookupOptions={lookupOptions}
          onCreateLookup={onCreateLookup}
          pendingImages={pendingImages}
          onFilesChange={onFilesChange}
          uploading={isSaving}
        />
      </Box>
    </SideDrawer>
  )
}
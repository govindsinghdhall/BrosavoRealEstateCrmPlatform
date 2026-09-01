import { useCallback, useMemo, useState } from 'react'
import { Alert, Box, Button, Snackbar } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppTable, type AppTableColumn } from '@/components/common/AppTable'
import tableStyles from './PropertiesTable.module.css'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { PageSummaryGrid, PageSummaryItem } from '@/components/common/PageSummaryGrid'
import { SideDrawer } from '@/components/common/SideDrawer'
import { StatCard } from '@/components/common/StatCard'
import { TableFilterPills } from '@/components/common/TableFilterPills'
import { TablePill } from '@/components/common/TablePill'
import { TableRowActions } from '@/components/common/TableRowActions'
import { PropertyFormFields } from '@/components/properties/PropertyFormFields'
import { propertySchema, type PropertyFormData } from '@/schemas/property.schema'
import { getErrorMessage } from '@/api/client'
import { propertiesService, propertyLookupsService } from '@/api/services'
import {
  invalidateListQueries,
  prependToListCaches,
  removeFromListCaches,
  updateInListCaches,
} from '@/api/utils/query'
import { bhkLabel, enrichPropertyFormData } from '@/utils/propertyFormHelpers'
import {
  GURGAON_BUILDERS,
  GURGAON_LANDMARKS,
  GURGAON_LOCALITIES,
  GURGAON_PINCODES,
  GURGAON_SECTORS,
} from '@/utils/propertyMasterData'
import { mergeLookupOptions } from '@/utils/mergeLookupOptions'
import { capitalize, formatCurrency } from '@/utils/formatters'
import type { Property } from '@/types'
import type { PropertyLookupType } from '@/types/propertyLookup'
import styles from './PropertiesPage.module.css'

const defaultValues: PropertyFormData = {
  title: '',
  description: '',
  listingCategory: 'BUY',
  type: 'APARTMENT',
  status: 'AVAILABLE',
  price: 0,
  area: 0,
  bedrooms: 0,
  bathrooms: 0,
  address: '',
  city: 'Gurgaon',
  state: 'Haryana',
  zipCode: '',
  locality: '',
  sector: '',
  landmark: '',
  builderName: '',
  isVerified: true,
  hasRera: false,
  reraId: '',
  videoTourUrl: '',
  virtualTourUrl: '',
  brochureUrl: '',
  amenities: [],
  isActive: true,
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownerAddress: '',
  ownerNotes: '',
}

function propertyLabel(property: Property) {
  const typeLabel = capitalize(String(property.type).replace(/_/g, ' ').toLowerCase())
  const location = [property.locality || property.city, property.sector].filter(Boolean).join(' · ')
  return location
    ? `${bhkLabel(property.bedrooms)} ${typeLabel} · ${location}`
    : `${bhkLabel(property.bedrooms)} ${typeLabel}`
}

export function PropertiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'on_website'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['properties', search],
    queryFn: () => propertiesService.getAll({ search, pageSize: 50 }),
  })

  const { data: savedLookups } = useQuery({
    queryKey: ['property-lookups'],
    queryFn: () => propertyLookupsService.getAll(),
    enabled: drawerOpen,
    staleTime: 60_000,
  })

  const lookupOptions = useMemo(
    () => ({
      locality: mergeLookupOptions(
        GURGAON_LOCALITIES,
        savedLookups?.LOCALITY,
        editingProperty?.locality,
      ),
      sector: mergeLookupOptions(GURGAON_SECTORS, savedLookups?.SECTOR, editingProperty?.sector),
      landmark: mergeLookupOptions(
        GURGAON_LANDMARKS,
        savedLookups?.LANDMARK,
        editingProperty?.landmark,
      ),
      pincode: mergeLookupOptions(
        GURGAON_PINCODES,
        savedLookups?.PINCODE,
        editingProperty?.zipCode,
      ),
      builder: mergeLookupOptions(
        GURGAON_BUILDERS,
        savedLookups?.BUILDER,
        editingProperty?.builderName,
      ),
    }),
    [savedLookups, editingProperty],
  )

  const handleCreateLookup = useCallback(
    async (type: PropertyLookupType, value: string) => {
      await propertyLookupsService.create(type, value)
      await queryClient.invalidateQueries({ queryKey: ['property-lookups'] })
    },
    [queryClient],
  )

  const { control, handleSubmit, reset, watch, setValue } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  })

  const status = watch('status')
  const isActive = watch('isActive')
  const isPublishedOnWebsite = isActive && status === 'AVAILABLE'

  const saveMutation = useMutation({
    mutationFn: async ({
      formData,
      propertyId,
      existingImageCount,
      images,
    }: {
      formData: PropertyFormData
      propertyId?: string
      existingImageCount: number
      images: File[]
    }) => {
      const payload = { ...formData }

      const property = propertyId
        ? await propertiesService.update(propertyId, payload)
        : await propertiesService.create(payload)

      let uploadedCount = 0
      if (images.length) {
        uploadedCount = await propertiesService.uploadImages(property.id, images, {
          hasExistingImages: existingImageCount > 0,
        })
      }

      return { property, uploadedCount, isNew: !propertyId }
    },
    onSuccess: async ({ property, uploadedCount, isNew }) => {
      if (isNew) {
        prependToListCaches(queryClient, ['properties'], property)
      } else {
        updateInListCaches(queryClient, ['properties'], property)
      }
      await invalidateListQueries(queryClient, ['properties'])
      handleCloseDrawer()

      const photoMsg =
        uploadedCount > 0
          ? ` ${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded successfully.`
          : ''
      const publishMsg = isPublishedOnWebsite ? ' It is now live on the website.' : ''

      setSuccessMessage(
        isNew
          ? `Property created successfully!${photoMsg}${publishMsg}`
          : `Property updated successfully!${photoMsg}${publishMsg}`,
      )
    },
    onError: (err) => setSubmitError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: propertiesService.delete,
    onSuccess: async (_data, id) => {
      removeFromListCaches(queryClient, ['properties'], id)
      await invalidateListQueries(queryClient, ['properties'])
      setDeleteId(null)
      setSuccessMessage('Property deleted successfully.')
    },
  })

  const handleOpenCreate = () => {
    setEditingProperty(null)
    setPendingImages([])
    setSubmitError('')
    reset(defaultValues)
    setDrawerOpen(true)
  }

  const handleOpenEdit = async (property: Property) => {
    setSubmitError('')
    setPendingImages([])
    try {
      const fresh = await propertiesService.getById(property.id)
      setEditingProperty(fresh)
      reset({
        title: fresh.title,
        description: fresh.description,
        listingCategory: fresh.listingCategory,
        type: fresh.type,
        status: fresh.status,
        price: fresh.price,
        area: fresh.area,
        carpetArea: fresh.carpetArea,
        builtUpArea: fresh.builtUpArea,
        superArea: fresh.superArea,
        bedrooms: fresh.bedrooms,
        bathrooms: fresh.bathrooms,
        address: fresh.address,
        city: 'Gurgaon',
        state: 'Haryana',
        zipCode: fresh.zipCode,
        locality: fresh.locality,
        sector: fresh.sector ?? '',
        landmark: fresh.landmark ?? '',
        builderName: fresh.builderName ?? '',
        propertyAge: fresh.propertyAge,
        furnishing: fresh.furnishing,
        facing: fresh.facing,
        possessionStatus: fresh.possessionStatus,
        possessionDate: fresh.possessionDate?.slice(0, 10) ?? '',
        roiPotential: fresh.roiPotential,
        isVerified: fresh.isVerified,
        hasRera: fresh.hasRera,
        reraId: fresh.reraId ?? '',
        videoTourUrl: fresh.videoTourUrl ?? '',
        virtualTourUrl: fresh.virtualTourUrl ?? '',
        brochureUrl: fresh.brochureUrl ?? '',
        amenities: fresh.amenities,
        isActive: fresh.isActive,
        ownerName: fresh.ownerName ?? '',
        ownerPhone: fresh.ownerPhone ?? '',
        ownerEmail: fresh.ownerEmail ?? '',
        ownerAddress: fresh.ownerAddress ?? '',
        ownerNotes: fresh.ownerNotes ?? '',
      })
      setDrawerOpen(true)
    } catch (err) {
      setSuccessMessage('')
      setSubmitError(getErrorMessage(err))
    }
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setEditingProperty(null)
    setPendingImages([])
    setSubmitError('')
    reset(defaultValues)
  }

  const onSubmit = (formData: PropertyFormData) => {
    setSubmitError('')
    saveMutation.mutate({
      formData: enrichPropertyFormData(formData),
      propertyId: editingProperty?.id,
      existingImageCount: editingProperty?.images.length ?? 0,
      images: pendingImages,
    })
  }

  const properties = useMemo(() => data?.data ?? [], [data?.data])

  const summary = useMemo(() => {
    const onWebsite = properties.filter((p) => p.isActive && p.status === 'AVAILABLE').length
    const available = properties.filter((p) => p.status === 'AVAILABLE').length
    const portfolioValue = properties.reduce((sum, p) => sum + (p.price || 0), 0)
    return { total: data?.total ?? properties.length, onWebsite, available, portfolioValue }
  }, [data?.total, properties])

  const filteredRows = useMemo(() => {
    switch (statusFilter) {
      case 'available':
        return properties.filter((p) => p.status === 'AVAILABLE')
      case 'on_website':
        return properties.filter((p) => p.isActive && p.status === 'AVAILABLE')
      default:
        return properties
    }
  }, [properties, statusFilter])

  const filterPills = useMemo(
    () => [
      { id: 'all', label: 'All', count: properties.length, color: '#64748b' },
      { id: 'available', label: 'Available', count: summary.available, color: '#0d9488' },
      { id: 'on_website', label: 'On Website', count: summary.onWebsite, color: '#2563eb' },
    ],
    [properties.length, summary.available, summary.onWebsite],
  )

  const columns = useMemo<AppTableColumn<Property>[]>(
    () => [
      {
        id: 'property',
        label: 'Property',
        colClassName: tableStyles.colProperty,
        cellClassName: tableStyles.cellPrimary,
        render: (property) => (
          <span title={propertyLabel(property)}>{propertyLabel(property)}</span>
        ),
      },
      {
        id: 'price',
        label: 'Price',
        colClassName: tableStyles.colPrice,
        cellClassName: tableStyles.cellStrong,
        render: (property) => formatCurrency(property.price),
      },
      {
        id: 'status',
        label: 'Status',
        colClassName: tableStyles.colStatus,
        render: (property) => <TablePill label={property.status} />,
      },
      {
        id: 'type',
        label: 'Type',
        hideOnMobile: true,
        colClassName: tableStyles.colType,
        render: (property) => <TablePill label={property.listingCategory} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        colClassName: tableStyles.colActions,
        cellClassName: tableStyles.cellActions,
        render: (property) => (
          <TableRowActions
            onEdit={() => handleOpenEdit(property)}
            onDelete={() => setDeleteId(property.id)}
          />
        ),
      },
    ],
    [],
  )

  return (
    <Box>
      <PageHeader
        title="Properties"
        subtitle="Manage listings — published to the website when Active and Available"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Properties' }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Add Property
          </Button>
        }
      />

      <PageSummaryGrid>
        <PageSummaryItem>
          <StatCard title="Total Properties" value={summary.total} icon={HomeWorkOutlinedIcon} color="#1565C0" subtitle="All listings" />
        </PageSummaryItem>
        <PageSummaryItem>
          <StatCard title="On Website" value={summary.onWebsite} icon={PublicOutlinedIcon} color="#00897B" subtitle="Live on public site" />
        </PageSummaryItem>
        <PageSummaryItem>
          <StatCard title="Available" value={summary.available} icon={SellOutlinedIcon} color="#0288D1" subtitle="Ready to sell" />
        </PageSummaryItem>
        <PageSummaryItem>
          <StatCard title="Portfolio Value" value={formatCurrency(summary.portfolioValue)} icon={AttachMoneyIcon} color="#2E7D32" subtitle="Total listing value" />
        </PageSummaryItem>
      </PageSummaryGrid>

      <AppTable
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row.id}
        tableClassName={tableStyles.table}
        loading={isLoading}
        emptyMessage="No properties found"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, city, locality..."
        filters={
          <TableFilterPills
            pills={filterPills}
            activeId={statusFilter}
            onChange={(id) => setStatusFilter(id as typeof statusFilter)}
          />
        }
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} className={styles.snackbarAlert}>
          {successMessage}
        </Alert>
      </Snackbar>

      <SideDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={editingProperty ? 'Edit Property' : 'Add Property'}
        subtitle={
          editingProperty
            ? 'Update listing details — changes sync to the website when published'
            : 'Create a new listing for the website'
        }
        width={720}
        footer={
          <>
            <Button onClick={handleCloseDrawer} disabled={saveMutation.isPending} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={saveMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {saveMutation.isPending
                ? pendingImages.length
                  ? `Uploading ${pendingImages.length} photo${pendingImages.length > 1 ? 's' : ''}...`
                  : 'Saving...'
                : editingProperty
                  ? 'Update Property'
                  : 'Create & Publish'}
            </Button>
          </>
        }
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Alert severity={isPublishedOnWebsite ? 'success' : 'info'} className={styles.formAlert}>
            {isPublishedOnWebsite
              ? 'This property will appear on the public website automatically.'
              : 'To publish on the website, set Status to Available and keep Active turned on.'}
          </Alert>

          {submitError && (
            <Alert severity="error" className={styles.formAlert}>
              {submitError}
            </Alert>
          )}

          <PropertyFormFields
            control={control}
            watch={watch}
            setValue={setValue}
            editingProperty={editingProperty}
            lookupOptions={lookupOptions}
            onCreateLookup={handleCreateLookup}
            pendingImages={pendingImages}
            onFilesChange={setPendingImages}
            uploading={saveMutation.isPending}
          />
        </Box>
      </SideDrawer>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Property"
        message="Are you sure you want to delete this property? It will be removed from the website too."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}

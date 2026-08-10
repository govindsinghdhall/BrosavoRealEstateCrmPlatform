import { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  FormHelperText,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { whatsappService } from '../../api/services/whatsapp.service'
import { contactsService } from '../../api/services/contacts.service'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  templateId: z.number().min(1, 'Please select a template'),
  contactIds: z
    .array(z.number())
    .min(1, 'Please select at least one contact'),
  scheduledAt: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function WhatsAppCampaignDrawer({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      templateId: 0,
      contactIds: [],
      scheduledAt: '',
    },
  })

  const selectedContactIds = watch('contactIds')

  // ============================================================
  // WHATSAPP TEMPLATES
  // ============================================================

  const {
    data: templates,
    isLoading: templatesLoading,
  } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: () => whatsappService.getTemplates(),
    enabled: open,
  })

  // ============================================================
  // CONTACTS
  // ============================================================

  const {
    data: contactsData,
    isLoading: contactsLoading,
  } = useQuery({
    queryKey: ['contacts', searchTerm],
    queryFn: () =>
      contactsService.getAll({
        search: searchTerm,
        limit: 100,
      }),
    enabled: open,
  })

  // ============================================================
  // CAMPAIGN CREATION
  // ============================================================
  //
  // NOTE:
  // whatsappService.createCampaign() does not currently exist.
  //
  // We intentionally leave this mutation disabled until we connect
  // the drawer to the correct backend WhatsApp campaign endpoint.
  //
  // This keeps the UI code ready without incorrectly calling the
  // existing generic marketing campaign API.
  //
  const createCampaign = useMutation({
    mutationFn: async (_data: CampaignFormData) => {
      throw new Error(
        'WhatsApp campaign API is not connected yet.',
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['whatsapp-campaigns'],
      })

      onSuccess()

      handleClose()
    },
  })

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    reset({
      name: '',
      templateId: 0,
      contactIds: [],
      scheduledAt: '',
    })

    setSearchTerm('')

    onClose()
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit = (data: CampaignFormData) => {
    createCampaign.mutate(data)
  }

  // ============================================================
  // APPROVED TEMPLATES
  // ============================================================

  const approvedTemplates =
    templates?.filter(
      (template: any) =>
        template.status === 'APPROVED',
    ) || []

  // ============================================================
  // CONTACT SELECTION
  // ============================================================

  const toggleContact = (contactId: number) => {
    const current = selectedContactIds || []

    if (current.includes(contactId)) {
      setValue(
        'contactIds',
        current.filter((id) => id !== contactId),
        {
          shouldValidate: true,
        },
      )
    } else {
      setValue(
        'contactIds',
        [...current, contactId],
        {
          shouldValidate: true,
        },
      )
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: {
            xs: '100%',
            sm: 600,
          },
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
        >
          Create WhatsApp Campaign
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Select an approved WhatsApp template and choose
          the contacts you want to reach.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* ================================================= */}
            {/* CAMPAIGN NAME */}
            {/* ================================================= */}

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Campaign Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={
                    errors.name?.message
                  }
                  placeholder="e.g., Festival Greeting 2026"
                />
              )}
            />

            {/* ================================================= */}
            {/* TEMPLATE */}
            {/* ================================================= */}

            <Controller
              name="templateId"
              control={control}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  error={!!errors.templateId}
                >
                  <InputLabel>
                    Template
                  </InputLabel>

                  <Select
                    {...field}
                    value={field.value || ''}
                    label="Template"
                    onChange={(event) => {
                      field.onChange(
                        Number(event.target.value),
                      )
                    }}
                  >
                    {templatesLoading ? (
                      <MenuItem disabled>
                        Loading templates...
                      </MenuItem>
                    ) : approvedTemplates.length ===
                      0 ? (
                      <MenuItem disabled>
                        No approved templates
                      </MenuItem>
                    ) : (
                      approvedTemplates.map(
                        (template: any) => (
                          <MenuItem
                            key={template.id}
                            value={template.id}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                              >
                                {template.name}
                              </Typography>

                              {template.language && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ({template.language})
                                </Typography>
                              )}

                              {template.category && (
                                <Chip
                                  label={
                                    template.category
                                  }
                                  size="small"
                                />
                              )}
                            </Box>
                          </MenuItem>
                        ),
                      )
                    )}
                  </Select>

                  {errors.templateId && (
                    <FormHelperText>
                      {
                        errors.templateId
                          .message
                      }
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            {/* ================================================= */}
            {/* CONTACTS */}
            {/* ================================================= */}

            <FormControl
              fullWidth
              error={!!errors.contactIds}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
              >
                Select Contacts (
                {selectedContactIds?.length || 0}{' '}
                selected)
              </Typography>

              <TextField
                fullWidth
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                size="small"
                sx={{ mb: 1 }}
              />

              <Box
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {contactsLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent:
                        'center',
                      p: 3,
                    }}
                  >
                    <CircularProgress
                      size={24}
                    />
                  </Box>
                ) : contactsData?.data?.length ? (
                  <List dense disablePadding>
                    {contactsData.data.map(
                      (contact: any) => {
                        const isSelected =
                          selectedContactIds?.includes(
                            contact.id,
                          )

                        return (
                          <ListItem
                            key={contact.id}
                            disablePadding
                          >
                            <ListItemButton
                              onClick={() =>
                                toggleContact(
                                  contact.id,
                                )
                              }
                              selected={
                                isSelected
                              }
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={
                                    isSelected
                                  }
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>

                              <ListItemText
                                primary={`${contact.firstName} ${
                                  contact.lastName ||
                                  ''
                                }`}
                                secondary={
                                  contact.phone ||
                                  contact.email ||
                                  'No contact information'
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        )
                      },
                    )}
                  </List>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      No contacts found
                    </Typography>
                  </Box>
                )}
              </Box>

              {errors.contactIds && (
                <FormHelperText>
                  {
                    errors.contactIds
                      .message
                  }
                </FormHelperText>
              )}
            </FormControl>

            {/* ================================================= */}
            {/* SCHEDULE */}
            {/* ================================================= */}

            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Schedule (Optional)"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Leave empty to send immediately"
                />
              )}
            />

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {createCampaign.error && (
              <Alert severity="error">
                {createCampaign.error
                  instanceof Error
                  ? createCampaign.error.message
                  : 'Failed to create campaign'}
              </Alert>
            )}

            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                fullWidth
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={
                  createCampaign.isPending ||
                  !selectedContactIds?.length
                }
              >
                {createCampaign.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Drawer>
  )
}
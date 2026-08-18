import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/api/client'
import { contactsService, leadsService } from '@/api/services'
import { whatsappService } from '@/api/services/whatsapp.service'
import type { Contact, Lead, WhatsAppMetaTemplate } from '@/types'

interface CrmOption {
  kind: 'contact' | 'lead'
  id: number
  label: string
  phone: string
  firstName?: string
  lastName?: string
}

interface WhatsAppNewConversationFormProps {
  onSent: (conversationId: number) => void
  onCancel: () => void
}

function templateKeys(template?: WhatsAppMetaTemplate | null): string[] {
  if (!template) return []
  if (template.variables?.length) return template.variables

  const keys: string[] = []
  for (const component of template.components || []) {
    const matches = String(component.text || '').matchAll(/{{\s*([^}]+?)\s*}}/g)
    for (const match of matches) {
      if (match[1] && !keys.includes(match[1])) {
        keys.push(match[1])
      }
    }
  }
  return keys
}

function previewTemplate(
  template: WhatsAppMetaTemplate,
  variables: Record<string, string>,
): string {
  const parts = (template.components || [])
    .filter((component) => component.text)
    .map((component) => String(component.text))

  let preview = parts.join('\n\n') || template.name

  for (const [key, value] of Object.entries(variables)) {
    preview = preview.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value || `{{${key}}}`)
  }

  return preview
}

function crmValue(
  key: string,
  phone: string,
  person?: { firstName?: string; lastName?: string; phone?: string } | null,
): string {
  const firstName = person?.firstName || ''
  const lastName = person?.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (['1', 'name', 'customername', 'fullname'].includes(normalized)) {
    return fullName || phone
  }
  if (['2', 'firstname'].includes(normalized)) return firstName
  if (['3', 'lastname'].includes(normalized)) return lastName
  if (normalized.includes('phone')) return person?.phone || phone
  if (normalized.includes('first')) return firstName
  if (normalized.includes('last')) return lastName
  if (normalized.includes('name')) return fullName || phone
  return ''
}

export function WhatsAppNewConversationForm({
  onSent,
  onCancel,
}: WhatsAppNewConversationFormProps) {
  const [phone, setPhone] = useState('')
  const [crmOption, setCrmOption] = useState<CrmOption | null>(null)
  const [messageType, setMessageType] = useState<'template' | 'text'>('template')
  const [templateId, setTemplateId] = useState<number | ''>('')
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const templatesQuery = useQuery({
    queryKey: ['whatsapp-approved-templates'],
    queryFn: async () => {
      try {
        await whatsappService.syncTemplates()
      } catch {
        // Use whatever is already stored if live sync fails.
      }
      return whatsappService.getApprovedTemplates()
    },
  })

  const contactsQuery = useQuery({
    queryKey: ['whatsapp-new-contacts'],
    queryFn: () => contactsService.getAll({ page: 1, pageSize: 100 }),
  })

  const leadsQuery = useQuery({
    queryKey: ['whatsapp-new-leads'],
    queryFn: () => leadsService.getAll({ page: 1, pageSize: 100 }),
  })

  const crmOptions = useMemo<CrmOption[]>(() => {
    const contacts = (contactsQuery.data?.data ?? []).map((contact: Contact) => ({
      kind: 'contact' as const,
      id: contact.id,
      label: `${contact.firstName} ${contact.lastName}`.trim() || contact.phone,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
    }))
    const leads = (leadsQuery.data?.data ?? []).map((lead: Lead) => ({
      kind: 'lead' as const,
      id: lead.id,
      label: `${lead.firstName} ${lead.lastName}`.trim() || lead.phone,
      phone: lead.phone,
      firstName: lead.firstName,
      lastName: lead.lastName,
    }))
    return [...contacts, ...leads]
  }, [contactsQuery.data, leadsQuery.data])

  const templates = templatesQuery.data ?? []
  const selectedTemplate =
    templates.find((template) => template.id === templateId) || null
  const variableKeys = templateKeys(selectedTemplate)

  useEffect(() => {
    if (!selectedTemplate) {
      setVariables({})
      return
    }

    const person = crmOption
    const next: Record<string, string> = {}
    for (const key of templateKeys(selectedTemplate)) {
      next[key] = crmValue(key, phone, person)
    }
    setVariables(next)
  }, [selectedTemplate, crmOption, phone])

  useEffect(() => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || crmOption) return

    const last10 = digits.slice(-10)
    const match = crmOptions.find((option) => {
      const optionDigits = option.phone.replace(/\D/g, '')
      return (
        optionDigits === digits ||
        optionDigits.slice(-10) === last10
      )
    })

    if (match) {
      setCrmOption(match)
    }
  }, [phone, crmOptions, crmOption])

  const sendMutation = useMutation({
    mutationFn: () =>
      whatsappService.sendText({
        to: phone.trim(),
        type: messageType,
        text: messageType === 'text' ? text : undefined,
        templateId: messageType === 'template' ? Number(templateId) : undefined,
        templateVariables: messageType === 'template' ? variables : undefined,
        contactId: crmOption?.kind === 'contact' ? crmOption.id : undefined,
        leadId: crmOption?.kind === 'lead' ? crmOption.id : undefined,
      }),
    onSuccess: (result) => {
      onSent(result.conversationId)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const canSend =
    Boolean(phone.trim()) &&
    (messageType === 'text'
      ? Boolean(text.trim())
      : Boolean(templateId) && templates.length > 0)

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        New WhatsApp Conversation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Send the first message to a customer from this organization&apos;s
        connected WhatsApp number.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TextField
        label="Phone Number"
        placeholder="+91 9810078510"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        helperText="International format is accepted. +91 9810078510 is fine."
      />

      <Autocomplete
        options={crmOptions}
        value={crmOption}
        onChange={(_event, value) => {
          setCrmOption(value)
          if (value?.phone) {
            setPhone(value.phone)
          }
        }}
        isOptionEqualToValue={(option, value) =>
          option.kind === value.kind && option.id === value.id
        }
        getOptionLabel={(option) =>
          `${option.label} · ${option.kind} · ${option.phone}`
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Contact / Lead (optional)"
            placeholder="Search CRM records"
          />
        )}
        sx={{ mb: 2 }}
      />

      <FormControl sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Message Type
        </Typography>
        <RadioGroup
          row
          value={messageType}
          onChange={(event) =>
            setMessageType(event.target.value as 'template' | 'text')
          }
        >
          <FormControlLabel value="template" control={<Radio />} label="Template" />
          <FormControlLabel value="text" control={<Radio />} label="Text" />
        </RadioGroup>
      </FormControl>

      {messageType === 'template' ? (
        templatesQuery.isLoading ? (
          <Typography color="text.secondary">Loading templates...</Typography>
        ) : templates.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No approved WhatsApp templates are available for this WhatsApp
            account. Create and approve a template in Meta Business Manager
            before initiating a business conversation outside the customer-service
            window.
          </Alert>
        ) : (
          <>
            <TextField
              select
              SelectProps={{ native: true }}
              label="Template"
              value={templateId}
              onChange={(event) =>
                setTemplateId(
                  event.target.value ? Number(event.target.value) : '',
                )
              }
              fullWidth
              sx={{ mb: 2 }}
            >
              <option value="">Select an approved template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.language})
                </option>
              ))}
            </TextField>

            {selectedTemplate && (
              <Alert severity="info" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {previewTemplate(selectedTemplate, variables)}
              </Alert>
            )}

            {variableKeys.map((key) => (
              <TextField
                key={key}
                label={`Variable {{${key}}}`}
                value={variables[key] || ''}
                onChange={(event) =>
                  setVariables((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                fullWidth
                sx={{ mb: 1.5 }}
              />
            ))}
          </>
        )
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Free-form text is only allowed inside an active WhatsApp
            customer-service window. To start a new business conversation, use
            an approved template.
          </Alert>
          <TextField
            label="Message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            fullWidth
            multiline
            minRows={4}
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Box display="flex" gap={1} justifyContent="flex-end" mt={1}>
        <Button variant="outlined" onClick={onCancel} disabled={sendMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setError('')
            sendMutation.mutate()
          }}
          disabled={!canSend || sendMutation.isPending}
          startIcon={
            sendMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {sendMutation.isPending ? 'Sending...' : 'Send WhatsApp'}
        </Button>
      </Box>
    </Box>
  )
}

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/api/client'
import { whatsappService } from '@/api/services/whatsapp.service'
import type { WhatsAppMetaTemplate, WhatsAppThreadMessage } from '@/types'

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

function statusColor(status: string) {
  if (status === 'read') return 'success'
  if (status === 'delivered') return 'info'
  if (status === 'sent' || status === 'sending') return 'default'
  if (status === 'failed') return 'error'
  return 'default'
}

function statusLabel(status: string) {
  if (status === 'sending') return 'Sending'
  if (status === 'sent') return 'Sent'
  if (status === 'delivered') return 'Delivered'
  if (status === 'read') return 'Read'
  if (status === 'failed') return 'Failed'
  return status
}

function isTemplateRequiredError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return /template is required|customer-service window|131047/i.test(
      getErrorMessage(error),
    )
  }

  const data = error.response?.data as { code?: string; message?: string } | undefined
  return (
    data?.code === 'TEMPLATE_REQUIRED' ||
    /template is required|customer-service window|131047/i.test(
      data?.message || error.message || '',
    )
  )
}

interface WhatsAppConversationPanelProps {
  conversationId: number | null
  leadId?: number
  contactId?: number
  title?: string
  phone?: string
}

export function WhatsAppConversationPanel({
  conversationId,
  leadId,
  contactId,
  title,
  phone,
}: WhatsAppConversationPanelProps) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [requiresTemplate, setRequiresTemplate] = useState(false)
  const [templateId, setTemplateId] = useState<number | ''>('')
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string>
  >({})

  const messagesQuery = useQuery({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: () => whatsappService.getConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 8000,
  })

  const templatesQuery = useQuery({
    queryKey: ['whatsapp-approved-templates'],
    queryFn: () => whatsappService.getApprovedTemplates(),
    enabled: requiresTemplate,
  })

  const selectedTemplate =
    templatesQuery.data?.find((template) => template.id === templateId) || null
  const variableKeys = templateKeys(selectedTemplate)

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateVariables({})
      return
    }

    const keys = templateKeys(selectedTemplate)
    setTemplateVariables((current) => {
      const next: Record<string, string> = {}
      for (const key of keys) {
        next[key] = current[key] || ''
      }
      return next
    })
  }, [selectedTemplate])

  const messages = useMemo(() => {
    const items = messagesQuery.data ?? []
    return [...items].sort(
      (a, b) =>
        new Date(a.timestamp || a.createdAt).getTime() -
        new Date(b.timestamp || b.createdAt).getTime(),
    )
  }, [messagesQuery.data])

  useEffect(() => {
    if (!conversationId) return
    void whatsappService.markRead(conversationId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] })
    })
  }, [conversationId, queryClient])

  const sendMutation = useMutation({
    mutationFn: () => {
      if (requiresTemplate) {
        return whatsappService.sendText({
          conversationId: conversationId || undefined,
          leadId,
          contactId,
          type: 'template',
          templateId: Number(templateId),
          templateVariables,
        })
      }

      return whatsappService.sendText({
        text: draft,
        conversationId: conversationId || undefined,
        leadId,
        contactId,
        type: 'text',
      })
    },
    onSuccess: async () => {
      setDraft('')
      setError('')
      setRequiresTemplate(false)
      setTemplateId('')
      setTemplateVariables({})
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-messages', conversationId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-conversations'],
      })
    },
    onError: (err) => {
      setError(getErrorMessage(err))
      if (isTemplateRequiredError(err)) {
        setRequiresTemplate(true)
      }
    },
  })

  const handleSend = () => {
    if (requiresTemplate && !templateId) return
    if (!requiresTemplate && !draft.trim()) return
    sendMutation.mutate()
  }

  if (!conversationId && !leadId && !contactId) {
    return (
      <Typography color="text.secondary">
        No conversation selected
      </Typography>
    )
  }

  const templates = templatesQuery.data ?? []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title || phone || 'Conversation'}
        </Typography>
        {phone && title !== phone && (
          <Typography variant="body2" color="text.secondary">
            {phone}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {requiresTemplate && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Meta rejected the free-form message because a template is required
          outside the customer-service window. Choose an approved template to
          continue.
        </Alert>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1, mb: 2 }}>
        {messagesQuery.isLoading ? (
          <Typography color="text.secondary">Loading messages...</Typography>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary">
            No messages yet. Send the first WhatsApp message.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {messages.map((message: WhatsAppThreadMessage) => {
              const outgoing = message.direction === 'outbound'
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: outgoing ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: outgoing ? '#DCF8C6' : 'action.hover',
                    }}
                  >
                    <Typography variant="body2">
                      {message.text || `[${message.messageType}]`}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.timestamp || message.createdAt).toLocaleString()}
                      </Typography>
                      {outgoing && (
                        <Chip
                          size="small"
                          label={sendMutation.isPending && !message.status ? 'Sending' : statusLabel(message.status)}
                          color={statusColor(message.status)}
                          variant="outlined"
                          sx={{ height: 18, fontSize: 10 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        )}
      </Box>

      {requiresTemplate ? (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {templatesQuery.isLoading ? (
            <Typography color="text.secondary">Loading templates...</Typography>
          ) : templates.length === 0 ? (
            <Alert severity="warning">
              No approved WhatsApp templates are available for this WhatsApp
              account. Create and approve a template in Meta Business Manager
              before initiating a business conversation outside the
              customer-service window.
            </Alert>
          ) : (
            <>
              <TextField
                select
                SelectProps={{ native: true }}
                size="small"
                fullWidth
                label="Approved template"
                value={templateId}
                onChange={(event) =>
                  setTemplateId(
                    event.target.value ? Number(event.target.value) : '',
                  )
                }
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.language})
                  </option>
                ))}
              </TextField>
              {variableKeys.map((key) => (
                <TextField
                  key={key}
                  size="small"
                  label={`Variable {{${key}}}`}
                  value={templateVariables[key] || ''}
                  onChange={(event) =>
                    setTemplateVariables((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  fullWidth
                />
              ))}
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRequiresTemplate(false)
                    setTemplateId('')
                    setError('')
                  }}
                  disabled={sendMutation.isPending}
                >
                  Try text again
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !templateId}
                  startIcon={
                    sendMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : undefined
                  }
                >
                  Send template
                </Button>
              </Box>
            </>
          )}
        </Box>
      ) : (
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a WhatsApp message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sendMutation.isPending || !draft.trim()}
            startIcon={
              sendMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {sendMutation.isPending ? 'Sending' : 'Send'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

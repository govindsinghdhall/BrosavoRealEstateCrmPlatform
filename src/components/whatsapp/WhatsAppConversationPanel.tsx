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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/api/client'
import { whatsappService } from '@/api/services/whatsapp.service'
import type { WhatsAppThreadMessage } from '@/types'

function statusColor(status: string) {
  if (status === 'read') return 'success'
  if (status === 'delivered') return 'info'
  if (status === 'sent' || status === 'sending') return 'default'
  if (status === 'failed') return 'error'
  return 'default'
}

interface WhatsAppConversationPanelProps {
  conversationId: number | null
  leadId?: number
  contactId?: number
}

export function WhatsAppConversationPanel({
  conversationId,
  leadId,
  contactId,
}: WhatsAppConversationPanelProps) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  const messagesQuery = useQuery({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: () => whatsappService.getConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 8000,
  })

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
    mutationFn: (text: string) =>
      whatsappService.sendText({
        text,
        conversationId: conversationId || undefined,
        leadId,
        contactId,
      }),
    onSuccess: async () => {
      setDraft('')
      setError('')
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-messages', conversationId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-conversations'],
      })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const handleSend = () => {
    const text = draft.trim()
    if (!text) return
    sendMutation.mutate(text)
  }

  if (!conversationId && !leadId && !contactId) {
    return (
      <Typography color="text.secondary">
        Select a conversation to start messaging.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 360 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
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
                    <Typography variant="body2">{message.text || `[${message.messageType}]`}</Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.timestamp || message.createdAt).toLocaleString()}
                      </Typography>
                      {outgoing && (
                        <Chip
                          size="small"
                          label={message.status}
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
          Send
        </Button>
      </Box>
    </Box>
  )
}

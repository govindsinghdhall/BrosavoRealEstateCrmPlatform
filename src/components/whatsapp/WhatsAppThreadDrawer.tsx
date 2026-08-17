import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { SideDrawer } from '@/components/common/SideDrawer'
import { getErrorMessage } from '@/api/client'
import { whatsappService } from '@/api/services/whatsapp.service'
import { WhatsAppConversationPanel } from './WhatsAppConversationPanel'

interface WhatsAppThreadDrawerProps {
  open: boolean
  onClose: () => void
  leadId?: number
  contactId?: number
  title?: string
  phone?: string
}

export function WhatsAppThreadDrawer({
  open,
  onClose,
  leadId,
  contactId,
  title,
  phone,
}: WhatsAppThreadDrawerProps) {
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const settingsQuery = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: () => whatsappService.getSettings(),
    enabled: open,
  })

  useEffect(() => {
    if (!open) {
      setConversationId(null)
      setError('')
      return
    }

    if (!leadId && !contactId) {
      return
    }

    let cancelled = false

    whatsappService
      .createConversation({ leadId, contactId })
      .then((conversation) => {
        if (!cancelled) {
          setConversationId(conversation.id)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err))
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, leadId, contactId])

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={title || 'WhatsApp'}
      subtitle={phone ? `Conversation with ${phone}` : 'WhatsApp conversation'}
      width={560}
    >
      {!settingsQuery.data?.isConnected ? (
        <Alert severity="warning">
          Connect WhatsApp in Settings before sending messages.
        </Alert>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !conversationId ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={18} />
          <Typography>Opening conversation...</Typography>
        </Box>
      ) : (
        <WhatsAppConversationPanel
          conversationId={conversationId}
          leadId={leadId}
          contactId={contactId}
        />
      )}
    </SideDrawer>
  )
}

import { useMemo, useState } from 'react'
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { whatsappService } from '@/api/services/whatsapp.service'
import { WhatsAppConversationPanel } from './WhatsAppConversationPanel'

export function WhatsAppInbox() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const conversationsQuery = useQuery({
    queryKey: ['whatsapp-conversations', search],
    queryFn: () =>
      whatsappService.getConversations({
        search: search || undefined,
        limit: 50,
      }),
    refetchInterval: 10000,
  })

  const conversations = conversationsQuery.data?.data ?? []

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
        gap: 2,
        minHeight: 480,
      }}
    >
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Box>
        <List dense sx={{ maxHeight: 520, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <Typography color="text.secondary" sx={{ px: 2, py: 3 }}>
              No WhatsApp conversations yet.
            </Typography>
          )}
          {conversations.map((conversation) => (
            <ListItemButton
              key={conversation.id}
              selected={conversation.id === selectedId}
              onClick={() => setSelectedId(conversation.id)}
            >
              <ListItemText
                primary={
                  conversation.contactName || conversation.phoneNumber
                }
                secondary={`${conversation.lastMessage || ''} · ${
                  conversation.unreadCount
                    ? `${conversation.unreadCount} unread`
                    : new Date(conversation.lastMessageAt).toLocaleString()
                }`}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        {selected ? (
          <WhatsAppConversationPanel
            conversationId={selected.id}
            leadId={selected.leadId || undefined}
            contactId={selected.contactId || undefined}
          />
        ) : (
          <Typography color="text.secondary">
            Select a conversation from the inbox.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

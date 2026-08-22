import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { SideDrawer } from '@/components/common/SideDrawer'
import { getErrorMessage } from '@/api/client'
import { whatsappService } from '@/api/services'
import type { Contact } from '@/types'

interface WhatsAppSendDrawerProps {
  open: boolean
  onClose: () => void
  contacts: Contact[]
  onSuccess: (message: string) => void
}

export function WhatsAppSendDrawer({ open, onClose, contacts, onSuccess }: WhatsAppSendDrawerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('')
  const [customMessage, setCustomMessage] = useState('')
  const [error, setError] = useState('')

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['whatsapp-approved-templates'],
    queryFn: () => whatsappService.getApprovedTemplates(),
    enabled: open,
  })

  const sendMutation = useMutation({
    mutationFn: whatsappService.sendMessage,
    onSuccess: (result) => {
      onSuccess(`WhatsApp message sent to ${result.sentCount} contact${result.sentCount === 1 ? '' : 's'}`)
      setCustomMessage('')
      setSelectedTemplateId('')
      setError('')
      onClose()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  useEffect(() => {
    if (!open) {
      setError('')
      return
    }
    if (templates && templates.length > 0) {
      setSelectedTemplateId((prev) => (prev === '' ? templates[0].id : prev))
    }
  }, [open, templates])

  const contactCount = contacts.length
  const hasMessage = selectedTemplateId !== '' || customMessage.trim().length > 0

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    setSelectedTemplateId(event.target.value ? Number(event.target.value) : '')
  }

  const handleSend = () => {
    if (!hasMessage) {
      setError('Select a template or enter a custom message.')
      return
    }

    setError('')
    sendMutation.mutate({
      contactIds: contacts.map((contact) => contact.id),
      templateId: selectedTemplateId === '' ? undefined : Number(selectedTemplateId),
      customMessage: customMessage.trim() || undefined,
    })
  }

  const selectedTemplate = templates?.find((template) => template.id === selectedTemplateId)

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Send WhatsApp"
      subtitle="Send a marketing message to your contacts using saved templates"
      width={520}
      footer={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose} disabled={sendMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sendMutation.isPending || contactCount === 0 || !hasMessage}
            startIcon={sendMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {sendMutation.isPending ? 'Sending...' : 'Send WhatsApp'}
          </Button>
        </Box>
      }
    >
      <Stack spacing={2}>
        <Alert severity="info">
          Messages are sent through your connected WhatsApp Business API account. Use different templates to avoid repeated content and stay compliant.
        </Alert>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Sending to
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {contactCount} contact{contactCount === 1 ? '' : 's'}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <FormControl fullWidth size="small">
          <InputLabel id="whatsapp-template-label">Template</InputLabel>
          <Select
            labelId="whatsapp-template-label"
            value={selectedTemplateId === '' ? '' : String(selectedTemplateId)}
            label="Template"
            onChange={handleTemplateChange}
            disabled={templatesLoading || sendMutation.isPending}
          >
            {templatesLoading && <MenuItem value="">Loading templates…</MenuItem>}
            {!templatesLoading && templates?.length === 0 && (
              <MenuItem value="">No saved templates</MenuItem>
            )}
            {templates?.map((template) => (
              <MenuItem key={template.id} value={String(template.id)}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedTemplate && (
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle2">Template preview</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
              {selectedTemplate.components?.find((component) => component.type === 'BODY')?.text ||
                selectedTemplate.name}
            </Typography>
          </Box>
        )}

        <TextField
          label="Customize message"
          multiline
          minRows={4}
          value={customMessage}
          onChange={(event) => setCustomMessage(event.target.value)}
          helperText="Optional: override the selected template or send a one-time message."
          disabled={sendMutation.isPending}
          fullWidth
        />
      </Stack>
    </SideDrawer>
  )
}

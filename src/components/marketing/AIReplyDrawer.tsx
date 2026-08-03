import { useEffect, useState } from 'react'
import { Box, Button, Rating, TextField, Typography, alpha, useTheme } from '@mui/material'
import { Copy, RefreshCw } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { SideDrawer } from '@/components/common/SideDrawer'
import type { GoogleReview } from '@/types/marketing'
import { marketingService } from '@/api/services'
import { getErrorMessage } from '@/api/client'

interface AIReplyDrawerProps {
  open: boolean
  review: GoogleReview | null
  onClose: () => void
  onSaved?: () => void
  onPosted?: () => void
  onError?: (message: string) => void
}

export function AIReplyDrawer({ open, review, onClose, onSaved, onPosted, onError }: AIReplyDrawerProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [reply, setReply] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (review) {
      setReply(review.aiReply || '')
      setCopied(false)
    }
  }, [review])

  const generateMutation = useMutation({
    mutationFn: () => marketingService.generateAiReply(review!.id),
    onSuccess: (result) => setReply(result.review.aiReply),
    onError: (err) => onError?.(getErrorMessage(err)),
  })

  const saveMutation = useMutation({
    mutationFn: () => marketingService.updateReviewReply(review!.id, reply),
    onSuccess: () => onSaved?.(),
    onError: (err) => onError?.(getErrorMessage(err)),
  })

  const postMutation = useMutation({
    mutationFn: async () => {
      await marketingService.updateReviewReply(review!.id, reply)
      return marketingService.postReviewReply(review!.id)
    },
    onSuccess: () => {
      onPosted?.()
      onClose()
    },
    onError: (err) => onError?.(getErrorMessage(err)),
  })

  const copy = async () => {
    await navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const busy = generateMutation.isPending || saveMutation.isPending || postMutation.isPending

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title="Reply to review"
      subtitle={
        review
          ? `Write a clear, polite reply for ${review.customerName}. You can generate a draft, edit it, then post.`
          : undefined
      }
      width={500}
      footer={
        <Box display="flex" gap={1.5} justifyContent="flex-end" flexWrap="wrap">
          <Button variant="outlined" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => saveMutation.mutate()}
            disabled={!reply.trim() || busy}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save draft'}
          </Button>
          <Button
            variant="contained"
            onClick={() => postMutation.mutate()}
            disabled={!reply.trim() || busy}
          >
            {postMutation.isPending ? 'Posting…' : 'Post reply'}
          </Button>
        </Box>
      }
    >
      {review && (
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? alpha('#fff', 0.03) : '#F8FAFC',
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Customer review
              </Typography>
              <Rating value={review.rating} readOnly size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {review.review || 'No written comment — rating only.'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Your reply
            </Typography>
            <TextField
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              multiline
              minRows={6}
              fullWidth
              placeholder="Thank the customer and address their feedback…"
              helperText="Tip: keep it short, thank them, and invite them to reach out if they need help."
            />
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              onClick={() => generateMutation.mutate()}
              disabled={busy}
            >
              {generateMutation.isPending ? 'Generating…' : reply ? 'Generate again' : 'Generate draft'}
            </Button>
            <Button variant="outlined" startIcon={<Copy size={14} />} onClick={copy} disabled={!reply}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </Box>
        </Box>
      )}
    </SideDrawer>
  )
}

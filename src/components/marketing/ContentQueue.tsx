import { useRef } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { format } from 'date-fns'
import { ImagePlus, Send, Trash2, Upload } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import type { ContentItem, ContentStatus } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { marketingService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { EmptyState } from '@/components/common/EmptyState'
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined'

const statusColor: Record<ContentStatus, 'default' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  scheduled: 'info',
  published: 'success',
  failed: 'error',
}

interface ContentQueueProps {
  items: ContentItem[]
  onChanged?: () => void
  onNotify?: (message: string, severity?: 'success' | 'error' | 'info') => void
}

export function ContentQueue({ items, onChanged, onNotify }: ContentQueueProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => marketingService.uploadContent(file),
    onSuccess: () => {
      onNotify?.('Image uploaded to your content queue.')
      onChanged?.()
    },
    onError: (err) => onNotify?.(getErrorMessage(err), 'error'),
  })

  const publishMutation = useMutation({
    mutationFn: (id: string | number) => marketingService.publishContent(id),
    onSuccess: () => {
      onNotify?.('Content published.')
      onChanged?.()
    },
    onError: (err) => onNotify?.(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => marketingService.deleteContent(id),
    onSuccess: () => {
      onNotify?.('Content deleted.', 'info')
      onChanged?.()
    },
    onError: (err) => onNotify?.(getErrorMessage(err), 'error'),
  })

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) uploadMutation.mutate(file)
  }

  return (
    <MarketingSection
      title="Content queue"
      action={
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<Upload size={14} />}
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </Box>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadMutation.mutate(file)
          e.target.value = ''
        }}
      />

      <Box
        mb={2}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        sx={{
          border: '1px dashed',
          borderColor: isDark ? alpha('#fff', 0.16) : '#CBD5E1',
          borderRadius: '12px',
          bgcolor: isDark ? alpha('#fff', 0.02) : '#F8FAFC',
          py: 4,
          px: 2,
          textAlign: 'center',
          cursor: 'pointer',
        }}
        onClick={() => inputRef.current?.click()}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            mx: 'auto',
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDark ? alpha('#fff', 0.06) : '#EEF2FF',
            color: 'primary.main',
          }}
        >
          <ImagePlus size={22} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>
          Drop an image here, or click to upload
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          JPG, PNG, or WEBP · max 10 MB
        </Typography>
      </Box>

      <MarketingCard hover={false} padding={0}>
        {items.length === 0 ? (
          <EmptyState
            icon={PhotoLibraryOutlinedIcon}
            title="Your content queue is empty"
            description="Upload photos for festival offers, listings, or Google posts. You can publish them when you are ready."
          />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Preview</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={String(item.id)} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.thumbnailUrl || undefined}
                        alt=""
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          objectFit: 'cover',
                          bgcolor: isDark ? alpha('#fff', 0.06) : '#F1F5F9',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={650}>
                        {item.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                        {item.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status}
                        color={statusColor[item.status]}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.scheduledDate
                          ? format(new Date(item.scheduledDate), 'dd MMM yyyy, HH:mm')
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        aria-label="Publish now"
                        onClick={() => publishMutation.mutate(item.id)}
                        disabled={item.status === 'published' || publishMutation.isPending}
                      >
                        <Send size={15} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Delete content"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </MarketingCard>
    </MarketingSection>
  )
}

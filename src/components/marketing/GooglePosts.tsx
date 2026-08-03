import {
  Box,
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
import { FileText, ImageIcon, MoreHorizontal } from 'lucide-react'
import type { ContentStatus, GooglePost, GooglePostsSummary } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { EmptyState } from '@/components/common/EmptyState'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'

const statusColor: Record<ContentStatus, 'default' | 'info' | 'success' | 'error'> = {
  draft: 'default',
  scheduled: 'info',
  published: 'success',
  failed: 'error',
}

interface GooglePostsProps {
  summary: GooglePostsSummary
  posts: GooglePost[]
}

export function GooglePosts({ summary, posts }: GooglePostsProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const cards = [
    { label: 'Scheduled Posts', value: summary.scheduled },
    { label: 'Published', value: summary.published },
    { label: 'Drafts', value: summary.drafts },
  ]

  return (
    <MarketingSection title="Google posts">
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(3, 1fr)' }} gap={2} mb={2}>
        {cards.map((card) => (
          <MarketingCard key={card.label}>
            <Typography variant="caption" color="text.secondary" fontWeight={650}>
              {card.label}
            </Typography>
            <Typography variant="h5" fontWeight={800} mt={0.75}>
              {card.value}
            </Typography>
          </MarketingCard>
        ))}
      </Box>

      <MarketingCard hover={false} padding={0}>
        {posts.length === 0 ? (
          <EmptyState
            icon={ArticleOutlinedIcon}
            title="No Google posts yet"
            description="Upload images in the content queue above, then publish them. Counts for scheduled, published, and drafts update automatically."
          />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Publish Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={String(post.id)} hover>
                    <TableCell>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: isDark ? alpha('#fff', 0.06) : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'text.secondary',
                        }}
                      >
                        {post.status === 'draft' ? <FileText size={16} /> : <ImageIcon size={16} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={650}>
                        {post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {post.publishDate
                          ? format(new Date(post.publishDate), 'dd MMM yyyy')
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={post.status}
                        color={statusColor[post.status]}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {post.views.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Post actions">
                        <MoreHorizontal size={16} />
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

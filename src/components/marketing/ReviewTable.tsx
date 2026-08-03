import {
  Avatar,
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import { MoreHorizontal, Star } from 'lucide-react'
import { useState } from 'react'
import type { GoogleReview, ReviewReplyStatus } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { EmptyState } from '@/components/common/EmptyState'
import ReviewsOutlinedIcon from '@mui/icons-material/ReviewsOutlined'

const statusColor: Record<ReviewReplyStatus, 'warning' | 'info' | 'success' | 'default'> = {
  pending: 'warning',
  approved: 'info',
  posted: 'success',
  ignored: 'default',
}

interface ReviewTableProps {
  reviews: GoogleReview[]
  generatingId?: string | null
  onGenerateReply: (review: GoogleReview) => void
  onEditReply: (review: GoogleReview) => void
  onView: (review: GoogleReview) => void
}

export function ReviewTable({
  reviews,
  generatingId,
  onGenerateReply,
  onEditReply,
  onView,
}: ReviewTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [active, setActive] = useState<GoogleReview | null>(null)

  const openMenu = (event: React.MouseEvent<HTMLElement>, review: GoogleReview) => {
    setAnchorEl(event.currentTarget)
    setActive(review)
  }

  const closeMenu = () => {
    setAnchorEl(null)
    setActive(null)
  }

  return (
    <MarketingSection title="Reviews">
      <MarketingCard hover={false} padding={0}>
        {reviews.length === 0 ? (
          <EmptyState
            icon={ReviewsOutlinedIcon}
            title="No reviews synced yet"
            description="Click “Sync Google reviews” above after connecting Google Business. New reviews will appear here automatically every 30 minutes."
          />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>Review</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Reply</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={String(review.id)} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Avatar src={review.avatarUrl || undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>
                          {review.customerName.slice(0, 1)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={650} noWrap>
                          {review.customerName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Star size={14} fill="#F9A825" color="#F9A825" />
                        <Typography variant="body2" fontWeight={700}>
                          {review.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 280,
                        }}
                      >
                        {review.review || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 260,
                        }}
                      >
                        {review.aiReply || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={review.status}
                        color={statusColor[review.status]}
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {format(new Date(review.date), 'dd MMM yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={(e) => openMenu(e, review)}
                        endIcon={<MoreHorizontal size={14} />}
                        disabled={generatingId === String(review.id)}
                      >
                        {generatingId === String(review.id) ? 'Working…' : 'Actions'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              if (active) onGenerateReply(active)
              closeMenu()
            }}
          >
            Generate reply
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (active) onEditReply(active)
              closeMenu()
            }}
          >
            Edit / post reply
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (active) onView(active)
              closeMenu()
            }}
          >
            View
          </MenuItem>
        </Menu>
      </MarketingCard>
    </MarketingSection>
  )
}

import { useState } from 'react'
import { Box, Button, Typography, alpha, useTheme } from '@mui/material'
import { Link2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import type {
  ContentItem,
  GoogleBusinessProfile,
  GooglePost,
  GooglePostsSummary,
  GoogleReview,
  ReviewStats,
} from '@/types/marketing'
import { AIReplyDrawer } from './AIReplyDrawer'
import { ContentQueue } from './ContentQueue'
import { GoogleBusinessCard } from './GoogleBusinessCard'
import { GooglePosts } from './GooglePosts'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { ReviewDashboard } from './ReviewDashboard'
import { ReviewTable } from './ReviewTable'
import { marketingService } from '@/api/services'
import { getErrorMessage } from '@/api/client'

interface GoogleBusinessTabProps {
  profile: GoogleBusinessProfile
  reviewStats: ReviewStats
  reviews: GoogleReview[]
  contentQueue: ContentItem[]
  postsSummary: GooglePostsSummary
  posts: ContentItem[] | GooglePost[]
  connecting?: boolean
  onConnect?: () => void
  onRefresh?: () => void
  onNotify?: (message: string, severity?: 'success' | 'error' | 'info') => void
}

function GoogleEmptyState({
  onConnect,
  connecting,
}: {
  onConnect?: () => void
  connecting?: boolean
}) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <MarketingCard hover={false}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        py={{ xs: 6, md: 10 }}
        px={2}
      >
        <Box
          sx={{
            width: 88,
            height: 88,
            borderRadius: '22px',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDark ? alpha('#fff', 0.05) : '#F8FAFC',
            border: '1px solid',
            borderColor: 'divider',
            fontWeight: 800,
            fontSize: 34,
            color: '#4285F4',
            letterSpacing: '-0.04em',
          }}
        >
          G
        </Box>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" mb={1}>
          Connect Google Business to continue
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={440} mb={1.5} sx={{ lineHeight: 1.6 }}>
          One click connects your Google Business Profile. After that you can sync reviews, draft AI replies, and
          publish posts — without leaving this screen.
        </Typography>
        <Typography variant="caption" color="text.secondary" mb={3} display="block">
          You will sign in with Google and approve access for this CRM only.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Link2 size={16} />}
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? 'Opening Google…' : 'Connect Google Business'}
        </Button>
      </Box>
    </MarketingCard>
  )
}

export function GoogleBusinessTab({
  profile,
  reviewStats,
  reviews,
  contentQueue,
  postsSummary,
  posts,
  connecting,
  onConnect,
  onRefresh,
  onNotify,
}: GoogleBusinessTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<GoogleReview | null>(null)

  const generateMutation = useMutation({
    mutationFn: (id: string | number) => marketingService.generateAiReply(id),
    onSuccess: (result) => {
      setSelectedReview(result.review)
      setDrawerOpen(true)
      onRefresh?.()
      onNotify?.('AI reply draft ready — review it before posting.')
    },
    onError: (err) => onNotify?.(getErrorMessage(err), 'error'),
  })

  const openReply = (review: GoogleReview) => {
    setSelectedReview(review)
    setDrawerOpen(true)
  }

  if (!profile.connected) {
    return (
      <Box>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<Link2 size={16} />}
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? 'Opening Google…' : 'Connect Google Business'}
          </Button>
        </Box>
        <GoogleEmptyState onConnect={onConnect} connecting={connecting} />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" gap={1} mb={2} flexWrap="wrap">
        <Button variant="outlined" startIcon={<Link2 size={16} />} onClick={onConnect} disabled={connecting}>
          Reconnect Google
        </Button>
      </Box>

      <MarketingSection title="Business Profile">
        <GoogleBusinessCard profile={profile} />
      </MarketingSection>

      <ReviewDashboard stats={reviewStats} />

      <ReviewTable
        reviews={reviews}
        generatingId={generateMutation.isPending ? String(generateMutation.variables ?? '') : null}
        onGenerateReply={(review) => generateMutation.mutate(review.id)}
        onEditReply={openReply}
        onView={openReply}
      />

      <ContentQueue items={contentQueue} onChanged={onRefresh} onNotify={onNotify} />
      <GooglePosts
        summary={postsSummary}
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          imageUrl: 'imageUrl' in post ? post.imageUrl || '' : '',
          publishDate: 'scheduledDate' in post ? post.scheduledDate : 'publishDate' in post ? post.publishDate : null,
          status: post.status,
          views: 'views' in post ? Number(post.views || 0) : 0,
        }))}
      />

      <AIReplyDrawer
        open={drawerOpen}
        review={selectedReview}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => {
          onRefresh?.()
          onNotify?.('Reply saved.')
        }}
        onPosted={() => {
          onRefresh?.()
          onNotify?.('Reply posted to Google.')
        }}
        onError={(message) => onNotify?.(message, 'error')}
      />
    </Box>
  )
}

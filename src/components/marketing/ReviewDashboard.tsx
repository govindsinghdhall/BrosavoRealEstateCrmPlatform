import { Box, Typography, alpha, useTheme } from '@mui/material'
import { Bot, MessageSquareReply, Star, Sparkles } from 'lucide-react'
import type { ReviewStats } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'

interface ReviewDashboardProps {
  stats: ReviewStats
}

export function ReviewDashboard({ stats }: ReviewDashboardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const items = [
    { label: 'Pending Replies', value: stats.pendingReplies, icon: Bot, color: '#7B1FA2' },
    { label: 'Replied Today', value: stats.repliedToday, icon: MessageSquareReply, color: '#00897B' },
    { label: 'Average Rating', value: stats.averageRating, icon: Star, color: '#F9A825' },
    { label: 'New Reviews', value: stats.newReviews, icon: Sparkles, color: theme.palette.primary.main },
  ]

  return (
    <MarketingSection title="Review Dashboard">
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }}
        gap={2}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <MarketingCard key={item.label}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={650}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} mt={0.75} letterSpacing="-0.02em">
                    {item.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(item.color, isDark ? 0.2 : 0.1),
                    color: item.color,
                  }}
                >
                  <Icon size={16} />
                </Box>
              </Box>
            </MarketingCard>
          )
        })}
      </Box>
    </MarketingSection>
  )
}

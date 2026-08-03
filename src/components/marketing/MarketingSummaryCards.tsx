import { Box, Button, CircularProgress, Typography, alpha, useTheme } from '@mui/material'
import { Link2, Star, Bot, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import type { MarketingSummary } from '@/types/marketing'
import { MarketingCard } from './MarketingCard'

interface MarketingSummaryCardsProps {
  summary: MarketingSummary
  onManagePlatforms?: () => void
  onReviewReplies?: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

function ScoreRing({ value }: { value: number }) {
  const theme = useTheme()
  return (
    <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
      <CircularProgress
        variant="determinate"
        value={100}
        size={64}
        thickness={4}
        sx={{ color: alpha(theme.palette.primary.main, 0.12), position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={64}
        thickness={4}
        sx={{ color: 'primary.main', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Typography variant="subtitle2" fontWeight={800} sx={{ position: 'absolute' }}>
        {value}%
      </Typography>
    </Box>
  )
}

function IconBadge({
  children,
  color,
}: {
  children: React.ReactNode
  color: string
}) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(color, isDark ? 0.2 : 0.1),
        color,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  )
}

export function MarketingSummaryCards({
  summary,
  onManagePlatforms,
  onReviewReplies,
}: MarketingSummaryCardsProps) {
  const theme = useTheme()

  const cards = [
    {
      key: 'platforms',
      title: 'Connected Platforms',
      icon: <Link2 size={18} />,
      color: theme.palette.primary.main,
      body: (
        <>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            {summary.connectedPlatforms} / {summary.totalPlatforms}
          </Typography>
          <Button size="small" variant="outlined" sx={{ mt: 1.5 }} onClick={onManagePlatforms}>
            Manage
          </Button>
        </>
      ),
    },
    {
      key: 'reviews',
      title: 'Google Reviews',
      icon: <Star size={18} />,
      color: '#ED6C02',
      body: (
        <>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            {summary.googleReviews}
          </Typography>
          <Typography variant="caption" color="success.main" fontWeight={600} mt={1} display="block">
            {summary.googleReviewsTrend}
          </Typography>
        </>
      ),
    },
    {
      key: 'ai',
      title: 'Pending AI Replies',
      icon: <Bot size={18} />,
      color: '#7B1FA2',
      body: (
        <>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            {summary.pendingAiReplies}
          </Typography>
          <Button size="small" variant="outlined" sx={{ mt: 1.5 }} onClick={onReviewReplies}>
            Review
          </Button>
        </>
      ),
    },
    {
      key: 'campaigns',
      title: 'Scheduled Campaigns',
      icon: <CalendarDays size={18} />,
      color: '#00897B',
      body: (
        <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
          {summary.scheduledCampaigns}
        </Typography>
      ),
    },
    {
      key: 'rating',
      title: 'Average Rating',
      icon: <Star size={18} />,
      color: '#F9A825',
      body: (
        <>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            {summary.averageRating}
          </Typography>
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Out of 5
          </Typography>
        </>
      ),
    },
    {
      key: 'score',
      title: 'Marketing Score',
      icon: null,
      color: theme.palette.primary.main,
      body: (
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
          <Typography variant="body2" color="text.secondary" maxWidth={100}>
            Overall channel health
          </Typography>
          <ScoreRing value={summary.marketingScore} />
        </Box>
      ),
    },
  ]

  return (
    <Box
      component={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          xl: 'repeat(6, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((card) => (
        <Box key={card.key} component={motion.div} variants={item}>
          <MarketingCard>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 650,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontSize: '0.68rem',
                }}
              >
                {card.title}
              </Typography>
              {card.icon && <IconBadge color={card.color}>{card.icon}</IconBadge>}
            </Box>
            {card.body}
          </MarketingCard>
        </Box>
      ))}
    </Box>
  )
}

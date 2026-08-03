import { Box, Skeleton, Typography, useTheme } from '@mui/material'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MarketingAnalytics, MarketingSummary } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { EmptyState } from '@/components/common/EmptyState'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'

interface AnalyticsDashboardProps {
  summary: MarketingSummary
  analytics?: MarketingAnalytics
  loading?: boolean
}

const PIE_COLORS = ['#1565C0', '#00897B', '#ED6C02', '#7B1FA2', '#0288D1']

function ChartCard({ title, children, empty }: { title: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <MarketingCard hover={false}>
      <Typography variant="subtitle2" fontWeight={750} mb={2}>
        {title}
      </Typography>
      <Box height={240}>
        {empty ? (
          <Box height="100%" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              Not enough data yet
            </Typography>
          </Box>
        ) : (
          children
        )}
      </Box>
    </MarketingCard>
  )
}

export function AnalyticsDashboard({ summary, analytics, loading }: AnalyticsDashboardProps) {
  const theme = useTheme()
  const axisColor = theme.palette.text.secondary
  const gridColor = theme.palette.divider

  const metrics = [
    { label: 'Connected platforms', value: `${summary.connectedPlatforms}/${summary.totalPlatforms}`, change: '' },
    { label: 'Reviews', value: summary.googleReviews, change: summary.googleReviewsTrend },
    { label: 'Pending replies', value: summary.pendingAiReplies, change: '' },
    { label: 'Average rating', value: summary.averageRating || '—', change: summary.averageRating ? 'Out of 5' : '' },
    { label: 'Scheduled campaigns', value: summary.scheduledCampaigns, change: '' },
    { label: 'Marketing score', value: `${summary.marketingScore}%`, change: '' },
  ]

  if (loading) {
    return (
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: '12px' }} />
        ))}
      </Box>
    )
  }

  const hasReviewData = (analytics?.reviewsTrend?.length ?? 0) > 0

  if (!hasReviewData && summary.googleReviews === 0) {
    return (
      <MarketingCard hover={false}>
        <EmptyState
          icon={InsightsOutlinedIcon}
          title="Analytics will appear after you sync reviews"
          description="Connect Google Business and sync reviews once. Charts for trends, ratings, and keywords fill in from your real data — nothing is invented."
        />
      </MarketingCard>
    )
  }

  return (
    <Box>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }}
        gap={2}
        mb={3}
      >
        {metrics.map((metric) => (
          <MarketingCard key={metric.label}>
            <Typography variant="caption" color="text.secondary" fontWeight={650}>
              {metric.label}
            </Typography>
            <Typography variant="h5" fontWeight={800} mt={0.75} letterSpacing="-0.02em">
              {metric.value}
            </Typography>
            {metric.change && (
              <Typography variant="caption" color="text.secondary" fontWeight={650} mt={0.5} display="block">
                {metric.change}
              </Typography>
            )}
          </MarketingCard>
        ))}
      </Box>

      <MarketingSection title="Performance">
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={2}>
          <ChartCard title="Reviews over time" empty={!analytics?.reviewsTrend?.length}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.reviewsTrend || []}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#1565C0" fill="#1565C033" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rating trend" empty={!analytics?.ratingTrend?.length}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.ratingTrend || []}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis domain={[0, 5]} stroke={axisColor} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#F9A825" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Customer sentiment" empty={!analytics?.sentiment?.some((s) => s.value > 0)}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics?.sentiment || []} dataKey="value" nameKey="name" outerRadius={85} label>
                  {(analytics?.sentiment || []).map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Words customers use" empty={!analytics?.popularReviewKeywords?.length}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.popularReviewKeywords || []}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={axisColor} fontSize={11} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#7B1FA2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Box>
      </MarketingSection>
    </Box>
  )
}

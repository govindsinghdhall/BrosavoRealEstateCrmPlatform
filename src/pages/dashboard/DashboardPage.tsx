import { Box, List, ListItem, ListItemText, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageHeader } from '@/components/common/PageHeader'
import { PageSummaryGrid, PageSummaryItem } from '@/components/common/PageSummaryGrid'
import { SectionCard } from '@/components/common/SectionCard'
import { StatCard } from '@/components/common/StatCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FloatingActionButton } from '@/components/common/FloatingActionButton'
import { dashboardService } from '@/api/services'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 15_000,
    staleTime: 0,
  })

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: dashboardService.getRecentActivity,
    refetchInterval: 15_000,
    staleTime: 0,
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: dashboardService.getChartData,
  })

  if (statsLoading) return <LoadingSpinner />

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your real estate operations"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Dashboard' }]}
      />

      <PageSummaryGrid>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Total Leads" value={stats?.totalLeads ?? 0} icon={PeopleOutlineIcon} color="#1565C0" subtitle={`${stats?.activeLeads ?? 0} active`} />
        </PageSummaryItem>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Properties" value={stats?.totalProperties ?? 0} icon={HomeWorkOutlinedIcon} color="#00897B" subtitle={`${stats?.availableProperties ?? 0} available`} />
        </PageSummaryItem>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Site Visits" value={stats?.upcomingSiteVisits ?? 0} icon={EventAvailableOutlinedIcon} color="#ED6C02" subtitle="Upcoming" />
        </PageSummaryItem>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Pending Bookings" value={stats?.pendingBookings ?? 0} icon={BookOnlineOutlinedIcon} color="#7B1FA2" />
        </PageSummaryItem>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue ?? 0)} icon={AttachMoneyIcon} color="#2E7D32" />
        </PageSummaryItem>
        <PageSummaryItem size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <StatCard title="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} icon={TrendingUpIcon} color="#0288D1" />
        </PageSummaryItem>
      </PageSummaryGrid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Monthly Bookings" subtitle="Booking volume by status">
            {chartLoading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1565C0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Recent Activity" subtitle="Latest lead updates">
            {activityLoading ? (
              <LoadingSpinner />
            ) : (
              <List disablePadding>
                {activity?.map((item) => (
                  <ListItem key={item.id} disablePadding sx={{ py: 1.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDateTime(item.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <FloatingActionButton href="/properties" ariaLabel="Add Property" />
    </Box>
  )
}

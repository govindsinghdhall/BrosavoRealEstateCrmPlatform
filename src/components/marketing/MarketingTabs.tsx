import { Box, Tab, Tabs, alpha, useTheme } from '@mui/material'
import { MessageCircle, MapPin, Sparkles, BarChart3, Settings } from 'lucide-react'
import type { MarketingTabId } from '@/types/marketing'

interface MarketingTabsProps {
  value: MarketingTabId
  onChange: (tab: MarketingTabId) => void
}

const TABS: { id: MarketingTabId; label: string; icon: typeof MessageCircle }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'google', label: 'Google Business', icon: MapPin },
  { id: 'ai', label: 'AI Content', icon: Sparkles },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function MarketingTabs({ value, onChange }: MarketingTabsProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 3,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#0F172A', 0.02),
        borderRadius: '12px 12px 0 0',
        px: { xs: 0.5, sm: 1 },
      }}
    >
      <Tabs
        value={value}
        onChange={(_, next: MarketingTabId) => onChange(next)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'text.secondary',
            gap: 1,
          },
          '& .Mui-selected': { color: 'primary.main' },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={<Icon size={16} />}
              iconPosition="start"
            />
          )
        })}
      </Tabs>
    </Box>
  )
}

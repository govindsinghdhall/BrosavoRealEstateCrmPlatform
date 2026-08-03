import { Box, Paper, alpha, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface MarketingCardProps {
  children: ReactNode
  sx?: object
  hover?: boolean
  padding?: number | object
}

export function MarketingCard({ children, sx, hover = true, padding = 2.5 }: MarketingCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={
        hover
          ? {
              y: -2,
              boxShadow: isDark
                ? '0 10px 28px rgba(0,0,0,0.35)'
                : '0 10px 28px rgba(15, 23, 42, 0.08)',
            }
          : undefined
      }
      sx={{
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#E2E8F0',
        bgcolor: 'background.paper',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.25)' : '0 1px 3px rgba(15, 23, 42, 0.06)',
        p: padding,
        height: '100%',
        ...sx,
      }}
    >
      {children}
    </Paper>
  )
}

export function MarketingSection({
  title,
  action,
  children,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Box mb={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
        <Box
          component="h3"
          sx={{
            m: 0,
            fontSize: '0.95rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'text.primary',
          }}
        >
          {title}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}

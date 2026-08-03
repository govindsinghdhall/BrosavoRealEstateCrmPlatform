import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'

interface MarketingHeaderProps {
  title?: string
  subtitle?: string
}

export function MarketingHeader({
  title = 'Marketing',
  subtitle = 'Manage WhatsApp marketing, Google Business, AI-generated replies, campaigns and marketing analytics from one place.',
}: MarketingHeaderProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      mb={3}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 0.75, fontSize: { xs: '1.6rem', md: '1.85rem' } }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={720} sx={{ lineHeight: 1.6 }}>
        {subtitle}
      </Typography>
    </Box>
  )
}

import { Avatar, Box, Button, Chip, Typography, alpha, useTheme } from '@mui/material'
import { Building2, ExternalLink, MapPin, ShieldCheck, Star } from 'lucide-react'
import type { GoogleBusinessProfile } from '@/types/marketing'
import { MarketingCard } from './MarketingCard'

interface GoogleBusinessCardProps {
  profile: GoogleBusinessProfile
}

export function GoogleBusinessCard({ profile }: GoogleBusinessCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <MarketingCard>
      <Box display="flex" gap={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }}>
        <Avatar
          src={profile.logoUrl || undefined}
          variant="rounded"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '14px',
            bgcolor: isDark ? alpha('#fff', 0.06) : '#F1F5F9',
            color: 'text.secondary',
          }}
        >
          <Building2 size={28} />
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
            <Typography variant="h6" fontWeight={750} letterSpacing="-0.02em">
              {profile.name}
            </Typography>
            {profile.verified && (
              <Chip
                size="small"
                icon={<ShieldCheck size={14} />}
                label="Verified"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 650 }}
              />
            )}
          </Box>
          <Box display="flex" alignItems="flex-start" gap={0.75} color="text.secondary">
            <MapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} />
            <Typography variant="body2">{profile.address}</Typography>
          </Box>
        </Box>

        <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
          <Box textAlign="center">
            <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
              <Star size={16} fill="#F9A825" color="#F9A825" />
              <Typography variant="h6" fontWeight={800}>
                {profile.averageRating}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Average Rating
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={800}>
              {profile.totalReviews}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Reviews
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            endIcon={<ExternalLink size={14} />}
            href={profile.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google
          </Button>
        </Box>
      </Box>
    </MarketingCard>
  )
}

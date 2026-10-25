import { Fab, useMediaQuery, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'

interface FloatingActionButtonProps {
  onClick?: () => void
  href?: string
  ariaLabel?: string
}

export function FloatingActionButton({ 
  onClick, 
  href,
  ariaLabel = "Add Property"
}: FloatingActionButtonProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  const handleClick = () => {
    if (href) {
      navigate(href)
    } else if (onClick) {
      onClick()
    }
  }

  // Only show floating action button on mobile devices
  if (!isMobile) return null

  return (
    <Fab
      color="primary"
      aria-label={ariaLabel}
      onClick={handleClick}
      sx={{
        position: 'fixed',
        bottom: { xs: 24, sm: 24 }, // Responsive spacing
        right: { xs: 24, sm: 24 },  // Responsive spacing
        zIndex: theme.zIndex.fab,
        width: '56px',              // Standard FAB size
        height: '56px',             // Standard FAB size
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Better visibility
      }}
    >
      <AddIcon />
    </Fab>
  )
}
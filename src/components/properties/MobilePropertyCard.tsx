import { Box, Button, Typography } from '@mui/material'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { formatCurrency } from '@/utils/formatters'
import type { Property } from '@/types'
// import { getImageUrl } from '@/utils/formatters'
// import { PropertyStatusCell } from './PropertyStatusCell'

interface MobilePropertyCardProps {
  property: Property
  onEdit: (property: Property) => void
  onDelete: (id: string) => void
  showImage?: boolean
}

export function MobilePropertyCard({ property, onEdit, onDelete, showImage = true }: MobilePropertyCardProps) {
  // If images are disabled, we render only the content without any image section
  if (!showImage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2, bgcolor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }} noWrap>
            {property.title || 'Untitled Property'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
            {formatCurrency(property.price)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <HomeWorkOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
            {property.bedrooms} bed · {property.bathrooms} bath · {property.area} sqft
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {property.locality || property.sector || property.city}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={() => onEdit(property)}
              sx={{ minWidth: 0, flex: 1, height: '40px', px: 1.5, py: 0.5 }}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              onClick={() => onDelete(property.id)}
              sx={{ minWidth: 0, flex: 1, height: '40px', px: 1.5, py: 0.5 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  // When images are enabled, render the full card with image section
  // const imageUrl = property.images?.length > 0 ? getImageUrl(property.images[0].url) : '/placeholder-property.jpg'
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2, bgcolor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      {/* <Box sx={{ position: 'relative', height: 180 }}>
        {imageUrl ? (
          <Box component="img" src={imageUrl} alt={property.title || 'Property image'} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeWorkOutlinedIcon sx={{ color: 'grey.400', fontSize: 48 }} />
          </Box>
        )}
        
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <PropertyStatusCell property={property} />
        </Box>
      </Box> */}

      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }} noWrap>
          {property.title || 'Untitled Property'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
          {formatCurrency(property.price)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <HomeWorkOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
          {property.bedrooms} bed · {property.bathrooms} bath · {property.area} sqft
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {property.locality || property.sector || property.city}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onClick={() => onEdit(property)}
            sx={{ minWidth: 0, flex: 1, height: '40px', px: 1.5, py: 0.5 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={() => onDelete(property.id)}
            sx={{ minWidth: 0, flex: 1, height: '40px', px: 1.5, py: 0.5 }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
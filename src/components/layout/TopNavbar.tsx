import { useState } from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { useNavigate } from 'react-router-dom'
import { OrgBrand } from '@/components/common/OrgBrand'
import { useAuthStore } from '@/store/authStore'
import { useOrganizationStore } from '@/store/organizationStore'
import { useThemeStore } from '@/store/themeStore'
import { useSidebarStore } from '@/store/sidebarStore'
import { authService } from '@/api/services'

export function TopNavbar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const clearOrganization = useOrganizationStore((state) => state.clearOrganization)
  const { mode, toggleMode } = useThemeStore()
  const { toggle: toggleMobileDrawer, toggleCollapsed } = useSidebarStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuClick = () => {
    if (isMobile) {
      toggleMobileDrawer()
    } else {
      toggleCollapsed()
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    clearOrganization()
    logout()
    navigate('/login')
  }

  return (
    <AppBar
      position="sticky"
      color="inherit"
      sx={{
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={handleMenuClick} aria-label="Toggle navigation">
          <MenuIcon />
        </IconButton>

        <OrgBrand />

        <Box flex={1} />

        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
          <IconButton onClick={toggleMode}>
            {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
        </Tooltip>

        {/* <Tooltip title="Notifications">
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>
        </Tooltip> */}

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ cursor: 'pointer' }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: theme.palette.primary.main,
              fontSize: 14,
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              navigate('/profile')
            }}
          >
            <PersonOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

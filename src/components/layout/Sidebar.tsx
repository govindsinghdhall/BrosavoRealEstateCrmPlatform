import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { NavLink, useLocation } from 'react-router-dom'
import { OrgBrand } from '@/components/common/OrgBrand'
import { useSidebarStore } from '@/store/sidebarStore'
import { useAuthStore } from '@/store/authStore'
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from '@/utils/constants'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
  { label: 'Leads', path: '/leads', icon: PeopleOutlineIcon },
  { label: 'Contacts', path: '/contacts', icon: ContactsOutlinedIcon },
  { label: 'Properties', path: '/properties', icon: HomeWorkOutlinedIcon },
  { label: 'Property Owners', path: '/properties/owners', icon: PersonSearchOutlinedIcon },
  { label: 'Site Visits', path: '/site-visits', icon: EventAvailableOutlinedIcon },
  { label: 'Bookings', path: '/bookings', icon: BookOnlineOutlinedIcon },
  { label: 'Marketing', path: '/marketing', icon: CampaignOutlinedIcon },
  { label: 'Users', path: '/users', icon: GroupOutlinedIcon },
  { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon },
]

export function Sidebar() {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { isOpen, isCollapsed, setOpen, toggleCollapsed } = useSidebarStore()
  const userRole = useAuthStore((state) => state.user?.role)

  const width = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH
  const showCompanyNav = userRole === 'admin'

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : 2,
          py: 2,
          minHeight: 64,
        }}
      >
        {!isCollapsed ? (
          <>
            <OrgBrand size="sm" />
            {!isMobile && (
              <IconButton size="small" onClick={toggleCollapsed} aria-label="Collapse sidebar">
                <ChevronLeftIcon />
              </IconButton>
            )}
          </>
        ) : (
          <OrgBrand iconOnly size="sm" />
        )}
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/properties'
              ? location.pathname === '/properties'
              : location.pathname === item.path ||
                (location.pathname.startsWith(`${item.path}/`) &&
                  !NAV_ITEMS.some(
                    (other) =>
                      other.path !== item.path &&
                      other.path.startsWith(`${item.path}/`) &&
                      location.pathname.startsWith(other.path),
                  ))
          const Icon = item.icon

          const button = (
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={isActive}
              onClick={() => isMobile && setOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 1 : 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 0 : 40,
                  justifyContent: 'center',
                  color: isActive ? 'inherit' : 'text.secondary',
                }}
              >
                <Icon />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          )

          return (
            <ListItem key={item.path} disablePadding>
              {isCollapsed ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          )
        })}

        {showCompanyNav && (
          <ListItem disablePadding>
            {(() => {
              const isActive = location.pathname.startsWith('/settings/company')
              const button = (
                <ListItemButton
                  component={NavLink}
                  to="/settings/company"
                  selected={isActive}
                  onClick={() => isMobile && setOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: isCollapsed ? 1 : 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 40,
                      justifyContent: 'center',
                      color: isActive ? 'inherit' : 'text.secondary',
                    }}
                  >
                    <BusinessOutlinedIcon />
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary="Company" />}
                </ListItemButton>
              )

              return isCollapsed ? (
                <Tooltip title="Company" placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )
            })()}
          </ListItem>
        )}
      </List>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width'),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

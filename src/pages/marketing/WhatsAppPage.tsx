import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material'
import {
  ArrowLeft,
  Inbox,
  Megaphone,
  MessageCircle,
  Settings,
  FileText,
} from 'lucide-react'

import { WhatsAppTab } from '@/components/marketing/WhatsAppTab'
import { WhatsAppConfiguration } from '@/components/marketing/WhatsAppConfiguration'

type WhatsAppView =
  | 'home'
  | 'inbox'
  | 'campaigns'
  | 'templates'
  | 'settings'

interface WhatsAppTool {
  id: WhatsAppView
  title: string
  description: string
  icon: typeof Inbox
  available: boolean
}

const WHATSAPP_TOOLS: WhatsAppTool[] = [
  {
    id: 'inbox',
    title: 'Inbox',
    description: 'Manage customer conversations and replies.',
    icon: Inbox,
    available: false,
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    description: 'Create and manage WhatsApp campaigns.',
    icon: Megaphone,
    available: true,
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Manage approved WhatsApp message templates.',
    icon: FileText,
    available: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Connect and configure your WhatsApp Business account.',
    icon: Settings,
    available: true,
  },
]

function WhatsAppToolCard({
  tool,
  onClick,
}: {
  tool: WhatsAppTool
  onClick: () => void
}) {
  const Icon = tool.icon

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        opacity: tool.available ? 1 : 0.6,
        transition:
          'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': tool.available
          ? {
              transform: 'translateY(-3px)',
              boxShadow: 4,
              borderColor: 'primary.main',
            }
          : undefined,
      }}
    >
      <CardActionArea
        disabled={!tool.available}
        onClick={onClick}
        sx={{ height: '100%' }}
      >
        <CardContent
          sx={{
            p: 2.5,
            minHeight: 190,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: 'action.hover',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <Icon size={24} />
          </Box>

          <Typography
            variant="h6"
            fontWeight={750}
            sx={{ mb: 0.75 }}
          >
            {tool.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.55,
              flex: 1,
            }}
          >
            {tool.description}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Chip
              size="small"
              label={
                tool.available
                  ? 'Available'
                  : 'Coming soon'
              }
              color={
                tool.available
                  ? 'success'
                  : 'default'
              }
              variant={
                tool.available
                  ? 'outlined'
                  : 'filled'
              }
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export function WhatsAppPage() {
  const [view, setView] =
    useState<WhatsAppView>('home')

  const renderHeader = (
    title: string,
    description: string,
  ) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: {
          xs: 'flex-start',
          sm: 'center',
        },
        gap: 2,
        mb: 4,
      }}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowLeft size={16} />}
        onClick={() => setView('home')}
      >
        WhatsApp
      </Button>

      <Box>
        <Typography
          variant="h5"
          fontWeight={800}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {description}
        </Typography>
      </Box>
    </Box>
  )

  if (view === 'campaigns') {
    return (
      <Box>
        {renderHeader(
          'Campaigns',
          'Create and manage WhatsApp campaigns.',
        )}

        <WhatsAppTab
          campaigns={[]}
          loadingCampaigns={false}
        />
      </Box>
    )
  }

  if (view === 'settings') {
    return (
      <Box>
        {renderHeader(
          'Settings',
          'Connect and configure your WhatsApp Business account.',
        )}

        <WhatsAppConfiguration />
      </Box>
    )
  }

  if (view === 'templates') {
    return (
      <Box>
        {renderHeader(
          'Templates',
          'Manage approved WhatsApp message templates.',
        )}

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={750}
              sx={{ mb: 1 }}
            >
              WhatsApp Templates
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Template management will be moved into
              this dedicated workspace.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (view === 'inbox') {
    return (
      <Box>
        {renderHeader(
          'Inbox',
          'Manage customer conversations and replies.',
        )}

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              p: 6,
              textAlign: 'center',
            }}
          >
            <Inbox size={32} />

            <Typography
              variant="h6"
              fontWeight={750}
              sx={{ mt: 2, mb: 1 }}
            >
              WhatsApp Inbox
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              The WhatsApp conversation inbox will be
              implemented here.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box>
      {/* HEADER */}

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'action.hover',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageCircle size={28} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              WhatsApp
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
            >
              Manage your WhatsApp Business communication
              from one workspace.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* QUICK NAVIGATION */}

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<Inbox size={16} />}
          disabled
        >
          Inbox
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Megaphone size={16} />}
          onClick={() => setView('campaigns')}
        >
          Campaigns
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<FileText size={16} />}
          onClick={() => setView('templates')}
        >
          Templates
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Settings size={16} />}
          onClick={() => setView('settings')}
        >
          Settings
        </Button>
      </Box>

      {/* TOOLS */}

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          fontWeight={750}
        >
          WhatsApp Tools
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Choose what you want to manage.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {WHATSAPP_TOOLS.map((tool) => (
          <WhatsAppToolCard
            key={tool.id}
            tool={tool}
            onClick={() => setView(tool.id)}
          />
        ))}
      </Box>
    </Box>
  )
}
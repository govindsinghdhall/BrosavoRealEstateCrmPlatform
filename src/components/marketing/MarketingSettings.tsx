import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { Link2, Unplug } from 'lucide-react'
import type { MarketingSettingsState, ThemePreference } from '@/types/marketing'
import { useThemeStore } from '@/store/themeStore'
import { MarketingCard, MarketingSection } from './MarketingCard'

interface MarketingSettingsProps {
  settings: MarketingSettingsState
  saving?: boolean
  disconnecting?: boolean
  onSave: (next: MarketingSettingsState) => void
  onConnectGoogle: () => void
  onDisconnectGoogle: () => void
}

export function MarketingSettings({
  settings,
  saving,
  disconnecting,
  onSave,
  onConnectGoogle,
  onDisconnectGoogle,
}: MarketingSettingsProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const setMode = useThemeStore((state) => state.setMode)
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const update = <K extends keyof MarketingSettingsState>(key: K, value: MarketingSettingsState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const applyTheme = (value: ThemePreference) => {
    update('theme', value)
    if (value === 'light' || value === 'dark') {
      setMode(value)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setMode(prefersDark ? 'dark' : 'light')
    }
  }

  return (
    <Box>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={2.5}>
        <MarketingSection title="Google Business">
          <MarketingCard hover={false}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap" mb={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight={750}>
                  Connection
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Only admins can connect or disconnect Google for your company.
                </Typography>
              </Box>
              <Chip
                label={settings.googleConnected ? 'Connected' : 'Not connected'}
                color={settings.googleConnected ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontWeight: 650 }}
              />
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<Link2 size={14} />} onClick={onConnectGoogle}>
                {settings.googleConnected ? 'Reconnect' : 'Connect'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Unplug size={14} />}
                onClick={onDisconnectGoogle}
                disabled={!settings.googleConnected || disconnecting}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </Box>
          </MarketingCard>
        </MarketingSection>

        <MarketingSection title="Review replies">
          <MarketingCard hover={false}>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.enableAiReplies}
                    onChange={(e) => update('enableAiReplies', e.target.checked)}
                  />
                }
                label="Suggest AI reply drafts"
              />
              <Typography variant="caption" color="text.secondary" sx={{ pl: 6, mb: 1 }}>
                Always review a draft before posting. Nothing is sent automatically.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.reviewApprovalRequired}
                    onChange={(e) => update('reviewApprovalRequired', e.target.checked)}
                  />
                }
                label="Require approval before posting"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.emailNotifications}
                    onChange={(e) => update('emailNotifications', e.target.checked)}
                  />
                }
                label="Email me about new reviews"
              />
              {draft.emailNotifications && (
                <TextField
                  size="small"
                  label="Notification email"
                  value={draft.notificationEmail || ''}
                  onChange={(e) => update('notificationEmail', e.target.value)}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </MarketingCard>
        </MarketingSection>

        <MarketingSection title="Appearance">
          <MarketingCard hover={false}>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Choose light or dark for the whole CRM, or follow your device.
            </Typography>
            <RadioGroup row value={draft.theme} onChange={(e) => applyTheme(e.target.value as ThemePreference)}>
              <FormControlLabel value="system" control={<Radio size="small" />} label="System" />
              <FormControlLabel value="dark" control={<Radio size="small" />} label="Dark" />
              <FormControlLabel value="light" control={<Radio size="small" />} label="Light" />
            </RadioGroup>
            <Box
              mt={2}
              sx={{
                p: 1.5,
                borderRadius: '10px',
                bgcolor: isDark ? alpha('#fff', 0.04) : '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Currently showing: <strong>{theme.palette.mode}</strong> mode
              </Typography>
            </Box>
          </MarketingCard>
        </MarketingSection>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={() => onSave(draft)} disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </Box>
    </Box>
  )
}

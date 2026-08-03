import { useState } from 'react'
import { Box, Button, Chip, TextField, Typography, alpha, useTheme } from '@mui/material'
import { Copy, RefreshCw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AiTone } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'

interface AIContentStudioProps {
  tone: AiTone
  onNotify?: (message: string, severity?: 'success' | 'error' | 'info') => void
}

const EXAMPLES = [
  {
    id: 'e1',
    label: 'Festival post',
    prompt: 'Write a short Diwali property offer post for Google Business. Mention limited inventory.',
  },
  {
    id: 'e2',
    label: 'Property launch',
    prompt: 'Announce a premium 3BHK ready-to-move launch near Cyber Hub for Google and WhatsApp.',
  },
  {
    id: 'e3',
    label: 'Weekend offer',
    prompt: 'Draft a weekend-only message inviting warm leads to an open house on Sunday at 11 AM.',
  },
  {
    id: 'e4',
    label: 'Review reply',
    prompt: 'Write a warm thank-you reply to a 5-star review that mentions helpful agents.',
  },
]

function buildDraft(prompt: string, tone: AiTone) {
  const clean = prompt.trim()
  if (!clean) {
    return 'Describe what you need in the box on the left — for example a festival post, launch announcement, or review reply — then click Generate.'
  }

  const toneLine =
    tone === 'friendly'
      ? 'Friendly, approachable tone.'
      : tone === 'formal'
        ? 'Formal, polished tone.'
        : 'Professional, clear tone.'

  return `${toneLine}

Based on your brief:
“${clean}”

Suggested draft:
We’re excited to help you find the right home. Our team is ready with transparent options, guided site visits, and end-to-end support.

Reply to this message or call us to book a visit this week.

— Your property advisors

Note: This draft uses your Marketing tone setting. Connect OpenAI later for richer generation — nothing is posted until you copy and publish it yourself.`
}

export function AIContentStudio({ tone, onNotify }: AIContentStudioProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const runGenerate = (nextPrompt?: string) => {
    const value = nextPrompt ?? prompt
    if (nextPrompt) setPrompt(nextPrompt)
    setGenerating(true)
    window.setTimeout(() => {
      setOutput(buildDraft(value, tone))
      setGenerating(false)
      onNotify?.('Draft ready — edit before you publish anywhere.')
    }, 400)
  }

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    onNotify?.('Copied to clipboard.')
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <MarketingSection title="Writing assistant">
      <Typography variant="body2" color="text.secondary" mb={2} maxWidth={720}>
        Use this to draft posts and replies in your brand tone ({tone}). Drafts stay on this screen until you copy them
        — nothing is sent automatically.
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }}
        gap={2.5}
        alignItems="stretch"
      >
        <MarketingCard hover={false}>
          <Typography variant="subtitle2" fontWeight={750} mb={1.5}>
            What do you want to write?
          </Typography>
          <TextField
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Weekend open house invite for warm leads in Sector 54…"
            multiline
            minRows={6}
            fullWidth
          />

          <Typography variant="caption" color="text.secondary" fontWeight={650} display="block" mt={2} mb={1}>
            Quick starts
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {EXAMPLES.map((example) => (
              <Chip
                key={example.id}
                label={example.label}
                onClick={() => runGenerate(example.prompt)}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2.5 }}
            startIcon={<Sparkles size={16} />}
            onClick={() => runGenerate()}
            disabled={generating}
          >
            {generating ? 'Generating…' : 'Generate draft'}
          </Button>
        </MarketingCard>

        <MarketingCard hover={false}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} gap={1} flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight={750}>
              Draft
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" startIcon={<Copy size={14} />} onClick={copy} disabled={!output}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshCw size={14} />}
                onClick={() => runGenerate()}
                disabled={generating}
              >
                Regenerate
              </Button>
            </Box>
          </Box>

          <AnimatePresence mode="wait">
            <Box
              key={output || 'empty'}
              component={motion.div}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              sx={{
                minHeight: 280,
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? alpha('#fff', 0.03) : '#F8FAFC',
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem',
                lineHeight: 1.65,
                color: 'text.primary',
              }}
            >
              {output ||
                'Your draft will appear here. Pick a quick start or type a brief, then generate.'}
            </Box>
          </AnimatePresence>
        </MarketingCard>
      </Box>
    </MarketingSection>
  )
}

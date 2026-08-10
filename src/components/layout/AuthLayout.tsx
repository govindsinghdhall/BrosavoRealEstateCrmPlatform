import { Box, Link, Typography } from '@mui/material'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded'
import { POWERED_BY_LABEL, POWERED_BY_URL } from '@/utils/constants'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background:
          'linear-gradient(135deg, #eef4ff 0%, #f8faff 45%, #eef7ff 100%)',
      }}
    >
      {/* Background glow - top right */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0) 70%)',
          top: -220,
          right: -120,
          pointerEvents: 'none',
        }}
      />

      {/* Background glow - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0) 70%)',
          bottom: -250,
          left: -150,
          pointerEvents: 'none',
        }}
      />

      {/* Main viewport */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          px: {
            xs: 1.5,
            sm: 2.5,
            md: 3,
          },
          py: {
            xs: 1.5,
            md: 2.5,
          },
          boxSizing: 'border-box',
        }}
      >
        {/* Auth Card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 1180,

            /*
             * IMPORTANT:
             * The card can never exceed the viewport.
             */
            height: {
              xs: 'calc(100vh - 24px)',
              sm: 'calc(100vh - 40px)',
              md: 'calc(100vh - 48px)',
            },

            maxHeight: {
              xs: 'calc(100vh - 24px)',
              sm: 'calc(100vh - 40px)',
              md: 'calc(100vh - 48px)',
            },

            minHeight: 0,

            display: 'flex',

            flexDirection: {
              xs: 'column',
              md: 'row',
            },

            overflow: 'hidden',

            borderRadius: {
              xs: 3,
              md: 4,
            },

            backgroundColor: '#ffffff',

            boxShadow:
              '0 25px 70px rgba(30, 64, 175, 0.15)',
          }}
        >
          {/* ================================================== */}
          {/* LEFT HERO */}
          {/* ================================================== */}

          <Box
            sx={{
              width: {
                xs: '100%',
                md: '50%',
              },

              /*
               * Desktop: exact same height as right side.
               */
              height: {
                xs: '42%',
                md: '100%',
              },

              minHeight: {
                xs: 240,
                md: 0,
              },

              position: 'relative',
              overflow: 'hidden',

              flexShrink: 0,

              background:
                'linear-gradient(145deg, #2563eb 0%, #4f46e5 55%, #6d28d9 100%)',

              color: '#fff',
            }}
          >
            {/* Grid */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,

                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',

                backgroundSize: '45px 45px',
              }}
            />

            {/* Decorative circle */}
            <Box
              sx={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                border:
                  '1px solid rgba(255,255,255,0.10)',
                right: -170,
                top: -140,
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                width: 550,
                height: 550,
                borderRadius: '50%',
                border:
                  '1px solid rgba(255,255,255,0.07)',
                right: -230,
                top: -200,
              }}
            />

            {/* Building decoration */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '70%',
                height: '40%',
                opacity: 0.10,

                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',

                gap: 1,
              }}
            >
              {[25, 38, 30, 52, 43, 70, 48, 85, 60].map(
                (height, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: {
                        xs: 16,
                        md: 30,
                      },

                      height: `${height}%`,

                      background:
                        'linear-gradient(to top, #fff, rgba(255,255,255,0.25))',

                      borderRadius:
                        '3px 3px 0 0',
                    }}
                  />
                ),
              )}
            </Box>

            {/* Hero content */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,

                height: '100%',

                display: 'flex',
                flexDirection: 'column',

                p: {
                  xs: 2.5,
                  sm: 3,
                  md: 5,
                },

                boxSizing: 'border-box',
              }}
            >
              {/* Brand */}
              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: '1.7rem',
                      md: '2.2rem',
                    },

                    fontWeight: 800,

                    letterSpacing: '-0.04em',
                  }}
                >
                  BROSAVO
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,

                    fontSize: {
                      xs: '0.75rem',
                      md: '0.9rem',
                    },

                    color:
                      'rgba(255,255,255,0.82)',

                    fontWeight: 500,
                  }}
                >
                  Enterprise Real Estate Management
                </Typography>
              </Box>

              {/* Main hero message */}
              <Box
                sx={{
                  mt: {
                    xs: 3,
                    md: 7,
                  },

                  maxWidth: 470,
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: '1.6rem',
                      sm: '2rem',
                      md: '2.8rem',
                    },

                    lineHeight: 1.08,

                    fontWeight: 700,

                    letterSpacing: '-0.04em',
                  }}
                >
                  Powering Real Estate
                  <br />
                  Businesses to{' '}
                  <Box
                    component="span"
                    sx={{
                      color: '#67e8f9',
                    }}
                  >
                    Grow
                  </Box>
                </Typography>

                <Box
                  sx={{
                    width: 45,
                    height: 3,
                    borderRadius: 3,

                    backgroundColor:
                      '#67e8f9',

                    my: {
                      xs: 1.5,
                      md: 2.5,
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: '0.78rem',
                      md: '0.95rem',
                    },

                    lineHeight: 1.6,

                    color:
                      'rgba(255,255,255,0.82)',

                    maxWidth: 430,
                  }}
                >
                  An all-in-one CRM to manage
                  leads, properties, clients and
                  deals — smarter, faster and more
                  efficiently.
                </Typography>
              </Box>

              {/* Features */}
              <Box
                sx={{
                  mt: 'auto',

                  display: 'grid',

                  gridTemplateColumns:
                    'repeat(3, 1fr)',

                  gap: {
                    xs: 1,
                    md: 1.5,
                  },
                }}
              >
                <Feature
                  icon={
                    <HomeWorkRoundedIcon />
                  }
                  title="Properties"
                />

                <Feature
                  icon={
                    <PeopleAltRoundedIcon />
                  }
                  title="Leads"
                />

                <Feature
                  icon={
                    <TrendingUpRoundedIcon />
                  }
                  title="Deals"
                />
              </Box>
            </Box>
          </Box>

          {/* ================================================== */}
          {/* RIGHT AUTH PANEL */}
          {/* ================================================== */}

          <Box
            sx={{
              width: {
                xs: '100%',
                md: '50%',
              },

              height: {
                xs: '58%',
                md: '100%',
              },

              minHeight: 0,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              overflow: 'hidden',

              p: {
                xs: 2.5,
                sm: 3,
                md: 5,
              },

              boxSizing: 'border-box',

              backgroundColor:
                '#ffffff',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 490,

                /*
                 * Prevent content from increasing
                 * the height of the page.
                 */
                minHeight: 0,

                display: 'flex',
                flexDirection: 'column',

                justifyContent: 'center',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  mb: {
                    xs: 2,
                    md: 3,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: '1.45rem',
                      sm: '1.7rem',
                      md: '2rem',
                    },

                    lineHeight: 1.15,

                    fontWeight: 750,

                    letterSpacing:
                      '-0.035em',

                    color: '#111827',
                  }}
                >
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    sx={{
                      mt: 0.8,

                      fontSize: {
                        xs: '0.8rem',
                        md: '0.9rem',
                      },

                      color: '#64748b',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* Form */}
              {children}

              {/* Footer */}
              <Box
                sx={{
                  mt: {
                    xs: 2,
                    md: 3,
                  },

                  pt: {
                    xs: 1.5,
                    md: 2,
                  },

                  borderTop:
                    '1px solid #eef2f7',

                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                  }}
                >
                  Secure. Reliable. Built for
                  Real Estate.
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    mt: 0.5,
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                  }}
                >
                  Powered by{' '}
                  <Link
                    href={POWERED_BY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      color: '#2563eb',
                      fontWeight: 600,
                    }}
                  >
                    {POWERED_BY_LABEL}
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

interface FeatureProps {
  icon: React.ReactNode
  title: string
}

function Feature({
  icon,
  title,
}: FeatureProps) {
  return (
    <Box
      sx={{
        p: {
          xs: 1,
          md: 1.5,
        },

        borderRadius: 2,

        backgroundColor:
          'rgba(255,255,255,0.10)',

        border:
          '1px solid rgba(255,255,255,0.15)',

        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        sx={{
          width: {
            xs: 30,
            md: 34,
          },

          height: {
            xs: 30,
            md: 34,
          },

          borderRadius: 1.5,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          backgroundColor:
            'rgba(255,255,255,0.12)',

          mb: 0.7,

          '& svg': {
            fontSize: {
              xs: 17,
              md: 20,
            },
          },
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: {
            xs: '0.65rem',
            md: '0.75rem',
          },

          fontWeight: 600,

          color:
            'rgba(255,255,255,0.9)',
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}
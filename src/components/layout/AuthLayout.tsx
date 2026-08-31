import { Box, Link, Typography } from '@mui/material'
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
        height: '100dvh',
        minHeight: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        position: 'relative',
        background:
          'linear-gradient(135deg, #eef4ff 0%, #f8faff 45%, #eef7ff 100%)',
      }}
    >
      {/* ================================================== */}
      {/* BACKGROUND GLOW - TOP RIGHT */}
      {/* ================================================== */}

      <Box
        sx={{
          position: 'absolute',
          width: {
            xs: 200,
            sm: 320,
            md: 500,
          },
          height: {
            xs: 200,
            sm: 320,
            md: 500,
          },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0) 70%)',
          top: {
            xs: -80,
            sm: -120,
            md: -220,
          },
          right: {
            xs: -60,
            sm: -100,
            md: -120,
          },
          pointerEvents: 'none',
        }}
      />

      {/* ================================================== */}
      {/* BACKGROUND GLOW - BOTTOM LEFT */}
      {/* ================================================== */}

      <Box
        sx={{
          position: 'absolute',
          width: {
            xs: 200,
            sm: 320,
            md: 500,
          },
          height: {
            xs: 200,
            sm: 320,
            md: 500,
          },
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0) 70%)',
          bottom: {
            xs: -80,
            sm: -120,
            md: -250,
          },
          left: {
            xs: -60,
            sm: -100,
            md: -150,
          },
          pointerEvents: 'none',
        }}
      />

      {/* ================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ================================================== */}

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
            xs: 1,
            sm: 2,
            md: 3,
          },

          py: {
            xs: 1,
            sm: 1.5,
            md: 2.5,
          },

          boxSizing: 'border-box',
        }}
      >
        {/* ================================================== */}
        {/* AUTH CARD */}
        {/* ================================================== */}

        <Box
          sx={{
            width: '100%',
            maxWidth: 1180,

            height: {
              xs: 'calc(100dvh - 16px)',
              sm: 'calc(100dvh - 24px)',
              md: 'calc(100dvh - 48px)',
            },

            maxHeight: {
              xs: 'calc(100dvh - 16px)',
              sm: 'calc(100dvh - 24px)',
              md: 'calc(100dvh - 48px)',
            },

            minHeight: 0,

            display: 'flex',

            /*
             * PHONE
             * └── Form only
             *
             * IPAD + DESKTOP
             * ├── Hero
             * └── Form
             */
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            overflow: 'hidden',

            borderRadius: {
              xs: 2,
              sm: 3,
              md: 4,
            },

            backgroundColor: '#ffffff',

            boxShadow: {
              xs: '0 10px 40px rgba(30, 64, 175, 0.12)',
              sm: '0 15px 50px rgba(30, 64, 175, 0.13)',
              md: '0 25px 70px rgba(30, 64, 175, 0.15)',
            },
          }}
        >
          {/* ================================================== */}
          {/* LEFT HERO */}
          {/* ================================================== */}

          <Box
            sx={{
              /*
               * Hidden on phones.
               * Visible from iPad size upward.
               */
              display: {
                xs: 'none',
                sm: 'block',
              },

              width: {
                sm: '45%',
                md: '50%',
              },

              height: '100%',

              minHeight: 0,

              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,

              background:
                'linear-gradient(145deg, #2563eb 0%, #4f46e5 55%, #6d28d9 100%)',

              color: '#fff',
            }}
          >
            {/* ================================================== */}
            {/* GRID */}
            {/* ================================================== */}

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.08,

                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',

                backgroundSize: {
                  sm: '32px 32px',
                  md: '45px 45px',
                },
              }}
            />

            {/* ================================================== */}
            {/* DECORATIVE CIRCLE 1 */}
            {/* ================================================== */}

            <Box
              sx={{
                position: 'absolute',

                width: {
                  sm: 250,
                  md: 400,
                },

                height: {
                  sm: 250,
                  md: 400,
                },

                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.10)',

                right: {
                  sm: -100,
                  md: -170,
                },

                top: {
                  sm: -70,
                  md: -140,
                },
              }}
            />

            {/* ================================================== */}
            {/* DECORATIVE CIRCLE 2 */}
            {/* ================================================== */}

            <Box
              sx={{
                position: 'absolute',

                width: {
                  sm: 350,
                  md: 550,
                },

                height: {
                  sm: 350,
                  md: 550,
                },

                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.07)',

                right: {
                  sm: -150,
                  md: -230,
                },

                top: {
                  sm: -100,
                  md: -200,
                },
              }}
            />

            {/* ================================================== */}
            {/* BUILDING DECORATION */}
            {/* ================================================== */}

            <Box
              sx={{
                display: {
                  xs: 'none',
                  sm: 'flex',
                },

                position: 'absolute',
                bottom: 0,
                right: 0,

                width: '75%',
                height: '35%',

                opacity: 0.10,

                alignItems: 'flex-end',
                justifyContent: 'flex-end',

                gap: {
                  sm: 0.5,
                  md: 1,
                },
              }}
            >
              {[25, 38, 30, 52, 43, 70, 48, 85, 60].map(
                (height, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: {
                        sm: 18,
                        md: 30,
                      },

                      height: `${height}%`,

                      background:
                        'linear-gradient(to top, #fff, rgba(255,255,255,0.25))',

                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                ),
              )}
            </Box>

            {/* ================================================== */}
            {/* HERO CONTENT */}
            {/* ================================================== */}

            <Box
              sx={{
                position: 'relative',
                zIndex: 2,

                height: '100%',

                display: 'flex',
                flexDirection: 'column',

                p: {
                  sm: 3,
                  md: 5,
                },

                boxSizing: 'border-box',
              }}
            >
              {/* ================================================== */}
              {/* BRAND */}
              {/* ================================================== */}

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      sm: '1.5rem',
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
                    mt: 0.2,

                    fontSize: {
                      sm: '0.65rem',
                      md: '0.9rem',
                    },

                    color: 'rgba(255,255,255,0.82)',
                    fontWeight: 500,
                  }}
                >
                  Enterprise Real Estate Management
                </Typography>
              </Box>

              {/* ================================================== */}
              {/* MAIN HERO MESSAGE */}
              {/* ================================================== */}

              <Box
                sx={{
                  mt: {
                    sm: 6,
                    md: 7,
                  },

                  maxWidth: {
                    sm: 350,
                    md: 470,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      sm: '2rem',
                      md: '2.8rem',
                    },

                    lineHeight: 1.1,
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
                    width: {
                      sm: 32,
                      md: 45,
                    },

                    height: 3,
                    borderRadius: 3,
                    backgroundColor: '#67e8f9',

                    my: {
                      sm: 1.5,
                      md: 2.5,
                    },
                  }}
                />

                <Typography
                  sx={{
                    display: 'block',

                    fontSize: {
                      sm: '0.75rem',
                      md: '0.95rem',
                    },

                    lineHeight: 1.5,

                    color: 'rgba(255,255,255,0.82)',

                    maxWidth: {
                      sm: 340,
                      md: 430,
                    },
                  }}
                >
                  An all-in-one CRM to manage leads,
                  properties, clients and deals — smarter,
                  faster and more efficiently.
                </Typography>
              </Box>

              {/* ================================================== */}
              {/* FEATURES */}
              {/* ================================================== */}

              <Box
                sx={{
                  mt: 'auto',

                  display: 'grid',

                  gridTemplateColumns: 'repeat(3, 1fr)',

                  gap: {
                    sm: 1,
                    md: 1.5,
                  },
                }}
              >
                <Feature
                  icon={<HomeWorkRoundedIcon />}
                  title="Properties"
                />

                <Feature
                  icon={<PeopleAltRoundedIcon />}
                  title="Leads"
                />

                <Feature
                  icon={<TrendingUpRoundedIcon />}
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
                sm: '55%',
                md: '50%',
              },

              height: '100%',

              minHeight: 0,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              overflow: 'hidden',

              p: {
                xs: 1.5,
                sm: 3,
                md: 5,
              },

              boxSizing: 'border-box',

              backgroundColor: '#ffffff',
            }}
          >
            {/* ================================================== */}
            {/* AUTH CONTENT */}
            {/* ================================================== */}

            <Box
              sx={{
                width: '100%',

                maxWidth: {
                  xs: 490,
                  sm: 420,
                  md: 490,
                },

                minHeight: 0,

                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* ================================================== */}
              {/* HEADER */}
              {/* ================================================== */}

              <Box
                sx={{
                  mb: {
                    xs: 1,
                    sm: 2,
                    md: 3,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: '1.1rem',
                      sm: '1.55rem',
                      md: '2rem',
                    },

                    lineHeight: 1.2,
                    fontWeight: 750,
                    letterSpacing: '-0.035em',
                    color: '#111827',
                  }}
                >
                  {title}
                </Typography>

                {subtitle && (
                  <Typography
                    sx={{
                      mt: 0.4,

                      fontSize: {
                        xs: '0.65rem',
                        sm: '0.75rem',
                        md: '0.9rem',
                      },

                      color: '#64748b',

                      lineHeight: 1.4,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* ================================================== */}
              {/* FORM */}
              {/* ================================================== */}

              <Box
                sx={{
                  flexShrink: 0,

                  '& form': {
                    width: '100%',
                  },

                  '& .MuiTextField-root': {
                    mb: {
                      xs: 1,
                      sm: 1.25,
                      md: 2,
                    },

                    '& .MuiInputBase-root': {
                      fontSize: {
                        xs: '0.85rem',
                        sm: '0.9rem',
                        md: '1rem',
                      },
                    },
                  },

                  '& .MuiButton-root': {
                    width: '100%',

                    py: {
                      xs: 0.8,
                      sm: 1,
                      md: 1.2,
                    },

                    fontSize: {
                      xs: '0.8rem',
                      sm: '0.9rem',
                      md: '1rem',
                    },
                  },

                  '& .MuiFormControl-root': {
                    width: '100%',
                  },

                  '& .MuiInputLabel-root': {
                    fontSize: {
                      xs: '0.8rem',
                      sm: '0.85rem',
                      md: '1rem',
                    },
                  },
                }}
              >
                {children}
              </Box>

              {/* ================================================== */}
              {/* FOOTER */}
              {/* ================================================== */}

              <Box
                sx={{
                  mt: {
                    xs: 1.5,
                    sm: 1.5,
                    md: 3,
                  },

                  pt: {
                    xs: 1,
                    sm: 1.25,
                    md: 2,
                  },

                  borderTop: '1px solid #eef2f7',

                  textAlign: 'center',

                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',

                    fontSize: {
                      xs: '0.55rem',
                      sm: '0.6rem',
                      md: '0.7rem',
                    },
                  }}
                >
                  Secure. Reliable. Built for Real Estate.
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  sx={{
                    mt: 0.3,

                    color: '#94a3b8',

                    fontSize: {
                      xs: '0.55rem',
                      sm: '0.6rem',
                      md: '0.7rem',
                    },
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

                      fontSize: {
                        xs: '0.55rem',
                        sm: '0.6rem',
                        md: '0.7rem',
                      },
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

/* ================================================== */
/* FEATURE */
/* ================================================== */

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
          xs: 0.5,
          sm: 1,
          md: 1.5,
        },

        borderRadius: {
          xs: 1,
          sm: 1.5,
          md: 2,
        },

        backgroundColor: 'rgba(255,255,255,0.10)',

        border: '1px solid rgba(255,255,255,0.15)',

        backdropFilter: 'blur(10px)',

        display: 'flex',

        flexDirection: 'column',

        alignItems: 'center',

        justifyContent: 'center',

        gap: {
          xs: 0.5,
          sm: 0.4,
          md: 0.5,
        },

        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: {
            xs: 18,
            sm: 26,
            md: 34,
          },

          height: {
            xs: 18,
            sm: 26,
            md: 34,
          },

          borderRadius: {
            xs: 0.75,
            sm: 1,
            md: 1.5,
          },

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          backgroundColor: 'rgba(255,255,255,0.12)',

          flexShrink: 0,

          '& svg': {
            fontSize: {
              xs: 12,
              sm: 16,
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
            xs: '0.5rem',
            sm: '0.65rem',
            md: '0.75rem',
          },

          fontWeight: 600,

          color: 'rgba(255,255,255,0.9)',

          whiteSpace: 'nowrap',

          overflow: 'hidden',

          textOverflow: 'ellipsis',

          maxWidth: '100%',
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}
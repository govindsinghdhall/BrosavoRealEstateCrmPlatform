import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Grid from '@mui/material/Grid2'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { FormTextField } from '@/components/forms/FormTextField'

import {
  signupSchema,
  type SignupFormData,
} from '@/schemas/auth.schema'

import { authService } from '@/api/services'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/api/client'

const SIGNUP_ACCESS_CODE = '200797'

const defaultValues: SignupFormData = {
  organizationName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

export function SignupPage() {
  const navigate = useNavigate()

  const {
    setAuth,
    isAuthenticated,
  } = useAuthStore()

  const [error, setError] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')

  const {
    control,
    handleSubmit,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  })

  const signupMutation = useMutation({
    mutationFn: (data: SignupFormData) => {
      /*
       * Access code is intentionally NOT sent
       * to the backend.
       */
      const {
        confirmPassword: _,
        ...credentials
      } = data

      return authService.register(credentials)
    },

    onSuccess: (data) => {
      setAuth(data.user, data.token)

      navigate('/dashboard', {
        replace: true,
      })
    },

    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  const handleSignup = (data: SignupFormData) => {
    setError('')

    if (accessCode.trim() !== SIGNUP_ACCESS_CODE) {
      setAccessCodeError('Invalid access code.')
      return
    }

    setAccessCodeError('')

    signupMutation.mutate(data)
  }

  if (isAuthenticated) {
    navigate('/dashboard', {
      replace: true,
    })

    return null
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to start managing your real estate business"
    >
      {/* =========================================
          API ERROR
          ========================================= */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.5,
            borderRadius: 1.5,
            py: 0.5,
            fontSize: '0.8rem',
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* =========================================
          SIGNUP FORM
          ========================================= */}
      <Box
        component="form"
        onSubmit={handleSubmit(handleSignup)}
        noValidate
        sx={{
          /*
           * ========================================
           * SIGNUP PAGE ONLY
           * ========================================
           *
           * FormTextField.tsx is NOT modified.
           * These styles only apply to fields
           * inside this form.
           */

          '& .MuiTextField-root': {
            mb: 0,
          },

          /* ----------------------------------------
             INPUT
             ---------------------------------------- */

          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            height: 48,
            borderRadius: '10px',
            backgroundColor: '#ffffff',

            transition:
              'border-color 0.2s ease, box-shadow 0.2s ease',

            '& fieldset': {
              borderColor: '#d9e0ea',
              borderWidth: '1px',
            },

            '&:hover fieldset': {
              borderColor: '#a8b3c2',
            },

            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '1.5px',
            },

            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            },
          },

          /* ----------------------------------------
             INPUT TEXT
             ---------------------------------------- */

          '& .MuiInputBase-input': {
            fontSize: '0.9rem',
            color: '#334155',
            padding: '12px 14px',

            '&::placeholder': {
              color: '#94a3b8',
              opacity: 1,
            },
          },

          /* ----------------------------------------
             LABEL
             ---------------------------------------- */

          '& .MuiInputLabel-root': {
            fontSize: '0.9rem',
            color: '#64748b',

            '&.Mui-focused': {
              color: '#2563eb',
            },

            '&.Mui-error': {
              color: '#ef4444',
            },
          },

          /* ----------------------------------------
             ERROR / HELPER TEXT
             ---------------------------------------- */

          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            marginTop: '4px',
            fontSize: '0.7rem',
            lineHeight: 1.2,
          },

          /* ----------------------------------------
             PASSWORD VISIBILITY
             ---------------------------------------- */

          '& .MuiInputAdornment-root .MuiIconButton-root': {
            padding: '6px',
            color: '#64748b',

            '&:hover': {
              color: '#2563eb',
              backgroundColor:
                'rgba(37, 99, 235, 0.06)',
            },
          },
        }}
      >
        <Grid
          container
          columnSpacing={1.5}
          rowSpacing={1.25}
        >
          {/* =======================================
              ORGANIZATION
              ======================================= */}

          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="organizationName"
              control={control}
              label="Organization Name"
              required
            />
          </Grid>

          {/* =======================================
              FIRST / LAST NAME
              ======================================= */}

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="firstName"
              control={control}
              label="First Name"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="lastName"
              control={control}
              label="Last Name"
              required
            />
          </Grid>

          {/* =======================================
              EMAIL
              ======================================= */}

          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="email"
              control={control}
              label="Email"
              type="email"
              required
            />
          </Grid>

          {/* =======================================
              PHONE
              ======================================= */}

          <Grid size={{ xs: 12 }}>
            <FormTextField
              name="phone"
              control={control}
              label="Phone (optional)"
            />
          </Grid>

          {/* =======================================
              PASSWORD / CONFIRM PASSWORD
              ======================================= */}

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="password"
              control={control}
              label="Password"
              type="password"
              showPasswordToggle
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              type="password"
              showPasswordToggle
              required
            />
          </Grid>

          {/* =======================================
              ACCESS CODE
              ======================================= */}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Access Code"
              placeholder="Enter access code"
              value={accessCode}
              error={!!accessCodeError}
              helperText={accessCodeError}
              onChange={(event) => {
                setAccessCode(event.target.value)
                setAccessCodeError('')
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: accessCodeError
                            ? '#ef4444'
                            : '#64748b',
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 48,
                  minHeight: 48,
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',

                  '& fieldset': {
                    borderColor: accessCodeError
                      ? '#ef4444'
                      : '#d9e0ea',
                  },

                  '&:hover fieldset': {
                    borderColor: accessCodeError
                      ? '#ef4444'
                      : '#a8b3c2',
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: accessCodeError
                      ? '#ef4444'
                      : '#2563eb',

                    borderWidth: '1.5px',
                  },
                },

                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em',
                  color: '#334155',
                },

                '& .MuiInputLabel-root': {
                  fontSize: '0.9rem',
                  color: '#64748b',

                  '&.Mui-focused': {
                    color: accessCodeError
                      ? '#ef4444'
                      : '#2563eb',
                  },
                },

                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginTop: '4px',
                  fontSize: '0.7rem',
                },
              }}
            />
          </Grid>

          {/* =======================================
              CREATE ACCOUNT
              ======================================= */}

          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={signupMutation.isPending}
              sx={{
                mt: 0.25,
                height: 50,
                borderRadius: '10px',

                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,

                background:
                  'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',

                boxShadow:
                  '0 7px 18px rgba(37, 99, 235, 0.18)',

                transition:
                  'transform 0.2s ease, box-shadow 0.2s ease',

                '&:hover': {
                  background:
                    'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)',

                  boxShadow:
                    '0 10px 24px rgba(37, 99, 235, 0.25)',

                  transform: 'translateY(-1px)',
                },

                '&:active': {
                  transform: 'translateY(0)',
                },

                '&.Mui-disabled': {
                  background:
                    'linear-gradient(90deg, #93c5fd 0%, #c4b5fd 100%)',

                  color: '#ffffff',
                },
              }}
            >
              {signupMutation.isPending ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                'Create Account'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* =========================================
          SIGN IN
          ========================================= */}

      <Box
        sx={{
          mt: 1.75,
          textAlign: 'center',
        }}
      >
        <AuthFooterLink
          text="Already have an account?"
          linkText="Sign in"
          to="/login"
        />
      </Box>
    </AuthLayout>
  )
}
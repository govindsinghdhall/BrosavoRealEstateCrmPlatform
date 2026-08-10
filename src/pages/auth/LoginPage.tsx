import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { AuthFooterLink } from '@/components/auth/AuthFooterLink'
import { FormTextField } from '@/components/forms/FormTextField'

import {
  loginSchema,
  type LoginFormData,
} from '@/schemas/auth.schema'

import {
  authService,
  organizationService,
} from '@/api/services'

import { useAuthStore } from '@/store/authStore'
import { useOrganizationStore } from '@/store/organizationStore'
import { applyOrganizationBranding } from '@/utils/branding'
import { getErrorMessage } from '@/api/client'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    setAuth,
    isAuthenticated,
  } = useAuthStore()

  const setOrganization = useOrganizationStore(
    (state) => state.setOrganization,
  )

  const [error, setError] = useState('')

  const from =
    (
      location.state as {
        from?: {
          pathname: string
        }
      }
    )?.from?.pathname || '/dashboard'

  const {
    control,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,

    onSuccess: async (data) => {
      setAuth(data.user, data.token)

      try {
        const organization =
          await organizationService.getCurrent()

        setOrganization(organization)

        applyOrganizationBranding(organization)
      } catch {
        // Organization branding is optional on first login
      }

      navigate(from, {
        replace: true,
      })
    },

    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  if (isAuthenticated) {
    navigate('/dashboard', {
      replace: true,
    })

    return null
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to your account to continue"
    >
      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <Box
        component="form"
        onSubmit={handleSubmit((data) =>
          loginMutation.mutate(data),
        )}
        sx={{
          /*
           * ==========================================
           * LOGIN PAGE ONLY STYLES
           * ==========================================
           *
           * These styles are scoped to this form.
           * FormTextField.tsx remains untouched.
           */

          '& .MuiTextField-root': {
            mb: 2.5,
          },

          /* TextField container */
          '& .MuiOutlinedInput-root': {
            minHeight: 52,
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            transition:
              'border-color 0.2s ease, box-shadow 0.2s ease',

            '& fieldset': {
              borderColor: '#d9e0ea',
              borderWidth: '1px',
            },

            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },

            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '1.5px',
            },

            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            },

            '&.Mui-disabled': {
              backgroundColor: '#f8fafc',
            },

            '&.Mui-disabled fieldset': {
              borderColor: '#e2e8f0',
            },
          },

          /* Input text */
          '& .MuiInputBase-input': {
            fontSize: '0.95rem',
            fontWeight: 400,
            color: '#1e293b',
          },

          /* Placeholder */
          '& .MuiInputBase-input::placeholder': {
            color: '#94a3b8',
            opacity: 1,
          },

          /* Label */
          '& .MuiInputLabel-root': {
            color: '#64748b',
            fontSize: '0.95rem',

            '&.Mui-focused': {
              color: '#2563eb',
            },

            '&.Mui-error': {
              color: '#ef4444',
            },
          },

          /* Helper/error text */
          '& .MuiFormHelperText-root': {
            marginLeft: 0,
            marginTop: '6px',
            fontSize: '0.78rem',

            '&.Mui-error': {
              color: '#ef4444',
            },
          },

          /* Password visibility button */
          '& .MuiInputAdornment-root .MuiIconButton-root': {
            color: '#64748b',
            transition: 'all 0.2s ease',

            '&:hover': {
              color: '#2563eb',
              backgroundColor:
                'rgba(37, 99, 235, 0.06)',
            },
          },
        }}
      >
        {/* Email */}
        <FormTextField
          name="email"
          control={control}
          label="Email"
        />

        {/* Password */}
        <FormTextField
          name="password"
          control={control}
          label="Password"
          type="password"
          showPasswordToggle
        />

        {/* Forgot Password */}
        <Box
          display="flex"
          justifyContent="flex-end"
          sx={{
            mt: -1,
            mb: 2.5,
          }}
        >
          <Button
            type="button"
            variant="text"
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#2563eb',
              minWidth: 'auto',
              p: 0,

              '&:hover': {
                backgroundColor: 'transparent',
                color: '#1d4ed8',
              },
            }}
            onClick={() => {
              // Add forgot password navigation here
            }}
          >
            Forgot password?
          </Button>
        </Box>

        {/* Sign In */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loginMutation.isPending}
          sx={{
            height: 52,
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,

            background:
              'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',

            boxShadow:
              '0 8px 20px rgba(37, 99, 235, 0.20)',

            transition:
              'transform 0.2s ease, box-shadow 0.2s ease',

            '&:hover': {
              background:
                'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)',

              boxShadow:
                '0 10px 24px rgba(37, 99, 235, 0.28)',

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
          {loginMutation.isPending ? (
            <CircularProgress
              size={24}
              color="inherit"
            />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>

      {/* Sign Up */}
      <Box
        mt={3}
        textAlign="center"
      >
        <AuthFooterLink
          text="Don't have an account?"
          linkText="Sign up"
          to="/signup"
        />
      </Box>
    </AuthLayout>
  )
}
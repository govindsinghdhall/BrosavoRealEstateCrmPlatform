import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ProtectedRoute } from './ProtectedRoute'
import { PropertiesLayout } from './PropertiesLayout'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })))
const PropertyOwnersPage = lazy(() =>
  import('@/pages/properties/PropertyOwnersPage').then((m) => ({ default: m.PropertyOwnersPage })),
)
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LeadsPage = lazy(() => import('@/pages/leads/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const LeadDetailPage = lazy(() => import('@/pages/leads/LeadDetailPage').then((m) => ({ default: m.LeadDetailPage })))
const ContactsPage = lazy(() => import('@/pages/contacts/ContactsPage').then((m) => ({ default: m.ContactsPage })))
const ContactDetailPage = lazy(() =>
  import('@/pages/contacts/ContactDetailPage').then((m) => ({ default: m.ContactDetailPage })),
)
const PropertiesPage = lazy(() => import('@/pages/properties/PropertiesPage').then((m) => ({ default: m.PropertiesPage })))
const SiteVisitsPage = lazy(() => import('@/pages/siteVisits/SiteVisitsPage').then((m) => ({ default: m.SiteVisitsPage })))
const BookingsPage = lazy(() => import('@/pages/bookings/BookingsPage').then((m) => ({ default: m.BookingsPage })))
const MarketingPage = lazy(() =>
  import('@/pages/marketing/MarketingHubPage').then((m) => ({ default: m.MarketingHubPage })),
)
const UsersPage = lazy(() => import('@/pages/users/UsersPage').then((m) => ({ default: m.UsersPage })))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const CompanySettingsPage = lazy(() =>
  import('@/pages/settings/CompanySettingsPage').then((m) => ({ default: m.CompanySettingsPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/settings/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner fullScreen />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/signup',
    element: (
      <LazyPage>
        <SignupPage />
      </LazyPage>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <LazyPage>
            <DashboardPage />
          </LazyPage>
        ),
      },
      {
        path: 'leads',
        element: (
          <LazyPage>
            <LeadsPage />
          </LazyPage>
        ),
      },
      {
        path: 'leads/:id',
        element: (
          <LazyPage>
            <LeadDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'contacts',
        element: (
          <LazyPage>
            <ContactsPage />
          </LazyPage>
        ),
      },
      {
        path: 'contacts/:id',
        element: (
          <LazyPage>
            <ContactDetailPage />
          </LazyPage>
        ),
      },
      {
        path: 'properties',
        element: <PropertiesLayout />,
        children: [
          {
            index: true,
            element: (
              <LazyPage>
                <PropertiesPage />
              </LazyPage>
            ),
          },
          {
            path: 'owners',
            element: (
              <LazyPage>
                <PropertyOwnersPage />
              </LazyPage>
            ),
          },
        ],
      },
      {
        path: 'site-visits',
        element: (
          <LazyPage>
            <SiteVisitsPage />
          </LazyPage>
        ),
      },
      {
        path: 'bookings',
        element: (
          <LazyPage>
            <BookingsPage />
          </LazyPage>
        ),
      },
      {
        path: 'marketing',
        element: (
          <LazyPage>
            <MarketingPage />
          </LazyPage>
        ),
      },
      {
        path: 'bookings/marketing',
        element: <Navigate to="/marketing" replace />,
      },
      {
        path: 'users',
        element: (
          <LazyPage>
            <UsersPage />
          </LazyPage>
        ),
      },
      {
        path: 'reports',
        element: (
          <LazyPage>
            <ReportsPage />
          </LazyPage>
        ),
      },
      {
        path: 'settings/company',
        element: (
          <LazyPage>
            <CompanySettingsPage />
          </LazyPage>
        ),
      },
      {
        path: 'profile',
        element: (
          <LazyPage>
            <ProfilePage />
          </LazyPage>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])

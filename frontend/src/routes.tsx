import React from 'react'
import { Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'

// Lazy-loaded pages
const HomePage = React.lazy(() => import('./pages/HomePage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const AuthLandingPage = React.lazy(() => import('./pages/AuthLandingPage'))
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'))
const PasswordResetRequestPage = React.lazy(() => import('./pages/PasswordResetRequestPage'))
const PasswordResetConfirmPage = React.lazy(() => import('./pages/PasswordResetConfirmPage'))
const MyApplicationsPage = React.lazy(() => import('./pages/applicant/MyApplicationsPage'))
const ApplicationLayout = React.lazy(() => import('./pages/applicant/ApplicationLayout'))
const Step1 = React.lazy(() => import('./pages/applicant/Step1_CallInfo'))
const Step2 = React.lazy(() => import('./pages/applicant/Step2_Upload'))
const Step3 = React.lazy(() => import('./pages/applicant/Step3_Review'))
const Step4 = React.lazy(() => import('./pages/applicant/Step4_Submit'))
const CallsPage = React.lazy(() => import('./pages/CallsPage'))
const CallDetailPage = React.lazy(() => import('./pages/CallDetailPage'))
const CallManagementPage = React.lazy(() => import('./pages/admin/CallManagementPage'))
const CreateCallPage = React.lazy(() => import('./pages/admin/CreateCallPage'))
const EditCallPage = React.lazy(() => import('./pages/admin/EditCallPage'))
const CallDocumentsPage = React.lazy(() => import('./pages/admin/CallDocumentsPage'))
const CallApplicationsPage = React.lazy(() => import('./pages/reviewer/CallApplicationsPage'))
const ApplicationDetailPage = React.lazy(() => import('./pages/admin/ApplicationDetailPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

export const appRoutes = [
  // Public
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/auth', element: <AuthLandingPage /> },
  { path: '/register/:role', element: <RegisterPage /> },
  { path: '/register', element: <Navigate to="/auth" replace /> },
  { path: '/login/:role', element: <LoginPage /> },
  { path: '/login', element: <Navigate to="/auth" replace /> },
  { path: '/verify/:token', element: <VerifyEmailPage /> },
  { path: '/password-reset', element: <PasswordResetRequestPage /> },
  { path: '/password-reset/:token', element: <PasswordResetConfirmPage /> },

  // Applicant
  { path: '/my-applications', element: <PrivateRoute><MyApplicationsPage /></PrivateRoute> },
  {
    path: '/applicant/:callId',
    element: <PrivateRoute><ApplicationLayout /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="step1" replace /> },
      { path: 'step1', element: <Step1 /> },
      { path: 'step2', element: <Step2 /> },
      { path: 'step3', element: <Step3 /> },
      { path: 'step4', element: <Step4 /> },
    ],
  },

  // Reviewer / Kullanıcı
  { path: '/calls', element: <PrivateRoute><CallsPage /></PrivateRoute> },
  { path: '/calls/:callId', element: <PrivateRoute><CallDetailPage /></PrivateRoute> },

  // Admin
  { path: '/admin/calls', element: <PrivateRoute roles={["admin"]}><CallManagementPage /></PrivateRoute> },
  { path: '/admin/calls/new', element: <PrivateRoute roles={["admin"]}><CreateCallPage /></PrivateRoute> },
  { path: '/admin/calls/:callId/edit', element: <PrivateRoute roles={["admin"]}><EditCallPage /></PrivateRoute> },
  { path: '/admin/calls/:callId/documents', element: <PrivateRoute roles={["admin"]}><CallDocumentsPage /></PrivateRoute> },
  { path: '/admin/calls/:callId/applications', element: <PrivateRoute roles={["admin"]}><CallApplicationsPage /></PrivateRoute> },
  { path: '/admin/calls/:callId/applications/:applicationId', element: <PrivateRoute roles={["admin", "reviewer"]}><ApplicationDetailPage /></PrivateRoute> },

  // 404
  { path: '*', element: <NotFoundPage /> },
]

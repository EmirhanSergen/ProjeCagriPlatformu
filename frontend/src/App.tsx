import Navbar from './components/Navbar'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './components/AuthProvider'
import PrivateRoute from './components/PrivateRoute'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import CallsPage from './pages/CallsPage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplicationPreview from './pages/ApplicationPreview'
import CallDetailPage from './pages/CallDetailPage'
import CallManagementPage from './pages/CallManagementPage'
import CallApplicationsPage from './pages/CallApplicationsPage'
import CallDocumentsPage from './pages/CallDocumentsPage'
import CreateCallPage from './pages/CreateCallPage'
import EditCallPage from './pages/EditCallPage'
import ApplicationDocumentsPage from './pages/ApplicationDocumentsPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import PasswordResetRequestPage from './pages/PasswordResetRequestPage'
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage'
import { Routes, Route } from 'react-router-dom'



function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="max-w-md mx-auto p-4 space-y-8 flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/register" element={<RegisterPage />} />              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify/:token" element={<VerifyEmailPage />} />
              <Route path="/password-reset" element={<PasswordResetRequestPage />} />
              <Route path="/password-reset/:token" element={<PasswordResetConfirmPage />} />
              <Route
                path="/calls"
                element={
                  <PrivateRoute>
                    <CallsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calls/:callId"
                element={
                  <PrivateRoute>
                    <CallDetailPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/calls"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CallManagementPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/calls/new"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CreateCallPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/calls/:callId/edit"
                element={
                  <PrivateRoute roles={['admin']}>
                    <EditCallPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/calls/:callId/applications"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CallApplicationsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/calls/:callId/documents"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CallDocumentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications/:callId/preview"
                element={
                  <PrivateRoute>
                    <ApplicationPreview />
                  </PrivateRoute>
                }
              />
              <Route
                path="/applications/:callId/documents"
                element={
                  <PrivateRoute>
                    <ApplicationDocumentsPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

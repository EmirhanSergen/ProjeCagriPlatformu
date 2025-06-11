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
import CallManagementPage from './pages/CallManagementPage'
import CallApplicationsPage from './pages/CallApplicationsPage'
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
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/calls"
                element={
                  <PrivateRoute>
                    <CallsPage />
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
                path="/admin/calls/:callId/applications"
                element={
                  <PrivateRoute roles={['admin']}>
                    <CallApplicationsPage />
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
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

import Navbar from './components/Navbar'
import { ToastProvider } from './components/ToastProvider'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import CallsPage from './pages/CallsPage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplicationPreview from './pages/ApplicationPreview'
import CallManagementPage from './pages/CallManagementPage'
import { Routes, Route } from 'react-router-dom'



function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="max-w-md mx-auto p-4 space-y-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/admin/calls" element={<CallManagementPage />} />
            <Route path="/applications/:callId/preview" element={<ApplicationPreview />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

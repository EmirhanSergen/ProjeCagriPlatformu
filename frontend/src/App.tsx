import Navbar from './Navbar'
import { ToastProvider } from './ToastProvider'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'
import CallsPage from './CallsPage'
import HomePage from './HomePage'
import AboutPage from './AboutPage'
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
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import CallList from './CallList';
import Navbar from './Navbar';
import { ToastProvider } from './ToastProvider';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="max-w-md mx-auto p-4 space-y-8 flex-grow">
          <RegisterForm />
          <LoginForm />
          <CallList />
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

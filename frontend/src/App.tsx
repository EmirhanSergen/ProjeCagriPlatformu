import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import CallList from './CallList';
import { ToastProvider } from './ToastProvider';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <div className="max-w-md mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold text-center">Project Call Platform</h1>
        <RegisterForm />
        <LoginForm />
        <CallList />
      </div>
    </ToastProvider>
  );
}

export default App;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import '../styles/Auth.css';

type AuthMode = 'login' | 'signup';

interface ValidationErrors {
  email: string;
  password: string;
  submit?: string;
}

export const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters long' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setSuccessMessage('Check your email for the confirmation link!');
        setEmail('');
        setPassword('');
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>{mode === 'login' ? 'Login' : 'Sign Up'}</h1>
        
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            placeholder="Email"
            disabled={isLoading}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            placeholder="Password"
            disabled={isLoading}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="submit-button"
        >
          {isLoading
            ? mode === 'login' ? 'Logging in...' : 'Signing up...'
            : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>

        <button 
          type="button" 
          onClick={() => {
            setMode(prev => (prev === 'login' ? 'signup' : 'login'));
            setErrors({ email: '', password: '' });
            setSuccessMessage('');
          }} 
          className="toggle-mode-button"
        >
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </button>
      </form>
    </div>
  );
};

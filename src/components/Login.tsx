import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

interface ValidationErrors {
  email: string;
  password: string;
  submit?: string;
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
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
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
      return false;
    }
    if (!/\d/.test(password)) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one number' }));
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one special character' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, submit: '' }));

      try {
        const { error } = await login(email, password);
        if (error) {
          setErrors(prev => ({ ...prev, submit: error.message }));
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, submit: 'An unexpected error occurred' }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>
        
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

          <div className="password-requirements">
            Password must:
            <ul>
              <li className={password.length >= 8 ? 'valid' : ''}>
                Be at least 8 characters long
              </li>
              <li className={/\d/.test(password) ? 'valid' : ''}>
                Contain at least one number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : ''}>
                Contain at least one special character
              </li>
            </ul>
          </div>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

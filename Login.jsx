import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast, isValidEmail } from '../utils/helpers';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Load saved email if "Remember Me" is checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Logged in successfully!', 'success');
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/');
      }
    } catch (error) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
      padding: '2rem 1rem',
      animation: 'fadeIn 0.6s ease-in-out',
    },
    card: {
      background: 'white',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-xl)',
      padding: '3rem',
      width: '100%',
      maxWidth: '450px',
      animation: 'slideUp 0.6s ease',
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    icon: {
      margin: '0 auto 1rem',
      width: '60px',
      height: '60px',
      background: 'var(--primary)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    title: { fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' },
    subtitle: { color: 'var(--gray-600)' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' },
    label: { fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-md)',
      border: '2px solid var(--gray-200)',
      fontSize: '1rem',
      transition: 'var(--transition-base)',
      outline: 'none',
      width: '100%',
    },
    togglePassword: {
      position: 'absolute',
      right: '12px',
      top: '36px',
      cursor: 'pointer',
      color: 'var(--gray-500)',
    },
    button: {
      padding: '0.875rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--primary)',
      color: 'white',
      fontWeight: 600,
      fontSize: '1rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'var(--transition-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    buttonHover: {
      background: 'var(--primary-dark)',
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    footer: { marginTop: '2rem', textAlign: 'center', color: 'var(--gray-600)' },
    link: { color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' },
    remember: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.875rem',
      color: 'var(--gray-600)',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; } to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}><LogIn size={32} /></div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
            />
            <div
              style={styles.togglePassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div style={styles.remember}>
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Remember Me
            </label>
            <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            style={{ ...styles.button, ...(loading && styles.buttonDisabled) }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          Don’t have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

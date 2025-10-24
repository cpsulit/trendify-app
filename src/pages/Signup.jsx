import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast, isValidEmail } from '../utils/helpers';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Common email domains for suggestion
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const atIndex = value.indexOf('@');
    if (atIndex > -1) {
      const domainPart = value.slice(atIndex + 1);
      setSuggestions(
        domains
          .filter((d) => d.startsWith(domainPart) && d !== domainPart)
          .map((d) => value.slice(0, atIndex + 1) + d)
      );
    } else {
      setSuggestions([]);
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    evaluateStrength(value);
  };

  const evaluateStrength = (value) => {
    if (value.length < 6) setStrength('Weak');
    else if (/[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value))
      setStrength('Strong');
    else setStrength('Medium');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signUp(email, password);
      if (error) throw error;
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.message || 'An error occurred. Please try again.', 'error');
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
      background: 'linear-gradient(135deg, var(--secondary), var(--primary-light))',
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
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    icon: {
      margin: '0 auto 1rem',
      width: '60px',
      height: '60px',
      background: 'var(--secondary)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' },
    input: {
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-md)',
      border: '2px solid var(--gray-200)',
      fontSize: '1rem',
      transition: 'var(--transition-base)',
      outline: 'none',
      width: '100%',
    },
    strengthBar: {
      height: '6px',
      borderRadius: '6px',
      background:
        strength === 'Strong'
          ? '#22c55e'
          : strength === 'Medium'
          ? '#facc15'
          : strength === 'Weak'
          ? '#ef4444'
          : '#ddd',
      transition: '0.3s ease',
    },
    button: {
      padding: '0.875rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--secondary)',
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
    suggestionBox: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginTop: '0.25rem',
      zIndex: 5,
    },
    suggestionItem: {
      padding: '0.5rem 0.75rem',
      cursor: 'pointer',
      transition: '0.2s',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: 'var(--gray-600)' }}>Join our community today</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="you@example.com"
              style={styles.input}
              disabled={loading}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={styles.suggestionItem}
                    onClick={() => {
                      setEmail(s);
                      setSuggestions([]);
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#f3f4f6')}
                    onMouseLeave={(e) => (e.target.style.background = 'white')}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="At least 6 characters"
                style={styles.input}
                disabled={loading}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#888',
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <div style={styles.strengthBar}></div>
            <small style={{ color: '#555' }}>{strength && `Password strength: ${strength}`}</small>
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

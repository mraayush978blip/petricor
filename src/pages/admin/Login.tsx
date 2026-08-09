import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { clientBotCheck, verifyRecaptchaToken, getFormOpenTime } from '../../lib/botProtection';

// ── Brute-force config ──────────────────────────────────────────────────────
const MAX_ATTEMPTS   = 5;           // failed tries before lockout
const LOCKOUT_MS     = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY    = '__admin_lock';

interface LockState { attempts: number; lockedUntil: number | null; }

function getLockState(): LockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
  } catch { return { attempts: 0, lockedUntil: null }; }
}

function saveLockState(state: LockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearLockState() {
  localStorage.removeItem(STORAGE_KEY);
}

function getRemainingLockMs(lockedUntil: number | null): number {
  if (!lockedUntil) return 0;
  return Math.max(0, lockedUntil - Date.now());
}

function formatLockTime(ms: number): string {
  const mins = Math.ceil(ms / 60000);
  return mins > 1 ? `${mins} minutes` : `${Math.ceil(ms / 1000)} seconds`;
}
// ───────────────────────────────────────────────────────────────────────────

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [lockRemaining, setLockRemaining] = useState(() => {
    const s = getLockState();
    return getRemainingLockMs(s.lockedUntil);
  });

  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const honeypotRef  = useRef('');
  const formOpenedAt = useRef(getFormOpenTime());

  // Tick the lockout countdown
  const tickLock = useCallback(() => {
    const interval = setInterval(() => {
      const s = getLockState();
      const remaining = getRemainingLockMs(s.lockedUntil);
      setLockRemaining(remaining);
      if (remaining <= 0) {
        clearLockState();
        clearInterval(interval);
      }
    }, 1000);
    return interval;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── 1. Lockout check ───────────────────────────────────────────────────
    const lockState = getLockState();
    const remaining = getRemainingLockMs(lockState.lockedUntil);
    if (remaining > 0) {
      setError(`Too many failed attempts. Try again in ${formatLockTime(remaining)}.`);
      return;
    }

    // ── 2. Honeypot + time check ───────────────────────────────────────────
    const botCheck = clientBotCheck(honeypotRef.current, formOpenedAt.current);
    if (botCheck.blocked) {
      // Silently pretend it failed (don't reveal bot detection)
      setError('Invalid credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    // ── 3. reCAPTCHA v3 ───────────────────────────────────────────────────
    if (executeRecaptcha) {
      const token = await executeRecaptcha('admin_login');
      const isHuman = await verifyRecaptchaToken(token);
      if (!isHuman) {
        setError('Security verification failed. Please try again.');
        setLoading(false);
        return;
      }
    }

    // ── 4. Supabase auth ──────────────────────────────────────────────────
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      // Increment failed attempt counter
      const newAttempts = lockState.attempts + 1;
      const newLockedUntil = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
      saveLockState({ attempts: newAttempts, lockedUntil: newLockedUntil });

      if (newLockedUntil) {
        setLockRemaining(LOCKOUT_MS);
        setError(`Too many failed attempts. Account locked for ${formatLockTime(LOCKOUT_MS)}.`);
        tickLock();
      } else {
        const attemptsLeft = MAX_ATTEMPTS - newAttempts;
        setError(`Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before lockout.`);
      }
      setLoading(false);
    } else {
      // Success — clear lockout state
      clearLockState();
      navigate('/admin');
    }
  };

  const isLocked = lockRemaining > 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ margin: '0 auto', width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/Logo-1-2.png" alt="Petricor" style={{ height: '40px', width: 'auto' }} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #eaeaea' }}>
          
          <h2 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>
            Admin Login
          </h2>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#aaa', marginBottom: '28px' }}>
            Authorised access only
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              name="website"
              onChange={(e) => { honeypotRef.current = e.target.value; }}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* Error / Lockout banner */}
            {error && (
              <div style={{ backgroundColor: isLocked ? '#fff3cd' : '#f8d7da', color: isLocked ? '#856404' : '#721c24', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', border: `1px solid ${isLocked ? '#ffc107' : '#f5c6cb'}`, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Lockout progress bar */}
            {isLocked && (
              <div style={{ height: '4px', backgroundColor: '#f0e6d2', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#7c5847', borderRadius: '2px', width: `${(lockRemaining / LOCKOUT_MS) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '7px' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', pointerEvents: 'none' }}>
                  <Mail size={17} color="#bbb" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isLocked}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  style={{ width: '100%', padding: '12px 12px 12px 38px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: isLocked ? '#f9f9f9' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }}
                  placeholder="admin@petricor.co.in"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '7px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', pointerEvents: 'none' }}>
                  <Lock size={17} color="#bbb" />
                </div>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  disabled={isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 42px 12px 38px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box', backgroundColor: isLocked ? '#f9f9f9' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }}
                  placeholder="••••••••"
                />
                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#bbb' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLocked}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: isLocked ? '#ccc' : '#7c5847',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.8 : 1,
                marginTop: '4px',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Verifying...' : isLocked ? `Locked — ${formatLockTime(lockRemaining)}` : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#ccc', marginTop: '20px' }}>
          Protected by reCAPTCHA · Petricor Admin
        </p>
      </div>
    </div>
  );
};

export default Login;

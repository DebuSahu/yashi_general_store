import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, Eye, EyeOff, Settings, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import confetti from 'canvas-confetti';
import { getUserFirstName } from '../utils/userHelper';

export function GoogleGLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

// Helper to decode Google JWT ID Token safely
function parseGoogleJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT token:', e);
    return null;
  }
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
  shopSettings,
  theme = 'light'
}) {
  const googleBtnContainerRef = useRef(null);
  const [gisAvailable, setGisAvailable] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  // Built-in Google OAuth Client ID provided by Store Owner
  const DEFAULT_GOOGLE_CLIENT_ID = '59926349381-1t44eucqdpgl1c4d2gghh8qf3coddf5r.apps.googleusercontent.com';

  // Active Google OAuth Client ID
  const [googleClientId, setGoogleClientId] = useState(() => {
    return shopSettings?.googleClientId ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('ygs_google_client_id') ||
      DEFAULT_GOOGLE_CLIENT_ID;
  });

  const [showConfigSetup, setShowConfigSetup] = useState(false);
  const [tempClientIdInput, setTempClientIdInput] = useState('');

  // Admin Verification State (triggered when Google returns an admin email)
  const [pendingAdminUser, setPendingAdminUser] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordEye, setShowPasswordEye] = useState(false);

  // Sync Google Client ID from shopSettings
  useEffect(() => {
    if (shopSettings?.googleClientId && !googleClientId) {
      setGoogleClientId(shopSettings.googleClientId);
    }
  }, [shopSettings]);

  // Initialize Google Identity Services (GIS) when modal opens
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setIsSigningIn(false);
      setPendingAdminUser(null);
      setAdminPassword('');
      return;
    }

    const initGoogleGis = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setGisAvailable(true);

        const activeId = googleClientId.trim();
        if (activeId && activeId.includes('.apps.googleusercontent.com')) {
          try {
            window.google.accounts.id.initialize({
              client_id: activeId,
              callback: handleGisCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true
            });

            // Render Google's official Sign In button
            if (googleBtnContainerRef.current) {
              googleBtnContainerRef.current.innerHTML = '';
              window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
                type: 'standard',
                theme: theme === 'dark' ? 'filled_black' : 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left',
                width: 300
              });
            }

            // Prompt One Tap account chooser on mobile/Chrome
            window.google.accounts.id.prompt();
          } catch (e) {
            console.warn('Google Identity Services init notice:', e.message);
          }
        }
      }
    };

    initGoogleGis();
    const timer = setTimeout(initGoogleGis, 600);
    return () => clearTimeout(timer);
  }, [isOpen, googleClientId, theme]);

  if (!isOpen) return null;

  // Callback when user picks a real Google account from GIS Button or One Tap
  const handleGisCredentialResponse = (response) => {
    if (!response?.credential) {
      setError('No credential received from Google.');
      return;
    }

    const payload = parseGoogleJwt(response.credential);
    if (!payload || !payload.email) {
      setError('Invalid Google token received. Please try again.');
      return;
    }

    handleVerifiedGoogleProfile({
      email: payload.email,
      name: payload.name || payload.given_name || 'Customer',
      avatar: payload.picture || null,
      googleSub: payload.sub,
      verified: true
    });
  };

  // Launch Google OAuth2 Account Selector Popup
  const handleTriggerGoogleOAuth = () => {
    setError('');
    const activeId = googleClientId.trim();

    if (!activeId) {
      setShowConfigSetup(true);
      return;
    }

    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        setIsSigningIn(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: activeId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setIsSigningIn(false);
              setError(`Google Sign-In canceled or failed: ${tokenResponse.error}`);
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                // Fetch verified profile details directly from Google UserInfo endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await res.json();

                if (userInfo?.email) {
                  handleVerifiedGoogleProfile({
                    email: userInfo.email,
                    name: userInfo.name || userInfo.given_name || 'Customer',
                    avatar: userInfo.picture || null,
                    googleSub: userInfo.sub,
                    verified: true
                  });
                } else {
                  setError('Could not retrieve verified email from Google.');
                  setIsSigningIn(false);
                }
              } catch (fetchErr) {
                setError('Failed to fetch user details from Google: ' + fetchErr.message);
                setIsSigningIn(false);
              }
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.warn('OAuth2 popup exception:', err);
      }
    }

    // Fallback to GIS prompt if available
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        setIsSigningIn(false);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError('Google account prompt was dismissed. Please tap the Google button.');
        }
      });
      return;
    }

    setError('Google Identity Service is loading. Please tap again in a moment.');
    setIsSigningIn(false);
  };

  // Process verified account returned by Google
  const handleVerifiedGoogleProfile = async (account, passwordToVerify = '') => {
    setError('');
    const cleanEmail = account.email.trim().toLowerCase();
    const isOwner = cleanEmail === 'debusahu121@gmail.com';
    const isAdmin = isOwner || api.isAuthorizedAdminEmail(cleanEmail);

    // If this verified Google account is Store Owner or Admin, require password
    if (isAdmin && !passwordToVerify) {
      setPendingAdminUser(account);
      setIsSigningIn(false);
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await api.googleLogin({
        email: cleanEmail,
        name: account.name,
        avatar: account.avatar || null,
        phone: account.phone || null,
        adminPassword: passwordToVerify
      });

      if (res && res.requiresAdminPassword) {
        setPendingAdminUser(account);
        setError(res.error || 'Admin verification required: Enter your Admin Password to unlock Admin Portal.');
        setIsSigningIn(false);
        return;
      }

      if (res && res.success) {
        try {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.55 }
          });
        } catch (e) {}

        const userFirstName = getUserFirstName(account);
        onShowToast?.({
          type: 'success',
          title: `Welcome, ${userFirstName}! 🎉`,
          message: res.isAdmin
            ? `Store Owner Verified • Admin Portal unlocked`
            : `Signed in via Google (${cleanEmail})`
        });

        onLoginSuccess(res.user, res.token, res);
        onClose();
      } else {
        setError(res?.error || 'Failed to sign in with Google');
      }
    } catch (err) {
      setError('Connection error: ' + (err?.message || 'unknown error'));
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Admin Password Submission for verified owner account
  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setError('Please enter your Store Admin Password.');
      return;
    }
    if (pendingAdminUser) {
      handleVerifiedGoogleProfile(pendingAdminUser, adminPassword.trim());
    }
  };

  // Save custom Google Client ID
  const handleSaveClientId = (e) => {
    e.preventDefault();
    const trimmed = tempClientIdInput.trim();
    if (!trimmed.includes('.apps.googleusercontent.com')) {
      setError('Please enter a valid Google OAuth Client ID ending with .apps.googleusercontent.com');
      return;
    }
    setGoogleClientId(trimmed);
    localStorage.setItem('ygs_google_client_id', trimmed);
    setShowConfigSetup(false);
    setError('');
    onShowToast?.({
      type: 'success',
      title: 'Google Client ID Saved',
      message: 'Google Identity Services initialized for this domain!'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200 transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GoogleGLogo className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                Sign in with Google
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Continue directly to <strong>Yashi General Store</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Real Google Authentication • Select your account to sign in</span>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STATE 1: PENDING ADMIN PASSWORD (User picked an admin Google account, must verify password) */}
          {pendingAdminUser ? (
            <form onSubmit={handleAdminPasswordSubmit} className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-purple-900 dark:text-purple-300">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Store Owner Account Detected</span>
                </div>
                
                <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-purple-900">
                  {pendingAdminUser.avatar ? (
                    <img src={pendingAdminUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                      {pendingAdminUser.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{pendingAdminUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{pendingAdminUser.email}</p>
                  </div>
                </div>

                <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-tight">
                  Enter your Store Admin Password to verify ownership and unlock the Admin Portal:
                </p>

                <div className="relative">
                  <input
                    type={showPasswordEye ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="Enter Store Admin Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordEye(!showPasswordEye)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPasswordEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingAdminUser(null);
                    setAdminPassword('');
                    setError('');
                  }}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigningIn || !adminPassword.trim()}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSigningIn ? 'Verifying...' : 'Unlock Admin Portal'}</span>
                </button>
              </div>
            </form>
          ) : showConfigSetup ? (
            /* STATE 2: GOOGLE CLIENT ID SETUP (For store owner to connect Google Cloud project) */
            <form onSubmit={handleSaveClientId} className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Connect Real Google Identity Services</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  To show your mobile phone's Google accounts via real Google Identity Services on <strong>debusahu.github.io</strong>, enter your Google Cloud Web OAuth Client ID:
                </p>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789-xxx.apps.googleusercontent.com"
                  value={tempClientIdInput}
                  onChange={(e) => setTempClientIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <p>1. Open Google Cloud Console &gt; Credentials</p>
                  <p>2. Create OAuth Client ID (Web Application)</p>
                  <p>3. Authorized origin: <code>https://debusahu.github.io</code></p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigSetup(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Save & Enable Real Google
                </button>
              </div>
            </form>
          ) : (
            /* STATE 3: PRIMARY GOOGLE SIGN-IN INTERFACE */
            <div className="space-y-4">
              
              <div className="text-center py-2 space-y-1">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                  <GoogleGLogo className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                  1-Tap Google Account Login
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Google will securely display your phone or Chrome Google accounts and fetch your profile details.
                </p>
              </div>

              {/* Official Google GIS Button Container (rendered directly by Google SDK) */}
              <div className="flex flex-col items-center justify-center min-h-[44px]">
                <div ref={googleBtnContainerRef} className="flex justify-center w-full"></div>
                
                {/* Primary Interactive Button */}
                <button
                  type="button"
                  onClick={handleTriggerGoogleOAuth}
                  disabled={isSigningIn}
                  className="w-full mt-2 py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-black text-xs sm:text-sm rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-sm flex items-center justify-center gap-3 transition active:scale-98 disabled:opacity-50"
                >
                  <GoogleGLogo className="w-5 h-5 shrink-0" />
                  <span>{isSigningIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                </button>
              </div>

              {/* Verified Features */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real Google verification — no fake accounts accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Auto-fetches your verified name & profile photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>No password needed for customers</span>
                </div>
              </div>

              {/* Google Client ID config trigger for Store Owner */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfigSetup(true)}
                  className="text-[11px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold inline-flex items-center gap-1 transition"
                >
                  <Settings className="w-3 h-3" />
                  <span>Store Owner: Google Client ID Settings</span>
                </button>
              </div>

            </div>
          )}

          {/* Privacy statement */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 text-center leading-normal">
            By continuing, Google shares your verified name, email address, and profile photo with Yashi General Store in accordance with Google's Privacy Policy.
          </div>

        </div>

      </div>
    </div>
  );
}

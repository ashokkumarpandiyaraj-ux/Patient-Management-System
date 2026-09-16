import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  HeartPulse, Shield, UserCheck, Lock, Mail, User, Stethoscope, 
  ArrowRight, Sparkles, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { UserProfile } from '../../types';

export const AuthPage: React.FC = () => {
  const { login, signUp, demoLogin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [email, setEmail] = useState('dr.jenkins@caretrack.hospital.org');
  const [password, setPassword] = useState('Hospital@2025');

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserProfile['role']>('Physician');

  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      showToast('success', 'Welcome back', 'Successfully authenticated into CareTrack.');
    } else {
      setFormError(res.error || 'Authentication failed. Please verify credentials.');
      showToast('error', 'Login Failed', res.error || 'Unable to log in');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!signUpName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    if (!signUpEmail.trim()) {
      setFormError('Email address is required.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await signUp(signUpEmail, signUpPassword, signUpName, signUpRole);
    if (res.success) {
      showToast('success', 'Account Registered', `Welcome to CareTrack, ${signUpName}.`);
    } else {
      setFormError(res.error || 'Registration failed.');
      showToast('error', 'Sign Up Failed', res.error || 'Registration error');
    }
  };

  const handleDemoLogin = async (role: 'Physician' | 'Administrator' | 'Nurse') => {
    setFormError(null);
    await demoLogin(role);
    showToast('success', 'Demo Login Successful', `Logged in as ${role} for evaluation.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        {/* Left Side: Medical Branding & College Activity Info (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-teal-900/90 via-teal-950 to-slate-900 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block">
                  CareTrack
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-teal-300 uppercase">
                  Patient Management System
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                Mini Web Application – CRUD Activity
              </div>

              <h2 className="text-2xl font-bold text-white leading-tight">
                Secure clinical data management for modern healthcare.
              </h2>

              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                Comprehensive patient enrollment, appointment scheduling, and full CRUD operations with Supabase relational database integration.
              </p>
            </div>

            {/* Feature points */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Full CRUD for Patients &amp; Appointments</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Protected routes with Supabase Authentication</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Relational PostgreSQL tables with Foreign Keys</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400">
            CareTrack Medical Portal • College Activity Demonstration Edition
          </div>
        </div>

        {/* Right Side: Auth Form & Fast Evaluator Logins (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white text-slate-900 flex flex-col justify-between">
          <div>
            {/* Quick Mode Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setFormError(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                Role Protected
              </span>
            </div>

            {/* Evaluator Fast Login Bar */}
            <div className="mt-5 p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" /> Fast Demo Access (1-Click)
                </span>
                <span className="text-[10px] text-teal-700 font-medium">No signup needed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Physician')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-100/80 border border-teal-200 rounded-xl transition-all shadow-2xs text-left cursor-pointer"
                >
                  <span className="block font-bold text-slate-900">Dr. Sarah Jenkins</span>
                  <span className="text-[10px] text-teal-600 block">Lead Physician</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Administrator')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-100/80 border border-teal-200 rounded-xl transition-all shadow-2xs text-left cursor-pointer"
                >
                  <span className="block font-bold text-slate-900">Alex Morgan</span>
                  <span className="text-[10px] text-blue-600 block">Hospital Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Nurse')}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-100/80 border border-teal-200 rounded-xl transition-all shadow-2xs text-left cursor-pointer"
                >
                  <span className="block font-bold text-slate-900">Chloe Bennett</span>
                  <span className="text-[10px] text-emerald-600 block">Staff Nurse, RN</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      id="login-email-input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="physician@caretrack.hospital.org"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password-input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-login-btn"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name &amp; Title
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      id="signup-name-input"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      placeholder="e.g. Dr. Robert Martinez, MD"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hospital Role
                  </label>
                  <select
                    id="signup-role-input"
                    value={signUpRole}
                    onChange={e => setSignUpRole(e.target.value as UserProfile['role'])}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Physician">Physician / Medical Doctor</option>
                    <option value="Administrator">Healthcare Administrator</option>
                    <option value="Nurse">Registered Nurse (RN)</option>
                    <option value="Staff">Clinic Medical Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      id="signup-email-input"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="name@hospital.org"
                      className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="signup-password-input"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    id="submit-signup-btn"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Register &amp; Access Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>HIPAA-Compliant Interface Prototype</span>
            <span>CRUD Evaluation System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

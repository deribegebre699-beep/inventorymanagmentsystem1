import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import LoadingButton from '../components/common/LoadingButton';

enum Step {
  Email,
  Otp,
  Reset
}

const ForgotPasswordFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(Step.Email);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/Auth/forgot-password', { email });
      setMessage('We have sent a 6-digit OTP to your email.');
      setStep(Step.Otp);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please check your email.';
      const tech = err.response?.data?.technicalError;
      setError(tech ? `${msg} (${tech})` : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/Auth/verify-otp', { email, code: otp });
      setMessage(''); // clear any previous success message before showing reset form
      setStep(Step.Reset);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/Auth/reset-password', { email, code: otp, newPassword });
      setResetDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60 animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl shadow-indigo-100 mb-6 group transition-transform hover:scale-105 duration-300">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recover Password</h1>
          <p className="text-slate-500 mt-2 font-medium">Follow the steps to reset your account access</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-8 border border-white">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {message && step !== Step.Reset && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}

          {step === Step.Email && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 ml-1 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <LoadingButton
                type="submit"
                loading={loading}
              >
                Send OTP
              </LoadingButton>
            </form>
          )}

          {step === Step.Otp && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 ml-1 mb-2">6-Digit Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold tracking-[0.5em] text-center"
                    placeholder="000000"
                  />
                </div>
                 <p className="text-xs text-slate-400 mt-2 px-1">Check your inbox for the verification code.</p>
              </div>
              <LoadingButton
                type="submit"
                loading={loading}
              >
                Verify OTP
              </LoadingButton>
              <button 
                type="button" 
                onClick={() => setStep(Step.Email)}
                className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === Step.Reset && (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              {resetDone ? (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center gap-3 text-emerald-600 text-center">
                  <CheckCircle2 className="w-10 h-10" />
                  <p className="text-base font-bold">Password reset successfully!</p>
                  <p className="text-sm text-emerald-500">Redirecting you to login...</p>
                </div>
              ) : (
                <>
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> OTP verified! Set your new password below.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 ml-1 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium pr-12"
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 ml-1 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium pr-12"
                        placeholder="••••••••"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                  >
                    Change Password
                  </LoadingButton>
                </>
              )}
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordFlow;

import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Church,
  Lock,
  Phone,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, registerChurchAccount, showToast } = useChurch();
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('01000000001');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Church form state
  const [regName, setRegName] = useState('');
  const [regRegion, setRegRegion] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginPhone.trim() || !loginPassword.trim()) {
      setLoginError('يرجى كتابة رقم الموبايل وكلمة السر');
      return;
    }

    setIsSubmitting(true);
    const success = await login(loginPhone.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (!success) {
      setLoginError('رقم الموبايل أو كلمة السر غير صحيحة. يرجى التأكد وإعادة المحاولة.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('يرجى كتابة اسم الكنيسة');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('يرجى كتابة رقم الموبايل لتسجيل الدخول');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setRegError('كلمة السر يجب أن تكون من 4 خانات على الأقل');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('كلمة السر وتأكيدها غير متطابقين');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerChurchAccount({
        name: regName.trim(),
        region: regRegion.trim() || 'عام',
        address: regAddress.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim(),
        adminName: regAdminName.trim() || 'أبونا المسؤول'
      });
    } catch (err: any) {
      setRegError(err.message || 'حدث خطأ أثناء تسجيل الكنيسة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-100 font-sans select-none"
      dir="rtl"
    >
      {/* Background glow elements */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-6 sm:p-8 z-10">
        {/* App Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 text-3xl mb-4">
            ⛪
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            نظام كنيستي لإدارة الخدمات
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            منظومة كنسية متكاملة تضمن عزل تام للبيانات وصلاحيات دقيقة للخدام والكهنة
          </p>
        </div>

        {/* Tab switcher: Login / Register Church */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setActiveMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل دخول الكنيسة أو الخادم
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('register');
              setRegError('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeMode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل كنيسة جديدة
          </button>
        </div>

        {/* Mode 1: Login Form */}
        {activeMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رقم الموبايل المسجل
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: 01000000001"
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                كلمة السر
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'جاري التحقق...' : 'دخول إلى حساب الكنيسة'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode 2: Register Church Form */}
        {activeMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            {regError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                اسم الكنيسة <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Church className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: كنيسة الشهيد العظيم مارمينا"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  الإيبارشية أو المحافظة
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="مثال: القاهرة / شبرا"
                    value={regRegion}
                    onChange={e => setRegRegion(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  اسم المسؤول أو الأب الكاهن
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="مثال: القمص أنطونيوس"
                    value={regAdminName}
                    onChange={e => setRegAdminName(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                رقم الموبايل لتسجيل الدخول <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="مثال: 01234567890"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                سيكون هذا الرقم هو المعرف الأساسي لتسجيل دخول كنيستك في أي وقت.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  كلمة السر <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="كلمة السر"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  تأكيد كلمة السر <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="أعد كتابتها"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none text-right transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                ستحصل كنيستك على قاعدة بيانات نظيفة وخاصة بها مع عزل تام عن أي كنيسة أخرى، ويمكنك بعدها إضافة الخدمات وحسابات الخدام بكل سهولة.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-1 cursor-pointer"
            >
              <span>{isSubmitting ? 'جاري إنشاء حساب الكنيسة...' : 'إنشاء حساب الكنيسة والبدء فوراً'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span>🔒 بيانات مشفرة ومؤمنة</span>
        <span>•</span>
        <span>⛪ عزل تام لكل كنيسة</span>
        <span>•</span>
        <span>📱 متاح على جميع الأجهزة</span>
      </div>
    </div>
  );
};

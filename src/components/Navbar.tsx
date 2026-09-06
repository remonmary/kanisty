import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Menu,
  ChevronDown,
  Plus,
  Clock,
  HeartHandshake,
  LogOut,
  Shield,
  User,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { ROLE_BADGES } from '../utils/churchUtils';

export const Navbar: React.FC<{
  onOpenSidebar?: () => void;
  onOpenAddPerson?: () => void;
  onOpenAddChurch?: () => void;
}> = ({ onOpenSidebar, onOpenAddPerson, onOpenAddChurch }) => {
  const {
    activeChurch,
    currentUser,
    currentAccount,
    logout,
    data,
    setIsSearchOpen,
    effectiveOverallRole,
    setActiveTab,
    canAccessTab,
    openLogVisitModal
  } = useChurch();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifications = data.notifications.filter(n => !n.isRead);

  const displayUserName = currentAccount?.name || currentUser?.name || 'مسؤول الكنيسة';
  const displayRoleTitle = currentAccount?.roleTitle || (ROLE_BADGES[effectiveOverallRole]?.label || 'مسؤول');
  const userPhone = currentAccount?.phone || 'غير مسجل';

  const userAssignedServices = (currentAccount?.serviceIds || [])
    .map(id => data.services.find(s => s.id === id)?.name)
    .filter(Boolean);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-30 select-none">
      {/* Search Bar matching theme */}
      <div className="flex items-center gap-3">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            title="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center bg-slate-100 px-4 py-2 rounded-lg w-64 sm:w-80 md:w-96 border border-slate-200 cursor-pointer hover:bg-slate-200/60 transition-colors"
        >
          <span className="text-slate-400 ml-2 select-none">🔍</span>
          <input
            type="text"
            readOnly
            placeholder="ابحث عن مخدوم، خادم، أو كود..."
            className="bg-transparent border-none outline-none text-sm w-full text-right cursor-pointer text-slate-700 placeholder:text-slate-400"
          />
          <kbd className="hidden md:inline-block font-mono text-[10px] bg-white border border-slate-300 text-slate-500 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Left side actions and Church Switcher */}
      <div className="flex items-center space-x-3 space-x-reverse">
        {/* Quick Action: Record attendance */}
        <button
          onClick={() => setActiveTab('attendance')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>تسجيل حضور</span>
        </button>

        {/* Quick Action: Log visit */}
        <button
          onClick={() => openLogVisitModal()}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>افتقاد جديد</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <div
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full cursor-pointer transition-colors"
            title="الإشعارات"
          >
            🔔
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>

          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    التنبيهات والإشعارات ({unreadNotifications.length})
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('announcements');
                      setIsNotificationsOpen(false);
                    }}
                    className="text-[11px] text-amber-600 font-semibold hover:underline"
                  >
                    لوحة الإعلانات
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {data.notifications.slice(0, 5).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.linkTab) setActiveTab(notif.linkTab);
                        setIsNotificationsOpen(false);
                      }}
                      className="p-3 text-right hover:bg-slate-50 cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

        {/* Active Church Identity (Strictly Isolated - No Cross-Church Leaking) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-bold shadow-2xs shrink-0">
            ⛪
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px]" title={activeChurch?.name}>
              {activeChurch?.name || 'كنيستي'}
            </span>
            <span className="text-[10px] text-amber-700 font-medium truncate max-w-[180px]">
              {activeChurch?.region || 'إدارة الكنيسة'}
            </span>
          </div>
        </div>

        {/* Authenticated User Profile & Security Popup */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            title="ملف الحساب الحالي والصلاحيات"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
              {displayUserName.slice(0, 1)}
            </div>
            <div className="flex flex-col text-right hidden md:flex">
              <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {displayUserName}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {displayRoleTitle}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                ROLE_BADGES[effectiveOverallRole]?.bg || 'bg-slate-100 text-slate-700'
              }`}
            >
              {ROLE_BADGES[effectiveOverallRole]?.label || displayRoleTitle}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 px-4 z-50 animate-fade-in text-right">
                {/* Profile Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {displayUserName.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {displayUserName}
                    </h4>
                    <p className="text-xs text-amber-800 font-semibold truncate">
                      {displayRoleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {userPhone}
                    </p>
                  </div>
                </div>

                {/* Account Details & Context */}
                <div className="py-2.5 space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>الكنيسة الحالية:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[170px]">{activeChurch?.name}</span>
                    </div>
                    {userAssignedServices.length > 0 && (
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                        <span>الخدمات المسؤولة:</span>
                        <span className="font-medium text-amber-800 truncate max-w-[170px]">
                          {userAssignedServices.join('، ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                    <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>
                      الحساب مؤمن بكلمة سر. للتبديل لحساب كاهن أو خادم آخر، يجب تسجيل الخروج والدخول ببيانات الحساب الآخر.
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  {canAccessTab('accounts') && (
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setActiveTab('accounts');
                      }}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>إدارة حسابات وصلاحيات الخدام</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج من الحساب</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Direct Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

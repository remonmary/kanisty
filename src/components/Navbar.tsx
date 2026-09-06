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
  User
} from 'lucide-react';
import { ROLE_BADGES } from '../utils/churchUtils';

export const Navbar: React.FC<{
  onOpenSidebar?: () => void;
  onOpenAddPerson?: () => void;
  onOpenAddChurch?: () => void;
}> = ({ onOpenSidebar, onOpenAddPerson, onOpenAddChurch }) => {
  const {
    churches,
    activeChurch,
    setActiveChurchId,
    currentUser,
    setCurrentUserId,
    currentAccount,
    accounts,
    setCurrentAccount,
    logout,
    data,
    setIsSearchOpen,
    effectiveOverallRole,
    setActiveTab,
    openLogVisitModal
  } = useChurch();

  const [isChurchDropdownOpen, setIsChurchDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadNotifications = data.notifications.filter(n => !n.isRead);

  const displayUserName = currentAccount?.name || currentUser?.name || 'مسؤول الكنيسة';
  const displayRoleTitle = currentAccount?.roleTitle || (ROLE_BADGES[effectiveOverallRole]?.label || 'مسؤول');

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

        {/* Church Name & Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsChurchDropdownOpen(!isChurchDropdownOpen)}
            className="flex flex-col items-start text-right hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800 truncate max-w-[170px]">
                {activeChurch?.name || 'كنيسة الشهيد مارجرجس'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-400">
              {activeChurch?.region || 'المنطقة التعليمية - الجيزة'}
            </span>
          </button>

          {isChurchDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsChurchDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">
                    الكنائس المتاحة (عزل تام للبيانات)
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {churches.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChurchId(c.id);
                        setIsChurchDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-right flex items-center justify-between transition-colors ${
                        c.id === activeChurch?.id
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold leading-tight">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.region}</p>
                      </div>
                      {c.id === activeChurch?.id && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          الحالية
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {onOpenAddChurch && (
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsChurchDropdownOpen(false);
                        onOpenAddChurch();
                      }}
                      className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>تسجيل كنيسة جديدة</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Account & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            title="تبديل الحساب أو الصلاحيات"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                ROLE_BADGES[effectiveOverallRole]?.bg || 'bg-slate-100 text-slate-700'
              }`}
            >
              {displayRoleTitle}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700">الحساب الحالي والصلاحيات</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    الاسم: {displayUserName}
                  </p>
                </div>

                {accounts.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      تبديل سريع لحسابات الخدام والكهنة بالكنيسة:
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setCurrentAccount(acc);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-right flex items-center justify-between text-xs transition-colors ${
                            acc.id === currentAccount?.id
                              ? 'bg-amber-50 text-amber-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{acc.name}</div>
                            <span className="text-[10px] text-slate-400">{acc.phone}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {acc.roleTitle || (acc.role === 'priest' ? 'كاهن' : acc.role === 'leader' ? 'أمين خدمة' : 'خادم')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      setActiveTab('accounts');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1.5 mb-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>إدارة صلاحيات جميع الخدام</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      logout();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج من الكنيسة</span>
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

import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Menu,
  ChevronDown,
  Plus,
  Clock,
  HeartHandshake
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

  // Profiles for simulation
  const keyProfiles = data.persons.filter(p =>
    p.code?.startsWith('PR') ||
    p.code?.startsWith('LD') ||
    p.code?.startsWith('SR') ||
    p.code === 'MN-1042'
  );

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

        {/* Role simulation badge */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="تبديل محاكاة الصلاحيات"
          >
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                ROLE_BADGES[effectiveOverallRole]?.bg || 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {ROLE_BADGES[effectiveOverallRole]?.label || 'مستخدم'}
            </span>
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3.5 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-600">محاكاة الصلاحيات</p>
                  <p className="text-[10px] text-slate-400">اختر حساباً لمعاينة الواجهة:</p>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {keyProfiles.map(person => (
                    <button
                      key={person.id}
                      onClick={() => {
                        setCurrentUserId(person.id);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-right flex items-center justify-between text-xs ${
                        person.id === currentUser?.id
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{person.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {person.code?.startsWith('PR') ? 'كاهن' : person.code?.startsWith('LD') ? 'أمين خدمة' : 'خادم'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Home,
  Users,
  Layers,
  CalendarCheck,
  PhoneCall,
  BookOpen,
  CheckSquare,
  Cake,
  BarChart3,
  Settings,
  Library,
  Calendar,
  Megaphone,
  Archive,
  ChevronLeft,
  HeartHandshake,
  Shield,
  LogOut
} from 'lucide-react';
import { ROLE_BADGES } from '../utils/churchUtils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenAddChurch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose, onOpenAddChurch }) => {
  const {
    activeTab,
    setActiveTab,
    data,
    activeChurch,
    currentUser,
    currentAccount,
    effectiveOverallRole,
    canAccessTab,
    logout
  } = useChurch();

  // Calculate badges
  const pendingTasks = data.tasks.filter(t => t.status !== 'completed').length;
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const birthdaysTodayCount = data.persons.filter(p => {
    if (!p.birthDate) return false;
    const parts = p.birthDate.split('-');
    return parseInt(parts[1], 10) - 1 === currentMonth && parseInt(parts[2], 10) === currentDay;
  }).length;

  const urgentAttendanceAlerts = data.persons.filter(p => {
    if (p.status === 'archived') return false;
    const personAttendance = data.attendance.filter(a => a.personId === p.id);
    const sorted = [...personAttendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, 3);
    return recent.length >= 3 && recent.every(r => r.status === 'absent');
  }).length;

  const allNavSections = [
    {
      group: 'الرئيسية',
      items: [
        { id: 'dashboard', label: 'الرئيسية', icon: Home, emoji: '🏠' }
      ]
    },
    {
      group: 'إدارة الخدمة',
      items: [
        { id: 'persons', label: 'الأشخاص والمخدومين', icon: Users, emoji: '👥' },
        { id: 'services', label: 'الخدمات والاجتماعات', icon: Layers, emoji: '⛪' },
        {
          id: 'attendance',
          label: 'الحضور والغياب',
          icon: CalendarCheck,
          emoji: '🗓️',
          badge: urgentAttendanceAlerts > 0 ? `${urgentAttendanceAlerts} غائب` : undefined,
          badgeColor: 'bg-red-500/20 text-red-400'
        },
        { id: 'visitation', label: 'الافتقاد والمتابعة', icon: PhoneCall, emoji: '📞' },
        { id: 'preparation', label: 'التحضير والدروس', icon: BookOpen, emoji: '📚' },
        { id: 'library', label: 'مكتبة الخدمة', icon: Library, emoji: '📖' }
      ]
    },
    {
      group: 'الأدوات',
      items: [
        {
          id: 'tasks',
          label: 'المهام والتكليفات',
          icon: CheckSquare,
          emoji: '🎯',
          badge: pendingTasks > 0 ? `${pendingTasks}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400'
        },
        {
          id: 'birthdays',
          label: 'أعياد الميلاد',
          icon: Cake,
          emoji: '🎂',
          badge: birthdaysTodayCount > 0 ? `${birthdaysTodayCount} اليوم` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400'
        },
        { id: 'calendar', label: 'التقويم الكنسي', icon: Calendar, emoji: '📅' },
        { id: 'announcements', label: 'لوحة الإعلانات', icon: Megaphone, emoji: '📢' }
      ]
    },
    {
      group: 'النظام والتقارير',
      items: [
        { id: 'reports', label: 'التقارير والتصدير', icon: BarChart3, emoji: '📊' },
        { id: 'archive', label: 'الأرشيف', icon: Archive, emoji: '🗄️' },
        { id: 'accounts', label: 'حسابات وصلاحيات الخدام', icon: Shield, emoji: '🛡️' },
        { id: 'settings', label: 'الإعدادات وتصفير البيانات', icon: Settings, emoji: '⚙️' }
      ]
    }
  ];

  // Filter sections by access permissions
  const navSections = allNavSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(it => canAccessTab(it.id))
    }))
    .filter(sec => sec.items.length > 0);

  const displayUserName = currentAccount?.name || currentUser?.name || 'مسؤول الكنيسة';
  const displayRoleTitle = currentAccount?.roleTitle || (ROLE_BADGES[effectiveOverallRole]?.label || 'مسؤول');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar (Professional Polish Theme) */}
      <aside
        id="app-sidebar"
        className={`w-64 bg-slate-900 text-slate-300 flex flex-col border-l border-slate-800 transition-transform duration-200 ease-in-out shrink-0 select-none z-50 lg:static fixed inset-y-0 right-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-xs">
              ⛪
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-tight truncate max-w-[130px]" title={activeChurch?.name || 'نظام كنيستي'}>
                {activeChurch?.name || 'نظام كنيستي'}
              </span>
              <span className="text-xs text-amber-400/90 font-medium truncate max-w-[130px]">
                {activeChurch?.region || 'إدارة الكنيسة'}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
              title="إغلاق"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation list with uppercase grouped categories */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 text-sm custom-scrollbar">
          {navSections.map(sec => (
            <div key={sec.group} className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 px-3 py-1 uppercase tracking-wider">
                {sec.group}
              </div>
              <div className="space-y-0.5">
                {sec.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onClose && window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-sm transition-colors text-right ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-500 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="ml-3 text-base leading-none">{item.emoji}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 ml-2.5 flex items-center justify-center font-bold text-xs">
              {displayUserName.slice(0, 1)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate max-w-[110px]" title={displayUserName}>
                {displayUserName}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                {displayRoleTitle}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};


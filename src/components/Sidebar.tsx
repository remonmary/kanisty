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
  HeartHandshake
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
    effectiveOverallRole
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

  const navSections = [
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
        { id: 'settings', label: 'الإعدادات والنسخ', icon: Settings, emoji: '⚙️' }
      ]
    }
  ];

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
              <span className="text-white font-bold text-lg leading-tight">نظام كنيستي</span>
              <span className="text-xs text-slate-500">إدارة الكنيسة المركزية</span>
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

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-700 ml-3 flex items-center justify-center font-bold text-white text-xs overflow-hidden border border-slate-600">
              {currentUser?.photo ? (
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{currentUser?.name?.slice(0, 1) || '👤'}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white uppercase leading-tight truncate max-w-[110px]">
                {currentUser?.name || 'أبونا مرقس'}
              </span>
              <span className="text-[10px] text-slate-500">
                {ROLE_BADGES[effectiveOverallRole]?.label || 'مسؤول الكنيسة'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            <HeartHandshake className="w-3 h-3 text-emerald-400" />
            <span>معزول</span>
          </div>
        </div>
      </aside>
    </>
  );
};

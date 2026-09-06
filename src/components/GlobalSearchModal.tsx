import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Search, X, User, Phone, Calendar, ArrowRight, Shield, Award } from 'lucide-react';
import { getPersonAttendanceStats, ROLE_BADGES } from '../utils/churchUtils';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    data,
    setSelectedPersonForProfile,
    openLogVisitModal
  } = useChurch();

  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTerm('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    return data.persons
      .filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.stage?.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [term, data.persons]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="ابحث بالاسم، كود المخدوم (مثل MN-1042)، أو رقم الهاتف..."
            className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
          />
          {term && (
            <button
              onClick={() => setTerm('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            ESC للإغلاق
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-3">
          {term.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600">البحث الشامل في قاعدة بيانات الكنيسة</p>
              <p className="text-[11px] mt-1 text-slate-400">
                يمكنك كتابة «مينا»، «مارك»، «إعدادي»، أو كود مثل «1042»
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              <p className="font-semibold text-slate-600">لا توجد نتائج مطابقة لـ «{term}»</p>
              <p className="text-[11px] mt-1 text-slate-400">تأكد من كتابة الاسم أو الكود بشكل صحيح</p>
            </div>
          ) : (
            searchResults.map(person => {
              // Person's memberships
              const personMemberships = data.memberships.filter(m => m.personId === person.id && m.isActive);
              const stats = getPersonAttendanceStats(person.id, data.attendance);
              const lastAtt = stats.records[0];

              // Last visitation
              const personVisits = data.visitations
                .filter(v => v.personId === person.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const lastVisit = personVisits[0];

              // Assigned servant
              const memWithServant = personMemberships.find(m => m.assignedServantId);
              let servantName = '';
              if (memWithServant?.assignedServantId) {
                const s = data.persons.find(p => p.id === memWithServant.assignedServantId);
                if (s) servantName = s.name;
              }

              return (
                <div
                  key={person.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-400/60 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {person.photo ? (
                          <img
                            src={person.photo}
                            alt={person.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-base">
                            {person.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {person.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {person.code || 'MN-00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {person.phone}
                          </span>
                          <span>•</span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-sm text-[11px]">
                            {person.stage}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPersonForProfile(person);
                        setIsSearchOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shrink-0"
                    >
                      الملف الشامل
                    </button>
                  </div>

                  {/* Section 26 details breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Services & Roles */}
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-semibold block">الخدمات والأدوار</span>
                      <div className="mt-1 space-y-0.5">
                        {personMemberships.length > 0 ? (
                          personMemberships.map(m => {
                            const srv = data.services.find(s => s.id === m.serviceId);
                            return (
                              <div key={m.id} className="text-[11px] flex items-center gap-1">
                                <span className="font-semibold text-slate-800">{srv?.name || 'خدمة'}:</span>
                                <span className="text-slate-600">{ROLE_BADGES[m.role]?.label || m.role}</span>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[11px] text-slate-400">غير مسجل بخدمة</span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Servant */}
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-semibold block">الخادم المسؤول</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        {servantName || 'غير محدد'}
                      </p>
                    </div>

                    {/* Last Attendance & Rate */}
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-semibold block">نسبة وآخر حضور</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {stats.total > 0 ? `${stats.rate}%` : 'لا سجلات'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {lastAtt ? lastAtt.date : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Last Visit */}
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-semibold block">آخر افتقاد</span>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {lastVisit ? lastVisit.date : 'لم يفتقد بعد'}
                        </span>
                        <button
                          onClick={() => {
                            openLogVisitModal(person);
                            setIsSearchOpen(false);
                          }}
                          className="text-[10px] text-amber-700 font-bold hover:underline"
                        >
                          افتقد
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

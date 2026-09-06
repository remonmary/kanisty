import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  PhoneCall,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Plus,
  MessageCircle,
  Phone,
  Home,
  User,
  ArrowRight
} from 'lucide-react';
import { getSmartFollowUpAlerts, SmartAlert } from '../utils/churchUtils';

export const VisitationView: React.FC = () => {
  const {
    data,
    activeSubTab,
    setActiveSubTab,
    openLogVisitModal,
    setSelectedPersonForProfile
  } = useChurch();

  const currentTab = activeSubTab === 'log' ? 'log' : activeSubTab === 'urgent' ? 'urgent' : 'monitor';
  const [filterType, setFilterType] = useState<string>(activeSubTab === 'urgent' ? 'urgent' : 'all');

  const alerts = useMemo(() => {
    return getSmartFollowUpAlerts(
      data.persons,
      data.attendance,
      data.visitations,
      data.memberships,
      data.persons
    );
  }, [data]);

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    if (filterType === 'urgent') return alerts.filter(a => a.type === 'absent_3_streak' || a.type === 'not_visited_30_days');
    if (filterType === 'absent_3_streak') return alerts.filter(a => a.type === 'absent_3_streak');
    if (filterType === 'not_visited_30_days') return alerts.filter(a => a.type === 'not_visited_30_days');
    if (filterType === 'low_attendance') return alerts.filter(a => a.type === 'low_attendance');
    if (filterType === 'recently_visited') return alerts.filter(a => a.type === 'recently_visited');
    return alerts;
  }, [alerts, filterType]);

  const absentStreakCount = alerts.filter(a => a.type === 'absent_3_streak').length;
  const notVisitedCount = alerts.filter(a => a.type === 'not_visited_30_days').length;
  const lowAttendanceCount = alerts.filter(a => a.type === 'low_attendance').length;
  const recentVisitedCount = alerts.filter(a => a.type === 'recently_visited').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>نظام الافتقاد والمتابعة الذكية</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {alerts.length} حالة مسجلة
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد تلقائي للغياب المتصل والانقطاع، ومتابعة الافتقاد لكل خادم ومخدوم
          </p>
        </div>

        {/* Header Action & Subtabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('monitor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'monitor' || currentTab === 'urgent'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            المتابعة الذكية
          </button>
          <button
            onClick={() => setActiveSubTab('log')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              currentTab === 'log'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            سجل الافتقاد ({data.visitations.length})
          </button>
          <button
            onClick={() => openLogVisitModal()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>توثيق افتقاد</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SMART MONITOR (Sections 14 & 15) */}
      {(currentTab === 'monitor' || currentTab === 'urgent') && (
        <div className="space-y-4">
          {/* 4 Smart Rule Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Condition 1: Absent 3 consecutive */}
            <div
              onClick={() => setFilterType('absent_3_streak')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterType === 'absent_3_streak'
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-700">🔴 غياب 3 أسابيع</span>
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-xs">
                  {absentStreakCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">انقطاع 3 اجتماعات متتالية</p>
            </div>

            {/* Condition 2: Not visited in 30 days */}
            <div
              onClick={() => setFilterType('not_visited_30_days')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterType === 'not_visited_30_days'
                  ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-orange-700">🟠 لم يفتقد 30 يوماً</span>
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center text-xs">
                  {notVisitedCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">بحاجة لزيارة أو اتصال اطمئنان</p>
            </div>

            {/* Condition 3: Attendance < 70% */}
            <div
              onClick={() => setFilterType('low_attendance')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterType === 'low_attendance'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-amber-700">🟡 نسبة حضور &lt; 70%</span>
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  {lowAttendanceCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">تذبذب وعدم انتظام في الحضور</p>
            </div>

            {/* Condition 4: Recently visited */}
            <div
              onClick={() => setFilterType('recently_visited')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterType === 'recently_visited'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-700">🟢 مفتقد حديثاً</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {recentVisitedCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">تم التواصل معه خلال 14 يوماً</p>
            </div>
          </div>

          {/* Quick Filter Reset Button */}
          {filterType !== 'all' && (
            <div className="flex items-center justify-between bg-slate-100 px-4 py-2 rounded-xl text-xs">
              <span className="font-bold text-slate-700">
                تصفية حسب: {filterType === 'absent_3_streak' ? 'غياب 3 أسابيع' : filterType === 'not_visited_30_days' ? 'لم يفتقد منذ 30 يوماً' : filterType === 'low_attendance' ? 'حضور منخفض' : 'مفتقد حديثاً'}
              </span>
              <button
                onClick={() => setFilterType('all')}
                className="text-amber-700 font-bold hover:underline"
              >
                عرض كل الحالات ({alerts.length})
              </button>
            </div>
          )}

          {/* Alerts Cards List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                لا توجد حالات مطابقة لمعايير هذا الفلتر
              </div>
            ) : (
              filteredAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border bg-white shadow-2xs transition-all space-y-3 hover:shadow-md ${
                    alert.type === 'absent_3_streak'
                      ? 'border-rose-200 hover:border-rose-300'
                      : alert.type === 'not_visited_30_days'
                      ? 'border-orange-200 hover:border-orange-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {alert.person.photo ? (
                          <img
                            src={alert.person.photo}
                            alt={alert.person.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-base">
                            {alert.person.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => setSelectedPersonForProfile(alert.person)}
                            className="text-sm font-extrabold text-slate-900 hover:text-amber-700 cursor-pointer"
                          >
                            {alert.person.name}
                          </h4>
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {alert.person.code}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${alert.badgeBg}`}>
                            {alert.badgeText}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {alert.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {alert.person.phone && (
                        <a
                          href={`tel:${alert.person.phone}`}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="اتصال"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {alert.person.phone && (
                        <a
                          href={`https://wa.me/2${alert.person.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="واتساب"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openLogVisitModal(alert.person)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>افتقد الآن</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer details row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center gap-4">
                      <span>الخادم المسؤول: <strong className="text-slate-800">{alert.assignedServantName || 'غير محدد'}</strong></span>
                      <span>•</span>
                      <span>نسبة الحضور: <strong className="text-slate-800">{alert.attendanceRate}%</strong></span>
                    </div>
                    <div>
                      <span>آخر افتقاد: <strong className="text-slate-800">{alert.lastVisitDate || 'لم يفتقد بعد'}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VISITATION LOG (Section 13) */}
      {currentTab === 'log' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">التاريخ</th>
                    <th className="py-3.5 px-3">المخدوم</th>
                    <th className="py-3.5 px-3">الخادم المفتقد</th>
                    <th className="py-3.5 px-3">طريقة الافتقاد</th>
                    <th className="py-3.5 px-3">السبب والنتيجة</th>
                    <th className="py-3.5 px-3">المتابعة القادمة</th>
                    <th className="py-3.5 px-4">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.visitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        لا يوجد سجلات افتقاد مسجلة حتى الآن
                      </td>
                    </tr>
                  ) : (
                    data.visitations.map(v => {
                      const person = data.persons.find(p => p.id === v.personId);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{v.date}</td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => person && setSelectedPersonForProfile(person)}
                              className="font-extrabold text-slate-800 hover:text-amber-700"
                            >
                              {person?.name || 'مخدوم'}
                            </button>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{v.servantName}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                              {v.method === 'call' ? '📞 مكالمة' : v.method === 'visit' ? '🏠 زيارة' : v.method === 'message' ? '💬 واتساب' : '🤝 مقابلة'}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="font-bold text-slate-900">{v.reason}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{v.result}</div>
                          </td>
                          <td className="py-3 px-3 text-amber-800 font-bold">
                            {v.followUpDate || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{v.notes || '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

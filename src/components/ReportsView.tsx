import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Award,
  AlertTriangle,
  TrendingUp,
  CalendarCheck
} from 'lucide-react';
import { getPersonAttendanceStats } from '../utils/churchUtils';

export const ReportsView: React.FC = () => {
  const { data, setSelectedPersonForProfile, showToast } = useChurch();
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');

  // Overall calculations
  const totalAttendanceRecords = data.attendance.length;
  const presentRecords = data.attendance.filter(a => a.status === 'present').length;
  const generalAttendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 0;

  // Rate by Service
  const serviceStats = useMemo(() => {
    return data.services.map(srv => {
      const records = data.attendance.filter(a => a.serviceId === srv.id);
      const present = records.filter(a => a.status === 'present').length;
      const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;
      const membersCount = data.memberships.filter(m => m.serviceId === srv.id && m.role === 'member' && m.isActive).length;
      return {
        id: srv.id,
        name: srv.name,
        icon: srv.icon,
        stage: srv.stage,
        rate,
        recordsCount: records.length,
        membersCount
      };
    });
  }, [data.services, data.attendance, data.memberships]);

  // Top committed members (highest attendance rate)
  const topCommitted = useMemo(() => {
    const list = data.persons
      .filter(p => p.status !== 'archived')
      .map(p => {
        const stats = getPersonAttendanceStats(p.id, data.attendance);
        return { person: p, stats };
      })
      .filter(item => item.stats.total >= 2)
      .sort((a, b) => b.stats.rate - a.stats.rate || b.stats.present - a.stats.present)
      .slice(0, 5);
    return list;
  }, [data.persons, data.attendance]);

  // Most absent members (lowest attendance rate or high consecutive absences)
  const topAbsent = useMemo(() => {
    const list = data.persons
      .filter(p => p.status !== 'archived')
      .map(p => {
        const stats = getPersonAttendanceStats(p.id, data.attendance);
        return { person: p, stats };
      })
      .filter(item => item.stats.total >= 2)
      .sort((a, b) => a.stats.rate - b.stats.rate)
      .slice(0, 5);
    return list;
  }, [data.persons, data.attendance]);

  // Servants visitation activity
  const servantsActivity = useMemo(() => {
    const servantVisitsMap: Record<string, number> = {};
    data.visitations.forEach(v => {
      servantVisitsMap[v.servantName] = (servantVisitsMap[v.servantName] || 0) + 1;
    });

    return Object.entries(servantVisitsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data.visitations]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['الكود', 'الاسم', 'المرحلة', 'الهاتف', 'المدرسة', 'العنوان'];
    const rows = data.persons.map(p => [
      p.code || '',
      p.name,
      p.stage,
      p.phone || '',
      p.school || '',
      p.address || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_أفراد_الكنيسة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير كشف البيانات بصيغة CSV بنجاح');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>لوحة التقارير والإحصائيات المتقدمة</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              نسبة الحضور العامة: {generalAttendanceRate}%
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تحليل معدلات الحضور، مؤشرات التزام المخدومين، ونشاط الخدام في الافتقاد
          </p>
        </div>

        {/* Export & Print Buttons (Section 25) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel (CSV)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">متوسط الحضور العام</span>
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{generalAttendanceRate}%</div>
          <p className="text-[11px] text-slate-400">مرصود عبر {totalAttendanceRecords} تسجيلاً</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي عمليات الافتقاد</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{data.visitations.length}</div>
          <p className="text-[11px] text-slate-400">بمشاركة {servantsActivity.length} خادماً</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الخدمات النشطة</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{data.services.length}</div>
          <p className="text-[11px] text-slate-400">{data.meetings.length} اجتماع أسبوعي مسجل</p>
        </div>
      </div>

      {/* Attendance by Service Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">
          نسب الحضور حسب الخدمة والمرحلة (Section 23)
        </h3>
        <div className="space-y-3">
          {serviceStats.map(srv => (
            <div key={srv.id} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span>{srv.icon}</span>
                  <span>{srv.name} ({srv.stage})</span>
                </div>
                <span className="font-black text-slate-900">{srv.rate}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    srv.rate >= 75 ? 'bg-emerald-500' : srv.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${srv.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Top Committed vs Most Absent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most committed */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Award className="w-5 h-5" />
            <h4 className="font-extrabold text-xs">المخدومين الأكثر التزاماً بالحضور</h4>
          </div>
          <div className="space-y-2">
            {topCommitted.map((item, idx) => (
              <div
                key={item.person.id}
                onClick={() => setSelectedPersonForProfile(item.person)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-emerald-300 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{item.person.name}</span>
                    <span className="text-[10px] text-slate-400">{item.person.stage}</span>
                  </div>
                </div>
                <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {item.stats.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most absent */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-extrabold text-xs">المخدومين الأكثر غياباً (يحتاجون رعاية وافتقاد)</h4>
          </div>
          <div className="space-y-2">
            {topAbsent.map((item, idx) => (
              <div
                key={item.person.id}
                onClick={() => setSelectedPersonForProfile(item.person)}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-rose-300 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{item.person.name}</span>
                    <span className="text-[10px] text-slate-400">{item.person.stage}</span>
                  </div>
                </div>
                <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {item.stats.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Servants visitation ranking */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <h4 className="font-extrabold text-slate-900 text-xs">
          نشاط الخدام في الافتقاد والتواصل الرعوي
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {servantsActivity.map((srv, idx) => (
            <div key={srv.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">{srv.name}</span>
              <span className="text-[11px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                {srv.count} زيارة
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

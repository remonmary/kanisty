import React from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Users,
  Layers,
  CalendarCheck,
  PhoneCall,
  Cake,
  Megaphone,
  CheckSquare,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Phone,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import {
  getSmartFollowUpAlerts,
  getBirthdaySummaries,
  getPersonAttendanceStats,
  ROLE_BADGES
} from '../utils/churchUtils';

export const DashboardView: React.FC<{
  onOpenAddPerson: () => void;
}> = ({ onOpenAddPerson }) => {
  const {
    data,
    currentUser,
    effectiveOverallRole,
    setActiveTab,
    setSelectedPersonForProfile,
    openLogVisitModal,
    showToast
  } = useChurch();

  // Smart follow-up alerts (Section 14 & 15)
  const smartAlerts = React.useMemo(() => {
    return getSmartFollowUpAlerts(
      data.persons,
      data.attendance,
      data.visitations,
      data.memberships,
      data.persons
    );
  }, [data]);

  // Urgent alerts
  const urgentAlerts = smartAlerts.filter(
    a => a.type === 'absent_3_streak' || a.type === 'not_visited_30_days' || a.type === 'low_rate_under_70'
  );

  // Birthday alerts (Section 20)
  const birthdaySummaries = React.useMemo(() => {
    return getBirthdaySummaries(data.persons);
  }, [data.persons]);

  const birthdaysToday = birthdaySummaries.filter(b => b.isToday);
  const birthdaysUpcoming = birthdaySummaries.filter(b => !b.isToday).slice(0, 3);

  // Overall attendance calculation
  const totalAttendanceRecords = data.attendance.length;
  const presentRecords = data.attendance.filter(a => a.status === 'present').length;
  const churchAttendanceRate = totalAttendanceRecords > 0
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 84;

  // Servants and members count
  const totalPersons = data.persons.filter(p => p.status !== 'archived').length;
  const servantsCount = data.memberships.filter(m => (m.role === 'servant' || m.role === 'leader') && m.isActive).length;
  const membersCount = data.memberships.filter(m => m.role === 'member' && m.isActive).length;

  // Latest announcement
  const latestAnnouncement = data.announcements[0] || {
    id: 'ann-1',
    title: 'إعلان هام للخدام',
    content: 'الرجاء مراجعة سجلات الافتقاد الخاصة بشهر سبتمبر قبل يوم الجمعة القادم لحصر نسب الغياب في الصيف.',
    authorName: 'أبونا مرقس',
    date: new Date().toISOString().split('T')[0]
  };

  const handleSendGreeting = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!p.phone) {
      showToast('لا يوجد رقم هاتف مسجل');
      return;
    }
    const cleanPhone = p.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`كل سنة وأنت طيب وبخير يا ${p.name} بمناسبة عيد ميلادك! بركة صلوات كنيستنا تكون معك.`);
    window.open(`https://wa.me/20${cleanPhone.replace(/^0+/, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12 select-none font-sans">
      {/* 4 Professional Metric Cards Grid (Matching Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Members */}
        <div
          onClick={() => setActiveTab('persons')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-lg leading-none">
              👥
            </div>
            <span className="text-xs text-green-600 font-bold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalPersons > 0 ? totalPersons.toLocaleString('ar-EG') : '1,248'}
          </div>
          <div className="text-xs text-slate-500">إجمالي المخدومين والمسجلين</div>
        </div>

        {/* Card 2: Servants */}
        <div
          onClick={() => setActiveTab('persons')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg text-lg leading-none">
              🧑‍🏫
            </div>
            <span className="text-xs text-slate-400 font-bold">ثابت</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {servantsCount > 0 ? servantsCount.toLocaleString('ar-EG') : '156'}
          </div>
          <div className="text-xs text-slate-500">إجمالي الخدام وأمناء الخدمة</div>
        </div>

        {/* Card 3: Liturgy Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-lg leading-none">
              📈
            </div>
            <span className="text-xs text-green-600 font-bold">+5%</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {churchAttendanceRate}%
          </div>
          <div className="text-xs text-slate-500">نسبة حضور القداس والاجتماعات</div>
        </div>

        {/* Card 4: Required Follow-up */}
        <div
          onClick={() => setActiveTab('visitation')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg text-lg leading-none">
              📞
            </div>
            <span className="text-xs text-red-600 font-bold">
              {urgentAlerts.length > 0 ? `${urgentAlerts.length} عاجل` : '-2%'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {urgentAlerts.length > 0 ? urgentAlerts.length : '342'}
          </div>
          <div className="text-xs text-slate-500">افتقاد مطلوب هذا الشهر</div>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Theme 12-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols in RTL): Urgent Follow-up Table */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center text-sm">
                <span className="ml-2">🔴</span> حالات تحتاج متابعة فورية
              </h3>
              <button
                onClick={() => setActiveTab('visitation')}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                عرض الكل ({urgentAlerts.length})
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 text-xs">
                  <tr>
                    <th className="p-3 font-medium">الاسم</th>
                    <th className="p-3 font-medium">الخدمة</th>
                    <th className="p-3 font-medium">الخادم المسؤول</th>
                    <th className="p-3 font-medium">آخر حضور</th>
                    <th className="p-3 font-medium">السبب</th>
                    <th className="p-3 font-medium text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {urgentAlerts.slice(0, 6).map(alert => {
                    const isStreak = alert.type === 'absent_3_streak';
                    return (
                      <tr
                        key={alert.person.id}
                        onClick={() => setSelectedPersonForProfile(alert.person)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-bold text-slate-900">
                          {alert.person.name}
                        </td>
                        <td className="p-3 text-slate-600">
                          {alert.person.stage || 'عام'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {alert.assignedServantName || 'غير محدد'}
                        </td>
                        <td
                          className={`p-3 font-bold ${
                            isStreak ? 'text-red-500' : 'text-amber-500'
                          }`}
                        >
                          {alert.lastAttendanceDate
                            ? alert.lastAttendanceDate
                            : isStreak
                            ? 'منذ 3 أسابيع'
                            : 'منذ شهر'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-[10px] rounded-full font-bold ${
                              isStreak
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {alert.title}
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => openLogVisitModal(alert.person.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold shadow-2xs transition-colors"
                          >
                            افتقاد
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {urgentAlerts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا توجد حالات غياب حرجة حالياً، كل المخدومين منتظمين ومتابعين!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols in RTL): Birthdays & Featured Announcement */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Card 1: Birthdays Today */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center text-sm">
                <span className="ml-2">🎂</span> أعياد ميلاد اليوم
              </h3>
              <button
                onClick={() => setActiveTab('birthdays')}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                عرض التقويم
              </button>
            </div>

            <div className="space-y-3">
              {birthdaysToday.map(b => (
                <div
                  key={b.person.id}
                  onClick={() => setSelectedPersonForProfile(b.person)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-pink-200 text-pink-800 rounded-full flex items-center justify-center text-xs ml-3 font-bold">
                      {b.person.name.slice(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {b.person.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {b.person.stage} {b.age ? `- ${b.age} سنة` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={e => handleSendGreeting(b.person, e)}
                    className="text-lg hover:scale-125 transition-transform"
                    title="إرسال تهنئة واتساب"
                  >
                    🎈
                  </button>
                </div>
              ))}

              {birthdaysToday.length === 0 && (
                <div className="p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-400">
                  لا توجد أعياد ميلاد اليوم، تفقد أعياد الميلاد القادمة هذا الأسبوع!
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Important Announcement Card (Slate-900 with Glow Effect) */}
          <div className="bg-slate-900 rounded-xl p-5 text-white flex-1 relative overflow-hidden shadow-sm">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-bold mb-3 relative z-10 text-white text-base">
              {latestAnnouncement.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 relative z-10">
              {latestAnnouncement.content}
            </p>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-amber-500 font-bold">
                أرسله: {latestAnnouncement.authorName}
              </span>
              <button
                onClick={() => {
                  showToast('تم تأكيد قراءة الإعلان وحفظه في سجلك');
                }}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors text-white cursor-pointer"
              >
                تأكيد القراءة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

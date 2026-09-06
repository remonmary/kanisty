import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  PhoneCall,
  MessageCircle,
  Plus,
  Share2,
  Edit,
  ShieldCheck,
  Award
} from 'lucide-react';
import { getPersonAttendanceStats, ROLE_BADGES, ATTENDANCE_STATUS_MAP, calculateAge } from '../utils/churchUtils';

export const PersonProfileModal: React.FC = () => {
  const {
    selectedPersonForProfile: person,
    setSelectedPersonForProfile,
    data,
    openLogVisitModal,
    showToast
  } = useChurch();

  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'attendance' | 'visitation' | 'parent'>('info');

  if (!person) return null;

  // Person memberships
  const personMemberships = data.memberships.filter(m => m.personId === person.id && m.isActive);
  const stats = getPersonAttendanceStats(person.id, data.attendance);
  const personVisitations = data.visitations
    .filter(v => v.personId === person.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Parent entity if present
  const parent = person.parentId
    ? data.parents.find(p => p.id === person.parentId)
    : null;

  const age = calculateAge(person.birthDate);

  const copyPhone = () => {
    if (person.phone) {
      navigator.clipboard.writeText(person.phone);
      showToast('تم نسخ رقم الهاتف للحافظة');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-12 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedPersonForProfile(null)}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header Profile Hero */}
        <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={() => setSelectedPersonForProfile(null)}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-700 border-2 border-amber-400/40 shrink-0 shadow-lg">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-amber-300">
                  {person.name.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">{person.name}</h3>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {person.code || 'بدون كود'}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  person.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : person.status === 'archived'
                    ? 'bg-slate-600 text-slate-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {person.status === 'active' ? 'نشط' : person.status === 'archived' ? 'مؤرشف' : 'غير نشط'}
                </span>
              </div>

              <p className="text-xs text-slate-300 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>المرحلة: {person.stage}</span>
                <span>•</span>
                <span>العمر: {age > 0 ? `${age} سنة` : '—'}</span>
                <span>•</span>
                <span>تاريخ الانضمام: {person.joinDate || '2023-09-01'}</span>
              </p>

              {/* Quick Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {person.phone && (
                  <a
                    href={`tel:${person.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال ({person.phone})</span>
                  </a>
                )}
                {person.phone && (
                  <a
                    href={`https://wa.me/2${person.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                )}
                <button
                  onClick={() => openLogVisitModal(person)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل افتقاد</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            البيانات الأساسية
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            الخدمات والعضويات ({personMemberships.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            سجل الحضور ({stats.rate}%)
          </button>
          <button
            onClick={() => setActiveTab('visitation')}
            className={`py-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'visitation'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            سجل الافتقاد ({personVisitations.length})
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`py-3 px-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'parent'
                ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            ولي الأمر
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-right">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block">رقم الهاتف</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 flex items-center justify-between">
                    <span>{person.phone || 'غير مسجل'}</span>
                    <button onClick={copyPhone} className="text-[11px] text-amber-700 font-bold hover:underline">
                      نسخ
                    </button>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block">تاريخ الميلاد</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {person.birthDate || 'غير مسجل'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block">المدرسة / الكلية</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {person.school || 'غير محدد'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block">العنوان</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {person.address || 'القاهرة'}
                  </p>
                </div>
              </div>

              {person.notes && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <h5 className="text-xs font-bold text-amber-900 mb-1">ملاحظات رعوية خاصة:</h5>
                  <p className="text-xs text-amber-800 leading-relaxed">{person.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICES & MEMBERSHIPS (Rule 6: Many-to-Many) */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                💡 <strong>قاعدة Many-to-Many:</strong> يمكن للشخص الانتماء لأكثر من خدمة في نفس الوقت، مع اختلاف دوره من خدمة لأخرى.
              </div>

              {personMemberships.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  لا توجد خدمات مسجلة لهذا الشخص حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {personMemberships.map(mem => {
                    const srv = data.services.find(s => s.id === mem.serviceId);
                    const meeting = data.meetings.find(m => m.id === mem.meetingId);
                    const group = data.groups.find(g => g.id === mem.groupId);
                    const servant = mem.assignedServantId
                      ? data.persons.find(p => p.id === mem.assignedServantId)
                      : null;

                    return (
                      <div
                        key={mem.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{srv?.icon || '⛪'}</span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{srv?.name || 'خدمة'}</h4>
                              <p className="text-[11px] text-slate-500">{srv?.stage}</p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              ROLE_BADGES[mem.role]?.bg || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {mem.roleTitle || ROLE_BADGES[mem.role]?.label || mem.role}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">الاجتماع:</span>
                            <span className="font-semibold text-slate-800">{meeting?.name || 'عام'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">المجموعة:</span>
                            <span className="font-semibold text-slate-800">{group?.name || 'غير محدد'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">الخادم المسؤول:</span>
                            <span className="font-semibold text-slate-800">{servant?.name || '—'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE RECORD (Section 12) */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {/* Stats Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold block">إجمالي الاجتماعات</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-1 block">{stats.total}</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-bold block">حضر</span>
                  <span className="text-lg font-extrabold text-emerald-700 mt-1 block">{stats.present}</span>
                </div>
                <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[11px] text-rose-700 font-bold block">غاب</span>
                  <span className="text-lg font-extrabold text-rose-700 mt-1 block">{stats.absent}</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[11px] text-amber-700 font-bold block">اعتذر / تأخر</span>
                  <span className="text-lg font-extrabold text-amber-700 mt-1 block">
                    {stats.excused + stats.late}
                  </span>
                </div>
                <div className="p-2 bg-slate-900 text-white rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-amber-400 font-bold block">نسبة الحضور</span>
                  <span className="text-lg font-extrabold text-white mt-1 block">{stats.rate}%</span>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-800">سجل الحضور اليومي المفصل:</h5>
                {stats.records.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    لم يتم تسجيل أي حضور أو غياب لهذا الشخص حتى الآن.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {stats.records.map(rec => {
                      const srv = data.services.find(s => s.id === rec.serviceId);
                      const statusInfo = ATTENDANCE_STATUS_MAP[rec.status] || ATTENDANCE_STATUS_MAP.present;
                      return (
                        <div key={rec.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{rec.date}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600 font-medium">{srv?.name || 'اجتماع'}</span>
                            </div>
                            {rec.notes && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{rec.notes}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VISITATION / PASTORAL CARE (Section 13) */}
          {activeTab === 'visitation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800">
                  سجل الافتقاد والمتابعة الرعوية ({personVisitations.length})
                </h5>
                <button
                  onClick={() => openLogVisitModal(person)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>توثيق افتقاد جديد</span>
                </button>
              </div>

              {personVisitations.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <PhoneCall className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">لا يوجد سجل افتقاد سابق</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    بادر بتسجيل أول افتقاد واطمئنان على المخدوم الآن
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personVisitations.map(v => (
                    <div
                      key={v.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{v.date}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                            {v.method === 'call' ? '📞 مكالمة' : v.method === 'visit' ? '🏠 زيارة منزلية' : v.method === 'message' ? '💬 رسالة واتساب' : '🤝 مقابلة'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          الخادم: <strong className="text-slate-800">{v.servantName}</strong>
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p className="text-slate-700">
                          <strong className="text-slate-900">السبب:</strong> {v.reason}
                        </p>
                        <p className="text-slate-700">
                          <strong className="text-slate-900">النتيجة:</strong> {v.result}
                        </p>
                        {v.notes && (
                          <p className="text-slate-500 text-[11px]">
                            <strong>ملاحظات:</strong> {v.notes}
                          </p>
                        )}
                      </div>

                      {v.followUpDate && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50/50 p-2 rounded-lg">
                          <span>موعد المتابعة القادمة: <strong>{v.followUpDate}</strong></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PARENTS & GUARDIAN (Section 27) */}
          {activeTab === 'parent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>بيانات ولي الأمر:</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">اسم ولي الأمر:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {parent?.name || person.parentName || 'غير مسجل'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">صلة القرابة:</span>
                    <span className="font-semibold text-slate-800">
                      {parent?.relation || person.parentRelation || 'أب'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">هاتف ولي الأمر:</span>
                    <span className="font-bold text-slate-900">
                      {parent?.phone || person.parentPhone || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">الوظيفة:</span>
                    <span className="font-semibold text-slate-800">
                      {parent?.job || '—'}
                    </span>
                  </div>
                </div>

                {parent?.notes && (
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <strong>ملاحظات التواصل:</strong> {parent.notes}
                  </p>
                )}

                {(parent?.phone || person.parentPhone) && (
                  <div className="pt-2 flex gap-2">
                    <a
                      href={`tel:${parent?.phone || person.parentPhone}`}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال بولي الأمر</span>
                    </a>
                    <a
                      href={`https://wa.me/2${(parent?.phone || person.parentPhone || '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>واتساب ولي الأمر</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

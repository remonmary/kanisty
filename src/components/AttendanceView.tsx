import React, { useState, useMemo, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Save,
  Download,
  Printer,
  Users,
  Check,
  Calendar as CalendarIcon,
  Search
} from 'lucide-react';
import { ATTENDANCE_STATUS_MAP } from '../utils/churchUtils';
import { api } from '../services/api';
import { AttendanceStatus, Person } from '../types';

interface AttendanceDraftRow {
  personId: string;
  name: string;
  code: string;
  photo?: string;
  stage: string;
  phone?: string;
  status: AttendanceStatus;
  notes: string;
}

export const AttendanceView: React.FC = () => {
  const {
    data,
    currentUser,
    activeChurchId,
    activeSubTab,
    setActiveSubTab,
    refreshData,
    showToast
  } = useChurch();

  const currentTab = activeSubTab === 'log' ? 'log' : activeSubTab === 'types' ? 'types' : 'record';

  // State for recording attendance
  const [selectedServiceId, setSelectedServiceId] = useState<string>('all');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [attendanceType, setAttendanceType] = useState<string>('meeting');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize default service when data loads
  useEffect(() => {
    if (selectedServiceId === 'all' && data.services.length > 0) {
      // Keep 'all' or default to first service
    }
  }, [data.services]);

  // Roster draft state
  const [draftRoster, setDraftRoster] = useState<AttendanceDraftRow[]>([]);

  // Filter meetings for selected service
  const serviceMeetings = useMemo(() => {
    if (selectedServiceId === 'all') return data.meetings;
    return data.meetings.filter(m => m.serviceId === selectedServiceId);
  }, [data.meetings, selectedServiceId]);

  // Set default meeting
  useEffect(() => {
    if (serviceMeetings.length > 0) {
      if (!selectedMeetingId || !serviceMeetings.some(m => m.id === selectedMeetingId)) {
        setSelectedMeetingId(serviceMeetings[0].id);
      }
    } else {
      setSelectedMeetingId('');
    }
  }, [serviceMeetings, selectedMeetingId]);

  // Build draft roster whenever service or date changes
  useEffect(() => {
    // 1. Determine target active persons
    const allActivePersons = data.persons.filter(p => p.status !== 'archived');

    let matchedPersons: Person[] = [];

    if (selectedServiceId === 'all') {
      matchedPersons = allActivePersons;
    } else {
      const selectedService = data.services.find(s => s.id === selectedServiceId);

      // Check memberships in this service
      const serviceMemberships = data.memberships.filter(
        m => m.serviceId === selectedServiceId && m.isActive
      );
      const memberPersonIds = new Set(serviceMemberships.map(m => m.personId));

      matchedPersons = allActivePersons.filter(p => memberPersonIds.has(p.id));

      // Fallback 1: If no persons explicitly mapped to this service, match by stage
      if (matchedPersons.length === 0 && selectedService?.stage) {
        matchedPersons = allActivePersons.filter(
          p => p.stage && p.stage.trim() === selectedService.stage.trim()
        );
      }

      // Fallback 2: If still 0, show all active persons so names never disappear
      if (matchedPersons.length === 0) {
        matchedPersons = allActivePersons;
      }
    }

    // 2. Build rows
    const rows: AttendanceDraftRow[] = matchedPersons.map(person => {
      // Check if existing record exists for this person on this date
      const existing = data.attendance.find(
        a =>
          a.personId === person.id &&
          a.date === attendanceDate &&
          (selectedServiceId === 'all' || a.serviceId === selectedServiceId)
      );

      return {
        personId: person.id,
        name: person.name,
        code: person.code || '—',
        photo: person.photo,
        stage: person.stage || 'عامة',
        phone: person.phone,
        status: existing ? existing.status : 'present',
        notes: existing?.notes || ''
      };
    });

    setDraftRoster(rows);
  }, [selectedServiceId, attendanceDate, data.memberships, data.persons, data.services, data.attendance]);

  // Filter roster by stage and search query
  const filteredRoster = useMemo(() => {
    return draftRoster.filter(r => {
      if (selectedStageFilter !== 'all' && r.stage !== selectedStageFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.name.toLowerCase().includes(q);
        const matchCode = r.code.toLowerCase().includes(q);
        const matchPhone = r.phone?.includes(q);
        if (!matchName && !matchCode && !matchPhone) return false;
      }
      return true;
    });
  }, [draftRoster, selectedStageFilter, searchQuery]);

  // Summary counts based on filtered roster
  const presentCount = filteredRoster.filter(r => r.status === 'present').length;
  const absentCount = filteredRoster.filter(r => r.status === 'absent').length;
  const excusedCount = filteredRoster.filter(r => r.status === 'excused' || r.status === 'excused_absence').length;
  const lateCount = filteredRoster.filter(r => r.status === 'late').length;
  const totalCount = filteredRoster.length;
  const currentRate = totalCount > 0 ? Math.round(((presentCount + lateCount * 0.75) / totalCount) * 100) : 0;

  const markAll = (status: AttendanceStatus) => {
    const visibleIds = new Set(filteredRoster.map(r => r.personId));
    setDraftRoster(prev =>
      prev.map(r => (visibleIds.has(r.personId) ? { ...r, status } : r))
    );
  };

  const updatePersonStatus = (personId: string, status: AttendanceStatus) => {
    setDraftRoster(prev =>
      prev.map(r => (r.personId === personId ? { ...r, status } : r))
    );
  };

  const updatePersonNotes = (personId: string, notes: string) => {
    setDraftRoster(prev =>
      prev.map(r => (r.personId === personId ? { ...r, notes } : r))
    );
  };

  const handleSaveAttendance = async () => {
    if (filteredRoster.length === 0) {
      showToast('لا يوجد أشخاص لتسجيل حضورهم');
      return;
    }

    try {
      setIsSaving(true);
      const targetService = data.services.find(s => s.id === selectedServiceId);
      const targetServiceId = selectedServiceId === 'all' ? (data.services[0]?.id || 'srv-all') : selectedServiceId;

      const recordsToSave = filteredRoster.map(r => ({
        churchId: activeChurchId,
        personId: r.personId,
        serviceId: targetServiceId,
        meetingId: selectedMeetingId || undefined,
        date: attendanceDate,
        status: r.status,
        type: attendanceType,
        notes: r.notes || undefined
      }));

      await api.saveAttendanceBatch({
        records: recordsToSave,
        operatorName: currentUser?.name || 'الخادم',
        churchId: activeChurchId,
        serviceName: targetService?.name || 'كافة الخدمات'
      });

      await refreshData();
      showToast(`تم حفظ كشف الحضور بنجاح لعدد ${filteredRoster.length} مخدوم`);
    } catch (err) {
      console.error('Failed to save attendance:', err);
      showToast('حدث خطأ أثناء حفظ كشف الحضور');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>منظومة كشوف الحضور والغياب</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              نسبة الحضور: {currentRate}%
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد حضور واعتذار وغياب المخدومين والخدام وفق الخدمة والاجتماع الأسبوعي
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('record')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'record'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            تسجيل حضور
          </button>
          <button
            onClick={() => setActiveSubTab('log')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'log'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            سجل الحضور التاريخي
          </button>
          <button
            onClick={() => setActiveSubTab('types')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'types'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            أنواع الحضور وإعداداتها
          </button>
        </div>
      </div>

      {/* TAB 1: RECORD ATTENDANCE */}
      {currentTab === 'record' && (
        <div className="space-y-4">
          {/* Controls Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Service Select */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">الخدمة:</label>
              <select
                value={selectedServiceId}
                onChange={e => setSelectedServiceId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="all">كافة خدمات ومخدومي الكنيسة (شامل)</option>
                {data.services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.icon || '⛪'} {s.name} ({s.stage})
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Select */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">الاجتماع:</label>
              <select
                value={selectedMeetingId}
                onChange={e => setSelectedMeetingId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
              >
                {serviceMeetings.length === 0 ? (
                  <option value="">(عام لكافة الاجتماعات)</option>
                ) : (
                  <>
                    <option value="">(عام لكافة الاجتماعات)</option>
                    {serviceMeetings.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dayOfWeek})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">تصفية المرحلة:</label>
              <select
                value={selectedStageFilter}
                onChange={e => setSelectedStageFilter(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="all">كافة المراحل</option>
                <option value="حضانة">حضانة</option>
                <option value="ابتدائي">ابتدائي</option>
                <option value="إعدادي">إعدادي</option>
                <option value="ثانوي">ثانوي</option>
                <option value="شباب جامعي">شباب جامعي</option>
                <option value="خريجين">خريجين</option>
                <option value="عامة">عامة</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">تاريخ اليوم:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Attendance Type */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">نوع النشاط:</label>
              <select
                value={attendanceType}
                onChange={e => setAttendanceType(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden"
              >
                <option value="meeting">اجتماع أسبوعي</option>
                <option value="liturgy">قداس إلهي</option>
                <option value="activity">نشاط / يوم روحي</option>
                <option value="conference">مؤتمر</option>
              </select>
            </div>
          </div>

          {/* Quick Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الكود أو رقم التليفون..."
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-hidden focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div className="text-xs text-slate-500 font-bold">
              يظهر الآن: <span className="text-amber-700 font-black">{filteredRoster.length}</span> شخص في الكشف
            </div>
          </div>

          {/* Quick Counter & Batch Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
            {/* Stats Summary */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                حاضر: {presentCount}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                غائب: {absentCount}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                اعتذار: {excusedCount}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                متأخر: {lateCount}
              </span>
              <span className="text-slate-400 border-r border-slate-700 pr-3 font-semibold">
                الإجمالي: {totalCount} شخص
              </span>
            </div>

            {/* Batch Buttons & Save */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('present')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors cursor-pointer"
              >
                تحديد الكل حاضر
              </button>
              <button
                type="button"
                onClick={() => markAll('absent')}
                className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors cursor-pointer"
              >
                تحديد الكل غائب
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كشف الحضور'}</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">اسم المخدوم / الخادم</th>
                    <th className="py-3 px-3">الكود</th>
                    <th className="py-3 px-3">المرحلة</th>
                    <th className="py-3 px-4 text-center">حالة الحضور</th>
                    <th className="py-3 px-4">ملاحظات أو سبب الاعتذار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        لا يوجد أشخاص مطابقين للبحث أو التصفية المختارة.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map(row => (
                      <tr key={row.personId} className="hover:bg-slate-50/70 transition-colors">
                        {/* Person photo & name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {row.photo ? (
                                <img
                                  src={row.photo}
                                  alt={row.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                  {row.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{row.name}</span>
                              {row.phone && (
                                <span className="text-[10px] text-slate-400 font-mono">{row.phone}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-600">
                          {row.code}
                        </td>

                        {/* Stage */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {row.stage}
                          </span>
                        </td>

                        {/* Status Toggle Buttons */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {[
                              { id: 'present', label: 'حاضر', activeClass: 'bg-emerald-600 text-white font-bold' },
                              { id: 'absent', label: 'غائب', activeClass: 'bg-rose-600 text-white font-bold' },
                              { id: 'excused', label: 'اعتذار', activeClass: 'bg-amber-600 text-white font-bold' },
                              { id: 'late', label: 'متأخر', activeClass: 'bg-orange-600 text-white font-bold' }
                            ].map(btn => (
                              <button
                                key={btn.id}
                                type="button"
                                onClick={() => updatePersonStatus(row.personId, btn.id as AttendanceStatus)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                                  row.status === btn.id
                                    ? btn.activeClass
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Notes input */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={e => updatePersonNotes(row.personId, e.target.value)}
                            placeholder="سبب غياب أو ملاحظة..."
                            className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORICAL LOG */}
      {currentTab === 'log' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              إجمالي التسجيلات المحفوظة: {data.attendance.length} تسجيلاً
            </span>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الكشف</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">التاريخ</th>
                    <th className="py-3.5 px-3">المخدوم</th>
                    <th className="py-3.5 px-3">الخدمة</th>
                    <th className="py-3.5 px-3">النوع</th>
                    <th className="py-3.5 px-3">الحالة</th>
                    <th className="py-3.5 px-4">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.attendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        لا يوجد سجل حضور محفوظ حتى الآن
                      </td>
                    </tr>
                  ) : (
                    data.attendance.slice(0, 100).map(rec => {
                      const person = data.persons.find(p => p.id === rec.personId);
                      const srv = data.services.find(s => s.id === rec.serviceId);
                      const statusInfo = ATTENDANCE_STATUS_MAP[rec.status] || ATTENDANCE_STATUS_MAP.present;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{rec.date}</td>
                          <td className="py-3 px-3 font-extrabold text-slate-800">
                            {person?.name || 'مخدوم'}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{srv?.name || 'خدمة عامة'}</td>
                          <td className="py-3 px-3 text-slate-500">
                            {rec.type === 'meeting' ? 'اجتماع' : rec.type === 'liturgy' ? 'قداس' : 'نشاط'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{rec.notes || '—'}</td>
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

      {/* TAB 3: ATTENDANCE TYPES & SETTINGS */}
      {currentTab === 'types' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            أنواع وأنشطة الحضور المقررة بالكنيسة
          </h3>
          <p className="text-xs text-slate-500">
            الأنشطة والاجتماعات المعتمدة لتسجيل الحضور والغياب:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'اجتماع أسبوعي', desc: 'الاجتماع الأساسي للمرحلة الأسبوعي', count: 'نشط' },
              { title: 'قداس إلهي', desc: 'حضور القداسات والتناول المقدس', count: 'نشط' },
              { title: 'نشاط وورشة عمل', desc: 'الأيام الروحية والأنشطة الصيفية', count: 'نشط' },
              { title: 'درس كتاب وتسبحة', desc: 'النهضات والتسابيح الأسبوعية', count: 'متاح' },
              { title: 'مؤتمر سنوي', desc: 'المؤتمرات الصيفية والشتوية', count: 'متاح' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    {item.count}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

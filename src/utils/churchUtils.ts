import {
  Person,
  AttendanceRecord,
  VisitationRecord,
  ServiceMembership,
  Service,
  Meeting,
  Group
} from '../types';

export interface SmartAlert {
  person: Person;
  type: 'absent_3_streak' | 'not_visited_30_days' | 'low_attendance' | 'recently_visited';
  badgeColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
  description: string;
  lastVisitDate?: string;
  attendanceRate?: number;
  assignedServantName?: string;
}

export interface BirthdaySummary {
  person: Person;
  age: number;
  isToday: boolean;
  isTomorrow: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  birthDateFormatted: string;
}

export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getBirthdaySummaries(persons: Person[]): BirthdaySummary[] {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  return persons
    .filter(p => p.birthDate && p.status !== 'archived')
    .map(person => {
      const parts = person.birthDate.split('-');
      if (parts.length < 3) return null;
      const birthMonth = parseInt(parts[1], 10) - 1;
      const birthDay = parseInt(parts[2], 10);

      const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
      // If already passed earlier this year by more than 7 days, might look at next year, but for comparison:
      const isToday = birthMonth === currentMonth && birthDay === currentDay;

      // Tomorrow check
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow = birthMonth === tomorrow.getMonth() && birthDay === tomorrow.getDate();

      // This week check (within next 7 days)
      const diffTime = thisYearBirthday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isThisWeek = diffDays >= 0 && diffDays <= 7;

      // This month check
      const isThisMonth = birthMonth === currentMonth;

      const age = calculateAge(person.birthDate);

      return {
        person,
        age,
        isToday,
        isTomorrow,
        isThisWeek,
        isThisMonth,
        birthDateFormatted: `${birthDay} / ${birthMonth + 1}`
      };
    })
    .filter((b): b is BirthdaySummary => b !== null);
}

export function getPersonAttendanceStats(personId: string, attendanceRecords: AttendanceRecord[]) {
  const records = attendanceRecords.filter(a => a.personId === personId);
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      excused: 0,
      late: 0,
      excused_absence: 0,
      rate: 0,
      records: []
    };
  }

  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const excused = records.filter(r => r.status === 'excused').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused_absence = records.filter(r => r.status === 'excused_absence').length;

  // Weight present as 100%, late as 75%, excused as not penalty or partial
  const rate = Math.round(((present + late * 0.75) / total) * 100);

  // Sorted latest first
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    total,
    present,
    absent,
    excused,
    late,
    excused_absence,
    rate,
    records: sorted
  };
}

export function getSmartFollowUpAlerts(
  persons: Person[],
  attendanceRecords: AttendanceRecord[],
  visitationRecords: VisitationRecord[],
  memberships: ServiceMembership[],
  allPersons: Person[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const today = new Date();

  // Only check active members (role: member)
  const memberPersonIds = new Set(
    memberships.filter(m => m.role === 'member' && m.isActive).map(m => m.personId)
  );

  for (const person of persons) {
    if (!memberPersonIds.has(person.id) || person.status !== 'active') continue;

    const stats = getPersonAttendanceStats(person.id, attendanceRecords);
    const personVisits = visitationRecords
      .filter(v => v.personId === person.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastVisit = personVisits[0];

    // Find assigned servant name
    const memberShip = memberships.find(m => m.personId === person.id && m.assignedServantId);
    let assignedServantName = '';
    if (memberShip?.assignedServantId) {
      const servant = allPersons.find(p => p.id === memberShip.assignedServantId);
      assignedServantName = servant ? servant.name : '';
    }

    // Rule 1: 🔴 Absent 3 consecutive meetings
    const recentAttendance = stats.records.slice(0, 3);
    const absentStreak = recentAttendance.length === 3 && recentAttendance.every(r => r.status === 'absent');
    if (absentStreak) {
      alerts.push({
        person,
        type: 'absent_3_streak',
        badgeColor: '#dc2626',
        badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
        badgeText: 'غائب 3 اجتماعات متتالية',
        label: '🔴 غياب متصل 3 أسابيع',
        description: 'المخدوم انقطع عن الحضور لثلاثة اجتماعات متتالية ويتطلب تدخلاً عاجلاً وافتقاداً منزلياً.',
        lastVisitDate: lastVisit?.date,
        attendanceRate: stats.rate,
        assignedServantName
      });
      continue; // priority 1
    }

    // Rule 2: 🟠 Not visited in 30 days
    let daysSinceVisit = 999;
    if (lastVisit) {
      const vDate = new Date(lastVisit.date);
      daysSinceVisit = Math.floor((today.getTime() - vDate.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      // Never visited since join
      daysSinceVisit = 100;
    }

    if (daysSinceVisit >= 30) {
      alerts.push({
        person,
        type: 'not_visited_30_days',
        badgeColor: '#ea580c',
        badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
        badgeText: `لم يتم افتقاده منذ ${daysSinceVisit > 90 ? 'أكثر من 90' : daysSinceVisit} يوماً`,
        label: '🟠 بحاجة لافتقاد دوري',
        description: lastVisit
          ? `آخر افتقاد كان بتاريخ ${lastVisit.date} (${lastVisit.reason || 'متابعة'})`
          : 'لم يسجل له أي افتقاد في النظام منذ انضمامه.',
        lastVisitDate: lastVisit?.date,
        attendanceRate: stats.rate,
        assignedServantName
      });
      continue;
    }

    // Rule 3: 🟡 Attendance rate < 70%
    if (stats.total >= 3 && stats.rate < 70) {
      alerts.push({
        person,
        type: 'low_attendance',
        badgeColor: '#d97706',
        badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
        badgeText: `نسبة الحضور ${stats.rate}% (أقل من 70%)`,
        label: '🟡 نسبة حضور منخفضة',
        description: `حضر ${stats.present} من أصل ${stats.total} اجتماعاً مسجلاً. يرجى المتابعة لمعرفة الأسباب.`,
        lastVisitDate: lastVisit?.date,
        attendanceRate: stats.rate,
        assignedServantName
      });
      continue;
    }

    // Rule 4: 🟢 Recently visited (within last 14 days)
    if (daysSinceVisit <= 14) {
      alerts.push({
        person,
        type: 'recently_visited',
        badgeColor: '#16a34a',
        badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        badgeText: 'تم افتقاده حديثاً',
        label: '🟢 مفتقد حديثاً ومتابع',
        description: `تم التواصل معه بنجاح بتاريخ ${lastVisit?.date} بواسطة ${lastVisit?.servantName || 'الخادم'}.`,
        lastVisitDate: lastVisit?.date,
        attendanceRate: stats.rate,
        assignedServantName
      });
    }
  }

  return alerts;
}

export const ROLE_BADGES = {
  priest: { label: 'كاهن', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
  leader: { label: 'أمين خدمة', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
  servant: { label: 'خادم', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  member: { label: 'مخدوم', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
};

export const ATTENDANCE_STATUS_MAP = {
  present: { label: 'حاضر', color: '#16a34a', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  absent: { label: 'غائب', color: '#dc2626', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  excused: { label: 'اعتذار', color: '#d97706', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  late: { label: 'متأخر', color: '#ea580c', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  excused_absence: { label: 'غياب بعذر', color: '#64748b', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
};

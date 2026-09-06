import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Clock, Users, Cake, PhoneCall, CheckSquare } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { data, setSelectedPersonForProfile } = useChurch();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Arabic month names
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Calendar grid calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Offset so week starts on Saturday (common in Church schedules)
  // Saturday = 6 -> index 0, Sunday = 0 -> index 1...
  const startOffset = (firstDayIndex + 1) % 7;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Selected date events sidebar
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  // Aggregate events for each day
  const getEventsForDay = (day: number) => {
    const events: { id: string; type: string; title: string; subtitle?: string; color: string }[] = [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Meetings on day of week
    const dayOfWeekIndex = new Date(year, month, day).getDay();
    const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const currentDayName = daysMap[dayOfWeekIndex];

    data.meetings.forEach(m => {
      if (m.dayOfWeek === currentDayName) {
        const srv = data.services.find(s => s.id === m.serviceId);
        events.push({
          id: `m-${m.id}-${day}`,
          type: 'meeting',
          title: m.name,
          subtitle: `${srv?.name || 'خدمة'} • ${m.time}`,
          color: 'bg-blue-500'
        });
      }
    });

    // Birthdays
    data.persons.forEach(p => {
      if (p.birthDate) {
        const parts = p.birthDate.split('-');
        if (parseInt(parts[1], 10) - 1 === month && parseInt(parts[2], 10) === day) {
          events.push({
            id: `b-${p.id}`,
            type: 'birthday',
            title: `عيد ميلاد ${p.name}`,
            subtitle: `${p.stage} • ${p.code}`,
            color: 'bg-pink-500'
          });
        }
      }
    });

    // Tasks due
    data.tasks.forEach(t => {
      if (t.dueDate === dateStr) {
        events.push({
          id: `t-${t.id}`,
          type: 'task',
          title: `مهمة: ${t.title}`,
          subtitle: `المسؤول: ${t.assigneeName}`,
          color: 'bg-amber-500'
        });
      }
    });

    // Preparations date
    data.preparations.forEach(prep => {
      if (prep.date === dateStr) {
        events.push({
          id: `p-${prep.id}`,
          type: 'prep',
          title: `درس: ${prep.title}`,
          subtitle: prep.authorName,
          color: 'bg-purple-500'
        });
      }
    });

    return events;
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>التقويم الكنسي والأنشطة</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {monthNames[month]} {year}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            عرض الاجتماعات الدورية، القداسات، أعياد الميلاد، ومواعيد تسليم المهام
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm px-3 py-1.5 rounded-xl bg-slate-900 text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span>السبت</span>
            <span>الأحد</span>
            <span>الإثنين</span>
            <span>الثلاثاء</span>
            <span>الأربعاء</span>
            <span>الخميس</span>
            <span>الجمعة</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Blank offset days */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 sm:h-24 bg-slate-50/50 rounded-xl p-1" />
            ))}

            {/* Month days */}
            {daysArray.map(day => {
              const dayEvents = getEventsForDay(day);
              const isSelected = day === selectedDay;
              const isToday =
                day === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-400'
                      : isToday
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-extrabold text-xs ${isToday ? 'text-amber-400' : 'text-slate-800'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold px-1 rounded-full bg-slate-100 text-slate-700">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Dots */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        className={`text-[9px] font-bold px-1 py-0.2 rounded-sm truncate text-white ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[8px] text-slate-400 font-semibold block">
                        +{dayEvents.length - 2} المزيد
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Sidebar (1 Col) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-amber-700">أحداث اليوم المحدد</span>
            <h3 className="text-base font-extrabold text-slate-900">
              {selectedDay} {monthNames[month]} {year}
            </h3>
          </div>

          <div className="space-y-2.5">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                لا توجد اجتماعات أو مناسبات مسجلة في هذا اليوم
              </div>
            ) : (
              selectedDayEvents.map(ev => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs">{ev.title}</span>
                    <span className={`w-2 h-2 rounded-full ${ev.color}`} />
                  </div>
                  {ev.subtitle && (
                    <p className="text-[11px] text-slate-500 font-medium">{ev.subtitle}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

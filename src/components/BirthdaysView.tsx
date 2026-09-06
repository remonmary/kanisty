import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Cake, Phone, MessageCircle, Calendar, Gift, Sparkles } from 'lucide-react';
import { getBirthdaySummaries, BirthdaySummary } from '../utils/churchUtils';

export const BirthdaysView: React.FC = () => {
  const { data, setSelectedPersonForProfile } = useChurch();
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week' | 'month'>('today');

  const summaries = useMemo(() => {
    return getBirthdaySummaries(data.persons);
  }, [data.persons]);

  const todayList = summaries.filter(b => b.isToday);
  const tomorrowList = summaries.filter(b => b.isTomorrow);
  const weekList = summaries.filter(b => b.isThisWeek);
  const monthList = summaries.filter(b => b.isThisMonth);

  const currentList =
    activeTab === 'today'
      ? todayList
      : activeTab === 'tomorrow'
      ? tomorrowList
      : activeTab === 'week'
      ? weekList
      : monthList;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>سجل أعياد الميلاد والتهنئة</span>
            <span className="text-xs font-bold bg-pink-100 text-pink-900 px-2.5 py-0.5 rounded-full">
              {todayList.length} اليوم
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            رصد تلقائي لمناسبات أعياد الميلاد للتواصل الرعوي وإرسال التهاني عبر واتساب والاتصال
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'today', label: `اليوم (${todayList.length})` },
          { id: 'tomorrow', label: `غداً (${tomorrowList.length})` },
          { id: 'week', label: `هذا الأسبوع (${weekList.length})` },
          { id: 'month', label: `هذا الشهر (${monthList.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            <Cake className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">لا توجد أعياد ميلاد في هذا النطاق الزمني</p>
            <p className="text-slate-400 mt-1">تأكد من تسجيل تواريخ الميلاد في ملفات المخدومين</p>
          </div>
        ) : (
          currentList.map(item => {
            const person = item.person;
            const messageText = encodeURIComponent(
              `كل سنة وأنت طيب يا ${person.name} وعقبال 100 سنة حلوة وناجحة في حضن المسيح والكنيسة! 🎉🎂💐`
            );

            return (
              <div
                key={person.id}
                className="p-5 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-4 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-base">
                        {person.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4
                      onClick={() => setSelectedPersonForProfile(person)}
                      className="font-extrabold text-slate-900 text-sm hover:underline cursor-pointer"
                    >
                      {person.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {person.stage} • {person.code}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-pink-700 font-bold block">تاريخ الميلاد:</span>
                    <span className="font-extrabold text-pink-950 text-sm">
                      {item.birthDateFormatted}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-pink-700 font-bold block">العمر الجديد:</span>
                    <span className="font-extrabold text-pink-950 text-sm">
                      {item.age + 1} سنة 🎉
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons: WhatsApp & Call (Section 20) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {person.phone ? (
                    <>
                      <a
                        href={`https://wa.me/2${person.phone.replace(/^0/, '')}?text=${messageText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>تهنئة واتساب</span>
                      </a>
                      <a
                        href={`tel:${person.phone}`}
                        className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال هاتفي</span>
                      </a>
                    </>
                  ) : (
                    <div className="col-span-2 text-center text-[11px] text-slate-400 py-1">
                      لا يوجد رقم هاتف مسجل
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

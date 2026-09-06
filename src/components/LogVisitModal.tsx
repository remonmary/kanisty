import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { X, PhoneCall, Check, Calendar } from 'lucide-react';
import { api } from '../services/api';

export const LogVisitModal: React.FC = () => {
  const {
    isLogVisitOpen,
    setIsLogVisitOpen,
    visitationTargetPerson,
    currentUser,
    data,
    activeChurchId,
    refreshData,
    showToast
  } = useChurch();

  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    visitationTargetPerson?.id || ''
  );
  const [method, setMethod] = useState<'call' | 'message' | 'visit' | 'in_person' | 'other'>('call');
  const [reason, setReason] = useState('اطمئنان دوري ومتابعة حضور');
  const [result, setResult] = useState('تم الاطمئنان بحمد الله وسيحضر الاجتماع القادم');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update when target changes
  React.useEffect(() => {
    if (visitationTargetPerson) {
      setSelectedPersonId(visitationTargetPerson.id);
    } else if (data.persons.length > 0 && !selectedPersonId) {
      setSelectedPersonId(data.persons[0].id);
    }
  }, [visitationTargetPerson, data.persons]);

  if (!isLogVisitOpen) return null;

  const targetPerson = data.persons.find(p => p.id === selectedPersonId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId) {
      showToast('يرجى تحديد الشخص المفتقد');
      return;
    }

    try {
      setIsSubmitting(true);
      const today = new Date().toISOString().split('T')[0];
      await api.addVisitation({
        churchId: activeChurchId,
        personId: selectedPersonId,
        servantId: currentUser?.id || 'servant-1',
        servantName: currentUser?.name || 'الخادم',
        serviceId: 'srv-prep',
        date: today,
        method,
        reason,
        result,
        notes,
        followUpDate: followUpDate || undefined,
        isResolved: true
      });

      await refreshData();
      showToast('تم توثيق الافتقاد بنجاح');
      setIsLogVisitOpen(false);
    } catch (err) {
      console.error('Failed to log visit:', err);
      showToast('حدث خطأ أثناء حفظ الافتقاد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsLogVisitOpen(false)}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">توثيق افتقاد رعوي جديد</h3>
              <p className="text-[11px] text-slate-500">حفظ نتائج التواصل والمتابعة في ملف المخدوم</p>
            </div>
          </div>
          <button
            onClick={() => setIsLogVisitOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Person Select */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">المخدوم / الشخص المفتقد:</label>
            <select
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500"
              required
            >
              {data.persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code || 'كود'} - {p.stage})
                </option>
              ))}
            </select>
          </div>

          {/* Method Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">طريقة التواصل والافتقاد:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'call', label: '📞 مكالمة هاتفية' },
                { id: 'message', label: '💬 رسالة واتساب' },
                { id: 'visit', label: '🏠 زيارة منزلية' },
                { id: 'in_person', label: '🤝 مقابلة بالكنيسة' }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setMethod(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-center font-bold border transition-all text-[11px] ${
                    method === item.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">سبب الافتقاد:</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="مثلاً: اطمئنان دوري، غياب عن الاجتماع، مناسبة خاصة..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          {/* Result */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">نتيجة التواصل:</label>
            <textarea
              rows={2}
              value={result}
              onChange={e => setResult(e.target.value)}
              placeholder="ماذا دار في التواصل، ومدى استجابة المخدوم وأسرته..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">ملاحظات إضافية:</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="أي تفاصيل أخرى..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">موعد المتابعة القادمة:</label>
              <input
                type="date"
                value={followUpDate}
                onChange={e => setFollowUpDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsLogVisitOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الافتقاد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

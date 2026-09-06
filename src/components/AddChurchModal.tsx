import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { X, Church as ChurchIcon, Check, ShieldCheck } from 'lucide-react';

export const AddChurchModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addNewChurch, showToast } = useChurch();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await addNewChurch({
        name: name.trim(),
        region: region.trim() || 'محافظة القاهرة',
        address: address.trim() || 'العنوان الرئيسي للكنيسة',
        phone: phone.trim() || '02-0000000',
        email: email.trim() || 'info@kenisati.org',
        logo: '⛪',
        settings: {
          attendanceTypes: [
            { id: 'meeting', label: 'اجتماع أسبوعي', icon: 'Users' },
            { id: 'liturgy', label: 'قداس إلهي', icon: 'Church' },
            { id: 'activity', label: 'نشاط وورشة عمل', icon: 'Smile' }
          ],
          attendanceStatuses: [
            { id: 'present', label: 'حاضر', color: '#16a34a', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
            { id: 'absent', label: 'غائب', color: '#dc2626', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
            { id: 'excused', label: 'اعتذار مسبق', color: '#d97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' }
          ],
          visitationMethods: [
            { id: 'call', label: 'مكالمة هاتفية', icon: 'Phone' },
            { id: 'message', label: 'رسالة واتساب', icon: 'MessageCircle' },
            { id: 'visit', label: 'زيارة منزلية', icon: 'Home' }
          ],
          stages: ['ابتدائي', 'إعدادي', 'ثانوي', 'شباب', 'عامة']
        }
      });
      onClose();
    } catch (err) {
      console.error('Failed to create church:', err);
      showToast('حدث خطأ أثناء إنشاء حساب الكنيسة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              ⛪
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">تسجيل كنيسة جديدة (حساب مستقل)</h3>
              <p className="text-[11px] text-slate-500">عزل كامل وتام للبيانات وقواعد البيانات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            ستكون بيانات هذه الكنيسة (الأشخاص، الخدمات، الحضور) معزولة تماماً ولا يمكن لأي كنيسة أخرى الاطلاع عليها.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">اسم الكنيسة والمقر:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثلاً: كنيسة الشهيد أبانوب النهيسي"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:outline-hidden focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">المحافظة / الإيبارشية:</label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="مثلاً: المنيا / ملوي"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">الهاتف الرسمي:</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="مثلاً: 086-2345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">العنوان التفصيلي:</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="شارع الكنيسة، بجوار..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">البريد الإلكتروني للإدارة:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@church.org"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
              <span>{isSubmitting ? 'جاري التسجيل...' : 'تسجيل الكنيسة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

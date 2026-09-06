import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { X, UserPlus, Check, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { UserRole } from '../types';

interface ServiceAssignmentRow {
  serviceId: string;
  meetingId: string;
  groupId: string;
  role: UserRole;
  roleTitle: string;
}

export const AddPersonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    activeChurchId,
    currentUser,
    data,
    refreshData,
    showToast
  } = useChurch();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [code, setCode] = useState(() => `MN-${Math.floor(1000 + Math.random() * 9000)}`);
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('2011-05-15');
  const [stage, setStage] = useState('إعدادي');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('القاهرة');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('أب');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial service assignment
  const [serviceAssignments, setServiceAssignments] = useState<ServiceAssignmentRow[]>([
    {
      serviceId: data.services[0]?.id || '',
      meetingId: data.meetings[0]?.id || '',
      groupId: data.groups[0]?.id || '',
      role: 'member',
      roleTitle: ''
    }
  ]);

  if (!isOpen) return null;

  const addServiceRow = () => {
    setServiceAssignments(prev => [
      ...prev,
      {
        serviceId: data.services[0]?.id || '',
        meetingId: '',
        groupId: '',
        role: 'member',
        roleTitle: ''
      }
    ]);
  };

  const removeServiceRow = (idx: number) => {
    setServiceAssignments(prev => prev.filter((_, i) => i !== idx));
  };

  const updateServiceRow = (idx: number, field: keyof ServiceAssignmentRow, val: any) => {
    setServiceAssignments(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);

      const createdPerson = await api.addPerson(
        {
          churchId: activeChurchId,
          name: name.trim(),
          gender,
          code: code.trim(),
          phone: phone.trim(),
          birthDate,
          stage,
          school: school.trim(),
          address: address.trim(),
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
          parentName: parentName.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          parentRelation: parentName.trim() ? parentRelation : undefined,
          notes: notes.trim() || undefined
        },
        currentUser?.name || 'المسؤول'
      );

      // Save Many-to-Many memberships
      for (const row of serviceAssignments) {
        if (row.serviceId) {
          await api.addMembership({
            churchId: activeChurchId,
            personId: createdPerson.id,
            serviceId: row.serviceId,
            meetingId: row.meetingId || undefined,
            groupId: row.groupId || undefined,
            role: row.role,
            roleTitle: row.roleTitle || undefined
          });
        }
      }

      await refreshData();
      showToast(`تمت إضافة ${createdPerson.name} وتسكينه في الخدمات المحددة بنجاح`);
      onClose();
    } catch (err) {
      console.error('Failed to add person:', err);
      showToast('حدث خطأ أثناء حفظ بيانات الشخص');
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

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-right flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">إضافة شخص جديد للمنظومة</h3>
              <p className="text-[11px] text-slate-500">
                (كاهن / أمين خدمة / خادم / مخدوم مع ربطه بالخدمات المناسبة)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
          {/* Section 1: Basic Info */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">1. البيانات الشخصية الأساسية</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">الاسم رباعي:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثلاً: يوسف سمير جرجس"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">كود المخدوم / العضو:</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">النوع:</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تاريخ الميلاد:</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المرحلة الدراسية:</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                >
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="شباب جامعي">شباب جامعي</option>
                  <option value="خريجين">خريجين</option>
                  <option value="عامة">عامة / كهنة</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الهاتف:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="012..."
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">المدرسة / الكلية / العمل:</label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  placeholder="مدرسة القديس يوسف"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان بالتفصيل:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="الشارع، المنطقة"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Many-to-Many Services Assignment (Rule 6) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-amber-950 text-xs">2. تسكين الخدمات والأدوار (Many-to-Many)</h4>
                <p className="text-[11px] text-amber-800">
                  يمكن ربط الشخص بأكثر من خدمة وتحديد دوره في كل خدمة بشكل مستقل
                </p>
              </div>
              <button
                type="button"
                onClick={addServiceRow}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خدمة أخرى</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {serviceAssignments.map((row, idx) => {
                const filteredMeetings = data.meetings.filter(m => m.serviceId === row.serviceId);
                const filteredGroups = data.groups.filter(g => g.serviceId === row.serviceId);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      {/* Service Select */}
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الخدمة:</label>
                        <select
                          value={row.serviceId}
                          onChange={e => updateServiceRow(idx, 'serviceId', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                          required
                        >
                          {data.services.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.icon} {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Role Select */}
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الدور في هذه الخدمة:</label>
                        <select
                          value={row.role}
                          onChange={e => updateServiceRow(idx, 'role', e.target.value as any)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                        >
                          <option value="member">مخدوم</option>
                          <option value="servant">خادم</option>
                          <option value="leader">أمين خدمة</option>
                          <option value="priest">كاهن مرشد</option>
                        </select>
                      </div>

                      {/* Meeting Select */}
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الاجتماع:</label>
                        <select
                          value={row.meetingId}
                          onChange={e => updateServiceRow(idx, 'meetingId', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                        >
                          <option value="">(عام لكافة الاجتماعات)</option>
                          {filteredMeetings.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Group & Remove */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">المجموعة:</label>
                          <select
                            value={row.groupId}
                            onChange={e => updateServiceRow(idx, 'groupId', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                          >
                            <option value="">(بدون مجموعة)</option>
                            {filteredGroups.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {serviceAssignments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceRow(idx)}
                            className="mt-4 p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Parent Info (Section 27) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs">3. بيانات ولي الأمر (اختياري)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم ولي الأمر:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="مثلاً: سمير جرجس بشارة"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">صلة القرابة:</label>
                <select
                  value={parentRelation}
                  onChange={e => setParentRelation(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="أب">أب</option>
                  <option value="أم">أم</option>
                  <option value="ولي أمر">ولي أمر</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">هاتف ولي الأمر:</label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  placeholder="012..."
                  className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">ملاحظات رعوية أو إرشادية:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثلاً: شماس، موهوب في الألحان، يحتاج متابعة دراسية..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
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
              <span>{isSubmitting ? 'جاري الحفظ والتسكين...' : 'إضافة وتسكين الشخص'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

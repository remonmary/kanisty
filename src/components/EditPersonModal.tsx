import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  X,
  UserCheck,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Layers,
  Save,
  Phone,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { Person, UserRole } from '../types';

interface ServiceAssignmentRow {
  membershipId?: string;
  serviceId: string;
  meetingId: string;
  role: UserRole;
  roleTitle: string;
}

export const EditPersonModal: React.FC<{
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ person, isOpen, onClose }) => {
  const {
    activeChurchId,
    activeChurch,
    currentAccount,
    currentUser,
    data,
    refreshData,
    showToast
  } = useChurch();

  const resolvedChurchId = currentAccount?.churchId || activeChurch?.id || activeChurchId || 'church-1';

  // Basic Info State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [stage, setStage] = useState('إعدادي');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>('active');
  const [notes, setNotes] = useState('');

  // Parent Info State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('أب');
  const [parentJob, setParentJob] = useState('');

  // Service Assignment State
  const [serviceAssignments, setServiceAssignments] = useState<ServiceAssignmentRow[]>([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize from person prop whenever modal opens
  useEffect(() => {
    if (isOpen && person) {
      setName(person.name || '');
      setGender(person.gender || 'male');
      setCode(person.code || '');
      setPhone(person.phone || '');
      setBirthDate(person.birthDate || '');
      setStage(person.stage || 'إعدادي');
      setSchool(person.school || '');
      setAddress(person.address || '');
      setStatus(person.status || 'active');
      setNotes(person.notes || '');

      // Parent info
      setParentName(person.parentName || '');
      setParentPhone(person.parentPhone || '');
      setParentRelation(person.parentRelation || 'أب');
      const linkedParent = person.parentId ? data.parents?.find(p => p.id === person.parentId) : undefined;
      setParentJob(linkedParent?.job || '');

      // Memberships
      const existingMems = data.memberships.filter(m => m.personId === person.id && m.isActive);
      if (existingMems.length > 0) {
        setServiceAssignments(
          existingMems.map(m => ({
            membershipId: m.id,
            serviceId: m.serviceId,
            meetingId: m.meetingId || '',
            role: m.role || 'member',
            roleTitle: m.roleTitle || ''
          }))
        );
      } else if (data.services.length > 0) {
        const firstSvc = data.services[0];
        const firstMeetings = data.meetings.filter(m => m.serviceId === firstSvc.id);
        setServiceAssignments([
          {
            serviceId: firstSvc.id,
            meetingId: firstMeetings.length > 0 ? firstMeetings[0].id : '',
            role: 'member',
            roleTitle: ''
          }
        ]);
      } else {
        setServiceAssignments([]);
      }

      setErrorMessage(null);
    }
  }, [isOpen, person, data.memberships, data.services, data.meetings, data.parents]);

  if (!isOpen || !person) return null;

  const addServiceRow = () => {
    if (data.services.length === 0) return;
    const assignedIds = new Set(serviceAssignments.map(s => s.serviceId));
    const nextService = data.services.find(s => !assignedIds.has(s.id)) || data.services[0];
    const svcMeetings = data.meetings.filter(m => m.serviceId === nextService.id);

    setServiceAssignments(prev => [
      ...prev,
      {
        serviceId: nextService.id,
        meetingId: svcMeetings.length > 0 ? svcMeetings[0].id : '',
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
      if (field === 'serviceId') {
        const svcMeetings = data.meetings.filter(m => m.serviceId === val);
        copy[idx] = {
          ...copy[idx],
          serviceId: val,
          meetingId: svcMeetings.length > 0 ? svcMeetings[0].id : ''
        };
      } else {
        copy[idx] = { ...copy[idx], [field]: val };
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('يرجى إدخال اسم الشخص بالكامل');
      return;
    }

    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMessage('يرجى تحديد كود للشخص');
      return;
    }

    // Check code duplication against other persons
    const codeExists = data.persons.some(
      p => p.id !== person.id && p.code && p.code.toUpperCase() === cleanCode.toUpperCase()
    );
    if (codeExists) {
      setErrorMessage(`الكود «${cleanCode}» مستخدم بالفعل لشخص آخر.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const operator = currentUser?.name || currentAccount?.name || 'المسؤول';

      // 1. Update Person record
      await api.updatePerson(
        person.id,
        {
          name: cleanName,
          gender,
          code: cleanCode,
          phone: phone.trim(),
          birthDate: birthDate || undefined,
          stage,
          school: school.trim(),
          address: address.trim(),
          status,
          parentName: parentName.trim() || undefined,
          parentPhone: parentPhone.trim() || undefined,
          parentRelation: parentName.trim() ? parentRelation : undefined,
          notes: notes.trim() || undefined
        },
        operator
      );

      // 2. Manage Memberships
      const existingMems = data.memberships.filter(m => m.personId === person.id && m.isActive);
      const currentMemIds = new Set(serviceAssignments.map(s => s.membershipId).filter(Boolean));

      // Remove deleted memberships
      for (const m of existingMems) {
        if (!currentMemIds.has(m.id)) {
          try {
            await api.deleteMembership(m.id);
          } catch (e) {
            console.warn('Could not delete membership', e);
          }
        }
      }

      // Add or update memberships
      for (const row of serviceAssignments) {
        if (!row.serviceId) continue;
        if (row.membershipId) {
          // Update existing
          await api.updateMembership(row.membershipId, {
            serviceId: row.serviceId,
            meetingId: row.meetingId || undefined,
            role: row.role,
            roleTitle: row.roleTitle || undefined
          });
        } else {
          // Create new
          await api.addMembership({
            churchId: resolvedChurchId,
            personId: person.id,
            serviceId: row.serviceId,
            meetingId: row.meetingId || undefined,
            role: row.role,
            roleTitle: row.roleTitle || undefined
          });
        }
      }

      await refreshData();
      showToast(`تم حفظ تعديل بيانات «${cleanName}» بنجاح`);
      onClose();
    } catch (err: any) {
      console.error('Failed to update person:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">تعديل بيانات الشخص</h3>
              <p className="text-xs text-slate-500">تحديث السجل الشخصي، الخدمات، والبيانات الأسرية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-right">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <User className="w-4 h-4 text-amber-600" />
              <span>1. البيانات الشخصية والأساسية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  الاسم بالكامل (رباعي): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:bg-white focus:outline-hidden text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  الكود الكنسي: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800 focus:bg-white focus:outline-hidden text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">النوع:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      gender === 'male'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ذكر 👦
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      gender === 'female'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    أنثى 👧
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المرحلة الدراسية / العمرية:</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs"
                >
                  <option value="حضانة">حضانة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="جامعة">جامعة</option>
                  <option value="خريجين">خريجين</option>
                  <option value="عامة">عامة</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الهاتف الشخصي:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">تاريخ الميلاد:</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المدرسة / الكلية / العمل:</label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  placeholder="اسم المدرسة أو الجامعة أو الوظيفة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان بالتفصيل:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="الشارع، المنطقة، رقم العقار"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">حالة السجل:</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
                >
                  <option value="active">نشط ومستمر</option>
                  <option value="inactive">غير نشط / منقطع</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات عامة:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="أي ملاحظات رعوية أو صحية خاصة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent Info */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>2. بيانات ولي الأمر والأسرة</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم ولي الأمر:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="اسم الأب أو الأم"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">هاتف ولي الأمر:</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">صلة القرابة:</label>
                <select
                  value={parentRelation}
                  onChange={e => setParentRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                >
                  <option value="أب">أب</option>
                  <option value="أم">أم</option>
                  <option value="أخ / أخت">أخ / أخت</option>
                  <option value="قريب / وصي">قريب / وصي</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">وظيفة ولي الأمر:</label>
                <input
                  type="text"
                  value={parentJob}
                  onChange={e => setParentJob(e.target.value)}
                  placeholder="المهنة أو جهة العمل"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Service & Meeting Assignment */}
          <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>3. تسكين الخدمات والاجتماعات الأسبوعية</span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  تحديد الخدمات التي ينتمي إليها الشخص، والاجتماع ودوره في كل خدمة
                </p>
              </div>

              <button
                type="button"
                onClick={addServiceRow}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خدمة أخرى</span>
              </button>
            </div>

            {serviceAssignments.length === 0 ? (
              <p className="text-slate-400 text-xs italic py-2">لا توجد خدمات مسكن بها حالياً</p>
            ) : (
              <div className="space-y-2.5">
                {serviceAssignments.map((row, idx) => {
                  const filteredMeetings = data.meetings.filter(m => m.serviceId === row.serviceId);

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                        {/* Service */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الخدمة:</label>
                          <select
                            value={row.serviceId}
                            onChange={e => updateServiceRow(idx, 'serviceId', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
                          >
                            {data.services.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.icon || '⛪'} {s.name} ({s.stage})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Role */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الدور في الخدمة:</label>
                          <select
                            value={row.role}
                            onChange={e => updateServiceRow(idx, 'role', e.target.value as any)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
                          >
                            <option value="member">مخدوم</option>
                            <option value="servant">خادم</option>
                            <option value="leader">أمين خدمة</option>
                            <option value="priest">كاهن مرشد</option>
                          </select>
                        </div>

                        {/* Meeting */}
                        <div className={serviceAssignments.length > 1 ? "sm:col-span-4" : "sm:col-span-5"}>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الاجتماع الأسبوعي:</label>
                          <select
                            value={row.meetingId}
                            onChange={e => updateServiceRow(idx, 'meetingId', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold"
                          >
                            {filteredMeetings.length === 0 ? (
                              <option value="">(عام لكافة الاجتماعات - لا يوجد اجتماع مسجل)</option>
                            ) : (
                              <>
                                <option value="">(عام لكافة اجتماعات الخدمة)</option>
                                {filteredMeetings.map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} ({m.dayOfWeek} {m.time ? '- ' + m.time : ''})
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>

                        {/* Delete Row */}
                        {serviceAssignments.length > 1 && (
                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeServiceRow(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer w-full flex items-center justify-center border border-rose-200"
                              title="حذف هذا التسكين"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Optional custom role title */}
                      {(row.role === 'servant' || row.role === 'leader') && (
                        <div className="pt-1 flex items-center gap-2">
                          <label className="text-[10px] text-slate-500 font-bold shrink-0">المسمى المخصص:</label>
                          <input
                            type="text"
                            value={row.roleTitle}
                            onChange={e => updateServiceRow(idx, 'roleTitle', e.target.value)}
                            placeholder="مثلاً: مسؤول حضور وغياب، خادم فصل..."
                            className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

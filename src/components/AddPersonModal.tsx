import React, { useState, useEffect } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  X,
  UserPlus,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Shield,
  AlertCircle,
  KeyRound,
  Users,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
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
    activeChurch,
    currentAccount,
    currentUser,
    data,
    refreshData,
    showToast
  } = useChurch();

  // Resolved tenant Church ID
  const resolvedChurchId = currentAccount?.churchId || activeChurch?.id || activeChurchId || 'church-1';

  // Primary Classification
  const [generalRole, setGeneralRole] = useState<'member' | 'servant' | 'leader' | 'priest' | 'deacon'>('member');

  // Basic Info State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('2012-05-15');
  const [stage, setStage] = useState('إعدادي');
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('القاهرة');

  // Parent Info State
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('أب');
  const [parentJob, setParentJob] = useState('');

  // Service Assignment State
  const [assignServicesNow, setAssignServicesNow] = useState(true);
  const [serviceAssignments, setServiceAssignments] = useState<ServiceAssignmentRow[]>([]);

  // Servant Account Creation Option
  const [createAccountForServant, setCreateAccountForServant] = useState(false);
  const [accountPassword, setAccountPassword] = useState('123456');

  // Notes & UI State
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to generate a collision-free code based on role
  const generateNewCode = (role: string) => {
    let prefix = 'MEM';
    if (role === 'servant') prefix = 'SRV';
    else if (role === 'leader') prefix = 'LDR';
    else if (role === 'priest') prefix = 'PR';
    else if (role === 'deacon') prefix = 'DCN';

    const existingCodes = new Set(data.persons.map(p => (p.code || '').toUpperCase()));
    for (let i = 0; i < 50; i++) {
      const candidate = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!existingCodes.has(candidate.toUpperCase())) {
        return candidate;
      }
    }
    return `${prefix}-${Date.now().toString().slice(-4)}`;
  };

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setGender('male');
      setGeneralRole('member');
      setPhone('');
      setBirthDate('2012-05-15');
      setStage('إعدادي');
      setSchool('');
      setAddress('القاهرة');
      setParentName('');
      setParentPhone('');
      setParentRelation('أب');
      setParentJob('');
      setNotes('');
      setCreateAccountForServant(false);
      setAccountPassword('123456');
      setErrorMessage(null);

      // Generate clean unique code
      setCode(generateNewCode('member'));

      // Set initial service assignments
      if (data.services.length > 0) {
        setAssignServicesNow(true);
        setServiceAssignments([
          {
            serviceId: data.services[0].id,
            meetingId: '',
            groupId: '',
            role: 'member',
            roleTitle: ''
          }
        ]);
      } else {
        setAssignServicesNow(false);
        setServiceAssignments([]);
      }
    }
  }, [isOpen, data.services]);

  if (!isOpen) return null;

  // Handle General Role change
  const handleRoleChange = (newRole: 'member' | 'servant' | 'leader' | 'priest' | 'deacon') => {
    setGeneralRole(newRole);
    setCode(generateNewCode(newRole));

    // Map to membership role
    const mappedRole: UserRole =
      newRole === 'priest' ? 'priest' : newRole === 'leader' ? 'leader' : newRole === 'servant' ? 'servant' : 'member';

    // Synchronize role in service assignments
    setServiceAssignments(prev =>
      prev.map(row => ({
        ...row,
        role: mappedRole
      }))
    );

    // If servant, suggest account creation
    if (newRole === 'servant' || newRole === 'leader' || newRole === 'priest') {
      setCreateAccountForServant(true);
    } else {
      setCreateAccountForServant(false);
    }
  };

  // Service Assignment helpers
  const addServiceRow = () => {
    if (data.services.length === 0) return;

    // Pick first service not yet assigned, or fallback to first
    const assignedIds = new Set(serviceAssignments.map(s => s.serviceId));
    const nextService = data.services.find(s => !assignedIds.has(s.id)) || data.services[0];

    const mappedRole: UserRole =
      generalRole === 'priest' ? 'priest' : generalRole === 'leader' ? 'leader' : generalRole === 'servant' ? 'servant' : 'member';

    setServiceAssignments(prev => [
      ...prev,
      {
        serviceId: nextService.id,
        meetingId: '',
        groupId: '',
        role: mappedRole,
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
        // Reset meeting and group when changing service to avoid cross-service mismatch
        copy[idx] = {
          ...copy[idx],
          serviceId: val,
          meetingId: '',
          groupId: ''
        };
      } else {
        copy[idx] = { ...copy[idx], [field]: val };
      }
      return copy;
    });
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('يرجى إدخال اسم الشخص رباعي باللغة العربية');
      return;
    }

    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMessage('يرجى تحديد كود للشخص');
      return;
    }

    // Check code duplication in active church persons
    const codeExists = data.persons.some(
      p => p.code && p.code.toUpperCase() === cleanCode.toUpperCase()
    );
    if (codeExists) {
      setErrorMessage(`الكود «${cleanCode}» مستخدم بالفعل لشخص آخر. يرجى تعديله أو الضغط على زر توليد كود جديد.`);
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create the Person record
      const createdPerson = await api.addPerson(
        {
          churchId: resolvedChurchId,
          name: cleanName,
          gender,
          code: cleanCode,
          phone: phone.trim(),
          birthDate: birthDate || '2012-01-01',
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
        currentUser?.name || currentAccount?.name || 'المسؤول'
      );

      // 2. If parent info was provided, create/link Parent record
      if (parentName.trim()) {
        try {
          const newParent = await api.addParent({
            churchId: resolvedChurchId,
            name: parentName.trim(),
            phone: parentPhone.trim() || phone.trim() || '',
            relation: parentRelation,
            job: parentJob.trim() || undefined,
            childrenIds: [createdPerson.id]
          });
          if (newParent && newParent.id) {
            await api.updatePerson(
              createdPerson.id,
              { parentId: newParent.id },
              currentUser?.name || currentAccount?.name || 'المسؤول'
            );
          }
        } catch (parentErr) {
          console.warn('Could not save separate parent record, continuing:', parentErr);
        }
      }

      // 3. Save Many-to-Many memberships if enabled
      if (assignServicesNow && serviceAssignments.length > 0) {
        for (const row of serviceAssignments) {
          if (row.serviceId) {
            await api.addMembership({
              churchId: resolvedChurchId,
              personId: createdPerson.id,
              serviceId: row.serviceId,
              meetingId: row.meetingId || undefined,
              groupId: row.groupId || undefined,
              role: row.role || (generalRole === 'servant' ? 'servant' : 'member'),
              roleTitle: row.roleTitle || undefined
            });
          }
        }
      }

      // 4. Create user account for servant if requested
      if (createAccountForServant && phone.trim()) {
        try {
          const existingAcc = data.accounts?.find(a => a.phone === phone.trim());
          if (!existingAcc) {
            const assignedServiceIds = serviceAssignments
              .map(s => s.serviceId)
              .filter(Boolean);

            await api.addAccount({
              churchId: resolvedChurchId,
              name: cleanName,
              phone: phone.trim(),
              password: accountPassword || '123456',
              role: generalRole === 'priest' ? 'priest' : generalRole === 'leader' ? 'leader' : 'servant',
              roleTitle:
                generalRole === 'priest'
                  ? 'كاهن مرشد'
                  : generalRole === 'leader'
                  ? 'أمين خدمة'
                  : 'خادم معتمد',
              serviceIds: assignedServiceIds,
              personId: createdPerson.id,
              permissions: {
                canManagePersons: generalRole === 'priest' || generalRole === 'leader',
                canTakeAttendance: true,
                canLogVisitations: true,
                canCreatePreparations: true,
                canManageTasks: true,
                canPostAnnouncements: generalRole === 'priest' || generalRole === 'leader',
                canViewReports: generalRole === 'priest' || generalRole === 'leader',
                canManageUsers: generalRole === 'priest',
                canAccessSettings: generalRole === 'priest'
              }
            });
          }
        } catch (accErr) {
          console.warn('Could not auto-create servant user account:', accErr);
        }
      }

      // 5. Refresh all data in context
      await refreshData();

      showToast(`تمت إضافة «${cleanName}» للمنظومة وتسكين كافة البيانات بنجاح`);
      onClose();
    } catch (err: any) {
      console.error('Failed to add person:', err);
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء حفظ بيانات الشخص. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-right flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">إضافة شخص جديد للمنظومة</h3>
              <p className="text-[11px] text-slate-500">
                تسجيل البيانات الشخصية والكنسية وربطه بالخدمات المناسبة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
          {/* Error Alert Box if any */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold text-xs leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Section 0: Primary Role / الصفة بالمنظومة */}
          <div className="p-4 rounded-2xl bg-gradient-to-l from-amber-50/70 via-amber-50/40 to-slate-50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>الصفة الكنسية / نوع الشخص بالمنظومة:</span>
              </h4>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                تحدد الصلاحيات وطريقة المتابعة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {[
                { id: 'member', label: 'مخدوم', desc: 'تلميذ / عضو بالخدمة' },
                { id: 'servant', label: 'خادم', desc: 'متابعة وافتقاد وتحضير' },
                { id: 'leader', label: 'أمين خدمة', desc: 'إشراف وتقارير الخدمة' },
                { id: 'priest', label: 'أب كاهن', desc: 'رعاية وإشراف عام' },
                { id: 'deacon', label: 'شماس', desc: 'ألحان وطقوس' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    generalRole === r.id
                      ? 'bg-slate-900 border-slate-900 text-amber-400 font-bold shadow-md shadow-slate-900/10 scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/30'
                  }`}
                >
                  <span className="text-xs font-black">{r.label}</span>
                  <span className={`text-[9px] mt-0.5 ${generalRole === r.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Basic Info */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3.5">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>1. البيانات الشخصية الأساسية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  الاسم رباعي: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="مثلاً: يوسف سمير جرجس بشارة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  كود الشخص: <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCode(generateNewCode(generalRole))}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors shrink-0"
                    title="توليد كود تلقائي جديد"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">النوع:</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden text-xs"
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">المرحلة الدراسية / العمرية:</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden text-xs"
                >
                  <option value="حضانة">حضانة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="شباب جامعي">شباب جامعي</option>
                  <option value="خريجين">خريجين</option>
                  <option value="عامة">عامة / أخرى</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم هاتف الشخص:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="010 / 011 / 012..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">المدرسة / الكلية / جهة العمل:</label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  placeholder="مثلاً: مدرسة القديس يوسف أو كلية التجارة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">العنوان بالتفصيل:</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="الشارع، المنطقة، رقم العقار"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Many-to-Many Service Assignment */}
          <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>2. تسكين الخدمات والمجموعات (Many-to-Many)</span>
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  تحديد الخدمات التي ينتمي إليها الشخص، والاجتماع والمجموعة ودوره في كل خدمة
                </p>
              </div>

              {data.services.length > 0 && assignServicesNow && (
                <button
                  type="button"
                  onClick={addServiceRow}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة خدمة أخرى</span>
                </button>
              )}
            </div>

            {/* If Church has no services yet */}
            {data.services.length === 0 ? (
              <div className="p-3 bg-amber-100/50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                لا توجد خدمات مسجلة في الكنيسة حالياً. سيتم حفظ بيانات الشخص الأساسية وتسكينه في الخدمات بعد إنشائها من تبويب «الخدمات».
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Toggle to skip or assign services */}
                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="assignServicesToggle"
                    checked={assignServicesNow}
                    onChange={e => {
                      setAssignServicesNow(e.target.checked);
                      if (e.target.checked && serviceAssignments.length === 0) {
                        setServiceAssignments([
                          {
                            serviceId: data.services[0].id,
                            meetingId: '',
                            groupId: '',
                            role: generalRole === 'priest' ? 'priest' : generalRole === 'leader' ? 'leader' : generalRole === 'servant' ? 'servant' : 'member',
                            roleTitle: ''
                          }
                        ]);
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <label htmlFor="assignServicesToggle" className="font-bold text-slate-800 text-xs cursor-pointer">
                    تسكين الشخص في خدمة محددة الآن
                  </label>
                </div>

                {assignServicesNow && (
                  <div className="space-y-2.5">
                    {serviceAssignments.map((row, idx) => {
                      const filteredMeetings = data.meetings.filter(m => m.serviceId === row.serviceId);
                      const filteredGroups = data.groups.filter(g => g.serviceId === row.serviceId);

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            {/* Service Select */}
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الخدمة:</label>
                              <select
                                value={row.serviceId}
                                onChange={e => updateServiceRow(idx, 'serviceId', e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs"
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

                            {/* Meeting Select */}
                            <div>
                              <label className="text-[10px] text-slate-500 font-bold block mb-0.5">الاجتماع:</label>
                              <select
                                value={row.meetingId}
                                onChange={e => updateServiceRow(idx, 'meetingId', e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs"
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
                                <label className="text-[10px] text-slate-500 font-bold block mb-0.5">المجموعة / الأسرة:</label>
                                <select
                                  value={row.groupId}
                                  onChange={e => updateServiceRow(idx, 'groupId', e.target.value)}
                                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs"
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
                                  className="mt-4 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="حذف هذا التسكين"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
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
            )}
          </div>

          {/* Section 3: Optional Account Creation for Servants */}
          {(generalRole === 'servant' || generalRole === 'leader' || generalRole === 'priest') && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createAccountCheckbox"
                  checked={createAccountForServant}
                  onChange={e => setCreateAccountForServant(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="createAccountCheckbox" className="font-extrabold text-indigo-950 text-xs flex items-center gap-1.5 cursor-pointer">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>إنشاء حساب تسجيل دخول للنظام لهذا الخادم فوراً</span>
                </label>
              </div>

              {createAccountForServant && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-indigo-100 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">اسم المستخدم / رقم الموبايل للدخول:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="010..."
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                      required={createAccountForServant}
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      سيستخدم رقم هاتفه لتسجيل الدخول في الكنيسة
                    </span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">كلمة المرور المبدئية:</label>
                    <input
                      type="text"
                      value={accountPassword}
                      onChange={e => setAccountPassword(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold font-mono"
                      required={createAccountForServant}
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      يمكن للخادم تغيير كلمة المرور لاحقاً
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Parent Info (Section 27) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-600" />
              <span>3. بيانات ولي الأمر (اختياري)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم ولي الأمر:</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="مثلاً: سمير جرجس بشارة"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">صلة القرابة:</label>
                <select
                  value={parentRelation}
                  onChange={e => setParentRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden"
                >
                  <option value="أب">أب</option>
                  <option value="أم">أم</option>
                  <option value="ولي أمر">ولي أمر</option>
                  <option value="أخ / أخت">أخ / أخت</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">هاتف ولي الأمر:</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">ملاحظات رعوية أو إرشادية:</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثلاً: شماس، موهوب في الألحان، يحتاج متابعة دراسية..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer text-xs"
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

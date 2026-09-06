import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Layers,
  Plus,
  Clock,
  Users,
  Calendar,
  X,
  Check,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { ROLE_BADGES } from '../utils/churchUtils';

export const ServicesView: React.FC = () => {
  const {
    data,
    activeChurchId,
    refreshData,
    showToast,
    setSelectedPersonForProfile
  } = useChurch();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    data.services[0]?.id || ''
  );
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  // Forms
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceStage, setNewServiceStage] = useState('إعدادي');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDay, setNewMeetingDay] = useState('الجمعة');
  const [newMeetingTime, setNewMeetingTime] = useState('06:00 م');
  const [newMeetingLocation, setNewMeetingLocation] = useState('قاعة الكنيسة');

  const activeService = data.services.find(s => s.id === selectedServiceId) || data.services[0];
  const serviceMeetings = data.meetings.filter(m => m.serviceId === activeService?.id);
  const serviceMemberships = data.memberships.filter(m => m.serviceId === activeService?.id && m.isActive);

  const leaders = serviceMemberships.filter(m => m.role === 'leader');
  const servants = serviceMemberships.filter(m => m.role === 'servant');
  const members = serviceMemberships.filter(m => m.role === 'member');

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    try {
      const created = await api.addService({
        churchId: activeChurchId,
        name: newServiceName.trim(),
        stage: newServiceStage,
        description: newServiceDesc.trim() || undefined,
        icon: '⛪'
      });
      await refreshData();
      setSelectedServiceId(created.id);
      setIsAddServiceOpen(false);
      setNewServiceName('');
      setNewServiceDesc('');
      showToast('تمت إضافة الخدمة بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة الخدمة');
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingName.trim() || !activeService) return;
    try {
      await api.addMeeting({
        churchId: activeChurchId,
        serviceId: activeService.id,
        name: newMeetingName.trim(),
        dayOfWeek: newMeetingDay,
        time: newMeetingTime,
        location: newMeetingLocation.trim() || undefined
      });
      await refreshData();
      setIsAddMeetingOpen(false);
      setNewMeetingName('');
      showToast('تمت إضافة الاجتماع بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة الاجتماع');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>إدارة الخدمات والاجتماعات</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {data.services.length} خدمات
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة الخدمات والاجتماعات الأسبوعية ومتابعة الخدام والمخدومين
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeService && (
            <button
              onClick={() => setIsAddMeetingOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>إضافة اجتماع للخدمة</span>
            </button>
          )}
          <button
            onClick={() => setIsAddServiceOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Services Tabs / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.services.map(srv => {
          const isSelected = srv.id === activeService?.id;
          const count = data.memberships.filter(m => m.serviceId === srv.id && m.isActive).length;
          const meetingsCount = data.meetings.filter(m => m.serviceId === srv.id).length;

          return (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-md ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="text-2xl block mb-1">{srv.icon || '⛪'}</span>
                <h4 className="font-extrabold text-xs leading-tight">{srv.name}</h4>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  {srv.stage}
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold flex items-center justify-between">
                <span>{count} شخص</span>
                <span className={isSelected ? 'text-amber-300' : 'text-slate-400'}>
                  {meetingsCount} اجتماع
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Service Detailed View */}
      {activeService && (
        <div className="space-y-6">
          {/* Service Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{activeService.icon || '⛪'}</span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{activeService.name}</h3>
                <p className="text-xs text-slate-500">
                  المرحلة: <strong>{activeService.stage}</strong> • {activeService.description || 'خدمة كنسية مباركة'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddMeetingOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة اجتماع لهذا القطاع</span>
            </button>
          </div>

          {/* Meetings Section (Full width now that Groups are removed) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>اجتماعات الخدمة ({serviceMeetings.length})</span>
              </h4>
              <button
                onClick={() => setIsAddMeetingOpen(true)}
                className="text-amber-700 font-bold text-xs hover:underline cursor-pointer"
              >
                + إضافة اجتماع جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {serviceMeetings.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد اجتماعات مضافة لهذه الخدمة بعد. اضغط على «إضافة اجتماع» لتسجيل مواعيد الخدمة الأسبوعية.
                </div>
              ) : (
                serviceMeetings.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">{m.name}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {m.dayOfWeek} • الساعة {m.time}
                      </p>
                      {m.location && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{m.location}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                      أسبوعي
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members Roster in this Service */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" />
              <span>الأشخاص المنتمين لهذه الخدمة ({serviceMemberships.length} شخص)</span>
            </h4>

            {/* Servants list */}
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-2">
                أمانة وهيئة الخدمة ({leaders.length + servants.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[...leaders, ...servants].length === 0 ? (
                  <div className="col-span-full py-3 text-slate-400 text-xs">
                    لم يتم تعيين خدام لهذه الخدمة بعد
                  </div>
                ) : (
                  [...leaders, ...servants].map(m => {
                    const person = data.persons.find(p => p.id === m.personId);
                    if (!person) return null;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedPersonForProfile(person)}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-amber-400 cursor-pointer transition-all"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{person.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{person.phone || person.code}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ROLE_BADGES[m.role]?.bg}`}>
                          {ROLE_BADGES[m.role]?.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Members list */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                المخدومين ({members.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {members.length === 0 ? (
                  <div className="col-span-full py-3 text-slate-400 text-xs">
                    لا يوجد مخدومين مسكنين في هذه الخدمة حالياً
                  </div>
                ) : (
                  members.map(m => {
                    const person = data.persons.find(p => p.id === m.personId);
                    if (!person) return null;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedPersonForProfile(person)}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 cursor-pointer transition-all"
                      >
                        <span className="font-bold text-slate-800 block truncate">{person.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{person.code}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddServiceOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border p-6 z-10 text-right text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">إضافة قطاع خدمة جديد</h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم الخدمة:</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  placeholder="مثلاً: خدمة إعدادي، خدمة ثانوي بنين..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">المرحلة الدراسية / النوعية:</label>
                <select
                  value={newServiceStage}
                  onChange={e => setNewServiceStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-semibold"
                >
                  <option value="حضانة">حضانة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="شباب جامعي">شباب جامعي</option>
                  <option value="خريجين">خريجين</option>
                  <option value="أخرى">أخرى / عامة</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">وصف موجز للخدمة (اختياري):</label>
                <input
                  type="text"
                  value={newServiceDesc}
                  onChange={e => setNewServiceDesc(e.target.value)}
                  placeholder="مثلاً: خدمة روحية واجتماعية لأبناء المرحلة"
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                >
                  إضافة الخدمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Meeting Modal */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddMeetingOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border p-6 z-10 text-right text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                إضافة اجتماع لخدمة: {activeService?.name}
              </h3>
              <button onClick={() => setIsAddMeetingOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMeeting} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم الاجتماع:</label>
                <input
                  type="text"
                  value={newMeetingName}
                  onChange={e => setNewMeetingName(e.target.value)}
                  placeholder="مثلاً: اجتماع الجمعة الأسبوعي، قداس الأحد..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">اليوم:</label>
                  <select
                    value={newMeetingDay}
                    onChange={e => setNewMeetingDay(e.target.value)}
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-semibold"
                  >
                    <option value="الجمعة">الجمعة</option>
                    <option value="السبت">السبت</option>
                    <option value="الأحد">الأحد</option>
                    <option value="الخميس">الخميس</option>
                    <option value="الأربعاء">الأربعاء</option>
                    <option value="الثلاثاء">الثلاثاء</option>
                    <option value="الإثنين">الإثنين</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">الوقت:</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={e => setNewMeetingTime(e.target.value)}
                    placeholder="06:00 م"
                    className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">المكان / القاعة:</label>
                <input
                  type="text"
                  value={newMeetingLocation}
                  onChange={e => setNewMeetingLocation(e.target.value)}
                  placeholder="مثلاً: كنيسة الدور الأرضي، قاعة مارمينا..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                >
                  إضافة الاجتماع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

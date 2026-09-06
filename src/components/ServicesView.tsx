import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Layers,
  Plus,
  Clock,
  Users,
  ChevronDown,
  Calendar,
  X,
  Check
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
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  // Forms
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceStage, setNewServiceStage] = useState('إعدادي');
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDay, setNewMeetingDay] = useState('الجمعة');
  const [newMeetingTime, setNewMeetingTime] = useState('06:00 م');
  const [newGroupName, setNewGroupName] = useState('');

  const activeService = data.services.find(s => s.id === selectedServiceId) || data.services[0];
  const serviceMeetings = data.meetings.filter(m => m.serviceId === activeService?.id);
  const serviceGroups = data.groups.filter(g => g.serviceId === activeService?.id);
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
        icon: '⛪'
      });
      await refreshData();
      setSelectedServiceId(created.id);
      setIsAddServiceOpen(false);
      setNewServiceName('');
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
        time: newMeetingTime
      });
      await refreshData();
      setIsAddMeetingOpen(false);
      setNewMeetingName('');
      showToast('تمت إضافة الاجتماع بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة الاجتماع');
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !activeService) return;
    try {
      await api.addGroup({
        churchId: activeChurchId,
        serviceId: activeService.id,
        name: newGroupName.trim()
      });
      await refreshData();
      setIsAddGroupOpen(false);
      setNewGroupName('');
      showToast('تمت إضافة المجموعة بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة المجموعة');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>الخدمات والاجتماعات والمجموعات</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {data.services.length} خدمات
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            هيكل الخدمة: كل خدمة تتبعها اجتماعات ومجموعات وخدام ومخدومين
          </p>
        </div>

        <button
          onClick={() => setIsAddServiceOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>

      {/* Services Tabs / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.services.map(srv => {
          const isSelected = srv.id === activeService?.id;
          const count = data.memberships.filter(m => m.serviceId === srv.id && m.isActive).length;

          return (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
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
              <div className="mt-2 text-[10px] font-bold">
                {count} مشمول
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
                <p className="text-xs text-slate-500">المرحلة: {activeService.stage} • {activeService.description || 'خدمة كنسية مباركة'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddMeetingOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة اجتماع</span>
              </button>
              <button
                onClick={() => setIsAddGroupOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مجموعة</span>
              </button>
            </div>
          </div>

          {/* Meetings & Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meetings Box */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>اجتماعات الخدمة ({serviceMeetings.length})</span>
                </h4>
                <button
                  onClick={() => setIsAddMeetingOpen(true)}
                  className="text-amber-700 font-bold text-xs hover:underline"
                >
                  + جديد
                </button>
              </div>

              <div className="space-y-2">
                {serviceMeetings.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">لا توجد اجتماعات مضافة</p>
                ) : (
                  serviceMeetings.map(m => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{m.name}</span>
                        <p className="text-[11px] text-slate-500">
                          {m.dayOfWeek} • الساعة {m.time}
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        أسبوعي
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Groups Box */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>مجموعات وأسر الخدمة ({serviceGroups.length})</span>
                </h4>
                <button
                  onClick={() => setIsAddGroupOpen(true)}
                  className="text-amber-700 font-bold text-xs hover:underline"
                >
                  + جديد
                </button>
              </div>

              <div className="space-y-2">
                {serviceGroups.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">لا توجد مجموعات مضافة</p>
                ) : (
                  serviceGroups.map(g => {
                    const groupMembers = serviceMemberships.filter(m => m.groupId === g.id && m.role === 'member').length;
                    return (
                      <div
                        key={g.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{g.name}</span>
                          <p className="text-[11px] text-slate-500">
                            {groupMembers} مخدوم مسكن بالمجموعة
                          </p>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                          نشطة
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Members Roster in this Service */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-sm">
              الأفراد المنتمين لهذه الخدمة ({serviceMemberships.length} شخص)
            </h4>

            {/* Servants list */}
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2">أمانة وهيئة الخدمة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[...leaders, ...servants].map(m => {
                  const person = data.persons.find(p => p.id === m.personId);
                  if (!person) return null;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedPersonForProfile(person)}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs hover:border-amber-400 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{person.name}</span>
                        <span className="text-[10px] text-slate-500">{person.phone}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ROLE_BADGES[m.role]?.bg}`}>
                        {ROLE_BADGES[m.role]?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Members list */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">المخدومين ({members.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {members.map(m => {
                  const person = data.persons.find(p => p.id === m.personId);
                  if (!person) return null;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedPersonForProfile(person)}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 cursor-pointer"
                    >
                      <span className="font-bold text-slate-800 block truncate">{person.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{person.code}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddServiceOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border p-6 z-10 text-right text-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة خدمة جديدة</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم الخدمة:</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={e => setNewServiceName(e.target.value)}
                  placeholder="مثلاً: خدمة إعدادي بنات"
                  className="w-full p-2 rounded-xl border bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="font-bold block mb-1">المرحلة:</label>
                <select
                  value={newServiceStage}
                  onChange={e => setNewServiceStage(e.target.value)}
                  className="w-full p-2 rounded-xl border bg-slate-50"
                >
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="شباب">شباب</option>
                  <option value="أخرى">أخرى / عامة</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddServiceOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Meeting Modal */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddMeetingOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border p-6 z-10 text-right text-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة اجتماع لخدمة {activeService?.name}</h3>
            <form onSubmit={handleAddMeeting} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم الاجتماع:</label>
                <input
                  type="text"
                  value={newMeetingName}
                  onChange={e => setNewMeetingName(e.target.value)}
                  placeholder="مثلاً: اجتماع الجمعة الأسبوعي"
                  className="w-full p-2 rounded-xl border bg-slate-50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">اليوم:</label>
                  <select
                    value={newMeetingDay}
                    onChange={e => setNewMeetingDay(e.target.value)}
                    className="w-full p-2 rounded-xl border bg-slate-50"
                  >
                    <option value="الجمعة">الجمعة</option>
                    <option value="السبت">السبت</option>
                    <option value="الأحد">الأحد</option>
                    <option value="الخميس">الخميس</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">الوقت:</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={e => setNewMeetingTime(e.target.value)}
                    placeholder="06:00 م"
                    className="w-full p-2 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddMeetingOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">إضافة الاجتماع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {isAddGroupOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddGroupOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border p-6 z-10 text-right text-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">إضافة مجموعة جديدة لخدمة {activeService?.name}</h3>
            <form onSubmit={handleAddGroup} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">اسم المجموعة / الأسرة:</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="مثلاً: أسرة القديس أثناسيوس"
                  className="w-full p-2 rounded-xl border bg-slate-50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddGroupOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">إضافة المجموعة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

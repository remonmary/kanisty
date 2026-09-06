import React, { useState, useMemo } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Calendar,
  Layers,
  ArrowUpDown,
  Archive,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Edit
} from 'lucide-react';
import { getPersonAttendanceStats, ROLE_BADGES } from '../utils/churchUtils';
import { api } from '../services/api';
import { Person } from '../types';
import { EditPersonModal } from './EditPersonModal';

export const PersonsView: React.FC<{
  onOpenAddPerson: () => void;
}> = ({ onOpenAddPerson }) => {
  const {
    data,
    currentUser,
    setSelectedPersonForProfile,
    openLogVisitModal,
    refreshData,
    showToast
  } = useChurch();

  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'servants' | 'members' | 'priests' | 'parents'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

  // Filtered persons
  const filteredPersons = useMemo(() => {
    return data.persons.filter(person => {
      // Must not be archived
      if (person.status === 'archived') return false;

      // Sub-tab filter
      const memberships = data.memberships.filter(m => m.personId === person.id && m.isActive);
      const isPriest = person.code?.startsWith('PR') || person.name.includes('القمص') || person.name.includes('أبونا') || memberships.some(m => m.role === 'priest');
      const isServantOrLeader = memberships.some(m => m.role === 'servant' || m.role === 'leader');
      const isMember = memberships.some(m => m.role === 'member') || (!isPriest && !isServantOrLeader);

      if (activeSubTab === 'priests' && !isPriest) return false;
      if (activeSubTab === 'servants' && !isServantOrLeader) return false;
      if (activeSubTab === 'members' && !isMember) return false;

      // Service filter
      if (selectedServiceFilter !== 'all') {
        const inService = memberships.some(m => m.serviceId === selectedServiceFilter);
        if (!inService) return false;
      }

      // Stage filter
      if (selectedStageFilter !== 'all') {
        if (person.stage !== selectedStageFilter) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          person.name.toLowerCase().includes(term) ||
          person.code?.toLowerCase().includes(term) ||
          person.phone?.includes(term) ||
          person.school?.toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [data.persons, data.memberships, activeSubTab, selectedServiceFilter, selectedStageFilter, searchTerm]);

  const handleArchive = async (personId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من نقل «${name}» إلى الأرشيف؟ (ستظل كافة سجلاته محفوظة)`)) return;
    try {
      await api.updatePerson(personId, { status: 'archived' }, currentUser?.name || 'المسؤول');
      await refreshData();
      showToast(`تم أرشفة «${name}» بنجاح`);
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء أرشفة الشخص');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>دليل الأشخاص والخدمات</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              {filteredPersons.length} شخص
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة الكهنة، أمناء الخدمة، الخدام، والمخدومين وفق علاقة Many-to-Many
          </p>
        </div>

        <button
          onClick={onOpenAddPerson}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة شخص جديد للمنظومة</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: `الكل (${data.persons.filter(p => p.status !== 'archived').length})` },
          { id: 'servants', label: 'الخدام وأمناء الخدمة' },
          { id: 'members', label: 'المخدومين' },
          { id: 'priests', label: 'الآباء الكهنة' },
          { id: 'parents', label: `أولياء الأمور (${data.parents.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      {activeSubTab !== 'parents' && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، الكود، التليفون، المدرسة..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Service Filter */}
          <div>
            <select
              value={selectedServiceFilter}
              onChange={e => setSelectedServiceFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">كافة الخدمات</option>
              {data.services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={selectedStageFilter}
              onChange={e => setSelectedStageFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">كافة المراحل</option>
              <option value="ابتدائي">ابتدائي</option>
              <option value="إعدادي">إعدادي</option>
              <option value="ثانوي">ثانوي</option>
              <option value="شباب جامعي">شباب جامعي</option>
              <option value="خريجين">خريجين</option>
              <option value="عامة">عامة</option>
            </select>
          </div>
        </div>
      )}

      {/* Subtab Content: Parents View */}
      {activeSubTab === 'parents' ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">سجل أولياء الأمور المعتمدين</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.parents.map(parent => {
                const children = data.persons.filter(p => p.parentId === parent.id);
                return (
                  <div key={parent.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900">{parent.name}</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                        {parent.relation}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>الهاتف:</strong> {parent.phone}
                    </p>
                    <p className="text-slate-600">
                      <strong>الوظيفة:</strong> {parent.job || '—'}
                    </p>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">الأبناء المسجلين:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {children.length > 0 ? (
                          children.map(ch => (
                            <span
                              key={ch.id}
                              onClick={() => setSelectedPersonForProfile(ch)}
                              className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer hover:border-amber-400"
                            >
                              {ch.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">لا يوجد أبناء مرتبطين مباشرة</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Regular Persons Roster Table */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">الشخص</th>
                  <th className="py-3.5 px-3">الكود</th>
                  <th className="py-3.5 px-3">المرحلة / الهاتف</th>
                  <th className="py-3.5 px-3">الخدمات والأدوار</th>
                  <th className="py-3.5 px-3">نسبة الحضور</th>
                  <th className="py-3.5 px-3">آخر افتقاد</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPersons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      لا يوجد أشخاص مطابقين لمعايير البحث
                    </td>
                  </tr>
                ) : (
                  filteredPersons.map(person => {
                    const personMemberships = data.memberships.filter(m => m.personId === person.id && m.isActive);
                    const stats = getPersonAttendanceStats(person.id, data.attendance);
                    const personVisits = data.visitations
                      .filter(v => v.personId === person.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const lastVisit = personVisits[0];

                    return (
                      <tr key={person.id} className="hover:bg-amber-50/20 transition-colors">
                        {/* Person Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {person.photo ? (
                                <img
                                  src={person.photo}
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-xs">
                                  {person.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => setSelectedPersonForProfile(person)}
                                className="font-extrabold text-slate-900 hover:text-amber-700 text-right block"
                              >
                                {person.name}
                              </button>
                              <span className="text-[11px] text-slate-400 block">{person.school || person.address}</span>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                            {person.code || '—'}
                          </span>
                        </td>

                        {/* Stage & Phone */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{person.stage}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{person.phone || '—'}</div>
                        </td>

                        {/* Services & Roles (Many-to-Many) */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {personMemberships.length > 0 ? (
                              personMemberships.map(m => {
                                const srv = data.services.find(s => s.id === m.serviceId);
                                return (
                                  <span
                                    key={m.id}
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                      ROLE_BADGES[m.role]?.bg || 'bg-slate-100 text-slate-700'
                                    }`}
                                    title={`${srv?.name || 'خدمة'} - ${ROLE_BADGES[m.role]?.label || m.role}`}
                                  >
                                    {srv?.name || 'خدمة'}: {ROLE_BADGES[m.role]?.label || m.role}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[10px] text-slate-400">غير مسكن بخدمة</span>
                            )}
                          </div>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-3 px-3">
                          {stats.total > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold text-xs ${
                                  stats.rate >= 80
                                    ? 'text-emerald-700'
                                    : stats.rate >= 60
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {stats.rate}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({stats.present}/{stats.total})
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">لا يوجد حضور</span>
                          )}
                        </td>

                        {/* Last Visit */}
                        <td className="py-3 px-3">
                          {lastVisit ? (
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{lastVisit.date}</span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                                {lastVisit.servantName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md">
                              لم يفتقد
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedPersonForProfile(person)}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors"
                              title="فتح الملف الشامل"
                            >
                              الملف
                            </button>
                            <button
                              onClick={() => setPersonToEdit(person)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors"
                              title="تعديل بيانات الشخص"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openLogVisitModal(person)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                              title="تسجيل افتقاد"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleArchive(person.id, person.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="أرشفة الشخص"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {personToEdit && (
        <EditPersonModal
          person={personToEdit}
          isOpen={!!personToEdit}
          onClose={() => setPersonToEdit(null)}
        />
      )}
    </div>
  );
};

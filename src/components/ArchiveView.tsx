import React from 'react';
import { useChurch } from '../context/ChurchContext';
import { Archive, RotateCcw, AlertCircle, Eye } from 'lucide-react';
import { api } from '../services/api';

export const ArchiveView: React.FC = () => {
  const { data, currentUser, refreshData, showToast, setSelectedPersonForProfile } = useChurch();

  const archivedPersons = data.persons.filter(p => p.status === 'archived');

  const handleRestore = async (personId: string, name: string) => {
    try {
      await api.updatePerson(personId, { status: 'active' }, currentUser?.name || 'المسؤول');
      await refreshData();
      showToast(`تمت استعادة «${name}» إلى قائمة النشطين بنجاح`);
    } catch (err) {
      showToast('حدث خطأ أثناء استعادة الشخص');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>سجل الأرشيف التاريخي (Section 28)</span>
            <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
              {archivedPersons.length} شخص مؤرشف
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حفظ البيانات القديمة وسجلات الحضور والافتقاد دون حذف، مع إمكانية الاسترجاع في أي وقت
          </p>
        </div>
      </div>

      {/* Info notice banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          وفقاً لميثاق سلامة البيانات، لا يتم حذف أي شخص نهائياً لحماية التاريخ الكنسي والرعوي. يمكنك استعراض الملف الكامل وسجلات الحضور القديمة لأي شخص مؤرشف.
        </span>
      </div>

      {/* Archived Roster */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">الشخص</th>
                <th className="py-3.5 px-3">الكود</th>
                <th className="py-3.5 px-3">المرحلة</th>
                <th className="py-3.5 px-3">الهاتف</th>
                <th className="py-3.5 px-3">تاريخ الأرشفة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedPersons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    لا يوجد أشخاص مؤرشفين حالياً في الكنيسة
                  </td>
                </tr>
              ) : (
                archivedPersons.map(person => (
                  <tr key={person.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{person.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{person.code || '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{person.stage}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{person.phone || '—'}</td>
                    <td className="py-3 px-3 text-slate-400">{person.archivedAt || 'أرشيف سابق'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedPersonForProfile(person)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>الملف والسجلات</span>
                        </button>
                        <button
                          onClick={() => handleRestore(person.id, person.name)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة للنشطين</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

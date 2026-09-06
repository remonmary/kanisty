import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  Settings,
  Shield,
  Database,
  History,
  ArrowRightLeft,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const {
    data,
    activeChurch,
    activeChurchId,
    currentUser,
    effectiveOverallRole,
    refreshData,
    showToast
  } = useChurch();

  const [activeTab, setActiveTab] = useState<'profile' | 'promotion' | 'backup' | 'audit'>('profile');

  // Promotion State (Section 32)
  const [promoFromStage, setPromoFromStage] = useState('ابتدائي');
  const [promoToServiceId, setPromoToServiceId] = useState(data.services[0]?.id || '');
  const [isPromoting, setIsPromoting] = useState(false);

  // Backup file upload
  const [isRestoring, setIsRestoring] = useState(false);

  // Handle Stage Promotion (Section 32)
  const handleStagePromotion = async () => {
    const candidatePersons = data.persons.filter(p => p.stage === promoFromStage && p.status !== 'archived');
    if (candidatePersons.length === 0) {
      showToast(`لا يوجد مخدومين حالياً في مرحلة «${promoFromStage}»`);
      return;
    }

    const nextStageName = promoFromStage === 'ابتدائي' ? 'إعدادي' : promoFromStage === 'إعدادي' ? 'ثانوي' : 'شباب';

    if (!confirm(`هل أنت متأكد من ترحيل ${candidatePersons.length} مخدوم من «${promoFromStage}» إلى «${nextStageName}»؟ سيتم حفظ كافة سجلاتهم السابقة.`)) {
      return;
    }

    try {
      setIsPromoting(true);
      for (const p of candidatePersons) {
        await api.updatePerson(
          p.id,
          { stage: nextStageName },
          currentUser?.name || 'المسؤول'
        );
      }
      await refreshData();
      showToast(`تم ترحيل ${candidatePersons.length} مخدوم بنجاح إلى مرحلة «${nextStageName}»`);
    } catch (err) {
      showToast('حدث خطأ أثناء ترحيل المرحلة');
    } finally {
      setIsPromoting(false);
    }
  };

  // Export JSON Backup (Section 33)
  const handleExportBackup = async () => {
    try {
      const fullBackup = await api.exportDatabase();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kenisati_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('تم تصدير النسخة الاحتياطية JSON بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء تصدير النسخة الاحتياطية');
    }
  };

  // Restore JSON Backup (Section 33)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (!e.target.files || e.target.files.length === 0) return;

    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = async event => {
      try {
        setIsRestoring(true);
        const parsed = JSON.parse(event.target?.result as string);
        await api.restoreDatabase(parsed);
        await refreshData();
        showToast('تم استعادة قاعدة البيانات بنجاح من النسخة الاحتياطية');
      } catch (err) {
        showToast('فشل استيراد النسخة الاحتياطية: الملف غير متوافق');
      } finally {
        setIsRestoring(false);
      }
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>إعدادات النظام وإدارة الكنيسة</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {activeChurch?.name || 'كنيستي'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تخصيص البيانات، ترحيل المراحل السنوية، النسخ الاحتياطي، وسجل العمليات
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'profile', label: 'بيانات الكنيسة', icon: Building },
          { id: 'promotion', label: 'الترحيل بين المراحل (Section 32)', icon: ArrowRightLeft },
          { id: 'backup', label: 'النسخ الاحتياطي وقاعدة البيانات (Section 33)', icon: Database },
          { id: 'audit', label: `سجل النشاطات Audit Log (${data.auditLogs.length})`, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHURCH PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
          <h3 className="font-extrabold text-sm text-slate-900">ملف الكنيسة والبيانات الرسمية</h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold block mb-1">اسم الكنيسة:</label>
              <input
                type="text"
                disabled
                value={activeChurch?.name || ''}
                className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">الإيبارشية / المنطقة:</label>
                <input
                  type="text"
                  disabled
                  value={activeChurch?.diocese || ''}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">المدينة والمحافظة:</label>
                <input
                  type="text"
                  disabled
                  value={activeChurch?.city || ''}
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1">العنوان التفصيلي:</label>
              <input
                type="text"
                disabled
                value={activeChurch?.address || ''}
                className="w-full p-2.5 rounded-xl border bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>نظام عزل البيانات التام مفعّل: كافة السجلات معزولة تماماً برقم الكنيسة <strong>{activeChurchId}</strong></span>
          </div>
        </div>
      )}

      {/* TAB 2: PROMOTION (Section 32) */}
      {activeTab === 'promotion' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs max-w-2xl">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              الترحيل التلقائي بين المراحل الدراسية (Section 32)
            </h3>
            <p className="text-slate-500 mt-1">
              يستخدم في نهاية العام الكنسي والخدمي: ترحيل دفعة كاملة (مثلاً خريجي 6 ابتدائي إلى إعدادي، أو 3 إعدادي إلى ثانوي) مع الحفاظ الكامل على كافة سجلات الحضور والافتقاد القديمة دون فقدان أي بيان.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">المرحلة الحالية للدفعة:</label>
                <select
                  value={promoFromStage}
                  onChange={e => setPromoFromStage(e.target.value)}
                  className="w-full p-2 rounded-xl border bg-white font-bold"
                >
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">المرحلة الجديدة التالية:</label>
                <input
                  type="text"
                  disabled
                  value={promoFromStage === 'ابتدائي' ? 'إعدادي' : promoFromStage === 'إعدادي' ? 'ثانوي' : 'شباب'}
                  className="w-full p-2 rounded-xl border bg-white font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStagePromotion}
                disabled={isPromoting}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{isPromoting ? 'جاري ترحيل الدفعة...' : 'بدء ترحيل المخدومين للمرحلة التالية'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP (Section 33) */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6 text-xs max-w-2xl">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              النسخ الاحتياطي لقاعدة البيانات JSON (Section 33)
            </h3>
            <p className="text-slate-500 mt-1">
              تصدير قاعدة البيانات بالكامل وتنزيلها كملف JSON لضمان الأمان والاحتفاظ بنسخ دورية، أو استرجاع نسخة سابقة في أي لحظة.
            </p>
          </div>

          {/* Export Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">تصدير قاعدة البيانات كاملة</h4>
              <p className="text-slate-500 text-[11px]">تنزيل ملف JSON يحتوي على كافة الجداول والسجلات</p>
            </div>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل النسخة JSON</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">استعادة نسخة احتياطية من ملف</h4>
              <p className="text-slate-500 text-[11px]">رفع ملف backup بصيغة JSON لاسترجاع البيانات</p>
            </div>
            <label className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{isRestoring ? 'جاري الاستعادة...' : 'رفع واستعادة'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isRestoring}
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG (Section 34) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              سجل نشاطات وعمليات المستخدمين (Section 34 - غير قابل للتعديل)
            </span>
            <span className="text-slate-400 font-medium">
              {data.auditLogs.length} عملية مسجلة
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">التوقيت</th>
                    <th className="py-3 px-3">المستخدم المسؤول</th>
                    <th className="py-3 px-3">نوع العملية</th>
                    <th className="py-3 px-4">تفاصيل النشاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.auditLogs.slice(0, 50).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        {log.userName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

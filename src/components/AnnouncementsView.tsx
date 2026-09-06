import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Megaphone, Plus, Bell, Calendar, Pin, X } from 'lucide-react';
import { api } from '../services/api';

export const AnnouncementsView: React.FC = () => {
  const { data, activeChurchId, currentUser, effectiveOverallRole, refreshData, showToast } = useChurch();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'servants' | 'specific_service'>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canPost = effectiveOverallRole === 'priest' || effectiveOverallRole === 'leader' || effectiveOverallRole === 'admin';

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);
      await api.addAnnouncement({
        churchId: activeChurchId,
        title: title.trim(),
        content: content.trim(),
        authorName: currentUser?.name || 'أمين الخدمة',
        targetAudience,
        date: new Date().toISOString().split('T')[0],
        isPinned
      });
      await refreshData();
      setIsAddOpen(false);
      setTitle('');
      setContent('');
      showToast('تم نشر الإعلان للكنيسة بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء نشر الإعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>لوحة الإعلانات والتنبيهات الكنسية</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {data.announcements.length} إعلان
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تنبيهات الخدام، مواعيد النهضات والقداسات، والرحلات والمؤتمرات
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>نشر إعلان جديد</span>
          </button>
        )}
      </div>

      {/* Announcements Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.announcements.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            لا توجد إعلانات منشورة حالياً
          </div>
        ) : (
          data.announcements.map(ann => (
            <div
              key={ann.id}
              className={`p-5 rounded-3xl border bg-white shadow-2xs space-y-3 transition-all ${
                ann.isPinned ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      مثبت
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {ann.targetAudience === 'all' ? 'لكافة شعب الكنيسة' : 'خاص بالخدام'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{ann.date}</span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{ann.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ann.content}
              </p>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>المعلن: <strong>{ann.authorName}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border p-6 z-10 text-right text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">نشر إعلان أو تنبيه جديد</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">عنوان الإعلان:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثلاً: نهضة عيد القديس العظيم مارجرجس، موعد انطلاق رحلة الفيوم..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">الجمهور المستهدف:</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value as any)}
                  className="w-full p-2 rounded-xl border bg-slate-50 font-semibold"
                >
                  <option value="all">كافة شعب الكنيسة والخدمة</option>
                  <option value="servants">هيئة الخدام فقط</option>
                  <option value="specific_service">خدمة محددة</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">تفاصيل الإعلان:</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="المواعيد، المكان، التعليمات الخاصة..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded-md"
                />
                <label htmlFor="pinCheck" className="font-bold text-slate-700 cursor-pointer">
                  تثبيت الإعلان بأعلى اللوحة
                </label>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  {isSubmitting ? 'جاري النشر...' : 'نشر الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

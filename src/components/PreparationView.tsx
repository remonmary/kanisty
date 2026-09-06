import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  BookOpen,
  Send,
  CheckCircle,
  Eye,
  Clock,
  Plus,
  FileText,
  Video,
  Check,
  X,
  Users,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export const PreparationView: React.FC = () => {
  const {
    data,
    currentUser,
    activeChurchId,
    effectiveOverallRole,
    refreshData,
    showToast
  } = useChurch();

  const [selectedPrepId, setSelectedPrepId] = useState<string>(
    data.preparations[0]?.id || ''
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Prep Form State
  const [title, setTitle] = useState('');
  const [serviceId, setServiceId] = useState(data.services[0]?.id || '');
  const [targetAudience, setTargetAudience] = useState('خدام مرحلة إعدادي بنين وبنات');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [scripture, setScripture] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLeaderOrPriest = effectiveOverallRole === 'priest' || effectiveOverallRole === 'leader';
  const selectedPrep = data.preparations.find(p => p.id === selectedPrepId) || data.preparations[0];

  // Mark as read handler
  const handleMarkAsRead = async (prepId: string) => {
    if (!currentUser) return;
    try {
      await api.markPreparationRead(prepId, currentUser.id);
      await refreshData();
      showToast('تم تأكيد القراءة والاستعداد لإلقاء الدرس');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء تأكيد القراءة');
    }
  };

  const handleCreatePrep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);
      // All servants in this service as target
      const srvMemberships = data.memberships.filter(
        m => m.serviceId === serviceId && (m.role === 'servant' || m.role === 'leader') && m.isActive
      );
      const servantIds: string[] = Array.from(new Set(srvMemberships.map(m => m.personId)));

      const created = await api.addPreparation({
        churchId: activeChurchId,
        serviceId,
        title: title.trim(),
        targetAudience,
        date,
        authorId: currentUser?.id || 'leader-1',
        authorName: currentUser?.name || 'أمين الخدمة',
        content: content.trim(),
        scripture: scripture.trim() || undefined,
        mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
        readStatus: servantIds.map(sid => ({
          servantId: sid,
          isRead: sid === currentUser?.id,
          readAt: sid === currentUser?.id ? new Date().toISOString() : undefined
        }))
      });

      await refreshData();
      setSelectedPrepId(created.id);
      setIsCreatingNew(false);
      showToast('تم نشر الدرس وإرساله لجميع خدام المرحلة بنجاح');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء نشر التحضير');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>الأنشطة والتحضير وإرسال الدروس</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
              {data.preparations.length} تحضيرات
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            صلاحية الكاهن وأمين الخدمة لإعداد الدروس، وتأكيد قراءة الخدام واستعدادهم
          </p>
        </div>

        {isLeaderOrPriest && (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>تحضير درس جديد</span>
          </button>
        )}
      </div>

      {/* Creation Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsCreatingNew(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-900">إعداد ونشر تحضير أسبوعي جديد</h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrep} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الخدمة المستهدفة:</label>
                  <select
                    value={serviceId}
                    onChange={e => setServiceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    {data.services.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ إلقاء الدرس:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الدرس أو الموضوع:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثلاً: الأمانة في القليل (مثل الوزنات)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الشاهد الكتابي والآية المحورية:</label>
                <input
                  type="text"
                  value={scripture}
                  onChange={e => setScripture(e.target.value)}
                  placeholder="لوقا 19: 11-27 • «كنت أميناً في القليل فأقيمك على الكثير»"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">محتوى وعناصر التحضير بالتفصيل:</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="الهدف الروحي، المقدمة المشوقة، عناصر القصة، التطبيق العملي للمخدومين..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 leading-relaxed font-sans"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رابط وسائط أو فيديو توضيحي (اختياري):</label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={e => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري النشر...' : 'نشر وإرسال للخدام'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Two-Column View: Preparation Details & Read Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right list of lessons */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">قائمة الدروس المحضرة</h3>
          <div className="space-y-2">
            {data.preparations.map(prep => {
              const srv = data.services.find(s => s.id === prep.serviceId);
              const readCount = prep.readStatus.filter(s => s.isRead).length;
              const totalServants = prep.readStatus.length;
              const isSelected = prep.id === selectedPrep?.id;

              return (
                <div
                  key={prep.id}
                  onClick={() => setSelectedPrepId(prep.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      {srv?.name || 'خدمة'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{prep.date}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{prep.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>الكاتب: {prep.authorName}</span>
                    <span className="font-bold text-emerald-700">
                      قرأ: {readCount} / {totalServants}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Column: Lesson Content & Section 18 Read Receipts Monitor */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPrep ? (
            <div className="space-y-4">
              {/* Content Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-amber-700">
                      تاريخ إلقاء الدرس: {selectedPrep.date}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {selectedPrep.title}
                    </h3>
                    <p className="text-slate-500 text-xs">
                      إعداد: <strong>{selectedPrep.authorName}</strong> • {selectedPrep.targetAudience}
                    </p>
                  </div>

                  {/* Servant Mark Read Button */}
                  {currentUser && (
                    <div>
                      {selectedPrep.readStatus.some(s => s.servantId === currentUser.id && s.isRead) ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>تمت القراءة والاستعداد</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkAsRead(selectedPrep.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>تأكيد القراءة والاستعداد</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Scripture Banner */}
                {selectedPrep.scripture && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                    📖 <strong>الشاهد الكتابي:</strong> {selectedPrep.scripture}
                  </div>
                )}

                {/* Body Text */}
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-3 whitespace-pre-wrap">
                  {selectedPrep.content}
                </div>
              </div>

              {/* Section 18: Read Receipts Monitor Report */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      تقرير متابعة قراءة التحضير بين الخدام (Section 18)
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-emerald-700">
                      تمت القراءة: {selectedPrep.readStatus.filter(s => s.isRead).length}
                    </span>
                    <span>•</span>
                    <span className="font-bold text-rose-700">
                      لم يقرأ بعد: {selectedPrep.readStatus.filter(s => !s.isRead).length}
                    </span>
                  </div>
                </div>

                {/* List of servants and their read status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                  {selectedPrep.readStatus.map(status => {
                    const servant = data.persons.find(p => p.id === status.servantId);
                    return (
                      <div
                        key={status.servantId}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          status.isRead
                            ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                            : 'bg-rose-50/40 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                            {servant?.name.slice(0, 1) || 'خ'}
                          </div>
                          <div>
                            <span className="font-bold block">{servant?.name || 'خادم'}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {status.isRead ? `قرأ في ${status.readAt?.split('T')[0]}` : 'لم يقرأ بعد'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status.isRead
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {status.isRead ? 'قرأ واستعد' : 'لم يقرأ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              اختر درساً للاطلاع على تفاصيل التحضير وتقارير قراءة الخدام
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

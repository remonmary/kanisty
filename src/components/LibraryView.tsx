import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { Library, Plus, Search, BookOpen, Music, Film, FileText, Tag, Download, ExternalLink, X } from 'lucide-react';
import { api } from '../services/api';

export const LibraryView: React.FC = () => {
  const { data, activeChurchId, refreshData, showToast } = useChurch();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'lesson' | 'story' | 'activity' | 'hymn' | 'media' | 'book'>('lesson');
  const [description, setDescription] = useState('');
  const [targetStage, setTargetStage] = useState('إعدادي');
  const [fileUrl, setFileUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'lesson', label: 'دروس وموضوعات' },
    { id: 'story', label: 'قصص وسير قديسين' },
    { id: 'activity', label: 'أنشطة وألعاب مسابقات' },
    { id: 'hymn', label: 'ترانيم وألحان' },
    { id: 'book', label: 'كتب ومراجع كنسية' }
  ];

  const filteredItems = data.library.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(t => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await api.addLibraryItem({
        churchId: activeChurchId,
        title: title.trim(),
        category,
        description: description.trim(),
        targetStage,
        fileUrl: fileUrl.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      await refreshData();
      setIsAddOpen(false);
      setTitle('');
      setDescription('');
      showToast('تمت إضافة المادة لمكتبة الخدمة بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة المادة');
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
            <span>مكتبة الخدمة والوسائط المركزية</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {data.library.length} مادة
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            مستودع متكامل للدروس التفاعلية، القصص، الألعاب، الترانيم، والمناهج الروحية
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة للمكتبة</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث في المكتبة والوسوم..."
            className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden"
          />
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            لا توجد مواد مطابقة لمعايير البحث في المكتبة
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                    {item.targetStage}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.category === 'lesson' ? 'درس' : item.category === 'story' ? 'قصة' : item.category === 'activity' ? 'نشاط' : 'مادة'}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tags and Action */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل واستعراض المادة</span>
                  </a>
                )}
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
              <h3 className="font-extrabold text-sm text-slate-900">إضافة مورد جديد لمكتبة الخدمة</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">عنوان المادة / الدرس / النشاط:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثلاً: مسابقة بوربوينت عن أسفار العهد القديم"
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">القسم:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl border bg-slate-50"
                  >
                    <option value="lesson">درس وموضوع</option>
                    <option value="story">قصة وسيرة</option>
                    <option value="activity">نشاط ولعبة</option>
                    <option value="hymn">ترنيمة ولحن</option>
                    <option value="book">كتاب ومرجع</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">المرحلة المستهدفة:</label>
                  <input
                    type="text"
                    value={targetStage}
                    onChange={e => setTargetStage(e.target.value)}
                    placeholder="إعدادي، ثانوي..."
                    className="w-full p-2 rounded-xl border bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">الوصف وعناصر المادة:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="محتوى المورد وطريقة استخدامه مع المخدومين..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">رابط الملف أو الفيديو (اختياري):</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 rounded-xl border bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">الوسوم (مفصولة بفاصلة):</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="ألعاب, صيف, مسابقات"
                  className="w-full p-2 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ بالمكتبة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { TaskItem } from '../types';

export const TasksView: React.FC = () => {
  const { data, activeChurchId, currentUser, refreshData, showToast } = useChurch();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(data.persons[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Servants list for assignment
  const servants = data.persons.filter(p => {
    const mems = data.memberships.filter(m => m.personId === p.id && m.isActive);
    return mems.some(m => m.role === 'servant' || m.role === 'leader') || p.code?.startsWith('SR') || p.code?.startsWith('LD');
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      await refreshData();
      showToast('تم تحديث حالة المهمة بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const assignee = data.persons.find(p => p.id === assigneeId);
      await api.addTask({
        churchId: activeChurchId,
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId,
        assigneeName: assignee?.name || 'الخادم المسؤول',
        dueDate,
        priority,
        status: 'pending'
      });
      await refreshData();
      setIsAddOpen(false);
      setTitle('');
      setDescription('');
      showToast('تمت إضافة المهمة وإسنادها للخادم بنجاح');
    } catch (err) {
      showToast('حدث خطأ أثناء إضافة المهمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = data.tasks.filter(t => {
    if (filterStatus === 'pending' && t.status !== 'pending') return false;
    if (filterStatus === 'in_progress' && t.status !== 'in_progress') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>المهام والتكليفات الرعوية</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {data.tasks.length} مهام
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إسناد المهام للخدام ومتابعة التنفيذ وتواريخ التسليم بدقة
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>تكليف بمهمة جديدة</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {[
          { id: 'all', label: `الكل (${data.tasks.length})` },
          { id: 'pending', label: `لم تبدأ (${data.tasks.filter(t => t.status === 'pending').length})` },
          { id: 'in_progress', label: `قيد التنفيذ (${data.tasks.filter(t => t.status === 'in_progress').length})` },
          { id: 'completed', label: `مكتملة (${data.tasks.filter(t => t.status === 'completed').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            لا توجد مهام مطابقة حالياً
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-3 transition-all ${
                task.status === 'completed'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : task.priority === 'urgent'
                  ? 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-600 mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Priority and Due Date */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : task.priority === 'important'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.priority === 'urgent' ? 'عاجل جداً' : task.priority === 'important' ? 'مهم' : 'عادي'}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>موعد التسليم: {task.dueDate}</span>
                  </span>
                </div>
              </div>

              {/* Footer Assignee & Status Transitions */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-600">
                  الخادم المسؤول: <strong className="text-slate-900">{task.assigneeName}</strong>
                </span>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'pending', label: 'لم تبدأ', bg: 'bg-slate-100 text-slate-700' },
                    { id: 'in_progress', label: 'قيد التنفيذ', bg: 'bg-amber-100 text-amber-900' },
                    { id: 'completed', label: 'تم التنفيذ بنجاح', bg: 'bg-emerald-100 text-emerald-900' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => handleStatusChange(task.id, btn.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        task.status === btn.id
                          ? 'bg-slate-900 text-white ring-2 ring-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border p-6 z-10 text-right text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">تكليف بمهمة جديدة</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">عنوان المهمة:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثلاً: افتقاد مخدومي مجموعة 1 تليفونياً، تحضير جوائز المسابقة..."
                  className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">تفاصيل وملاحظات المهمة:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="أي توجيهات خاصة للخادم المسؤول..."
                  className="w-full p-2 rounded-xl border bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">الخادم المسؤول:</label>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    className="w-full p-2 rounded-xl border bg-slate-50 font-semibold"
                  >
                    {data.persons.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">تاريخ التسليم:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border bg-slate-50 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">مستوى الأولوية:</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full p-2 rounded-xl border bg-slate-50 font-bold"
                >
                  <option value="normal">عادي</option>
                  <option value="important">مهم</option>
                  <option value="urgent">عاجل وفوري</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 font-bold">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  {isSubmitting ? 'جاري الحفظ...' : 'إسناد المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

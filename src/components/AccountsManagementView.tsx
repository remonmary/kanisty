import React, { useState } from 'react';
import { useChurch } from '../context/ChurchContext';
import { UserAccount, UserPermissions, UserRole } from '../types';
import {
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  Phone,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  Users,
  Lock,
  Search,
  Sparkles
} from 'lucide-react';

export const AccountsManagementView: React.FC = () => {
  const {
    activeChurch,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    data,
    currentAccount,
    showToast
  } = useChurch();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('servant');
  const [roleTitle, setRoleTitle] = useState('خادم');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canManagePersons: false,
    canTakeAttendance: true,
    canLogVisitations: true,
    canCreatePreparations: true,
    canManageTasks: true,
    canPostAnnouncements: false,
    canViewReports: false,
    canManageUsers: false,
    canAccessSettings: false
  });

  const resetForm = () => {
    setName('');
    setPhone('');
    setPassword('');
    setRole('servant');
    setRoleTitle('خادم');
    setSelectedServiceIds([]);
    setPermissions({
      canManagePersons: false,
      canTakeAttendance: true,
      canLogVisitations: true,
      canCreatePreparations: true,
      canManageTasks: true,
      canPostAnnouncements: false,
      canViewReports: false,
      canManageUsers: false,
      canAccessSettings: false
    });
    setEditingAccountId(null);
  };

  const applyPreset = (presetRole: UserRole) => {
    setRole(presetRole);
    if (presetRole === 'priest') {
      setRoleTitle('كاهن ومسؤول عام');
      setPermissions({
        canManagePersons: true,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: true,
        canViewReports: true,
        canManageUsers: true,
        canAccessSettings: true
      });
    } else if (presetRole === 'leader') {
      setRoleTitle('أمين خدمة');
      setPermissions({
        canManagePersons: true,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: true,
        canViewReports: true,
        canManageUsers: false,
        canAccessSettings: false
      });
    } else {
      setRoleTitle('خادم');
      setPermissions({
        canManagePersons: false,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessSettings: false
      });
    }
  };

  const openCreateModal = () => {
    resetForm();
    applyPreset('servant');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: UserAccount) => {
    setEditingAccountId(acc.id);
    setName(acc.name);
    setPhone(acc.phone);
    setPassword(acc.password || '');
    setRole(acc.role);
    setRoleTitle(acc.roleTitle || '');
    setSelectedServiceIds(acc.serviceIds || []);
    setPermissions(
      acc.permissions || {
        canManagePersons: false,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessSettings: false
      }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('يرجى كتابة الاسم ورقم الموبايل');
      return;
    }

    if (!editingAccountId && !password.trim()) {
      showToast('يرجى تحديد كلمة سر للحساب الجديد');
      return;
    }

    try {
      if (editingAccountId) {
        const updateData: Partial<UserAccount> = {
          name: name.trim(),
          phone: phone.trim(),
          role,
          roleTitle: roleTitle.trim() || (role === 'priest' ? 'كاهن' : role === 'leader' ? 'أمين خدمة' : 'خادم'),
          serviceIds: selectedServiceIds,
          permissions
        };
        if (password.trim()) {
          updateData.password = password.trim();
        }
        await updateAccount(editingAccountId, updateData);
      } else {
        await addAccount({
          name: name.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role,
          roleTitle: roleTitle.trim() || (role === 'priest' ? 'كاهن' : role === 'leader' ? 'أمين خدمة' : 'خادم'),
          serviceIds: selectedServiceIds,
          permissions
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ الحساب');
    }
  };

  const handleDelete = async (acc: UserAccount) => {
    if (acc.role === 'priest' && accounts.filter(a => a.role === 'priest').length <= 1) {
      showToast('لا يمكن حذف حساب الكاهن/المسؤول الوحيد في الكنيسة');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف حساب (${acc.name})؟ لن يتمكن من تسجيل الدخول بعد الآن.`)) {
      await deleteAccount(acc.id);
    }
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleService = (svcId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(svcId) ? prev.filter(id => id !== svcId) : [...prev, svcId]
    );
  };

  const filteredAccounts = accounts.filter(
    a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      (a.roleTitle && a.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">
              إدارة حسابات وصلاحيات الخدام
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إنشاء حسابات مستقلة لكل كاهن، أمين خدمة، وخادم بكنيسة ({activeChurch?.name}) وتحديد الصلاحيات الدقيقة لكل شخص.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة حساب خادم جديد</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الموبايل أو الدور..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-lg pr-10 pl-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Accounts List Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">اسم المستخدم</th>
                <th className="py-3 px-4">رقم الموبايل (تسجيل الدخول)</th>
                <th className="py-3 px-4">الدور الوظيفي</th>
                <th className="py-3 px-4">الصلاحيات الممنوحة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredAccounts.map(acc => {
                const permsCount = Object.values(acc.permissions || {}).filter(Boolean).length;
                const isCurrent = currentAccount?.id === acc.id;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div>{acc.name}</div>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-normal">
                              حسابك الحالي
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{acc.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          acc.role === 'priest'
                            ? 'bg-amber-100 text-amber-800'
                            : acc.role === 'leader'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {acc.roleTitle || (acc.role === 'priest' ? 'كاهن' : acc.role === 'leader' ? 'أمين خدمة' : 'خادم')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {acc.role === 'priest' ? 'صلاحيات كاملة' : `${permsCount} صلاحيات`}
                        </span>
                        {acc.serviceIds && acc.serviceIds.length > 0 && (
                          <span className="text-slate-400 text-[11px]">
                            • {acc.serviceIds.length} خدمات مخصصة
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(acc)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل الصلاحيات"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(acc)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    لا توجد حسابات مطابقة لبحثك
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Key className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingAccountId ? 'تعديل بيانات وصلاحيات الحساب' : 'إضافة حساب جديد لخادم أو كاهن'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-right">
              {/* Role Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  الدور ونموذج الصلاحيات السريع:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('priest')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      role === 'priest'
                        ? 'bg-amber-100 text-amber-800 border-amber-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    كاهن (صلاحيات كاملة)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('leader')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      role === 'leader'
                        ? 'bg-blue-100 text-blue-800 border-blue-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    أمين خدمة (إدارة وتقارير)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('servant')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      role === 'servant'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    خادم (حضور وافتقاد)
                  </button>
                </div>
              </div>

              {/* Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    الاسم بالكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أ. شنودة عادل"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    المسمى أو الرتبة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: أمين خدمة ابتدائي بنين"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Mobile Phone & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    رقم الموبايل (اسم الدخول) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    كلمة السر {editingAccountId ? '(اتركها فارغة للإبقاء عليها)' : <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Services Assignment */}
              {data.services.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    الخدمات التابع لها الخادم (اختياري):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                    {data.services.map(svc => {
                      const isSelected = selectedServiceIds.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => toggleService(svc.id)}
                          className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Granular Permissions Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  الصلاحيات المحددة لهذا الحساب:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManagePersons}
                      onChange={() => togglePermission('canManagePersons')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>إضافة وتعديل بيانات المخدومين</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canTakeAttendance}
                      onChange={() => togglePermission('canTakeAttendance')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>تسجيل ورصد الحضور والغياب</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canLogVisitations}
                      onChange={() => togglePermission('canLogVisitations')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>تسجيل ومتابعة الافتقاد</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canCreatePreparations}
                      onChange={() => togglePermission('canCreatePreparations')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>تحضير الدروس ومكتبة الخدمة</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageTasks}
                      onChange={() => togglePermission('canManageTasks')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>إدارة وتكليف مهام الخدمة</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canPostAnnouncements}
                      onChange={() => togglePermission('canPostAnnouncements')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>نشر التنبيهات والإعلانات</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewReports}
                      onChange={() => togglePermission('canViewReports')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>الاطلاع على التقارير والإحصائيات</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageUsers}
                      onChange={() => togglePermission('canManageUsers')}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>إدارة حسابات وصلاحيات الخدام</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer col-span-1 sm:col-span-2 text-red-700 font-medium">
                    <input
                      type="checkbox"
                      checked={permissions.canAccessSettings}
                      onChange={() => togglePermission('canAccessSettings')}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>إعدادات الكنيسة وتصفير البيانات (حساس)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingAccountId ? 'حفظ التعديلات' : 'إنشاء الحساب فوراً'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Churches
  app.get('/api/churches', (req, res) => {
    res.json(db.getChurches());
  });

  app.post('/api/churches', (req, res) => {
    const newChurch = {
      id: `church-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.addChurch(newChurch);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: newChurch.id,
      action: 'إنشاء كنيسة جديدة',
      userName: 'مدير النظام',
      details: `تم إضافة حساب مستقل لكنيسة: ${newChurch.name}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(newChurch);
  });

  app.put('/api/churches/:id', (req, res) => {
    const updated = db.updateChurch(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Church not found' });
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: req.params.id,
      action: 'تحديث بيانات الكنيسة',
      userName: 'مدير الكنيسة',
      details: 'تم تحديث بيانات وإعدادات الكنيسة',
      timestamp: new Date().toISOString()
    });
    res.json(updated);
  });

  // Church complete scoped data
  app.get('/api/church-data/:churchId', (req, res) => {
    const data = db.getChurchData(req.params.churchId);
    res.json(data);
  });

  // Persons
  app.get('/api/persons', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().persons;
    res.json(churchId ? all.filter(p => p.churchId === churchId) : all);
  });

  app.post('/api/persons', (req, res) => {
    const person = {
      id: req.body.id || `person-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.addPerson(person);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: person.churchId,
      action: 'إضافة شخص جديد',
      userName: req.body.operatorName || 'المسؤول',
      details: `تم إضافة ${person.name} (${person.code || 'بدون كود'}) للمنظومة`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(person);
  });

  app.put('/api/persons/:id', (req, res) => {
    const updated = db.updatePerson(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Person not found' });
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: updated.churchId,
      action: 'تعديل بيانات شخص',
      userName: req.body.operatorName || 'المسؤول',
      details: `تم تحديث بيانات ${updated.name}`,
      timestamp: new Date().toISOString()
    });
    res.json(updated);
  });

  app.delete('/api/persons/:id', (req, res) => {
    const person = db.getData().persons.find(p => p.id === req.params.id);
    if (person) {
      db.logAction({
        id: `log-${Date.now()}`,
        churchId: person.churchId,
        action: 'حذف شخص',
        userName: 'المسؤول',
        details: `تم حذف ${person.name} من النظام`,
        timestamp: new Date().toISOString()
      });
    }
    db.deletePerson(req.params.id);
    res.json({ success: true });
  });

  // Memberships (Many-to-Many Person <-> Service)
  app.get('/api/memberships', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().memberships;
    res.json(churchId ? all.filter(m => m.churchId === churchId) : all);
  });

  app.post('/api/memberships', (req, res) => {
    const membership = {
      id: req.body.id || `mem-${Date.now()}`,
      isActive: true,
      assignedDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.addMembership(membership);
    res.status(201).json(membership);
  });

  app.put('/api/memberships/:id', (req, res) => {
    const updated = db.updateMembership(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Membership not found' });
    res.json(updated);
  });

  app.delete('/api/memberships/:id', (req, res) => {
    db.deleteMembership(req.params.id);
    res.json({ success: true });
  });

  // Services
  app.get('/api/services', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().services;
    res.json(churchId ? all.filter(s => s.churchId === churchId) : all);
  });

  app.post('/api/services', (req, res) => {
    const service = {
      id: req.body.id || `srv-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.addService(service);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: service.churchId,
      action: 'إنشاء خدمة جديدة',
      userName: 'المسؤول',
      details: `تم إضافة خدمة: ${service.name}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(service);
  });

  app.put('/api/services/:id', (req, res) => {
    const updated = db.updateService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  });

  // Meetings
  app.get('/api/meetings', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().meetings;
    res.json(churchId ? all.filter(m => m.churchId === churchId) : all);
  });

  app.post('/api/meetings', (req, res) => {
    const meeting = {
      id: req.body.id || `meet-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.addMeeting(meeting);
    res.status(201).json(meeting);
  });

  // Groups
  app.get('/api/groups', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().groups;
    res.json(churchId ? all.filter(g => g.churchId === churchId) : all);
  });

  app.post('/api/groups', (req, res) => {
    const group = {
      id: req.body.id || `grp-${Date.now()}`,
      ...req.body
    };
    db.addGroup(group);
    res.status(201).json(group);
  });

  // Attendance
  app.get('/api/attendance', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().attendance;
    res.json(churchId ? all.filter(a => a.churchId === churchId) : all);
  });

  app.post('/api/attendance/batch', (req, res) => {
    const { records, operatorName, churchId, serviceName } = req.body;
    if (!Array.isArray(records)) return res.status(400).json({ error: 'Invalid records array' });

    const processed = records.map((r: any) => ({
      id: r.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...r
    }));

    db.saveAttendanceBatch(processed);
    if (churchId) {
      const presentCount = processed.filter(r => r.status === 'present').length;
      db.logAction({
        id: `log-${Date.now()}`,
        churchId,
        action: 'تسجيل كشف حضور',
        userName: operatorName || 'الخادم المسؤول',
        details: `تم تسجيل حضور ${serviceName || 'الخدمة'}: (${presentCount} حاضر من إجمالي ${processed.length})`,
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true, count: processed.length });
  });

  // Visitations
  app.get('/api/visitations', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().visitations;
    res.json(churchId ? all.filter(v => v.churchId === churchId) : all);
  });

  app.post('/api/visitations', (req, res) => {
    const vis = {
      id: req.body.id || `vis-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.addVisitation(vis);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: vis.churchId,
      action: 'توثيق افتقاد',
      userName: vis.servantName || 'الخادم',
      details: `تم توثيق افتقاد بطريقة (${vis.method}) لسبب: ${vis.reason}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(vis);
  });

  app.put('/api/visitations/:id', (req, res) => {
    const updated = db.updateVisitation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Visitation not found' });
    res.json(updated);
  });

  // Preparations
  app.get('/api/preparations', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().preparations;
    res.json(churchId ? all.filter(p => p.churchId === churchId) : all);
  });

  app.post('/api/preparations', (req, res) => {
    const prep = {
      id: req.body.id || `prep-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      readByServantIds: [],
      ...req.body
    };
    db.addPreparation(prep);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: prep.churchId,
      action: 'إرسال تحضير درس',
      userName: prep.authorName || 'أمين الخدمة',
      details: `تم إرسال تحضير: ${prep.title}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(prep);
  });

  app.post('/api/preparations/:id/read', (req, res) => {
    const { servantId } = req.body;
    const updated = db.markPreparationRead(req.params.id, servantId);
    if (!updated) return res.status(404).json({ error: 'Preparation not found' });
    res.json(updated);
  });

  // Library
  app.get('/api/library', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().library;
    res.json(churchId ? all.filter(l => l.churchId === churchId) : all);
  });

  app.post('/api/library', (req, res) => {
    const item = {
      id: req.body.id || `lib-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      tags: req.body.tags || [],
      ...req.body
    };
    db.addLibraryItem(item);
    res.status(201).json(item);
  });

  // Tasks
  app.get('/api/tasks', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().tasks;
    res.json(churchId ? all.filter(t => t.churchId === churchId) : all);
  });

  app.post('/api/tasks', (req, res) => {
    const task = {
      id: req.body.id || `tsk-${Date.now()}`,
      status: 'not_started',
      createdAt: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.addTask(task);
    res.status(201).json(task);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const updated = db.updateTask(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  });

  // Announcements
  app.get('/api/announcements', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().announcements;
    res.json(churchId ? all.filter(a => a.churchId === churchId) : all);
  });

  app.post('/api/announcements', (req, res) => {
    const ann = {
      id: req.body.id || `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body
    };
    db.addAnnouncement(ann);
    db.logAction({
      id: `log-${Date.now()}`,
      churchId: ann.churchId,
      action: 'نشر إعلان جديد',
      userName: ann.authorName || 'المسؤول',
      details: `تم نشر إعلان: ${ann.title}`,
      timestamp: new Date().toISOString()
    });
    res.status(201).json(ann);
  });

  // Parents
  app.get('/api/parents', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().parents;
    res.json(churchId ? all.filter(p => p.churchId === churchId) : all);
  });

  app.post('/api/parents', (req, res) => {
    const parent = {
      id: req.body.id || `par-${Date.now()}`,
      childrenIds: req.body.childrenIds || [],
      ...req.body
    };
    db.addParent(parent);
    res.status(201).json(parent);
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().auditLogs;
    res.json(churchId ? all.filter(l => l.churchId === churchId) : all);
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const churchId = req.query.churchId as string;
    const all = db.getData().notifications;
    res.json(churchId ? all.filter(n => n.churchId === churchId) : all);
  });

  // Auth: Register Church
  app.post('/api/auth/register-church', (req, res) => {
    const { name, region, address, phone, password, adminName, email } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'اسم الكنيسة ورقم الموبايل وكلمة السر حقول مطلوبة' });
    }

    const cleanPhone = phone.trim();
    const existingChurch = db.getChurches().find(c => c.phone === cleanPhone);
    if (existingChurch) {
      return res.status(400).json({ error: 'يوجد كنيسة مسجلة بالفعل بهذا الرقم، يرجى تسجيل الدخول أو استخدام رقم آخر' });
    }

    const newChurchId = `church-${Date.now()}`;
    const newChurch = {
      id: newChurchId,
      name: name.trim(),
      logo: '⛪',
      region: region?.trim() || 'عام',
      address: address?.trim() || '',
      phone: cleanPhone,
      password: password.trim(),
      adminName: adminName?.trim() || 'أبونا المسؤول',
      email: email?.trim() || '',
      settings: {
        attendanceTypes: [
          { id: 'meeting', label: 'اجتماع أسبوعي', icon: 'Users' },
          { id: 'liturgy', label: 'قداس إلهي', icon: 'Church' },
          { id: 'activity', label: 'نشاط وورشة عمل', icon: 'Smile' },
          { id: 'choir', label: 'تمرين كورال', icon: 'Music' }
        ],
        attendanceStatuses: [
          { id: 'present', label: 'حاضر', color: '#16a34a', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
          { id: 'absent', label: 'غائب', color: '#dc2626', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
          { id: 'excused', label: 'اعتذار مسبق', color: '#d97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' }
        ],
        visitationMethods: [
          { id: 'call', label: 'مكالمة هاتفية', icon: 'Phone' },
          { id: 'message', label: 'رسالة واتساب', icon: 'MessageCircle' },
          { id: 'visit', label: 'زيارة منزلية', icon: 'Home' },
          { id: 'in_person', label: 'مقابلة بالكنيسة', icon: 'UserCheck' }
        ],
        stages: ['حضانة', 'ابتدائي', 'إعدادي', 'ثانوي', 'جامعيين', 'خريجين', 'عامة']
      },
      createdAt: new Date().toISOString()
    };

    db.addChurch(newChurch);

    // Create primary admin account for this church
    const adminAccount = {
      id: `acc-admin-${Date.now()}`,
      churchId: newChurchId,
      name: adminName?.trim() || `مسؤول ${name}`,
      phone: cleanPhone,
      password: password.trim(),
      role: 'priest' as const,
      roleTitle: 'المشرف العام ومسؤول الكنيسة',
      permissions: {
        canManagePersons: true,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: true,
        canViewReports: true,
        canManageUsers: true,
        canAccessSettings: true
      },
      createdAt: new Date().toISOString()
    };

    db.addAccount(adminAccount);

    db.logAction({
      id: `log-${Date.now()}`,
      churchId: newChurchId,
      action: 'تسجيل كنيسة جديدة',
      userName: adminAccount.name,
      details: `تم تسجيل كنيسة: ${newChurch.name} بنجاح مع حساب المسؤول`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      church: newChurch,
      account: adminAccount
    });
  });

  // Auth: Login with Phone & Password
  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'يرجى إدخال رقم الموبايل وكلمة السر' });
    }

    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    // 1. Check user accounts first
    const accounts = db.getAccounts();
    const matchedAccount = accounts.find(
      a => a.phone === cleanPhone && a.password === cleanPassword
    );

    if (matchedAccount) {
      const church = db.getChurches().find(c => c.id === matchedAccount.churchId);
      if (church) {
        matchedAccount.lastLogin = new Date().toISOString();
        db.updateAccount(matchedAccount.id, { lastLogin: matchedAccount.lastLogin });

        db.logAction({
          id: `log-${Date.now()}`,
          churchId: church.id,
          action: 'تسجيل دخول مستخدم',
          userName: matchedAccount.name,
          details: `تم تسجيل الدخول بحساب: ${matchedAccount.name} (${matchedAccount.roleTitle || matchedAccount.role})`,
          timestamp: new Date().toISOString()
        });

        return res.json({
          success: true,
          church,
          account: matchedAccount
        });
      }
    }

    // 2. Check direct church admin credentials
    const matchedChurch = db.getChurches().find(
      c => c.phone === cleanPhone && (c.password === cleanPassword || !c.password)
    );

    if (matchedChurch) {
      // Find or generate admin account
      let churchAdminAccount = accounts.find(a => a.churchId === matchedChurch.id && a.role === 'priest');
      if (!churchAdminAccount) {
        churchAdminAccount = {
          id: `acc-admin-${matchedChurch.id}`,
          churchId: matchedChurch.id,
          name: matchedChurch.adminName || matchedChurch.name,
          phone: matchedChurch.phone,
          password: cleanPassword,
          role: 'priest',
          roleTitle: 'مسؤول الكنيسة',
          permissions: {
            canManagePersons: true,
            canTakeAttendance: true,
            canLogVisitations: true,
            canCreatePreparations: true,
            canManageTasks: true,
            canPostAnnouncements: true,
            canViewReports: true,
            canManageUsers: true,
            canAccessSettings: true
          },
          createdAt: new Date().toISOString()
        };
        db.addAccount(churchAdminAccount);
      }

      return res.json({
        success: true,
        church: matchedChurch,
        account: churchAdminAccount
      });
    }

    return res.status(401).json({ error: 'رقم الموبايل أو كلمة السر غير صحيحة، يرجى التأكد والمحاولة ثانية' });
  });

  // User Accounts (RBAC)
  app.get('/api/accounts', (req, res) => {
    const churchId = req.query.churchId as string;
    res.json(db.getAccounts(churchId));
  });

  app.post('/api/accounts', (req, res) => {
    const { churchId, name, phone, password, role, roleTitle, serviceIds, permissions, personId } = req.body;
    if (!churchId || !name || !phone || !password) {
      return res.status(400).json({ error: 'اسم الخادم، الكنيسة، رقم الموبايل، وكلمة السر حقول مطلوبة' });
    }

    const cleanPhone = phone.trim();
    const existing = db.getAccounts(churchId).find(a => a.phone === cleanPhone);
    if (existing) {
      return res.status(400).json({ error: 'يوجد حساب مسجل بالفعل برقم الموبايل هذا في الكنيسة' });
    }

    const defaultPerms = role === 'priest' ? {
      canManagePersons: true,
      canTakeAttendance: true,
      canLogVisitations: true,
      canCreatePreparations: true,
      canManageTasks: true,
      canPostAnnouncements: true,
      canViewReports: true,
      canManageUsers: true,
      canAccessSettings: true
    } : role === 'leader' ? {
      canManagePersons: true,
      canTakeAttendance: true,
      canLogVisitations: true,
      canCreatePreparations: true,
      canManageTasks: true,
      canPostAnnouncements: true,
      canViewReports: true,
      canManageUsers: false,
      canAccessSettings: false
    } : {
      canManagePersons: false,
      canTakeAttendance: true,
      canLogVisitations: true,
      canCreatePreparations: true,
      canManageTasks: true,
      canPostAnnouncements: false,
      canViewReports: false,
      canManageUsers: false,
      canAccessSettings: false
    };

    const newAccount = {
      id: req.body.id || `acc-${Date.now()}`,
      churchId,
      name: name.trim(),
      phone: cleanPhone,
      password: password.trim(),
      role: role || 'servant',
      roleTitle: roleTitle?.trim() || (role === 'priest' ? 'كاهن' : role === 'leader' ? 'أمين خدمة' : 'خادم'),
      serviceIds: serviceIds || [],
      permissions: permissions || defaultPerms,
      personId: personId || undefined,
      createdAt: new Date().toISOString()
    };

    db.addAccount(newAccount);

    db.logAction({
      id: `log-${Date.now()}`,
      churchId,
      action: 'إنشاء حساب خادم / صلاحيات',
      userName: req.body.operatorName || 'مسؤول الكنيسة',
      details: `تم إنشاء حساب لـ ${newAccount.name} بدور (${newAccount.roleTitle})`,
      timestamp: new Date().toISOString()
    });

    res.status(201).json(newAccount);
  });

  app.put('/api/accounts/:id', (req, res) => {
    const updated = db.updateAccount(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Account not found' });

    db.logAction({
      id: `log-${Date.now()}`,
      churchId: updated.churchId,
      action: 'تحديث صلاحيات حساب',
      userName: req.body.operatorName || 'مسؤول الكنيسة',
      details: `تم تحديث بيانات وصلاحيات الحساب: ${updated.name}`,
      timestamp: new Date().toISOString()
    });

    res.json(updated);
  });

  app.delete('/api/accounts/:id', (req, res) => {
    const acc = db.getAccounts().find(a => a.id === req.params.id);
    if (acc) {
      db.deleteAccount(req.params.id);
      db.logAction({
        id: `log-${Date.now()}`,
        churchId: acc.churchId,
        action: 'حذف حساب مستخدم',
        userName: 'مسؤول الكنيسة',
        details: `تم حذف حساب ${acc.name}`,
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true });
  });

  // Reset all records for a specific church so they can start from zero
  app.post('/api/church-reset/:churchId', (req, res) => {
    const churchId = req.params.churchId;
    const church = db.getChurches().find(c => c.id === churchId);
    if (!church) return res.status(404).json({ error: 'Church not found' });

    db.resetChurchData(churchId);

    db.logAction({
      id: `log-${Date.now()}`,
      churchId,
      action: 'تصفير بيانات الكنيسة',
      userName: req.body.operatorName || 'مسؤول الكنيسة',
      details: `تم تصفير جميع المخدومين والحضور والخدمات للكنيسة (${church.name}) للبدء من الصفر تماماً`,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `تم تصفير بيانات كنيسة (${church.name}) بنجاح. يمكنك الآن البدء من الصفر بإضافة الخدمات والمخدومين.`
    });
  });

  // Wipe complete database
  app.post('/api/wipe-database', (req, res) => {
    db.wipeDatabase();
    res.json({
      success: true,
      message: 'تم تصفير قاعدة البيانات بالكامل. يمكنك الآن تسجيل كنيستك والبدء من الصفر.'
    });
  });

  // Full Backup & Restore
  app.get('/api/backup', (req, res) => {
    res.json(db.getData());
  });

  app.post('/api/restore', (req, res) => {
    if (!req.body || !req.body.churches) {
      return res.status(400).json({ error: 'Invalid database backup structure' });
    }
    db.save(req.body);
    res.json({ success: true, message: 'Database restored successfully' });
  });

  app.post('/api/reset-seed', (req, res) => {
    const freshData = db.resetToSeed();
    res.json({ success: true, data: freshData });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kenisati Church Management Server running on port ${PORT}`);
  });
}

startServer();

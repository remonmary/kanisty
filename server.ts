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

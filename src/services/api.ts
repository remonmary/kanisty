import {
  Church,
  Person,
  Service,
  Meeting,
  Group,
  ServiceMembership,
  AttendanceRecord,
  VisitationRecord,
  Preparation,
  LibraryItem,
  TaskItem,
  Announcement,
  Parent,
  AuditLog,
  AppNotification,
  UserAccount
} from '../types';

export interface ScopedChurchData {
  church: Church | null;
  persons: Person[];
  services: Service[];
  meetings: Meeting[];
  groups: Group[];
  memberships: ServiceMembership[];
  attendance: AttendanceRecord[];
  visitations: VisitationRecord[];
  preparations: Preparation[];
  library: LibraryItem[];
  tasks: TaskItem[];
  announcements: Announcement[];
  parents: Parent[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  accounts: UserAccount[];
}

export const api = {
  async getChurches(): Promise<Church[]> {
    const res = await fetch('/api/churches');
    if (!res.ok) throw new Error('Failed to load churches');
    return res.json();
  },

  async addChurch(church: Partial<Church>): Promise<Church> {
    const res = await fetch('/api/churches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(church)
    });
    if (!res.ok) throw new Error('Failed to create church');
    return res.json();
  },

  async updateChurch(id: string, update: Partial<Church>): Promise<Church> {
    const res = await fetch(`/api/churches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update church');
    return res.json();
  },

  async getChurchData(churchId: string): Promise<ScopedChurchData> {
    const res = await fetch(`/api/church-data/${churchId}`);
    if (!res.ok) throw new Error('Failed to load church data');
    return res.json();
  },

  // Persons
  async addPerson(person: Partial<Person>, operatorName: string): Promise<Person> {
    const res = await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...person, operatorName })
    });
    if (!res.ok) throw new Error('Failed to add person');
    return res.json();
  },

  async updatePerson(id: string, update: Partial<Person>, operatorName: string): Promise<Person> {
    const res = await fetch(`/api/persons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...update, operatorName })
    });
    if (!res.ok) throw new Error('Failed to update person');
    return res.json();
  },

  async deletePerson(id: string): Promise<void> {
    const res = await fetch(`/api/persons/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete person');
  },

  // Memberships
  async addMembership(membership: Partial<ServiceMembership>): Promise<ServiceMembership> {
    const res = await fetch('/api/memberships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(membership)
    });
    if (!res.ok) throw new Error('Failed to add membership');
    return res.json();
  },

  async updateMembership(id: string, update: Partial<ServiceMembership>): Promise<ServiceMembership> {
    const res = await fetch(`/api/memberships/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update membership');
    return res.json();
  },

  async deleteMembership(id: string): Promise<void> {
    const res = await fetch(`/api/memberships/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete membership');
  },

  // Services
  async addService(service: Partial<Service>): Promise<Service> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    if (!res.ok) throw new Error('Failed to add service');
    return res.json();
  },

  // Meetings
  async addMeeting(meeting: Partial<Meeting>): Promise<Meeting> {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    });
    if (!res.ok) throw new Error('Failed to add meeting');
    return res.json();
  },

  // Groups
  async addGroup(group: Partial<Group>): Promise<Group> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(group)
    });
    if (!res.ok) throw new Error('Failed to add group');
    return res.json();
  },

  // Attendance batch
  async saveAttendanceBatch(params: {
    records: Partial<AttendanceRecord>[];
    operatorName: string;
    churchId: string;
    serviceName?: string;
  }): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/attendance/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to save attendance');
    return res.json();
  },

  // Visitations
  async addVisitation(visitation: Partial<VisitationRecord>): Promise<VisitationRecord> {
    const res = await fetch('/api/visitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitation)
    });
    if (!res.ok) throw new Error('Failed to save visitation');
    return res.json();
  },

  async updateVisitation(id: string, update: Partial<VisitationRecord>): Promise<VisitationRecord> {
    const res = await fetch(`/api/visitations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update visitation');
    return res.json();
  },

  // Preparations
  async addPreparation(prep: Partial<Preparation>): Promise<Preparation> {
    const res = await fetch('/api/preparations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prep)
    });
    if (!res.ok) throw new Error('Failed to add preparation');
    return res.json();
  },

  async markPreparationRead(prepId: string, servantId: string): Promise<Preparation> {
    const res = await fetch(`/api/preparations/${prepId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servantId })
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  // Library
  async addLibraryItem(item: Partial<LibraryItem>): Promise<LibraryItem> {
    const res = await fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add library item');
    return res.json();
  },

  // Tasks
  async addTask(task: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to add task');
    return res.json();
  },

  async updateTask(id: string, update: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  // Announcements
  async addAnnouncement(ann: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ann)
    });
    if (!res.ok) throw new Error('Failed to add announcement');
    return res.json();
  },

  // Parents
  async addParent(parent: Partial<Parent>): Promise<Parent> {
    const res = await fetch('/api/parents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parent)
    });
    if (!res.ok) throw new Error('Failed to add parent');
    return res.json();
  },

  // Reset demo seed
  async resetSeed(): Promise<void> {
    const res = await fetch('/api/reset-seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset seed data');
  },

  // Auth & Church Registration
  async registerChurch(payload: {
    name: string;
    region?: string;
    address?: string;
    phone: string;
    password: string;
    adminName?: string;
    email?: string;
  }): Promise<{ success: boolean; church: Church; account: UserAccount }> {
    const res = await fetch('/api/auth/register-church', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل في تسجيل الكنيسة');
    return data;
  },

  async login(phone: string, password: string): Promise<{ success: boolean; church: Church; account: UserAccount }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
    return data;
  },

  // User Accounts & RBAC
  async getAccounts(churchId?: string): Promise<UserAccount[]> {
    const url = churchId ? `/api/accounts?churchId=${encodeURIComponent(churchId)}` : '/api/accounts';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load accounts');
    return res.json();
  },

  async addAccount(account: Partial<UserAccount>): Promise<UserAccount> {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add account');
    return data;
  },

  async updateAccount(id: string, update: Partial<UserAccount>): Promise<UserAccount> {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update account');
    return data;
  },

  async deleteAccount(id: string): Promise<void> {
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete account');
  },

  // Database Reset Operations
  async resetChurchData(churchId: string, operatorName?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/church-reset/${encodeURIComponent(churchId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تصفير بيانات الكنيسة');
    return data;
  },

  async wipeDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/wipe-database', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تصفير قاعدة البيانات');
    return data;
  },

  // Backup & Restore
  async getBackup(): Promise<any> {
    const res = await fetch('/api/backup');
    if (!res.ok) throw new Error('Failed to export database backup');
    return res.json();
  },

  async exportDatabase(): Promise<any> {
    return this.getBackup();
  },

  async restoreBackup(data: any): Promise<void> {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to restore backup');
  },

  async restoreDatabase(data: any): Promise<void> {
    return this.restoreBackup(data);
  }
};

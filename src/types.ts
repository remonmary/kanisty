export type UserRole = 'priest' | 'leader' | 'servant' | 'member';

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late' | 'excused_absence';

export interface ChurchSettings {
  attendanceTypes: { id: string; label: string; icon?: string }[];
  attendanceStatuses: { id: string; label: string; color: string; badgeBg: string; badgeText: string }[];
  visitationMethods: { id: string; label: string; icon?: string }[];
  stages: string[];
}

export interface Church {
  id: string;
  name: string;
  logo: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  settings: ChurchSettings;
  createdAt: string;
}

export interface Person {
  id: string;
  churchId: string;
  name: string;
  code: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  phone: string;
  email?: string;
  address: string;
  stage: string; // المرحلة الدراسية / العمرية
  school?: string; // المدرسة أو الكلية
  photo?: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'archived';
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceMembership {
  id: string;
  churchId: string;
  personId: string;
  serviceId: string;
  meetingId?: string;
  groupId?: string;
  role: UserRole;
  roleTitle?: string; // e.g. "أمين خدمة مساعد"
  assignedServantId?: string; // الخادم المسؤول عن المخدوم
  assignedDate: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  churchId: string;
  name: string;
  stage: string;
  icon: string;
  description: string;
  leaderIds: string[]; // Person IDs
  createdAt: string;
}

export interface Meeting {
  id: string;
  churchId: string;
  serviceId: string;
  name: string;
  dayOfWeek: string;
  time: string;
  location: string;
  createdAt: string;
}

export interface Group {
  id: string;
  churchId: string;
  serviceId: string;
  meetingId?: string;
  name: string;
  assignedServantIds: string[];
}

export interface AttendanceRecord {
  id: string;
  churchId: string;
  personId: string;
  serviceId: string;
  meetingId: string;
  groupId?: string;
  type: string; // 'meeting', 'liturgy', 'activity', 'choir', 'trip', 'conference', etc.
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused' | 'late' | 'excused_absence';
  recordedBy: string; // Servant name or ID
  notes?: string;
  createdAt: string;
}

export interface VisitationRecord {
  id: string;
  churchId: string;
  personId: string;
  servantId: string;
  servantName: string;
  serviceId: string;
  date: string;
  method: 'call' | 'message' | 'visit' | 'in_person' | 'other';
  reason: string;
  result: string;
  notes: string;
  followUpDate?: string;
  isResolved?: boolean;
  createdAt: string;
}

export interface Preparation {
  id: string;
  churchId: string;
  serviceId: string;
  meetingId?: string;
  title: string;
  type?: 'lesson' | 'story' | 'activity' | 'media';
  date?: string;
  content: string;
  scripture?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  fileUrl?: string;
  authorId: string;
  authorName: string;
  targetAudience?: any;
  readByServantIds?: string[];
  readStatus?: {
    servantId: string;
    isRead: boolean;
    readAt?: string;
  }[];
  createdAt?: string;
}

export interface LibraryItem {
  id: string;
  churchId: string;
  serviceId?: string;
  title: string;
  category: 'lessons' | 'stories' | 'activities' | 'hymns' | 'photos' | 'books' | 'files' | 'preparations' | 'lesson' | 'story' | 'activity' | 'hymn' | 'media' | 'book';
  description: string;
  targetStage?: string;
  fileUrl?: string;
  author?: string;
  tags?: string[];
  createdAt?: string;
}

export interface TaskItem {
  id: string;
  churchId: string;
  serviceId?: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  creatorId?: string;
  dueDate: string;
  priority: 'urgent' | 'medium' | 'normal' | 'important';
  status: 'not_started' | 'in_progress' | 'completed' | 'pending';
  createdAt?: string;
}

export interface Announcement {
  id: string;
  churchId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole?: string;
  target?: 'all' | 'service' | 'servants' | 'group';
  targetAudience?: 'all' | 'servants' | 'specific_service' | string;
  targetServiceId?: string;
  targetGroupId?: string;
  priority?: 'normal' | 'important' | 'urgent';
  date: string;
  isPinned?: boolean;
}

export interface Parent {
  id: string;
  churchId: string;
  name: string;
  phone: string;
  relation: string;
  job?: string;
  notes?: string;
  childrenIds: string[];
}

export interface AuditLog {
  id: string;
  churchId: string;
  action: string;
  userName: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  churchId: string;
  title: string;
  message: string;
  type: 'preparation' | 'task' | 'meeting' | 'attendance' | 'visitation' | 'birthday' | 'announcement';
  date: string;
  isRead: boolean;
  linkTab?: string;
}

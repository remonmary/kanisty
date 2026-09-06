import fs from 'fs';
import path from 'path';
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
} from '../src/types.js';

export interface DatabaseSchema {
  churches: Church[];
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

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'kenisati.json');

export function getInitialSeed(): DatabaseSchema {
  const churches: Church[] = [
    {
      id: 'church-1',
      name: 'كنيسة رئيس الملائكة الجليل ميخائيل',
      logo: '⛪',
      region: 'القاهرة / الظاهر',
      address: 'شارع كلوت بك، الظاهر، القاهرة',
      phone: '01000000001',
      password: '123456',
      adminName: 'القمص / متى إبراهيم',
      email: 'stmichael.elzaher@kenisati.org',
      settings: {
        attendanceTypes: [
          { id: 'meeting', label: 'اجتماع أسبوعي', icon: 'Users' },
          { id: 'liturgy', label: 'قداس إلهي', icon: 'Church' },
          { id: 'gathering', label: 'لقاء روحي', icon: 'Heart' },
          { id: 'activity', label: 'نشاط وورشة عمل', icon: 'Smile' },
          { id: 'choir', label: 'تمرين كورال', icon: 'Music' },
          { id: 'trip', label: 'رحلة كنسية', icon: 'Compass' },
          { id: 'conference', label: 'مؤتمر سنوي', icon: 'Award' },
          { id: 'custom', label: 'نشاط مخصص', icon: 'Bookmark' }
        ],
        attendanceStatuses: [
          { id: 'present', label: 'حاضر', color: '#16a34a', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
          { id: 'absent', label: 'غائب', color: '#dc2626', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
          { id: 'excused', label: 'اعتذار مسبق', color: '#d97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' },
          { id: 'late', label: 'متأخر', color: '#ea580c', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700' },
          { id: 'excused_absence', label: 'غياب بعذر', color: '#64748b', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' }
        ],
        visitationMethods: [
          { id: 'call', label: 'مكالمة هاتفية', icon: 'Phone' },
          { id: 'message', label: 'رسالة واتساب', icon: 'MessageCircle' },
          { id: 'visit', label: 'زيارة منزلية', icon: 'Home' },
          { id: 'in_person', label: 'مقابلة شخصية بالكنيسة', icon: 'UserCheck' },
          { id: 'other', label: 'طريقة أخرى', icon: 'MoreHorizontal' }
        ],
        stages: ['حضانة', 'ابتدائي', 'إعدادي', 'ثانوي', 'شباب جامعي', 'خريجين', 'عامة']
      },
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'church-2',
      name: 'كنيسة الشهيد العظيم مارمرقس الرسول',
      logo: '⛪',
      region: 'الجيزة / الدقي',
      address: 'ميدان المساحة، الدقي، الجيزة',
      phone: '01000000002',
      password: '123456',
      adminName: 'أبونا مرقس حبيب',
      email: 'stmark.dokki@kenisati.org',
      settings: {
        attendanceTypes: [
          { id: 'meeting', label: 'اجتماع أسبوعي', icon: 'Users' },
          { id: 'liturgy', label: 'قداس إلهي', icon: 'Church' },
          { id: 'activity', label: 'نشاط', icon: 'Smile' }
        ],
        attendanceStatuses: [
          { id: 'present', label: 'حاضر', color: '#16a34a', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' },
          { id: 'absent', label: 'غائب', color: '#dc2626', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700' },
          { id: 'excused', label: 'اعتذار', color: '#d97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' }
        ],
        visitationMethods: [
          { id: 'call', label: 'مكالمة هاتفية', icon: 'Phone' },
          { id: 'visit', label: 'زيارة منزلية', icon: 'Home' }
        ],
        stages: ['ابتدائي', 'إعدادي', 'ثانوي', 'شباب']
      },
      createdAt: '2024-02-15T00:00:00.000Z'
    }
  ];

  const services: Service[] = [
    {
      id: 'srv-prep',
      churchId: 'church-1',
      name: 'خدمة المرحلة الإعدادية',
      stage: 'إعدادي',
      icon: '🧒',
      description: 'خدمة شباب وشابات المرحلة الإعدادية (أولى، ثانية، ثالثة إعدادي) لتنمية الحياة الروحية والدراسية والاجتماعية.',
      leaderIds: ['p-leader-mark'],
      createdAt: '2024-01-10'
    },
    {
      id: 'srv-youth',
      churchId: 'church-1',
      name: 'خدمة الشباب الجامعي',
      stage: 'شباب جامعي',
      icon: '👨',
      description: 'اجتماع شباب الجامعة والخريجين الجدد لمناقشة التحديات المعاصرة، ورش العمل والمؤتمرات.',
      leaderIds: ['p-leader-george'],
      createdAt: '2024-01-10'
    },
    {
      id: 'srv-pri',
      churchId: 'church-1',
      name: 'مدارس أحد ابتدائي',
      stage: 'ابتدائي',
      icon: '👶',
      description: 'تربية أطفال ابتدائي على محبة الكنيسة والتعاليم المسيحية والألحان.',
      leaderIds: ['p-leader-mary'],
      createdAt: '2024-01-10'
    },
    {
      id: 'srv-choir',
      churchId: 'church-1',
      name: 'كورال قيثارة داود المرتل',
      stage: 'عامة',
      icon: '🎵',
      description: 'فريق الترانيم والألحان الكنسية يضم موهوبي مختلف المراحل لخدمة الاحتفالات والمناسبات.',
      leaderIds: ['p-servant-mina'],
      createdAt: '2024-01-15'
    },
    {
      id: 'srv-sec',
      churchId: 'church-1',
      name: 'خدمة المرحلة الثانوية',
      stage: 'ثانوي',
      icon: '👦',
      description: 'بناء الهوية المسيحية السليمة لشباب ثانوي وتأهيلهم لمرحلة الجامعة.',
      leaderIds: ['p-leader-mark'],
      createdAt: '2024-01-15'
    }
  ];

  const meetings: Meeting[] = [
    {
      id: 'meet-prep-sat',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      name: 'اجتماع إعدادي الأسبوعي',
      dayOfWeek: 'السبت',
      time: '06:00 م',
      location: 'قاعة القديس مارمينا - الدور الثاني',
      createdAt: '2024-01-10'
    },
    {
      id: 'meet-prep-sun',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      name: 'قداس إعدادي المشترك',
      dayOfWeek: 'الأحد',
      time: '07:00 ص',
      location: 'كنيسة العذراء مريم - الدور الأرضي',
      createdAt: '2024-01-10'
    },
    {
      id: 'meet-youth-fri',
      churchId: 'church-1',
      serviceId: 'srv-youth',
      name: 'اجتماع الشباب الأسبوعي',
      dayOfWeek: 'الجمعة',
      time: '07:00 م',
      location: 'المسرح الكبير بالكنيسة',
      createdAt: '2024-01-10'
    },
    {
      id: 'meet-choir-wed',
      churchId: 'church-1',
      serviceId: 'srv-choir',
      name: 'تدريب الكورال الأسبوعي',
      dayOfWeek: 'الأربعاء',
      time: '06:30 م',
      location: 'غرفة الموسيقى والتسجيل',
      createdAt: '2024-01-15'
    }
  ];

  const groups: Group[] = [
    {
      id: 'grp-prep-1',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      name: 'مجموعة 1 - أسرة القديس أثناسيوس',
      assignedServantIds: ['p-servant-mina']
    },
    {
      id: 'grp-prep-2',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      name: 'مجموعة 2 - أسرة الشهيد مارجرجس',
      assignedServantIds: ['p-servant-maryam']
    },
    {
      id: 'grp-prep-3',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      name: 'مجموعة 3 - أسرة الأنبا أنطونيوس',
      assignedServantIds: ['p-servant-kyrollos']
    },
    {
      id: 'grp-choir-tenor',
      churchId: 'church-1',
      serviceId: 'srv-choir',
      meetingId: 'meet-choir-wed',
      name: 'فريق 2 - التينور والصولو',
      assignedServantIds: ['p-servant-mina']
    }
  ];

  // Helper date for birthdays
  const now = new Date();
  const todayMonthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowMonthDay = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const persons: Person[] = [
    {
      id: 'p-priest-bishoy',
      churchId: 'church-1',
      name: 'القمص بيشوي كامل عزيز',
      code: 'PR-001',
      gender: 'male',
      birthDate: '1970-04-12',
      phone: '01221234567',
      email: 'fr.bishoy@kenisati.org',
      address: '15 شارع رمسيس، القاهرة',
      stage: 'عامة',
      school: 'الكلية الإكليريكية اللاهوتية',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      joinDate: '2010-01-01',
      status: 'active',
      notes: 'كاهن الكنيسة ومسؤول الرعاية الروحية والافتقاد العام',
      createdAt: '2024-01-01'
    },
    {
      id: 'p-leader-mark',
      churchId: 'church-1',
      name: 'د. مارك سمير رمزي',
      code: 'LD-101',
      gender: 'male',
      birthDate: '1991-08-20',
      phone: '01009876543',
      email: 'dr.mark.samir@gmail.com',
      address: '24 شارع شبرا، القاهرة',
      stage: 'خريجين',
      school: 'كلية الطب جامعة عين شمس',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      joinDate: '2015-09-01',
      status: 'active',
      notes: 'أمين خدمة إعدادي، ويخدم أيضاً في خدمة الشباب وعضو في الكورال',
      createdAt: '2024-01-05'
    },
    {
      id: 'p-servant-mina',
      churchId: 'church-1',
      name: 'مينا وجدي مسعود',
      code: 'SR-201',
      gender: 'male',
      birthDate: '1997-11-14',
      phone: '01115544332',
      email: 'mina.wagdy@gmail.com',
      address: '8 شارع جزيرة بدران، شبرا',
      stage: 'خريجين',
      school: 'كلية الهندسة جامعة القاهرة',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      joinDate: '2018-09-15',
      status: 'active',
      notes: 'خادم مجموعة 1 إعدادي ومسؤول فرقة الكورال',
      createdAt: '2024-01-08'
    },
    {
      id: 'p-servant-maryam',
      churchId: 'church-1',
      name: 'مريم عادل نصيف',
      code: 'SR-202',
      gender: 'female',
      birthDate: '1998-03-25',
      phone: '01229988776',
      email: 'maryam.adel@gmail.com',
      address: '12 شارع أحمد سعيد، العباسية',
      stage: 'خريجين',
      school: 'كلية الألسن لغة إنجليزية',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      joinDate: '2019-10-01',
      status: 'active',
      notes: 'خادمة مجموعة 2 إعدادي بنات ومسؤولة الأنشطة الفنية',
      createdAt: '2024-01-10'
    },
    {
      id: 'p-servant-kyrollos',
      churchId: 'church-1',
      name: 'كيرلس فايز حبيب',
      code: 'SR-203',
      gender: 'male',
      birthDate: '1996-05-19',
      phone: '01061234890',
      email: 'kyrollos.fayez@gmail.com',
      address: '30 شارع الظاهر الرئيسي',
      stage: 'خريجين',
      school: 'كلية التجارة وإدارة الأعمال',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      joinDate: '2017-09-01',
      status: 'active',
      notes: 'خادم مجموعة 3 إعدادي بنين',
      createdAt: '2024-01-10'
    },
    // Members (مخدومين)
    {
      id: 'p-mem-mina',
      churchId: 'church-1',
      name: 'مينا ممدوح غالي',
      code: 'MN-1042',
      gender: 'male',
      birthDate: `2011-${todayMonthDay}`, // Birthday TODAY!
      phone: '01287654321',
      address: '4 شارع القبيسي، الظاهر',
      stage: 'إعدادي',
      school: 'مدرسة القديس يوسف الإعدادية',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-01',
      status: 'active',
      parentId: 'par-mamdouh',
      parentName: 'ممدوح غالي رزق',
      parentPhone: '01223456789',
      parentRelation: 'أب',
      notes: 'شماس ملتزم ومحب للألحان ومشارك في الكورال',
      createdAt: '2023-09-01'
    },
    {
      id: 'p-mem-fady',
      churchId: 'church-1',
      name: 'فادي نبيل عزيز',
      code: 'FD-1043',
      gender: 'male',
      birthDate: '2011-06-18',
      phone: '01123456780',
      address: '9 شارع الجيوشي، شبرا',
      stage: 'إعدادي',
      school: 'مدرسة التوفيقية الإعدادية',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-01',
      status: 'active',
      parentId: 'par-nabil',
      parentName: 'نبيل عزيز ميخائيل',
      parentPhone: '01001122334',
      parentRelation: 'أب',
      notes: 'غائب لـ 3 اجتماعات متتالية ويحتاج افتقاداً فورياً',
      createdAt: '2023-09-01'
    },
    {
      id: 'p-mem-marina',
      churchId: 'church-1',
      name: 'مارينا سامي يعقوب',
      code: 'MR-1044',
      gender: 'female',
      birthDate: `2012-${tomorrowMonthDay}`, // Birthday TOMORROW!
      phone: '01209871234',
      address: '18 شارع العباسية الغربية',
      stage: 'إعدادي',
      school: 'مدرسة الراهبات الفرنسيسكانيات',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-10-01',
      status: 'active',
      parentId: 'par-sami',
      parentName: 'سامي يعقوب بولس',
      parentPhone: '01225566778',
      parentRelation: 'أب',
      notes: 'لم يتم افتقادها منذ أكثر من 30 يوماً',
      createdAt: '2023-10-01'
    },
    {
      id: 'p-mem-andrew',
      churchId: 'church-1',
      name: 'أندرو وسيم توفيق',
      code: 'AN-1045',
      gender: 'male',
      birthDate: '2010-12-05',
      phone: '01098761234',
      address: '7 شارع الفجالة، القاهرة',
      stage: 'إعدادي',
      school: 'مدرسة الفرير دي لاسال',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-15',
      status: 'active',
      parentName: 'وسيم توفيق حبيب',
      parentPhone: '01112233445',
      parentRelation: 'أب',
      notes: 'نسبة حضوره أقل من 70% بسبب تمارين السباحة يوم السبت',
      createdAt: '2023-09-15'
    },
    {
      id: 'p-mem-peter',
      churchId: 'church-1',
      name: 'بيتر عصام يوسف',
      code: 'PT-1046',
      gender: 'male',
      birthDate: '2011-09-10',
      phone: '01276549821',
      address: '14 شارع بورسعيد، غمرة',
      stage: 'إعدادي',
      school: 'مدرسة النيل الإعدادية',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-01',
      status: 'active',
      parentName: 'عصام يوسف رزق',
      parentPhone: '01007788990',
      parentRelation: 'أب',
      notes: 'شماس متميز ونشيط في النشاط الرياضي',
      createdAt: '2023-09-01'
    },
    {
      id: 'p-mem-sara',
      churchId: 'church-1',
      name: 'سارة مجدي زكي',
      code: 'SR-1047',
      gender: 'female',
      birthDate: '2011-03-14',
      phone: '01211223344',
      address: '22 شارع مصر والسودان، حدائق القبة',
      stage: 'إعدادي',
      school: 'مدرسة القديس جرجس للغات',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinDate: '2023-09-20',
      status: 'active',
      parentName: 'مجدي زكي نصحي',
      parentPhone: '01223344556',
      parentRelation: 'أب',
      notes: 'ملتزمة وتشارك في فريق الرسم والمسرح',
      createdAt: '2023-09-20'
    },
    {
      id: 'p-mem-david',
      churchId: 'church-1',
      name: 'دافيد هاني سمير',
      code: 'DV-2050',
      gender: 'male',
      birthDate: '2004-10-18',
      phone: '01019988443',
      address: '5 شارع الترعة البولاقية، شبرا',
      stage: 'شباب جامعي',
      school: 'كلية الحاسبات والمعلومات',
      photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      joinDate: '2022-10-01',
      status: 'active',
      notes: 'مشارك في لجنة تكنولوجيا المعلومات والمسرح بالشباب',
      createdAt: '2022-10-01'
    }
  ];

  // Memberships showing the exact Many-to-Many rule:
  // e.g. Dr. Mark is Service Leader in Prep, Servant in Youth, and Member in Choir!
  const memberships: ServiceMembership[] = [
    // Priest
    {
      id: 'm-priest-all',
      churchId: 'church-1',
      personId: 'p-priest-bishoy',
      serviceId: 'srv-prep',
      role: 'priest',
      roleTitle: 'المرشد الروحي العام',
      assignedDate: '2020-01-01',
      isActive: true
    },
    // Dr. Mark Samir
    {
      id: 'm-mark-prep',
      churchId: 'church-1',
      personId: 'p-leader-mark',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      role: 'leader',
      roleTitle: 'أمين خدمة المرحلة الإعدادية',
      assignedDate: '2021-09-01',
      isActive: true
    },
    {
      id: 'm-mark-youth',
      churchId: 'church-1',
      personId: 'p-leader-mark',
      serviceId: 'srv-youth',
      meetingId: 'meet-youth-fri',
      role: 'servant',
      roleTitle: 'خادم ومسؤول لجنة الندوات الثقافية',
      assignedDate: '2022-01-01',
      isActive: true
    },
    {
      id: 'm-mark-choir',
      churchId: 'church-1',
      personId: 'p-leader-mark',
      serviceId: 'srv-choir',
      meetingId: 'meet-choir-wed',
      role: 'member',
      roleTitle: 'مرنم في طبقة الباص',
      assignedDate: '2023-01-01',
      isActive: true
    },
    // Mina Wagdy
    {
      id: 'm-mina-prep',
      churchId: 'church-1',
      personId: 'p-servant-mina',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-1',
      role: 'servant',
      roleTitle: 'خادم أولى إعدادي مجموعة 1',
      assignedDate: '2022-09-01',
      isActive: true
    },
    {
      id: 'm-mina-choir',
      churchId: 'church-1',
      personId: 'p-servant-mina',
      serviceId: 'srv-choir',
      meetingId: 'meet-choir-wed',
      groupId: 'grp-choir-tenor',
      role: 'leader',
      roleTitle: 'مدرب ومسؤول فريق الكورال',
      assignedDate: '2022-09-01',
      isActive: true
    },
    // Maryam Adel
    {
      id: 'm-maryam-prep',
      churchId: 'church-1',
      personId: 'p-servant-maryam',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-2',
      role: 'servant',
      roleTitle: 'خادمة بنات إعدادي مجموعة 2',
      assignedDate: '2022-09-01',
      isActive: true
    },
    // Kyrollos Fayez
    {
      id: 'm-kyrollos-prep',
      churchId: 'church-1',
      personId: 'p-servant-kyrollos',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-3',
      role: 'servant',
      roleTitle: 'خادم ثانية إعدادي مجموعة 3',
      assignedDate: '2022-09-01',
      isActive: true
    },
    // Member: Mina Mamdouh (In Prep Group 1 & Choir!)
    {
      id: 'm-mem-mina-prep',
      churchId: 'church-1',
      personId: 'p-mem-mina',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-1',
      role: 'member',
      assignedServantId: 'p-servant-mina',
      assignedDate: '2023-09-01',
      isActive: true
    },
    {
      id: 'm-mem-mina-choir',
      churchId: 'church-1',
      personId: 'p-mem-mina',
      serviceId: 'srv-choir',
      meetingId: 'meet-choir-wed',
      groupId: 'grp-choir-tenor',
      role: 'member',
      assignedServantId: 'p-servant-mina',
      assignedDate: '2023-10-01',
      isActive: true
    },
    // Member: Fady Nabil (Prep Group 1)
    {
      id: 'm-mem-fady-prep',
      churchId: 'church-1',
      personId: 'p-mem-fady',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-1',
      role: 'member',
      assignedServantId: 'p-servant-mina',
      assignedDate: '2023-09-01',
      isActive: true
    },
    // Member: Marina Sami (Prep Group 2)
    {
      id: 'm-mem-marina-prep',
      churchId: 'church-1',
      personId: 'p-mem-marina',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-2',
      role: 'member',
      assignedServantId: 'p-servant-maryam',
      assignedDate: '2023-10-01',
      isActive: true
    },
    // Member: Andrew Waseem (Prep Group 1)
    {
      id: 'm-mem-andrew-prep',
      churchId: 'church-1',
      personId: 'p-mem-andrew',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-1',
      role: 'member',
      assignedServantId: 'p-servant-mina',
      assignedDate: '2023-09-15',
      isActive: true
    },
    // Member: Peter Essam (Prep Group 3)
    {
      id: 'm-mem-peter-prep',
      churchId: 'church-1',
      personId: 'p-mem-peter',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-3',
      role: 'member',
      assignedServantId: 'p-servant-kyrollos',
      assignedDate: '2023-09-01',
      isActive: true
    },
    // Member: Sara Magdy (Prep Group 2)
    {
      id: 'm-mem-sara-prep',
      churchId: 'church-1',
      personId: 'p-mem-sara',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      groupId: 'grp-prep-2',
      role: 'member',
      assignedServantId: 'p-servant-maryam',
      assignedDate: '2023-09-20',
      isActive: true
    },
    // David Hany (Youth)
    {
      id: 'm-mem-david-youth',
      churchId: 'church-1',
      personId: 'p-mem-david',
      serviceId: 'srv-youth',
      meetingId: 'meet-youth-fri',
      role: 'member',
      assignedServantId: 'p-leader-mark',
      assignedDate: '2022-10-01',
      isActive: true
    }
  ];

  // Attendance records: multiple dates to trigger smart follow-up conditions accurately!
  // Dates:
  // Date 1: 2024-08-17 (3 weeks ago)
  // Date 2: 2024-08-24 (2 weeks ago)
  // Date 3: 2024-08-31 (last week)
  const attendance: AttendanceRecord[] = [
    // Date 1: 2024-08-17
    { id: 'att-1-1', churchId: 'church-1', personId: 'p-mem-mina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-17', status: 'present', recordedBy: 'مينا وجدي', createdAt: '2024-08-17' },
    { id: 'att-1-2', churchId: 'church-1', personId: 'p-mem-fady', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-17', status: 'absent', recordedBy: 'مينا وجدي', notes: 'لم يحضر الاجتماع', createdAt: '2024-08-17' },
    { id: 'att-1-3', churchId: 'church-1', personId: 'p-mem-andrew', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-17', status: 'absent', recordedBy: 'مينا وجدي', createdAt: '2024-08-17' },
    { id: 'att-1-4', churchId: 'church-1', personId: 'p-mem-marina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-17', status: 'present', recordedBy: 'مريم عادل', createdAt: '2024-08-17' },
    { id: 'att-1-5', churchId: 'church-1', personId: 'p-mem-sara', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-17', status: 'present', recordedBy: 'مريم عادل', createdAt: '2024-08-17' },
    { id: 'att-1-6', churchId: 'church-1', personId: 'p-mem-peter', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-3', type: 'meeting', date: '2024-08-17', status: 'present', recordedBy: 'كيرلس فايز', createdAt: '2024-08-17' },

    // Date 2: 2024-08-24
    { id: 'att-2-1', churchId: 'church-1', personId: 'p-mem-mina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-24', status: 'present', recordedBy: 'مينا وجدي', createdAt: '2024-08-24' },
    { id: 'att-2-2', churchId: 'church-1', personId: 'p-mem-fady', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-24', status: 'absent', recordedBy: 'مينا وجدي', notes: 'غياب بدون اتصال', createdAt: '2024-08-24' },
    { id: 'att-2-3', churchId: 'church-1', personId: 'p-mem-andrew', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-24', status: 'excused', recordedBy: 'مينا وجدي', notes: 'اعتذار بسبب بطولة رياضية', createdAt: '2024-08-24' },
    { id: 'att-2-4', churchId: 'church-1', personId: 'p-mem-marina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-24', status: 'present', recordedBy: 'مريم عادل', createdAt: '2024-08-24' },
    { id: 'att-2-5', churchId: 'church-1', personId: 'p-mem-sara', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-24', status: 'late', recordedBy: 'مريم عادل', createdAt: '2024-08-24' },
    { id: 'att-2-6', churchId: 'church-1', personId: 'p-mem-peter', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-3', type: 'meeting', date: '2024-08-24', status: 'present', recordedBy: 'كيرلس فايز', createdAt: '2024-08-24' },

    // Date 3: 2024-08-31
    { id: 'att-3-1', churchId: 'church-1', personId: 'p-mem-mina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-31', status: 'present', recordedBy: 'مينا وجدي', createdAt: '2024-08-31' },
    { id: 'att-3-2', churchId: 'church-1', personId: 'p-mem-fady', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-31', status: 'absent', recordedBy: 'مينا وجدي', notes: 'غائب للأسبوع الثالث على التوالي', createdAt: '2024-08-31' },
    { id: 'att-3-3', churchId: 'church-1', personId: 'p-mem-andrew', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-1', type: 'meeting', date: '2024-08-31', status: 'absent', recordedBy: 'مينا وجدي', createdAt: '2024-08-31' },
    { id: 'att-3-4', churchId: 'church-1', personId: 'p-mem-marina', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-31', status: 'present', recordedBy: 'مريم عادل', createdAt: '2024-08-31' },
    { id: 'att-3-5', churchId: 'church-1', personId: 'p-mem-sara', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-2', type: 'meeting', date: '2024-08-31', status: 'present', recordedBy: 'مريم عادل', createdAt: '2024-08-31' },
    { id: 'att-3-6', churchId: 'church-1', personId: 'p-mem-peter', serviceId: 'srv-prep', meetingId: 'meet-prep-sat', groupId: 'grp-prep-3', type: 'meeting', date: '2024-08-31', status: 'present', recordedBy: 'كيرلس فايز', createdAt: '2024-08-31' },

    // Choir attendance on Wednesday
    { id: 'att-c-1', churchId: 'church-1', personId: 'p-mem-mina', serviceId: 'srv-choir', meetingId: 'meet-choir-wed', groupId: 'grp-choir-tenor', type: 'choir', date: '2024-08-28', status: 'present', recordedBy: 'مينا وجدي', createdAt: '2024-08-28' },
    { id: 'att-c-2', churchId: 'church-1', personId: 'p-leader-mark', serviceId: 'srv-choir', meetingId: 'meet-choir-wed', groupId: 'grp-choir-tenor', type: 'choir', date: '2024-08-28', status: 'present', recordedBy: 'مينا وجدي', createdAt: '2024-08-28' }
  ];

  // Visitation records
  const visitations: VisitationRecord[] = [
    {
      id: 'vis-1',
      churchId: 'church-1',
      personId: 'p-mem-mina',
      servantId: 'p-servant-mina',
      servantName: 'مينا وجدي مسعود',
      serviceId: 'srv-prep',
      date: '2024-09-02',
      method: 'call',
      reason: 'اطمئنان دوري وتهنئة ببداية العام الدراسي',
      result: 'المخدوم بحالة ممتازة ومتحمس لدور الشمامسة والكورال',
      notes: 'تم الاتفاق على موعد تحفيظ ألحان القداس',
      followUpDate: '2024-09-25',
      isResolved: true,
      createdAt: '2024-09-02'
    },
    {
      id: 'vis-2',
      churchId: 'church-1',
      personId: 'p-mem-fady',
      servantId: 'p-servant-mina',
      servantName: 'مينا وجدي مسعود',
      serviceId: 'srv-prep',
      date: '2024-08-25',
      method: 'message',
      reason: 'غياب متكرر عن الاجتماع',
      result: 'تم إرسال رسالة واتساب للوالد ولكن لم يتم الرد بعد',
      notes: 'مطلوب زيارة منزلية مع أمين الخدمة أو الكاهن للوقوف على أسباب الانقطاع',
      followUpDate: '2024-09-07',
      isResolved: false,
      createdAt: '2024-08-25'
    },
    {
      id: 'vis-3',
      churchId: 'church-1',
      personId: 'p-mem-marina',
      servantId: 'p-servant-maryam',
      servantName: 'مريم عادل نصيف',
      serviceId: 'srv-prep',
      date: '2024-07-20', // more than 30 days ago!
      method: 'visit',
      reason: 'زيارة صيفية منزلية',
      result: 'استقبال رائع من الأسرة ومتابعة حفظ المزامير',
      notes: 'الأسرة تطلب التنسيق لمواعيد دروس اللغات',
      followUpDate: '2024-09-05',
      isResolved: true,
      createdAt: '2024-07-20'
    },
    {
      id: 'vis-4',
      churchId: 'church-1',
      personId: 'p-mem-andrew',
      servantId: 'p-servant-mina',
      servantName: 'مينا وجدي مسعود',
      serviceId: 'srv-prep',
      date: '2024-08-30',
      method: 'in_person',
      reason: 'انخفاض نسبة الحضور',
      result: 'تم التفاهم مع أندرو ووالده على تنظيم وقت تمرين السباحة',
      notes: 'سيحضر الاجتماع مع تقديم اعتذار عن النصف ساعة الأولى',
      followUpDate: '2024-09-14',
      isResolved: true,
      createdAt: '2024-08-30'
    }
  ];

  // Preparations & Activities
  const preparations: Preparation[] = [
    {
      id: 'prep-1',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      title: 'درس محبة القريب وسامرية الإيمان',
      type: 'lesson',
      content: `أهداف الدرس:
1. أن يتعرف المخدوم على معنى فضيلة المحبة العملية غير المشروطة.
2. استخراج المبادئ السامية من مثل السامري الصالح (لوقا 10: 25-37).
3. تطبيق عملي: عمل الخير مع من يختلف معنا، ومساعدة الزميل في الفصل والمدرسة.

الوسائل الإيضاحية:
- فيديو تمثيلي قصير مدته 3 دقائق عن مساعدة المحتاج.
- ورشة عمل تقسيم المجموعات لتصميم بوستر التضامن والمحبة.`,
      mediaUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600&auto=format&fit=crop&q=80',
      fileUrl: '/uploads/prep-good-samaritan.pdf',
      authorId: 'p-leader-mark',
      authorName: 'د. مارك سمير',
      targetAudience: {
        targetType: 'all_servants'
      },
      readByServantIds: ['p-servant-mina', 'p-servant-maryam'],
      createdAt: '2024-09-01'
    },
    {
      id: 'prep-2',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      meetingId: 'meet-prep-sat',
      title: 'قصة القديس أثناسيوس حامي الإيمان',
      type: 'story',
      content: `قصة مشوقة عن شجاعة البابا أثناسيوس الرسولي في الدفاع عن ألوهية السيد المسيح في مجمع نيقية المسكوني عام 325م.
يتم التركيز على الصمود والثبات في المبادئ رغم النفي والاضطهاد.`,
      mediaUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&auto=format&fit=crop&q=80',
      authorId: 'p-leader-mark',
      authorName: 'د. مارك سمير',
      targetAudience: {
        targetType: 'meeting_servants'
      },
      readByServantIds: ['p-servant-mina'],
      createdAt: '2024-08-25'
    }
  ];

  // Service Library
  const library: LibraryItem[] = [
    {
      id: 'lib-1',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      title: 'سلسلة دروس العقيدة المبسطة للناشئين',
      category: 'lessons',
      description: 'منهج شامل من 12 درساً يشرح قانون الإيمان والأسرار الكنسية السبعة بطريقة شيقة ومبسطة للمرحلة الإعدادية.',
      fileUrl: 'https://example.com/files/creed-teens.pdf',
      author: 'د. مارك سمير',
      tags: ['عقيدة', 'إعدادي', 'دروس', 'إيمان'],
      createdAt: '2024-02-01'
    },
    {
      id: 'lib-2',
      churchId: 'church-1',
      serviceId: 'srv-choir',
      title: 'نوتة وكلمات ترنيمة «يا صاحب الحنان» وتوزيع الهارموني',
      category: 'hymns',
      description: 'ملف PDF يحتوي على الكلمات بالتشكيل، النوتة الموسيقية لطبقات الصوبرانو، التينور، والباص مع تسجيل صوتي تجريبي.',
      fileUrl: 'https://example.com/files/hymn-hanan.pdf',
      author: 'مينا وجدي',
      tags: ['ترانيم', 'كورال', 'موسيقى', 'هارموني'],
      createdAt: '2024-03-10'
    },
    {
      id: 'lib-3',
      churchId: 'church-1',
      title: 'دليل الألعاب التفاعلية وكسر الجليد للمؤتمرات والرحلات',
      category: 'activities',
      description: 'أكثر من 50 لعبة جماعية حركية وفكرية مناسبة للرحلات الصيفية والمؤتمرات الكنسية مع شرح الأدوات والأهداف.',
      fileUrl: 'https://example.com/files/games-guide.pdf',
      author: 'مريم عادل',
      tags: ['أنشطة', 'ألعاب', 'رحلات', 'مؤتمرات'],
      createdAt: '2024-04-05'
    },
    {
      id: 'lib-4',
      churchId: 'church-1',
      title: 'قصص سير القديسين المصورة للأطفال والشباب',
      category: 'stories',
      description: 'مجموعة من 20 قصة قصيرة مروية بأسلوب سردي مشوق تعزز فضائل الصلاة، الأمانة، التواضع ومحبة الآخرين.',
      fileUrl: 'https://example.com/files/saints-stories.pdf',
      author: 'القمص بيشوي كامل',
      tags: ['قصص', 'قديسين', 'فضائل', 'تاريخ كنسي'],
      createdAt: '2024-05-12'
    }
  ];

  // Tasks
  const tasks: TaskItem[] = [
    {
      id: 'tsk-1',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      title: 'افتقاد عاجل للمخدوم فادي نبيل بالمنزل',
      description: 'زيارة منزلية للمخدوم فادي نبيل بصحبة أمين الخدمة لمعرفة سبب الغياب لثلاثة أسابيع.',
      assigneeId: 'p-servant-mina',
      assigneeName: 'مينا وجدي مسعود',
      creatorId: 'p-leader-mark',
      dueDate: '2024-09-08',
      priority: 'urgent',
      status: 'in_progress',
      createdAt: '2024-09-01'
    },
    {
      id: 'tsk-2',
      churchId: 'church-1',
      serviceId: 'srv-prep',
      title: 'تحضير وسائل إيضاح درس السامري الصالح',
      description: 'طباعة البوسترات وتجهيز شاشة العرض لورشة عمل مجموعات السبت القادم.',
      assigneeId: 'p-servant-maryam',
      assigneeName: 'مريم عادل نصيف',
      creatorId: 'p-leader-mark',
      dueDate: '2024-09-06',
      priority: 'medium',
      status: 'completed',
      createdAt: '2024-08-30'
    },
    {
      id: 'tsk-3',
      churchId: 'church-1',
      serviceId: 'srv-choir',
      title: 'تسجيل ترانيم احتفالية عيد الصليب',
      description: 'تسجيل المقاطع الصوتية الفردية للصولو والمجموعة للتجهيز للعرض الكنسي.',
      assigneeId: 'p-servant-mina',
      assigneeName: 'مينا وجدي مسعود',
      creatorId: 'p-priest-bishoy',
      dueDate: '2024-09-15',
      priority: 'normal',
      status: 'not_started',
      createdAt: '2024-09-02'
    }
  ];

  // Announcements
  const announcements: Announcement[] = [
    {
      id: 'ann-1',
      churchId: 'church-1',
      title: 'اجتماع عام لخدام الكنيسة مع أبونا بيشوي',
      content: 'يعقد اجتماع الخدام العام يوم الجمعة المقبل عقب القداس الإلهي مباشرة الساعة 10:30 صباحاً لمناقشة خطة العام الدراسي والخدمات الجديدة.',
      authorName: 'القمص بيشوي كامل',
      authorRole: 'كاهن الكنيسة',
      target: 'all',
      priority: 'urgent',
      date: '2024-09-04'
    },
    {
      id: 'ann-2',
      churchId: 'church-1',
      title: 'موعد المؤتمر السنوي لإعدادي (كن أميناً)',
      content: 'نحيطكم علماً بأن مؤتمر إعدادي السنوي سيقام في بيت ماريوحنا ببطرس في الفترة من 26 إلى 28 سبتمبر، والتسجيل يبدأ السبت القادم مع أمناء المجموعات.',
      authorName: 'د. مارك سمير',
      authorRole: 'أمين خدمة إعدادي',
      target: 'service',
      targetServiceId: 'srv-prep',
      priority: 'important',
      date: '2024-09-03'
    }
  ];

  // Parents
  const parents: Parent[] = [
    {
      id: 'par-mamdouh',
      churchId: 'church-1',
      name: 'ممدوح غالي رزق',
      phone: '01223456789',
      relation: 'أب',
      job: 'مهندس استشاري مدني',
      notes: 'متعاون جداً ويفضل التواصل عبر واتساب بعد الساعة 5 مساءً',
      childrenIds: ['p-mem-mina']
    },
    {
      id: 'par-nabil',
      churchId: 'church-1',
      name: 'نبيل عزيز ميخائيل',
      phone: '01001122334',
      relation: 'أب',
      job: 'مدير مالي',
      notes: 'مطلوب التواصل الهاتفي بخصوص الغياب',
      childrenIds: ['p-mem-fady']
    },
    {
      id: 'par-sami',
      churchId: 'church-1',
      name: 'سامي يعقوب بولس',
      phone: '01225566778',
      relation: 'أب',
      job: 'صيدلي حر',
      notes: 'ولي أمر مارينا',
      childrenIds: ['p-mem-marina']
    }
  ];

  // Audit Log
  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      churchId: 'church-1',
      action: 'تسجيل حضور أسبوعي',
      userName: 'مينا وجدي مسعود (خادم)',
      details: 'تم تسجيل حضور مجموعة 1 لاجتماع السبت بإجمالي 5 مخدومين حاضرين و1 غائب.',
      timestamp: '2024-08-31T18:45:00.000Z'
    },
    {
      id: 'log-2',
      churchId: 'church-1',
      action: 'إرسال تحضير جديد',
      userName: 'د. مارك سمير (أمين خدمة)',
      details: 'تم نشر وإرسال تحضير «درس محبة القريب وسامرية الإيمان» لجميع خدام إعدادي.',
      timestamp: '2024-09-01T14:20:00.000Z'
    },
    {
      id: 'log-3',
      churchId: 'church-1',
      action: 'توثيق افتقاد',
      userName: 'مينا وجدي مسعود (خادم)',
      details: 'تم توثيق مكالمة افتقاد دورية للمخدوم مينا ممدوح غالي مع تحديد موعد متابعة.',
      timestamp: '2024-09-02T19:10:00.000Z'
    },
    {
      id: 'log-4',
      churchId: 'church-1',
      action: 'نشر إعلان كنسي',
      userName: 'القمص بيشوي كامل (كاهن)',
      details: 'تم نشر إعلان اجتماع الخدام العام لجميع قطاعات الكنيسة.',
      timestamp: '2024-09-04T11:00:00.000Z'
    }
  ];

  // Notifications
  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      churchId: 'church-1',
      title: 'عيد ميلاد اليوم 🎂',
      message: 'اليوم عيد ميلاد المخدوم: مينا ممدوح غالي (خدمة إعدادي). بادر بإرسال تهنئة!',
      type: 'birthday',
      date: 'اليوم',
      isRead: false,
      linkTab: 'birthdays'
    },
    {
      id: 'notif-2',
      churchId: 'church-1',
      title: 'تنبيه افتقاد ذكي 🔴',
      message: 'المخدوم فادي نبيل عزيز غائب لـ 3 اجتماعات متتالية ويحتاج افتقاداً فورياً.',
      type: 'visitation',
      date: 'منذ يومين',
      isRead: false,
      linkTab: 'visitation'
    },
    {
      id: 'notif-3',
      churchId: 'church-1',
      title: 'تحضير درس جديد 📚',
      message: 'أرسل د. مارك سمير تحضير درس «محبة القريب» لاجتماع السبت القادم.',
      type: 'preparation',
      date: 'منذ 3 أيام',
      isRead: true,
      linkTab: 'preparation'
    },
    {
      id: 'notif-4',
      churchId: 'church-1',
      title: 'مهمة جديدة مسندة إليك 🎯',
      message: 'كلفك د. مارك بمهمة افتقاد فادي نبيل عزيز ومتابعة أسباب الغياب.',
      type: 'task',
      date: 'منذ 4 أيام',
      isRead: true,
      linkTab: 'tasks'
    }
  ];

  const accounts: UserAccount[] = [
    {
      id: 'acc-admin-church-1',
      churchId: 'church-1',
      name: 'القمص / متى إبراهيم',
      phone: '01000000001',
      password: '123456',
      role: 'priest',
      roleTitle: 'كاهن الكنيسة والمشرف العام',
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
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'acc-priest-bishoy',
      churchId: 'church-1',
      name: 'أبونا بيشوي كامل',
      phone: '01222222221',
      password: '123456',
      role: 'priest',
      roleTitle: 'كاهن ومسؤول الشباب والافتقاد',
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
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: 'acc-leader-mark',
      churchId: 'church-1',
      name: 'أ. مارك نبيل فرج',
      phone: '01111111112',
      password: '123456',
      role: 'leader',
      roleTitle: 'أمين خدمة المرحلة الإعدادية',
      serviceIds: ['srv-prep'],
      permissions: {
        canManagePersons: true,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: true,
        canViewReports: true,
        canManageUsers: false,
        canAccessSettings: false
      },
      createdAt: '2024-01-10T00:00:00.000Z'
    },
    {
      id: 'acc-servant-sara',
      churchId: 'church-1',
      name: 'تريزا عادل فهمي',
      phone: '01033333333',
      password: '123456',
      role: 'servant',
      roleTitle: 'خادمة ومتابعة أسر إعدادي',
      serviceIds: ['srv-prep'],
      permissions: {
        canManagePersons: false,
        canTakeAttendance: true,
        canLogVisitations: true,
        canCreatePreparations: true,
        canManageTasks: true,
        canPostAnnouncements: false,
        canViewReports: false,
        canManageUsers: false,
        canAccessSettings: false
      },
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'acc-admin-church-2',
      churchId: 'church-2',
      name: 'أبونا مرقس حبيب',
      phone: '01000000002',
      password: '123456',
      role: 'priest',
      roleTitle: 'كاهن ومشرف كنيسة مارمرقس',
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
      createdAt: '2024-02-15T00:00:00.000Z'
    }
  ];

  return {
    churches,
    persons,
    services,
    meetings,
    groups,
    memberships,
    attendance,
    visitations,
    preparations,
    library,
    tasks,
    announcements,
    parents,
    auditLogs,
    notifications,
    accounts
  };
}

export class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        parsed.accounts = parsed.accounts || [];
        return parsed;
      }
    } catch (err) {
      console.error('Failed to load database from file, initializing seed:', err);
    }
    const initial = getInitialSeed();
    this.save(initial);
    return initial;
  }

  public save(dataToSave?: DatabaseSchema) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to file:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToSeed(): DatabaseSchema {
    const seed = getInitialSeed();
    this.save(seed);
    return seed;
  }

  // --- Scoped church methods ---
  public getChurches(): Church[] {
    return this.data.churches;
  }

  public addChurch(church: Church) {
    this.data.churches.push(church);
    this.save();
    return church;
  }

  public updateChurch(id: string, update: Partial<Church>) {
    const idx = this.data.churches.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.churches[idx] = { ...this.data.churches[idx], ...update };
      this.save();
      return this.data.churches[idx];
    }
    return null;
  }

  // Generic methods with tenant isolation
  public getChurchData(churchId: string) {
    return {
      church: this.data.churches.find(c => c.id === churchId) || null,
      persons: this.data.persons.filter(p => p.churchId === churchId),
      services: this.data.services.filter(s => s.churchId === churchId),
      meetings: this.data.meetings.filter(m => m.churchId === churchId),
      groups: this.data.groups.filter(g => g.churchId === churchId),
      memberships: this.data.memberships.filter(m => m.churchId === churchId),
      attendance: this.data.attendance.filter(a => a.churchId === churchId),
      visitations: this.data.visitations.filter(v => v.churchId === churchId),
      preparations: this.data.preparations.filter(pr => pr.churchId === churchId),
      library: this.data.library.filter(l => l.churchId === churchId),
      tasks: this.data.tasks.filter(t => t.churchId === churchId),
      announcements: this.data.announcements.filter(an => an.churchId === churchId),
      parents: this.data.parents.filter(pa => pa.churchId === churchId),
      auditLogs: this.data.auditLogs.filter(al => al.churchId === churchId),
      notifications: this.data.notifications.filter(n => n.churchId === churchId),
      accounts: (this.data.accounts || []).filter(a => a.churchId === churchId)
    };
  }

  // Add person
  public addPerson(person: Person) {
    this.data.persons.unshift(person);
    this.save();
    return person;
  }

  public updatePerson(id: string, update: Partial<Person>) {
    const idx = this.data.persons.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.persons[idx] = { ...this.data.persons[idx], ...update };
      this.save();
      return this.data.persons[idx];
    }
    return null;
  }

  // Delete / Archive person
  public deletePerson(id: string) {
    this.data.persons = this.data.persons.filter(p => p.id !== id);
    this.data.memberships = this.data.memberships.filter(m => m.personId !== id);
    this.save();
    return true;
  }

  // Memberships
  public addMembership(membership: ServiceMembership) {
    this.data.memberships.push(membership);
    this.save();
    return membership;
  }

  public updateMembership(id: string, update: Partial<ServiceMembership>) {
    const idx = this.data.memberships.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.memberships[idx] = { ...this.data.memberships[idx], ...update };
      this.save();
      return this.data.memberships[idx];
    }
    return null;
  }

  public deleteMembership(id: string) {
    this.data.memberships = this.data.memberships.filter(m => m.id !== id);
    this.save();
    return true;
  }

  // Services
  public addService(service: Service) {
    this.data.services.push(service);
    this.save();
    return service;
  }

  public updateService(id: string, update: Partial<Service>) {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.services[idx] = { ...this.data.services[idx], ...update };
      this.save();
      return this.data.services[idx];
    }
    return null;
  }

  // Meetings
  public addMeeting(meeting: Meeting) {
    this.data.meetings.push(meeting);
    this.save();
    return meeting;
  }

  // Groups
  public addGroup(group: Group) {
    this.data.groups.push(group);
    this.save();
    return group;
  }

  // Attendance (single or batch)
  public saveAttendanceBatch(records: AttendanceRecord[]) {
    for (const rec of records) {
      const existingIdx = this.data.attendance.findIndex(
        a => a.personId === rec.personId &&
             a.serviceId === rec.serviceId &&
             a.meetingId === rec.meetingId &&
             a.date === rec.date &&
             a.type === rec.type
      );
      if (existingIdx !== -1) {
        this.data.attendance[existingIdx] = rec;
      } else {
        this.data.attendance.push(rec);
      }
    }
    this.save();
    return records;
  }

  // Visitations
  public addVisitation(vis: VisitationRecord) {
    this.data.visitations.unshift(vis);
    this.save();
    return vis;
  }

  public updateVisitation(id: string, update: Partial<VisitationRecord>) {
    const idx = this.data.visitations.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.visitations[idx] = { ...this.data.visitations[idx], ...update };
      this.save();
      return this.data.visitations[idx];
    }
    return null;
  }

  // Preparations
  public addPreparation(prep: Preparation) {
    this.data.preparations.unshift(prep);
    this.save();
    return prep;
  }

  public markPreparationRead(prepId: string, servantId: string) {
    const prep = this.data.preparations.find(p => p.id === prepId);
    if (prep) {
      if (!prep.readByServantIds.includes(servantId)) {
        prep.readByServantIds.push(servantId);
        this.save();
      }
      return prep;
    }
    return null;
  }

  // Tasks
  public addTask(task: TaskItem) {
    this.data.tasks.unshift(task);
    this.save();
    return task;
  }

  public updateTask(id: string, update: Partial<TaskItem>) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...update };
      this.save();
      return this.data.tasks[idx];
    }
    return null;
  }

  // Library
  public addLibraryItem(item: LibraryItem) {
    this.data.library.unshift(item);
    this.save();
    return item;
  }

  // Announcements
  public addAnnouncement(ann: Announcement) {
    this.data.announcements.unshift(ann);
    this.save();
    return ann;
  }

  // Parents
  public addParent(parent: Parent) {
    this.data.parents.push(parent);
    this.save();
    return parent;
  }

  // Audit log
  public logAction(log: AuditLog) {
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  // User Accounts & RBAC
  public getAccounts(churchId?: string): UserAccount[] {
    const list = this.data.accounts || [];
    return churchId ? list.filter(a => a.churchId === churchId) : list;
  }

  public addAccount(account: UserAccount) {
    if (!this.data.accounts) this.data.accounts = [];
    this.data.accounts.push(account);
    this.save();
    return account;
  }

  public updateAccount(id: string, update: Partial<UserAccount>) {
    if (!this.data.accounts) this.data.accounts = [];
    const idx = this.data.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.accounts[idx] = { ...this.data.accounts[idx], ...update };
      this.save();
      return this.data.accounts[idx];
    }
    return null;
  }

  public deleteAccount(id: string) {
    if (!this.data.accounts) this.data.accounts = [];
    this.data.accounts = this.data.accounts.filter(a => a.id !== id);
    this.save();
    return true;
  }

  // Reset all records for a specific church to start completely clean from 0
  public resetChurchData(churchId: string) {
    this.data.persons = this.data.persons.filter(p => p.churchId !== churchId);
    this.data.services = this.data.services.filter(s => s.churchId !== churchId);
    this.data.meetings = this.data.meetings.filter(m => m.churchId !== churchId);
    this.data.groups = this.data.groups.filter(g => g.churchId !== churchId);
    this.data.memberships = this.data.memberships.filter(m => m.churchId !== churchId);
    this.data.attendance = this.data.attendance.filter(a => a.churchId !== churchId);
    this.data.visitations = this.data.visitations.filter(v => v.churchId !== churchId);
    this.data.preparations = this.data.preparations.filter(pr => pr.churchId !== churchId);
    this.data.library = this.data.library.filter(l => l.churchId !== churchId);
    this.data.tasks = this.data.tasks.filter(t => t.churchId !== churchId);
    this.data.announcements = this.data.announcements.filter(an => an.churchId !== churchId);
    this.data.parents = this.data.parents.filter(pa => pa.churchId !== churchId);
    this.data.notifications = this.data.notifications.filter(n => n.churchId !== churchId);
    this.save();
    return this.getChurchData(churchId);
  }

  // Complete database wipe to start from scratch
  public wipeDatabase(): DatabaseSchema {
    const blank: DatabaseSchema = {
      churches: [],
      persons: [],
      services: [],
      meetings: [],
      groups: [],
      memberships: [],
      attendance: [],
      visitations: [],
      preparations: [],
      library: [],
      tasks: [],
      announcements: [],
      parents: [],
      auditLogs: [],
      notifications: [],
      accounts: []
    };
    this.save(blank);
    return blank;
  }
}

export const db = new JsonDatabase();

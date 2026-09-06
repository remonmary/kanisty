import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  UserRole,
  UserAccount,
  UserPermissions
} from '../types';
import { api, ScopedChurchData } from '../services/api';

const defaultFullPermissions: UserPermissions = {
  canManagePersons: true,
  canTakeAttendance: true,
  canLogVisitations: true,
  canCreatePreparations: true,
  canManageTasks: true,
  canPostAnnouncements: true,
  canViewReports: true,
  canManageUsers: true,
  canAccessSettings: true
};

interface ChurchContextType {
  churches: Church[];
  activeChurch: Church | null;
  activeChurchId: string;
  setActiveChurchId: (id: string) => void;
  currentUser: Person | null;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  currentAccount: UserAccount | null;
  setCurrentAccount: (acc: UserAccount | null) => void;
  isLoggedIn: boolean;
  login: (phone: string, pass: string) => Promise<boolean>;
  logout: () => void;
  registerChurchAccount: (payload: {
    name: string;
    region?: string;
    address?: string;
    phone: string;
    password: string;
    adminName?: string;
    email?: string;
  }) => Promise<Church>;
  accounts: UserAccount[];
  addAccount: (acc: Partial<UserAccount>) => Promise<UserAccount>;
  updateAccount: (id: string, update: Partial<UserAccount>) => Promise<UserAccount>;
  deleteAccount: (id: string) => Promise<void>;
  resetCurrentChurch: () => Promise<void>;
  wipeCompleteDatabase: () => Promise<void>;
  permissions: UserPermissions;
  canAccessTab: (tabId: string) => boolean;
  getUserRoleInService: (serviceId: string) => UserRole | 'none';
  effectiveOverallRole: UserRole;
  data: ScopedChurchData;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab?: string;
  setActiveSubTab: (sub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedPersonForProfile: Person | null;
  setSelectedPersonForProfile: (p: Person | null) => void;
  isLogVisitOpen: boolean;
  setIsLogVisitOpen: (open: boolean) => void;
  visitationTargetPerson: Person | null;
  openLogVisitModal: (person?: Person) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshData: () => Promise<void>;
  addNewChurch: (church: Partial<Church>) => Promise<Church>;
  updateChurchProfile: (update: Partial<Church>) => Promise<Church>;
}

const emptyData: ScopedChurchData = {
  church: null,
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

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [activeChurchId, setActiveChurchIdState] = useState<string>(() => {
    return localStorage.getItem('kenisati_active_church_id') || 'church-1';
  });
  const [currentUserId, setCurrentUserIdState] = useState<string>(() => {
    return localStorage.getItem('kenisati_current_user_id') || 'p-priest-bishoy';
  });

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('kenisati_logged_in');
    return saved !== null ? saved === 'true' : true; // Default logged in for smooth first preview
  });

  const [currentAccount, setCurrentAccountState] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('kenisati_current_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Fallback default admin account for church-1
    return {
      id: 'acc-admin-church-1',
      churchId: 'church-1',
      name: 'القمص / متى إبراهيم',
      phone: '01000000001',
      role: 'priest',
      roleTitle: 'المشرف العام ومسؤول الكنيسة',
      permissions: defaultFullPermissions,
      createdAt: '2024-01-01'
    };
  });

  const [data, setData] = useState<ScopedChurchData>(emptyData);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPersonForProfile, setSelectedPersonForProfile] = useState<Person | null>(null);
  const [isLogVisitOpen, setIsLogVisitOpen] = useState(false);
  const [visitationTargetPerson, setVisitationTargetPerson] = useState<Person | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  }, []);

  const setActiveChurchId = (id: string) => {
    // Strict isolation: if logged in, active church must match account's church
    if (currentAccount && currentAccount.churchId !== id) {
      console.warn('Strict tenant isolation: Cannot switch to another church without logging in with that church account.');
      return;
    }
    setActiveChurchIdState(id);
    localStorage.setItem('kenisati_active_church_id', id);
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    localStorage.setItem('kenisati_current_user_id', id);
  };

  const setCurrentAccount = (acc: UserAccount | null) => {
    setCurrentAccountState(acc);
    if (acc) {
      localStorage.setItem('kenisati_current_account', JSON.stringify(acc));
      if (acc.churchId) {
        setActiveChurchIdState(acc.churchId);
        localStorage.setItem('kenisati_active_church_id', acc.churchId);
      }
    } else {
      localStorage.removeItem('kenisati_current_account');
    }
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      // Determine the target church strictly from authenticated account or active state
      const targetChurchId = currentAccount?.churchId || activeChurchId;

      if (targetChurchId) {
        // Only load the current church to avoid exposing other churches
        const churchList = await api.getChurches(targetChurchId);
        setChurches(churchList);

        const churchData = await api.getChurchData(targetChurchId);
        setData(churchData);

        // Load accounts for this church strictly
        const churchAccounts = await api.getAccounts(targetChurchId);
        setAccounts(churchAccounts);

        // Keep current account in sync
        if (currentAccount && currentAccount.churchId === targetChurchId) {
          const freshAccount = churchAccounts.find(a => a.id === currentAccount.id);
          if (freshAccount) {
            setCurrentAccountState(freshAccount);
            localStorage.setItem('kenisati_current_account', JSON.stringify(freshAccount));
          }
        } else if (churchAccounts.length > 0) {
          setCurrentAccountState(churchAccounts[0]);
          localStorage.setItem('kenisati_current_account', JSON.stringify(churchAccounts[0]));
        }

        // Verify current simulated user exists in church
        if (!churchData.persons.some(p => p.id === currentUserId) && churchData.persons.length > 0) {
          const priest = churchData.persons.find(p => p.code?.startsWith('PR') || p.name.includes('القمص') || p.name.includes('أبونا'));
          const defaultUser = priest ? priest.id : churchData.persons[0].id;
          setCurrentUserIdState(defaultUser);
          localStorage.setItem('kenisati_current_user_id', defaultUser);
        } else if (churchData.persons.length === 0) {
          setCurrentUserIdState('');
          localStorage.removeItem('kenisati_current_user_id');
        }
      }
    } catch (err) {
      console.error('Failed to load church data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChurchId, currentAccount?.id, currentAccount?.churchId, currentUserId]);

  useEffect(() => {
    loadAll();
  }, [activeChurchId, currentAccount?.churchId]);

  const activeChurch = churches.find(c => c.id === activeChurchId) || data.church || null;
  const currentUser = data.persons.find(p => p.id === currentUserId) || null;

  // Permissions computed from current logged in account
  const permissions: UserPermissions = React.useMemo(() => {
    if (!currentAccount) return defaultFullPermissions;
    if (currentAccount.role === 'priest') return defaultFullPermissions;
    return currentAccount.permissions || defaultFullPermissions;
  }, [currentAccount]);

  // Overall effective role for header badge:
  const effectiveOverallRole: UserRole = React.useMemo(() => {
    if (currentAccount) {
      return currentAccount.role;
    }
    if (!currentUser) return 'member';
    if (currentUser.code?.startsWith('PR') || currentUser.name.includes('القمص') || currentUser.name.includes('أبونا')) {
      return 'priest';
    }
    const myMemberships = data.memberships.filter(m => m.personId === currentUser.id && m.isActive);
    if (myMemberships.some(m => m.role === 'leader')) return 'leader';
    if (myMemberships.some(m => m.role === 'servant')) return 'servant';
    return 'member';
  }, [currentUser, data.memberships, currentAccount]);

  // Tab Access Checker based on role & permissions
  const canAccessTab = useCallback((tabId: string): boolean => {
    if (effectiveOverallRole === 'priest') return true;
    switch (tabId) {
      case 'dashboard':
        return true;
      case 'persons':
        return permissions.canManagePersons || effectiveOverallRole === 'leader';
      case 'attendance':
        return permissions.canTakeAttendance;
      case 'visitation':
        return permissions.canLogVisitations;
      case 'preparation':
        return permissions.canCreatePreparations || effectiveOverallRole === 'servant';
      case 'services':
        return effectiveOverallRole === 'leader';
      case 'library':
        return true;
      case 'tasks':
        return permissions.canManageTasks || effectiveOverallRole === 'servant';
      case 'birthdays':
        return true;
      case 'calendar':
        return true;
      case 'announcements':
        return true;
      case 'reports':
        return permissions.canViewReports || effectiveOverallRole === 'leader';
      case 'archive':
        return permissions.canManagePersons;
      case 'accounts':
        return permissions.canManageUsers;
      case 'settings':
        return permissions.canAccessSettings;
      default:
        return true;
    }
  }, [permissions, effectiveOverallRole]);

  // Role in specific service
  const getUserRoleInService = useCallback((serviceId: string): UserRole | 'none' => {
    if (currentAccount) {
      if (currentAccount.role === 'priest') return 'priest';
      if (currentAccount.serviceIds && currentAccount.serviceIds.includes(serviceId)) {
        return currentAccount.role;
      }
    }
    if (!currentUser) return 'none';
    if (currentUser.id === 'p-priest-bishoy' || currentUser.name.includes('القمص') || currentUser.name.includes('أبونا')) {
      return 'priest';
    }
    const mem = data.memberships.find(
      m => m.personId === currentUser.id && m.serviceId === serviceId && m.isActive
    );
    return mem ? mem.role : 'none';
  }, [currentUser, data.memberships, currentAccount]);

  // Auth: Login
  const login = async (phone: string, pass: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.login(phone, pass);
      if (res.success && res.church && res.account) {
        setActiveChurchIdState(res.church.id);
        localStorage.setItem('kenisati_active_church_id', res.church.id);
        setCurrentAccount(res.account);
        setChurches([res.church]);
        setIsLoggedIn(true);
        localStorage.setItem('kenisati_logged_in', 'true');
        showToast(`أهلاً بك يا ${res.account.name} في ${res.church.name}`);
        
        // Strictly fetch this church's clean data
        const churchData = await api.getChurchData(res.church.id);
        setData(churchData);
        const churchAccounts = await api.getAccounts(res.church.id);
        setAccounts(churchAccounts);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الدخول');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Logout
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentAccount(null);
    setData(emptyData);
    setAccounts([]);
    setChurches([]);
    setActiveChurchIdState('');
    setCurrentUserIdState('');
    localStorage.setItem('kenisati_logged_in', 'false');
    localStorage.removeItem('kenisati_current_account');
    localStorage.removeItem('kenisati_active_church_id');
    localStorage.removeItem('kenisati_current_user_id');
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Auth: Register Church
  const registerChurchAccount = async (payload: {
    name: string;
    region?: string;
    address?: string;
    phone: string;
    password: string;
    adminName?: string;
    email?: string;
  }): Promise<Church> => {
    setIsLoading(true);
    try {
      const res = await api.registerChurch(payload);
      if (res.success && res.church && res.account) {
        setActiveChurchIdState(res.church.id);
        localStorage.setItem('kenisati_active_church_id', res.church.id);
        setCurrentAccount(res.account);
        setChurches([res.church]);
        setIsLoggedIn(true);
        localStorage.setItem('kenisati_logged_in', 'true');
        showToast(`تم تسجيل كنيسة: ${res.church.name} بنجاح!`);
        
        // Newly registered church will have 0 persons, 0 attendance, 0 services
        const churchData = await api.getChurchData(res.church.id);
        setData(churchData);
        const churchAccounts = await api.getAccounts(res.church.id);
        setAccounts(churchAccounts);
        return res.church;
      }
      throw new Error('تعذر إنشاء الكنيسة');
    } finally {
      setIsLoading(false);
    }
  };

  // Accounts Management
  const addAccount = async (acc: Partial<UserAccount>): Promise<UserAccount> => {
    const created = await api.addAccount({
      churchId: activeChurchId,
      ...acc
    });
    const updatedList = await api.getAccounts(activeChurchId);
    setAccounts(updatedList);
    showToast(`تم إنشاء حساب الخادم: ${created.name} بنجاح`);
    return created;
  };

  const updateAccount = async (id: string, update: Partial<UserAccount>): Promise<UserAccount> => {
    const updated = await api.updateAccount(id, update);
    const updatedList = await api.getAccounts(activeChurchId);
    setAccounts(updatedList);
    if (currentAccount && currentAccount.id === id) {
      setCurrentAccount(updated);
    }
    showToast('تم تحديث صلاحيات الحساب بنجاح');
    return updated;
  };

  const deleteAccount = async (id: string): Promise<void> => {
    await api.deleteAccount(id);
    const updatedList = await api.getAccounts(activeChurchId);
    setAccounts(updatedList);
    showToast('تم حذف الحساب بنجاح');
  };

  // Reset current church data to start from 0
  const resetCurrentChurch = async (): Promise<void> => {
    if (!activeChurch) return;
    setIsLoading(true);
    try {
      const res = await api.resetChurchData(activeChurch.id, currentAccount?.name || 'مسؤول الكنيسة');
      setData(res);
      showToast(`تم تصفير بيانات كنيسة (${activeChurch.name}) بنجاح. يمكنك الآن البدء من الصفر.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Wipe complete database
  const wipeCompleteDatabase = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.wipeDatabase();
      await loadAll();
      showToast('تم مسح وتصفير قاعدة البيانات بالكامل');
    } finally {
      setIsLoading(false);
    }
  };

  const openLogVisitModal = (person?: Person) => {
    setVisitationTargetPerson(person || null);
    setIsLogVisitOpen(true);
  };

  const addNewChurch = async (churchData: Partial<Church>) => {
    const created = await api.addChurch(churchData);
    await loadAll();
    setActiveChurchId(created.id);
    showToast(`تم إنشاء كنيسة: ${created.name} بنجاح`);
    return created;
  };

  const updateChurchProfile = async (update: Partial<Church>) => {
    if (!activeChurch) throw new Error('No active church');
    const updated = await api.updateChurch(activeChurch.id, update);
    await loadAll();
    showToast('تم حفظ إعدادات الكنيسة بنجاح');
    return updated;
  };

  return (
    <ChurchContext.Provider
      value={{
        churches,
        activeChurch,
        activeChurchId,
        setActiveChurchId,
        currentUser,
        currentUserId,
        setCurrentUserId,
        currentAccount,
        setCurrentAccount,
        isLoggedIn,
        login,
        logout,
        registerChurchAccount,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        resetCurrentChurch,
        wipeCompleteDatabase,
        permissions,
        canAccessTab,
        getUserRoleInService,
        effectiveOverallRole,
        data,
        isLoading,
        activeTab,
        setActiveTab,
        activeSubTab,
        setActiveSubTab,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        selectedPersonForProfile,
        setSelectedPersonForProfile,
        isLogVisitOpen,
        setIsLogVisitOpen,
        visitationTargetPerson,
        openLogVisitModal,
        toastMessage,
        showToast,
        refreshData: loadAll,
        addNewChurch,
        updateChurchProfile
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within ChurchProvider');
  }
  return context;
};


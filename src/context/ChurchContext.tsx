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
  UserRole
} from '../types';
import { api, ScopedChurchData } from '../services/api';

interface ChurchContextType {
  churches: Church[];
  activeChurch: Church | null;
  activeChurchId: string;
  setActiveChurchId: (id: string) => void;
  currentUser: Person | null;
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
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
  notifications: []
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
  const [data, setData] = useState<ScopedChurchData>(emptyData);
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
    setActiveChurchIdState(id);
    localStorage.setItem('kenisati_active_church_id', id);
  };

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    localStorage.setItem('kenisati_current_user_id', id);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const churchList = await api.getChurches();
      setChurches(churchList);

      let targetChurchId = activeChurchId;
      if (!churchList.some(c => c.id === targetChurchId) && churchList.length > 0) {
        targetChurchId = churchList[0].id;
        setActiveChurchId(targetChurchId);
      }

      if (targetChurchId) {
        const churchData = await api.getChurchData(targetChurchId);
        setData(churchData);

        // Verify current simulated user exists in church
        if (!churchData.persons.some(p => p.id === currentUserId) && churchData.persons.length > 0) {
          // Default to priest or first person
          const priest = churchData.persons.find(p => p.code?.startsWith('PR') || p.name.includes('القمص') || p.name.includes('أبونا'));
          const defaultUser = priest ? priest.id : churchData.persons[0].id;
          setCurrentUserId(defaultUser);
        }
      }
    } catch (err) {
      console.error('Failed to load church data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChurchId, currentUserId]);

  useEffect(() => {
    loadAll();
  }, [activeChurchId]);

  const activeChurch = churches.find(c => c.id === activeChurchId) || data.church || null;
  const currentUser = data.persons.find(p => p.id === currentUserId) || null;

  // Rule 33: Role depends on person's relationship to service!
  const getUserRoleInService = useCallback((serviceId: string): UserRole | 'none' => {
    if (!currentUser) return 'none';
    if (currentUser.id === 'p-priest-bishoy' || currentUser.name.includes('القمص') || currentUser.name.includes('أبونا')) {
      return 'priest';
    }
    const mem = data.memberships.find(
      m => m.personId === currentUser.id && m.serviceId === serviceId && m.isActive
    );
    return mem ? mem.role : 'none';
  }, [currentUser, data.memberships]);

  // Overall effective role for header badge:
  const effectiveOverallRole: UserRole = React.useMemo(() => {
    if (!currentUser) return 'member';
    if (currentUser.code?.startsWith('PR') || currentUser.name.includes('القمص') || currentUser.name.includes('أبونا')) {
      return 'priest';
    }
    const myMemberships = data.memberships.filter(m => m.personId === currentUser.id && m.isActive);
    if (myMemberships.some(m => m.role === 'leader')) return 'leader';
    if (myMemberships.some(m => m.role === 'servant')) return 'servant';
    return 'member';
  }, [currentUser, data.memberships]);

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

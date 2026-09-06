import React, { useState } from 'react';
import { ChurchProvider, useChurch } from './context/ChurchContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PersonsView } from './components/PersonsView';
import { AttendanceView } from './components/AttendanceView';
import { VisitationView } from './components/VisitationView';
import { PreparationView } from './components/PreparationView';
import { ServicesView } from './components/ServicesView';
import { LibraryView } from './components/LibraryView';
import { TasksView } from './components/TasksView';
import { BirthdaysView } from './components/BirthdaysView';
import { CalendarView } from './components/CalendarView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { ReportsView } from './components/ReportsView';
import { ArchiveView } from './components/ArchiveView';
import { SettingsView } from './components/SettingsView';
import { AccountsManagementView } from './components/AccountsManagementView';
import { AuthView } from './components/AuthView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PersonProfileModal } from './components/PersonProfileModal';
import { LogVisitModal } from './components/LogVisitModal';
import { AddPersonModal } from './components/AddPersonModal';
import { AddChurchModal } from './components/AddChurchModal';
import { CheckCircle2, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage, isLoading, isLoggedIn, canAccessTab } = useChurch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isAddChurchOpen, setIsAddChurchOpen] = useState(false);

  // If not logged in, show church login and registration interface
  if (!isLoggedIn) {
    return (
      <>
        <AuthView />
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-fade-in text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="flex h-screen w-full bg-slate-50 text-right font-sans overflow-hidden"
      dir="rtl"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAddChurch={() => setIsAddChurchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddPerson={() => setIsAddPersonOpen(true)}
          onOpenAddChurch={() => setIsAddChurchOpen(true)}
        />

        {/* Dynamic Body View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-xs font-bold">جاري تحميل بيانات الكنيسة...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView onOpenAddPerson={() => setIsAddPersonOpen(true)} />
                )}
                {activeTab === 'persons' && canAccessTab('persons') && (
                  <PersonsView onOpenAddPerson={() => setIsAddPersonOpen(true)} />
                )}
                {activeTab === 'attendance' && canAccessTab('attendance') && <AttendanceView />}
                {activeTab === 'visitation' && canAccessTab('visitation') && <VisitationView />}
                {activeTab === 'preparation' && canAccessTab('preparation') && <PreparationView />}
                {activeTab === 'services' && canAccessTab('services') && <ServicesView />}
                {activeTab === 'library' && <LibraryView />}
                {activeTab === 'tasks' && canAccessTab('tasks') && <TasksView />}
                {activeTab === 'birthdays' && <BirthdaysView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'announcements' && <AnnouncementsView />}
                {activeTab === 'reports' && canAccessTab('reports') && <ReportsView />}
                {activeTab === 'archive' && canAccessTab('archive') && <ArchiveView />}
                {activeTab === 'accounts' && canAccessTab('accounts') && <AccountsManagementView />}
                {activeTab === 'settings' && canAccessTab('settings') && <SettingsView />}

                {/* Unauthorized tab fallback */}
                {!canAccessTab(activeTab) && (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                    <p className="text-amber-700 font-bold text-base">ليس لديك صلاحية للوصول إلى هذا القسم</p>
                    <p className="text-xs text-slate-500">يرجى مراجعة أبونا كاهن الكنيسة أو أمين الخدمة لمنحك الصلاحية اللازمة.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <PersonProfileModal />
      <LogVisitModal />
      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
      />
      <AddChurchModal
        isOpen={isAddChurchOpen}
        onClose={() => setIsAddChurchOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ChurchProvider>
      <AppContent />
    </ChurchProvider>
  );
}

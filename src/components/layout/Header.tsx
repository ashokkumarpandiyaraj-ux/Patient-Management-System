import React from 'react';
import { ActiveTab } from '../../types';
import { isSupabaseConfigured } from '../../services/supabase';
import { 
  Menu, UserPlus, CalendarPlus, Database, Sparkles, Plus, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenAddPatient: () => void;
  onOpenAddAppointment: () => void;
  onOpenCrudGuide: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenAddPatient,
  onOpenAddAppointment,
  onOpenCrudGuide,
  onNavigateTab,
}) => {
  const isConnected = isSupabaseConfigured();

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    patients: {
      title: 'Patient Directory',
      subtitle: 'Complete CRUD registry with search, blood group filters, and medical profiles',
    },
    appointments: {
      title: 'Appointments Management',
      subtitle: 'Schedule consultations, reschedule, mark completed, or cancel visits',
    },
    settings: {
      title: 'Database & Settings',
      subtitle: 'Supabase PostgreSQL configuration, SQL schemas, and sample data generator',
    },
  };

  const current = titles[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{current.title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Quick actions, Status, Evaluator Guide */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Database Status Button */}
        <button
          onClick={() => onNavigateTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to view Database and Supabase Settings"
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="hidden md:inline">
            {isConnected ? 'Supabase Connected' : 'Database'}
          </span>
        </button>

        {/* Evaluator Rubric Guide Button */}
        <button
          onClick={onOpenCrudGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">CRUD Guide</span>
        </button>

        {/* Quick New Patient */}
        <button
          onClick={onOpenAddPatient}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Patient</span>
        </button>

        {/* Quick New Appointment */}
        <button
          onClick={onOpenAddAppointment}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-slate-600" />
          <span>New Appt</span>
        </button>
      </div>
    </header>
  );
};

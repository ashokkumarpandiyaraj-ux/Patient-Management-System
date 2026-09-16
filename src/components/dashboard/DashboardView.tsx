import React from 'react';
import { Patient, Appointment } from '../../types';
import { 
  Users, Calendar, Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  UserPlus, CalendarPlus, Activity, ChevronRight, Phone, Mail, Stethoscope, Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  onNavigateTab: (tab: 'dashboard' | 'patients' | 'appointments' | 'settings') => void;
  onOpenAddPatient: () => void;
  onOpenAddAppointment: () => void;
  onSelectPatient: (patient: Patient) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenCrudGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  appointments,
  onNavigateTab,
  onOpenAddPatient,
  onOpenAddAppointment,
  onSelectPatient,
  onSelectAppointment,
  onOpenCrudGuide,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Statistics calculation
  const totalPatients = patients.length;
  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);
  const pendingAppointments = appointments.filter(a => a.status === 'Scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'Completed');

  // Recent patients (latest 5)
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
    .slice(0, 5);

  // Today's appointments (sorted by time)
  const sortedTodayAppointments = [...todayAppointments]
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  return (
    <div className="space-y-6">
      {/* College Activity Banner / Evaluator Welcome */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-600/60 text-teal-100 border border-teal-500/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            College CRUD Demonstration Project
          </div>
          <h1 className="text-2xl font-bold tracking-tight">CareTrack Healthcare Dashboard</h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
            Live patient &amp; clinical appointment management with Create, Read, Update, and Delete operations backed by Supabase relational persistence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCrudGuide}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          >
            <Activity className="w-4 h-4 text-teal-300" />
            <span>Grading Rubric</span>
          </button>
          <button
            id="quick-add-patient-btn"
            onClick={onOpenAddPatient}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-white hover:bg-teal-50 transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span>Add Patient</span>
          </button>
          <button
            id="quick-add-appointment-btn"
            onClick={onOpenAddAppointment}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-sm cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div 
          onClick={() => onNavigateTab('patients')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Patients
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalPatients}
            </span>
            <span className="text-xs font-semibold text-teal-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Verified patient clinical profiles</p>
        </div>

        {/* Today's Appointments */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s Appointments
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {todayAppointments.length}
            </span>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Schedule <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">For date: {todayStr}</p>
        </div>

        {/* Pending Appointments */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Appointments
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingAppointments.length}
            </span>
            <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Scheduled <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting clinical consultation</p>
        </div>

        {/* Completed Appointments */}
        <div 
          onClick={() => onNavigateTab('appointments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Appointments
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {completedAppointments.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Archived <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Successfully fulfilled visits</p>
        </div>
      </div>

      {/* Main Dual Grid: Today's Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments Table/List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Today&apos;s Appointments</h2>
                <p className="text-xs text-slate-500">Consultation schedule for today</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              View Calendar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            {sortedTodayAppointments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No appointments scheduled for today.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Use the quick button below to schedule one.</p>
                <button
                  onClick={onOpenAddAppointment}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                >
                  + Add Today&apos;s Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTodayAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patient_id) || apt.patient;
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-teal-50/40 hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-teal-600 mx-auto mb-0.5" />
                          <span className="text-xs font-bold text-slate-900 block font-mono">
                            {apt.appointment_time}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm group-hover:text-teal-700">
                              {patient ? patient.full_name : 'Patient'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {apt.appointment_id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                            {apt.reason_for_visit}
                          </p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Stethoscope className="w-3 h-3 text-slate-400" /> {apt.doctor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {apt.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Patients</h2>
                <p className="text-xs text-slate-500">Newly registered records</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('patients')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              All ({patients.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4">
            {recentPatients.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No patient records yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPatients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-teal-50/40 hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200/60">
                        {patient.full_name
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs group-hover:text-teal-700">
                            {patient.full_name}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1 py-0.5 rounded border border-slate-200">
                            {patient.patient_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {patient.medical_condition}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {patient.blood_group}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

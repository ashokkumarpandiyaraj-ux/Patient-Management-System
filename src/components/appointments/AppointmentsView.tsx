import React, { useState, useMemo } from 'react';
import { Appointment, Patient, AppointmentStatus, AppointmentFilterOptions } from '../../types';
import { AVAILABLE_DOCTORS } from '../../services/sampleData';
import { AppointmentFormModal } from './AppointmentFormModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Search, CalendarPlus, Filter, Clock, Calendar, Eye, Edit, Trash2, 
  CheckCircle2, XCircle, AlertTriangle, Stethoscope, User, RefreshCw, LayoutGrid, Table as TableIcon
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onCreateAppointment: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) => Promise<void>;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  nextSuggestedId: string;
  initialPatientForNewApt?: Patient | null;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  isLoading,
  onRefresh,
  onCreateAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  nextSuggestedId,
  initialPatientForNewApt,
}) => {
  // Filters
  const [filters, setFilters] = useState<AppointmentFilterOptions>({
    searchQuery: '',
    status: 'All',
    dateFilter: 'all',
    doctor: 'All',
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Today string for date filtering
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchDoc = apt.doctor.toLowerCase().includes(q);
          const matchReason = apt.reason_for_visit.toLowerCase().includes(q);
          const matchId = apt.appointment_id.toLowerCase().includes(q);
          const patient = patients.find(p => p.id === apt.patient_id);
          const matchPatient = patient ? patient.full_name.toLowerCase().includes(q) || patient.patient_id.toLowerCase().includes(q) : false;

          if (!matchDoc && !matchReason && !matchId && !matchPatient) {
            return false;
          }
        }

        // Status filter
        if (filters.status !== 'All' && apt.status !== filters.status) {
          return false;
        }

        // Doctor filter
        if (filters.doctor !== 'All' && apt.doctor !== filters.doctor) {
          return false;
        }

        // Date filter
        if (filters.dateFilter === 'today') {
          if (apt.appointment_date !== todayStr) return false;
        } else if (filters.dateFilter === 'upcoming') {
          if (apt.appointment_date < todayStr) return false;
        } else if (filters.dateFilter === 'past') {
          if (apt.appointment_date >= todayStr) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Default sort: today/upcoming first, descending by date and time
        return `${b.appointment_date} ${b.appointment_time}`.localeCompare(`${a.appointment_date} ${a.appointment_time}`);
      });
  }, [appointments, patients, filters, todayStr]);

  // Handlers
  const handleOpenCreate = () => {
    setAppointmentToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setAppointmentToEdit(apt);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (apt: Appointment) => {
    setDetailAppointment(apt);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (apt: Appointment) => {
    setAppointmentToDelete(apt);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteAppointment(appointmentToDelete.id);
      setAppointmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) => {
    if (appointmentToEdit) {
      await onUpdateAppointment(appointmentToEdit.id, data);
    } else {
      await onCreateAppointment(data);
    }
  };

  const handleQuickStatus = async (id: string, status: AppointmentStatus) => {
    await onUpdateAppointment(id, { status });
    if (detailAppointment && detailAppointment.id === id) {
      setDetailAppointment(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Scheduling</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full CRUD operations: Book consultations, reschedule, update statuses, and cancel appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefresh()}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh Appointments from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          <button
            id="add-appointment-primary-button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Add Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="appointment-search-bar"
              value={filters.searchQuery}
              onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by patient, doctor, reason, ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 focus:bg-white"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              id="appointment-status-filter"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value as AppointmentStatus | 'All' })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-2">
            <select
              id="appointment-date-filter"
              value={filters.dateFilter}
              onChange={e => setFilters({ ...filters, dateFilter: e.target.value as AppointmentFilterOptions['dateFilter'] })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today&apos;s Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Records</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="sm:col-span-3">
            <select
              id="appointment-doctor-filter"
              value={filters.doctor}
              onChange={e => setFilters({ ...filters, doctor: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 truncate"
            >
              <option value="All">All Attending Doctors</option>
              {AVAILABLE_DOCTORS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredAppointments.length}</strong> of{' '}
            <strong className="text-slate-800">{appointments.length}</strong> appointments
          </span>
          {(filters.searchQuery || filters.status !== 'All' || filters.dateFilter !== 'all' || filters.doctor !== 'All') && (
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  status: 'All',
                  dateFilter: 'all',
                  doctor: 'All',
                })
              }
              className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading appointments from database...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredAppointments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Appointments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filters.searchQuery || filters.status !== 'All' || filters.dateFilter !== 'all'
              ? 'No appointments match the selected filters.'
              : 'No appointments currently scheduled. Click below to schedule your first consultation.'}
          </p>
          <div className="mt-4">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" /> Schedule Appointment
            </button>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {!isLoading && filteredAppointments.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Appointment ID</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4">Schedule Date & Time</th>
                  <th className="py-3.5 px-4">Reason for Consultation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patient_id) || apt.patient;
                  const isToday = apt.appointment_date === todayStr;

                  return (
                    <tr
                      key={apt.id}
                      id={`appointment-row-${apt.id}`}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Appointment ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[11px]">
                          {apt.appointment_id}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        {patient ? (
                          <div>
                            <span 
                              className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer block"
                              onClick={() => handleOpenDetail(apt)}
                            >
                              {patient.full_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <span>{patient.patient_id}</span>
                              <span>•</span>
                              <span className="font-semibold text-rose-600">{patient.blood_group}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unknown Patient</span>
                        )}
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{apt.doctor}</span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <span>{apt.appointment_date}</span>
                            {isToday && (
                              <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{apt.appointment_time}</span>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 line-clamp-1 max-w-[200px]" title={apt.reason_for_visit}>
                          {apt.reason_for_visit}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                            apt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {apt.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {apt.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                          {apt.status === 'Scheduled' && <AlertTriangle className="w-3 h-3" />}
                          {apt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* READ: View */}
                          <button
                            onClick={() => handleOpenDetail(apt)}
                            id={`view-appointment-${apt.id}`}
                            title="Read: View Appointment Details"
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* UPDATE: Edit */}
                          <button
                            onClick={() => handleOpenEdit(apt)}
                            id={`edit-appointment-${apt.id}`}
                            title="Update: Modify Appointment Information"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* DELETE: Delete */}
                          <button
                            onClick={() => handleOpenDelete(apt)}
                            id={`delete-appointment-${apt.id}`}
                            title="Delete: Remove Appointment Record"
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {!isLoading && filteredAppointments.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map(apt => {
            const patient = patients.find(p => p.id === apt.patient_id) || apt.patient;
            const isToday = apt.appointment_date === todayStr;

            return (
              <div
                key={apt.id}
                id={`appointment-card-${apt.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {apt.appointment_id}
                        </span>
                        {isToday && (
                          <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            Today
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => handleOpenDetail(apt)}
                        className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer text-sm mt-1.5"
                      >
                        {patient ? patient.full_name : 'Unknown Patient'}
                      </h3>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : apt.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{apt.appointment_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.appointment_time}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                        <Stethoscope className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700">{apt.doctor}</span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{apt.reason_for_visit}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Quick status change buttons */}
                  <div className="flex items-center gap-1">
                    {apt.status === 'Scheduled' && (
                      <button
                        onClick={() => handleQuickStatus(apt.id, 'Completed')}
                        className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md cursor-pointer"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDetail(apt)}
                      title="View Details"
                      className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(apt)}
                      title="Edit Appointment"
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(apt)}
                      title="Delete Appointment"
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & UPDATE MODAL */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setAppointmentToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        appointmentToEdit={appointmentToEdit}
        patients={patients}
        preselectedPatientId={initialPatientForNewApt ? initialPatientForNewApt.id : undefined}
        suggestedAppointmentId={appointmentToEdit ? appointmentToEdit.appointment_id : nextSuggestedId}
      />

      {/* READ DETAIL MODAL */}
      <AppointmentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailAppointment(null);
        }}
        appointment={detailAppointment}
        patient={detailAppointment ? patients.find(p => p.id === detailAppointment.patient_id) : null}
        onEdit={apt => handleOpenEdit(apt)}
        onDelete={apt => handleOpenDelete(apt)}
        onQuickStatusChange={handleQuickStatus}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={Boolean(appointmentToDelete)}
        title="Delete Appointment Record"
        message={`Are you sure you want to delete appointment record "${appointmentToDelete?.appointment_id}"? This will permanently remove the record from the Supabase database.`}
        confirmLabel="Yes, Delete Appointment"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  );
};

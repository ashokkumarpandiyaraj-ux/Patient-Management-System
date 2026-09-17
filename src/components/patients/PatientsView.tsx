import React, { useState, useMemo } from 'react';
import { Patient, Gender, BloodGroup, PatientFilterOptions, Appointment } from '../../types';
import { BLOOD_GROUPS } from '../../constants/formOptions';
import { PatientFormModal } from './PatientFormModal';
import { PatientDetailModal } from './PatientDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Search, UserPlus, Filter, ArrowUpDown, Eye, Edit, Trash2, 
  Calendar, Phone, Mail, HeartPulse, User, RefreshCw, LayoutGrid, Table as TableIcon, AlertCircle
} from 'lucide-react';

interface PatientsViewProps {
  patients: Patient[];
  appointments: Appointment[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onCreatePatient: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  onDeletePatient: (id: string) => Promise<void>;
  onOpenBookAppointment?: (patient: Patient) => void;
  nextSuggestedId: string;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  appointments,
  isLoading,
  onRefresh,
  onCreatePatient,
  onUpdatePatient,
  onDeletePatient,
  onOpenBookAppointment,
  nextSuggestedId,
}) => {
  // Filters & Search
  const [filters, setFilters] = useState<PatientFilterOptions>({
    searchQuery: '',
    gender: 'All',
    bloodGroup: 'All',
    sortBy: 'date_desc',
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort logic
  const filteredPatients = useMemo(() => {
    return patients
      .filter(p => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.full_name.toLowerCase().includes(q);
          const matchId = p.patient_id.toLowerCase().includes(q);
          const matchPhone = p.phone.toLowerCase().includes(q);
          const matchCondition = p.medical_condition.toLowerCase().includes(q);
          if (!matchName && !matchId && !matchPhone && !matchCondition) {
            return false;
          }
        }

        // Gender filter
        if (filters.gender !== 'All' && p.gender !== filters.gender) {
          return false;
        }

        // Blood group filter
        if (filters.bloodGroup !== 'All' && p.blood_group !== filters.bloodGroup) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'name_asc':
            return a.full_name.localeCompare(b.full_name);
          case 'name_desc':
            return b.full_name.localeCompare(a.full_name);
          case 'date_desc':
            return new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime();
          case 'date_asc':
            return new Date(a.registration_date).getTime() - new Date(b.registration_date).getTime();
          case 'age_desc':
            return b.age - a.age;
          case 'age_asc':
            return a.age - b.age;
          default:
            return 0;
        }
      });
  }, [patients, filters]);

  // Handlers
  const handleOpenCreate = () => {
    setPatientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (patient: Patient) => {
    setDetailPatient(patient);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await onDeletePatient(patientToDelete.id);
      setPatientToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    if (patientToEdit) {
      await onUpdatePatient(patientToEdit.id, data);
    } else {
      await onCreatePatient(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full CRUD operations: Register, inspect, edit, and manage verified patient records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefresh()}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Refresh List from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          <button
            id="add-patient-primary-button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="patient-search-bar"
              value={filters.searchQuery}
              onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by name, patient ID, phone, condition..."
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

          {/* Gender Filter */}
          <div className="sm:col-span-2">
            <select
              id="patient-gender-filter"
              value={filters.gender}
              onChange={e => setFilters({ ...filters, gender: e.target.value as Gender | 'All' })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div className="sm:col-span-2">
            <select
              id="patient-blood-filter"
              value={filters.bloodGroup}
              onChange={e => setFilters({ ...filters, bloodGroup: e.target.value as BloodGroup | 'All' })}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Blood Groups</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>
                  Blood: {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              id="patient-sort-select"
              value={filters.sortBy}
              onChange={e => setFilters({ ...filters, sortBy: e.target.value as PatientFilterOptions['sortBy'] })}
              className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="date_desc">Registration: Newest</option>
              <option value="date_asc">Registration: Oldest</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="age_asc">Age: Youngest First</option>
              <option value="age_desc">Age: Oldest First</option>
            </select>

            {/* View Mode Toggle */}
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
            Showing <strong className="text-slate-800">{filteredPatients.length}</strong> of{' '}
            <strong className="text-slate-800">{patients.length}</strong> patients
          </span>
          {(filters.searchQuery || filters.gender !== 'All' || filters.bloodGroup !== 'All') && (
            <button
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  gender: 'All',
                  bloodGroup: 'All',
                  sortBy: 'date_desc',
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
          <p className="text-sm font-semibold text-slate-700">Loading patients from database...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Patient Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filters.searchQuery || filters.gender !== 'All' || filters.bloodGroup !== 'All'
              ? 'No patients match the selected search criteria. Try adjusting your filters.'
              : 'There are currently no patients registered in the database. Add your first patient to begin.'}
          </p>
          <div className="mt-4">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Add New Patient
            </button>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {!isLoading && filteredPatients.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Demographics</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Medical Condition</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    id={`patient-row-${patient.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Patient ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/80 text-[11px]">
                        {patient.patient_id}
                      </span>
                    </td>

                    {/* Full Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0 border border-teal-200/60">
                          {patient.full_name
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer block" onClick={() => handleOpenDetail(patient)}>
                            {patient.full_name}
                          </span>
                          <span className="text-[11px] text-slate-400">DOB: {patient.date_of_birth}</span>
                        </div>
                      </div>
                    </td>

                    {/* Demographics */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 block">{patient.age} yrs</span>
                        <span className="text-slate-500 text-[11px]">{patient.gender}</span>
                      </div>
                    </td>

                    {/* Blood Group */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {patient.blood_group}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[170px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{patient.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Medical Condition */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[200px]">
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {patient.medical_condition}
                        </span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {patient.emergency_contact}
                        </span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {patient.registration_date}
                    </td>

                    {/* CRUD Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* READ: View */}
                        <button
                          onClick={() => handleOpenDetail(patient)}
                          id={`view-patient-${patient.id}`}
                          title="Read: View Full Patient Details"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* UPDATE: Edit */}
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          id={`edit-patient-${patient.id}`}
                          title="Update: Edit Patient Information"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* DELETE: Delete */}
                        <button
                          onClick={() => handleOpenDelete(patient)}
                          id={`delete-patient-${patient.id}`}
                          title="Delete: Remove Patient Record"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {!isLoading && filteredPatients.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <div
              key={patient.id}
              id={`patient-card-${patient.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200/70">
                      {patient.full_name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3
                        onClick={() => handleOpenDetail(patient)}
                        className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer text-sm leading-snug"
                      >
                        {patient.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {patient.patient_id}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {patient.age}y, {patient.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {patient.blood_group}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100/70">
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                      Condition
                    </span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {patient.medical_condition}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Reg: {patient.registration_date}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDetail(patient)}
                    title="View Details"
                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(patient)}
                    title="Edit Patient"
                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(patient)}
                    title="Delete Patient"
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & UPDATE MODAL */}
      <PatientFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPatientToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        patientToEdit={patientToEdit}
        suggestedPatientId={patientToEdit ? patientToEdit.patient_id : nextSuggestedId}
      />

      {/* READ DETAIL MODAL */}
      <PatientDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailPatient(null);
        }}
        patient={detailPatient}
        appointments={appointments}
        onEdit={p => handleOpenEdit(p)}
        onDelete={p => handleOpenDelete(p)}
        onBookAppointment={p => {
          if (onOpenBookAppointment) onOpenBookAppointment(p);
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={Boolean(patientToDelete)}
        title="Delete Patient Record"
        message={`Are you sure you want to delete patient "${patientToDelete?.full_name}" (${patientToDelete?.patient_id})? This action cannot be undone and will also delete any associated appointments from the database.`}
        confirmLabel="Yes, Delete Patient"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
};

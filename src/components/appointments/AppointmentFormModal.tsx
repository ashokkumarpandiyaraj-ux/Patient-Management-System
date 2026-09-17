import React, { useState, useEffect } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../../types';
import { AVAILABLE_DOCTORS } from '../../constants/formOptions';
import { X, CalendarPlus, Save, AlertCircle, Clock, Calendar, Stethoscope, User, FileText } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) => Promise<void>;
  appointmentToEdit?: Appointment | null;
  patients: Patient[];
  preselectedPatientId?: string;
  suggestedAppointmentId: string;
}

interface FormErrors {
  patient_id?: string;
  doctor?: string;
  appointment_date?: string;
  appointment_time?: string;
  reason_for_visit?: string;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  appointmentToEdit,
  patients,
  preselectedPatientId,
  suggestedAppointmentId,
}) => {
  const isEditing = Boolean(appointmentToEdit);

  const [formData, setFormData] = useState({
    appointment_id: suggestedAppointmentId,
    patient_id: preselectedPatientId || (patients.length > 0 ? patients[0].id : ''),
    doctor: AVAILABLE_DOCTORS[0],
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00',
    reason_for_visit: '',
    status: 'Scheduled' as AppointmentStatus,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointmentToEdit) {
      setFormData({
        appointment_id: appointmentToEdit.appointment_id,
        patient_id: appointmentToEdit.patient_id,
        doctor: appointmentToEdit.doctor,
        appointment_date: appointmentToEdit.appointment_date,
        appointment_time: appointmentToEdit.appointment_time,
        reason_for_visit: appointmentToEdit.reason_for_visit,
        status: appointmentToEdit.status,
        notes: appointmentToEdit.notes || '',
      });
    } else {
      setFormData({
        appointment_id: suggestedAppointmentId,
        patient_id: preselectedPatientId || (patients.length > 0 ? patients[0].id : ''),
        doctor: AVAILABLE_DOCTORS[0],
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:00',
        reason_for_visit: '',
        status: 'Scheduled',
        notes: '',
      });
    }
    setErrors({});
  }, [appointmentToEdit, suggestedAppointmentId, preselectedPatientId, patients, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = 'Please select a patient';
    }

    if (!formData.doctor.trim()) {
      newErrors.doctor = 'Please select or specify a attending doctor';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Appointment date is required';
    }

    if (!formData.appointment_time) {
      newErrors.appointment_time = 'Appointment time is required';
    }

    if (!formData.reason_for_visit.trim()) {
      newErrors.reason_for_visit = 'Reason for consultation/visit is required';
    } else if (formData.reason_for_visit.trim().length < 3) {
      newErrors.reason_for_visit = 'Reason must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Submit appointment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === formData.patient_id);

  return (
    <div 
      id="appointment-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="appointment-form-modal"
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
              {isEditing ? <Save className="w-5 h-5" /> : <CalendarPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Appointment Record' : 'Schedule New Appointment'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? `Updating record: ${formData.appointment_id}`
                  : 'Assign appointment to an enrolled patient and attending physician.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Row 1: Appointment ID & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment ID
              </label>
              <input
                type="text"
                id="appointment_id_input"
                value={formData.appointment_id}
                onChange={e => setFormData({ ...formData, appointment_id: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="appointment_status_input"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Row 2: Patient Selection (Relational Foreign Key) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <select
                id="appointment_patient_select"
                value={formData.patient_id}
                onChange={e => {
                  setFormData({ ...formData, patient_id: e.target.value });
                  if (errors.patient_id) setErrors({ ...errors, patient_id: undefined });
                }}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 bg-white ${
                  errors.patient_id ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              >
                <option value="">-- Choose Enrolled Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.patient_id}) — {p.gender}, {p.blood_group}
                  </option>
                ))}
              </select>
            </div>
            {errors.patient_id && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.patient_id}
              </p>
            )}

            {/* Selected Patient Mini Preview */}
            {selectedPatient && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{selectedPatient.full_name}</span>
                  <span className="text-slate-500 ml-2">({selectedPatient.phone})</span>
                </div>
                <span className="text-slate-600 truncate max-w-[200px]">
                  {selectedPatient.medical_condition}
                </span>
              </div>
            )}
          </div>

          {/* Row 3: Attending Doctor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attending Doctor <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Stethoscope className="w-4 h-4" />
              </span>
              <select
                id="appointment_doctor_select"
                value={formData.doctor}
                onChange={e => {
                  setFormData({ ...formData, doctor: e.target.value });
                  if (errors.doctor) setErrors({ ...errors, doctor: undefined });
                }}
                className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 bg-white ${
                  errors.doctor ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                }`}
              >
                {AVAILABLE_DOCTORS.map(doc => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
            {errors.doctor && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.doctor}
              </p>
            )}
          </div>

          {/* Row 4: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  id="appointment_date_input"
                  value={formData.appointment_date}
                  onChange={e => {
                    setFormData({ ...formData, appointment_date: e.target.value });
                    if (errors.appointment_date) setErrors({ ...errors, appointment_date: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.appointment_date ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
              </div>
              {errors.appointment_date && (
                <p className="text-xs text-rose-600 mt-1">{errors.appointment_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="time"
                  id="appointment_time_input"
                  value={formData.appointment_time}
                  onChange={e => {
                    setFormData({ ...formData, appointment_time: e.target.value });
                    if (errors.appointment_time) setErrors({ ...errors, appointment_time: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.appointment_time ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
                  }`}
                />
              </div>
              {errors.appointment_time && (
                <p className="text-xs text-rose-600 mt-1">{errors.appointment_time}</p>
              )}
            </div>
          </div>

          {/* Row 5: Reason for Visit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit / Chief Complaint <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="appointment_reason_input"
              rows={2}
              value={formData.reason_for_visit}
              onChange={e => {
                setFormData({ ...formData, reason_for_visit: e.target.value });
                if (errors.reason_for_visit) setErrors({ ...errors, reason_for_visit: undefined });
              }}
              className={`w-full px-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                errors.reason_for_visit ? 'border-rose-300 focus:ring-rose-400' : 'border-slate-200 focus:ring-teal-500'
              }`}
              placeholder="e.g. Routine blood pressure checkup and prescription renewal..."
            />
            {errors.reason_for_visit && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.reason_for_visit}
              </p>
            )}
          </div>

          {/* Row 6: Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Clinical Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              id="appointment_notes_input"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Patient requested morning slot; bring past lab results"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-appointment-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-appointment-btn"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <CalendarPlus className="w-4 h-4" />
              )}
              {isEditing ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

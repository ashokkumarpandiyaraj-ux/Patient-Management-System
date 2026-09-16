import React from 'react';
import { Patient, Appointment } from '../../types';
import { X, Edit, Trash2, CalendarPlus, User, Phone, Mail, MapPin, HeartPulse, ShieldAlert, Calendar, Clock, Activity, FileText } from 'lucide-react';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  appointments: Appointment[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onBookAppointment: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointments,
  onEdit,
  onDelete,
  onBookAppointment,
}) => {
  if (!isOpen || !patient) return null;

  const patientAppointments = appointments.filter(a => a.patient_id === patient.id);

  return (
    <div 
      id="patient-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="patient-detail-modal"
        className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center text-xl font-bold shadow-xs">
              {patient.full_name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{patient.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {patient.patient_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {patient.blood_group}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>{patient.gender}</span>
                <span>•</span>
                <span>{patient.age} years old</span>
                <span>•</span>
                <span>DOB: {patient.date_of_birth}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
              title="Edit Patient"
              className="p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(patient);
              }}
              title="Delete Patient"
              className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Medical Summary Banner */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  Primary Medical Condition / Diagnosis
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {patient.medical_condition}
                </p>
                {patient.notes && (
                  <p className="text-xs text-slate-600 mt-1.5 bg-white/70 p-2 rounded-lg border border-teal-100">
                    <span className="font-semibold text-slate-700">Clinical Notes: </span>
                    {patient.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact Details
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-20">Phone:</span>
                  <span className="font-semibold text-slate-800">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 w-20">Email:</span>
                  <span className="font-semibold text-slate-800 break-all">{patient.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-500 w-20">Address:</span>
                  <span className="font-medium text-slate-800">{patient.address}</span>
                </div>
              </div>
            </div>

            {/* Emergency & Registration */}
            <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Emergency & Registration
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                  <span className="block text-[11px] font-semibold text-rose-700">Emergency Contact</span>
                  <span className="font-medium text-slate-900 mt-0.5 block">{patient.emergency_contact}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Registration Date:</span>
                  <span className="font-semibold text-slate-800">{patient.registration_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Database Record ID:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]">{patient.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment History (Relational Check) */}
          <div className="p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Appointment History ({patientAppointments.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onBookAppointment(patient);
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200/70 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Book Appointment
              </button>
            </div>

            {patientAppointments.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">No appointments scheduled yet for this patient.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patientAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-center justify-between flex-wrap gap-2 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{apt.appointment_id}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-semibold text-slate-700">{apt.doctor}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{apt.reason_for_visit}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="font-semibold text-slate-800 block">{apt.appointment_date}</span>
                        <span className="text-slate-500">{apt.appointment_time}</span>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Appointment, Patient, AppointmentStatus } from '../../types';
import { X, Edit, Trash2, Calendar, Clock, User, Stethoscope, FileText, CheckCircle2, AlertTriangle, XCircle, Phone, Mail } from 'lucide-react';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  patient?: Patient | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onQuickStatusChange?: (id: string, status: AppointmentStatus) => Promise<void>;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  onEdit,
  onDelete,
  onQuickStatusChange,
}) => {
  if (!isOpen || !appointment) return null;

  const currentPatient = patient || appointment.patient;

  return (
    <div 
      id="appointment-detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="appointment-detail-modal"
        className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center text-lg font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Appointment Details</h2>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {appointment.appointment_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Managed in Supabase database with patient foreign key linkage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onEdit(appointment);
              }}
              title="Edit Appointment"
              className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(appointment);
              }}
              title="Delete Appointment"
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

        {/* Content */}
        <div className="mt-6 space-y-5">
          {/* Status & Timing Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Date & Time
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900 text-sm">{appointment.appointment_date}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {appointment.appointment_time}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-right mb-1">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                  appointment.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : appointment.status === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {appointment.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {appointment.status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                {appointment.status === 'Scheduled' && <AlertTriangle className="w-3.5 h-3.5" />}
                {appointment.status}
              </span>
            </div>
          </div>

          {/* Quick Status Changers (UPDATE demonstration) */}
          {onQuickStatusChange && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/50 border border-teal-100/80 text-xs">
              <span className="font-semibold text-teal-900">Change Status:</span>
              <div className="flex items-center gap-1.5">
                {(['Scheduled', 'Completed', 'Cancelled'] as AppointmentStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => onQuickStatusChange(appointment.id, status)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      appointment.status === status
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white hover:bg-teal-100/70 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Patient Card */}
          <div className="p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Enrolled Patient
            </h3>
            {currentPatient ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{currentPatient.full_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {currentPatient.patient_id}
                    </span>
                    <span>•</span>
                    <span>{currentPatient.age} yrs, {currentPatient.gender}</span>
                    <span>•</span>
                    <span className="font-bold text-rose-600">{currentPatient.blood_group}</span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentPatient.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentPatient.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Condition</span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block max-w-[150px]">
                    {currentPatient.medical_condition}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Patient information not linked.</p>
            )}
          </div>

          {/* Attending Physician */}
          <div className="p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Attending Physician
            </h3>
            <p className="text-sm font-semibold text-slate-800">{appointment.doctor}</p>
          </div>

          {/* Reason for Visit */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Clinical Reason for Visit
            </h3>
            <p className="text-sm font-medium text-slate-800 leading-relaxed mt-1">
              {appointment.reason_for_visit}
            </p>
            {appointment.notes && (
              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                <strong className="text-slate-600">Notes: </strong>
                {appointment.notes}
              </p>
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

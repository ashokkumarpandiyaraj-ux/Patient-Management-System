import React, { useState, useEffect } from 'react';
import { Patient, Gender, BloodGroup } from '../../types';
import { BLOOD_GROUPS } from '../../constants/formOptions';
import { X, UserPlus, Save, AlertCircle, Calendar, Phone, Mail, MapPin, HeartPulse, User } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  patientToEdit?: Patient | null;
  suggestedPatientId: string;
}

interface FormErrors {
  full_name?: string;
  date_of_birth?: string;
  age?: string;
  gender?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_condition?: string;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patientToEdit,
  suggestedPatientId,
}) => {
  const isEditing = Boolean(patientToEdit);

  const [formData, setFormData] = useState({
    patient_id: suggestedPatientId,
    full_name: '',
    date_of_birth: '',
    age: 0,
    gender: 'Male' as Gender,
    blood_group: 'O+' as BloodGroup,
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    medical_condition: '',
    registration_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens or patientToEdit changes
  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        patient_id: patientToEdit.patient_id,
        full_name: patientToEdit.full_name,
        date_of_birth: patientToEdit.date_of_birth,
        age: patientToEdit.age,
        gender: patientToEdit.gender,
        blood_group: patientToEdit.blood_group,
        phone: patientToEdit.phone,
        email: patientToEdit.email,
        address: patientToEdit.address,
        emergency_contact: patientToEdit.emergency_contact,
        medical_condition: patientToEdit.medical_condition,
        registration_date: patientToEdit.registration_date,
        notes: patientToEdit.notes || '',
      });
    } else {
      setFormData({
        patient_id: suggestedPatientId,
        full_name: '',
        date_of_birth: '',
        age: 0,
        gender: 'Male',
        blood_group: 'O+',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        medical_condition: '',
        registration_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [patientToEdit, suggestedPatientId, isOpen]);

  if (!isOpen) return null;

  // Auto calculate age from DOB
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    let calculatedAge = 0;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge < 0) calculatedAge = 0;
    }

    setFormData(prev => ({
      ...prev,
      date_of_birth: dob,
      age: calculatedAge,
    }));

    if (errors.date_of_birth) {
      setErrors(prev => ({ ...prev, date_of_birth: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const birth = new Date(formData.date_of_birth);
      const now = new Date();
      if (birth > now) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    if (formData.age < 0 || formData.age > 130) {
      newErrors.age = 'Please enter a valid age (0-130)';
    }

    // Phone validation
    const phoneRegex = /^[\d\s()+-]{7,20}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone format (e.g. +1 (555) 000-0000)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Residential address is required';
    }

    if (!formData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'Emergency contact is required';
    }

    if (!formData.medical_condition.trim()) {
      newErrors.medical_condition = 'Primary medical condition/reason is required';
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
      console.error('Submit patient error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="patient-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="patient-form-modal"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? 'Edit Patient Record' : 'Register New Patient'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? `Modifying information for ID: ${formData.patient_id}`
                  : 'Enter patient medical and personal details below for Supabase storage.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Row 1: Patient ID & Registration Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient ID
              </label>
              <input
                type="text"
                id="patient_id_input"
                value={formData.patient_id}
                onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                placeholder="e.g. PT-1001"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Date
              </label>
              <input
                type="date"
                id="registration_date_input"
                value={formData.registration_date}
                onChange={e => setFormData({ ...formData, registration_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="full_name_input"
                value={formData.full_name}
                onChange={e => {
                  setFormData({ ...formData, full_name: e.target.value });
                  if (errors.full_name) setErrors({ ...errors, full_name: undefined });
                }}
                className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.full_name
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
                placeholder="e.g. Eleanor Vance"
              />
            </div>
            {errors.full_name && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.full_name}
              </p>
            )}
          </div>

          {/* Row 3: DOB, Age, Gender, Blood Group */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="date_of_birth_input"
                value={formData.date_of_birth}
                onChange={handleDobChange}
                className={`w-full px-3 py-2 text-xs border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.date_of_birth
                    ? 'border-rose-300 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
              {errors.date_of_birth && (
                <p className="text-xs text-rose-600 mt-0.5">{errors.date_of_birth}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                id="age_input"
                min="0"
                max="130"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {errors.age && <p className="text-xs text-rose-600 mt-0.5">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                id="gender_input"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group <span className="text-rose-500">*</span>
              </label>
              <select
                id="blood_group_input"
                value={formData.blood_group}
                onChange={e => setFormData({ ...formData, blood_group: e.target.value as BloodGroup })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-semibold"
              >
                {BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="phone_input"
                  value={formData.phone}
                  onChange={e => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-teal-500'
                  }`}
                  placeholder="+1 (555) 234-5678"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  id="email_input"
                  value={formData.email}
                  onChange={e => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-teal-500'
                  }`}
                  placeholder="patient@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="address_input"
                value={formData.address}
                onChange={e => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.address
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
                placeholder="742 Evergreen Terrace, Springfield, OR"
              />
            </div>
            {errors.address && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.address}
              </p>
            )}
          </div>

          {/* Row 6: Emergency Contact */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Emergency Contact (Name, Relation & Phone) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="emergency_contact_input"
              value={formData.emergency_contact}
              onChange={e => {
                setFormData({ ...formData, emergency_contact: e.target.value });
                if (errors.emergency_contact) setErrors({ ...errors, emergency_contact: undefined });
              }}
              className={`w-full px-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                errors.emergency_contact
                  ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-teal-500'
              }`}
              placeholder="e.g. Mark Vance (Spouse) - +1 (555) 987-6543"
            />
            {errors.emergency_contact && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.emergency_contact}
              </p>
            )}
          </div>

          {/* Row 7: Medical Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medical Condition / Chief Diagnosis <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <HeartPulse className="w-4 h-4" />
              </span>
              <input
                type="text"
                id="medical_condition_input"
                value={formData.medical_condition}
                onChange={e => {
                  setFormData({ ...formData, medical_condition: e.target.value });
                  if (errors.medical_condition) setErrors({ ...errors, medical_condition: undefined });
                }}
                className={`w-full pl-10 pr-3.5 py-2 text-sm border rounded-xl text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.medical_condition
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
                placeholder="e.g. Type 2 Diabetes, Mild Hypertension"
              />
            </div>
            {errors.medical_condition && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.medical_condition}
              </p>
            )}
          </div>

          {/* Row 8: Clinical Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Notes & Allergies (Optional)
            </label>
            <textarea
              id="notes_input"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Penicillin allergy, monitors blood sugar daily..."
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-patient-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-patient-btn"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition-all shadow-sm shadow-teal-700/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isEditing ? 'Save Changes' : 'Create Patient Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

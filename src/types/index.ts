export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export interface Patient {
  id: string; // Database UUID or standard ID
  patient_id: string; // Formatted display ID like PT-1001
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  age: number;
  gender: Gender;
  blood_group: BloodGroup;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  medical_condition: string;
  registration_date: string; // ISO string or YYYY-MM-DD
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string; // Database UUID
  appointment_id: string; // Formatted display ID like APT-2001
  patient_id: string; // Foreign key referencing Patient.id
  patient?: Patient; // Populated patient relation
  doctor: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM (24-hr or 12-hr display)
  reason_for_visit: string;
  status: AppointmentStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'Physician' | 'Administrator' | 'Nurse' | 'Staff';
  avatar_url?: string;
}

export type ActiveTab = 'patients' | 'appointments' | 'settings';

export interface PatientFilterOptions {
  searchQuery: string;
  gender: Gender | 'All';
  bloodGroup: BloodGroup | 'All';
  sortBy: 'name_asc' | 'name_desc' | 'date_desc' | 'date_asc' | 'age_asc' | 'age_desc';
}

export interface AppointmentFilterOptions {
  searchQuery: string;
  status: AppointmentStatus | 'All';
  dateFilter: 'all' | 'today' | 'upcoming' | 'past';
  doctor: string | 'All';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

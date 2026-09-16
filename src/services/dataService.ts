import { Patient, Appointment } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS } from './sampleData';

const PATIENTS_STORAGE_KEY = 'caretrack_patients_data_v1';
const APPOINTMENTS_STORAGE_KEY = 'caretrack_appointments_data_v1';

// Helpers for Local Storage Fallback
const getLocalPatients = (): Patient[] => {
  const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PATIENTS;
  }
};

const saveLocalPatients = (patients: Patient[]) => {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
};

const getLocalAppointments = (): Appointment[] => {
  const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

const saveLocalAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
};

// Generate human-friendly ID like PT-1007 or APT-2008
export const generateNextPatientId = (existingPatients: Patient[]): string => {
  const numbers = existingPatients
    .map(p => {
      const match = p.patient_id.match(/PT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `PT-${max + 1}`;
};

export const generateNextAppointmentId = (existingAppointments: Appointment[]): string => {
  const numbers = existingAppointments
    .map(a => {
      const match = a.appointment_id.match(/APT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const max = numbers.length > 0 ? Math.max(...numbers) : 2000;
  return `APT-${max + 1}`;
};

// DATA SOURCE CHECK
export const isUsingSupabase = (): boolean => {
  return isSupabaseConfigured() && Boolean(getSupabaseClient());
};

// ============================================================================
// PATIENTS CRUD
// ============================================================================

export const dataService = {
  // --- READ ALL PATIENTS ---
  async getPatients(): Promise<Patient[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Patient[];
        }
        console.warn('Supabase getPatients returned error or empty, falling back to local:', error);
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage:', err);
      }
    }
    return getLocalPatients();
  },

  // --- READ SINGLE PATIENT ---
  async getPatientById(id: string): Promise<Patient | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) return data as Patient;
      } catch (err) {
        console.warn('Supabase getPatientById error:', err);
      }
    }
    const local = getLocalPatients();
    return local.find(p => p.id === id) || null;
  },

  // --- CREATE PATIENT ---
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;
    const now = new Date().toISOString();

    const newPatient: Patient = {
      ...patientData,
      id,
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([newPatient])
          .select()
          .single();

        if (!error && data) {
          // Keep local cache in sync
          const local = getLocalPatients();
          saveLocalPatients([data as Patient, ...local]);
          return data as Patient;
        }
        console.warn('Supabase insert patient error:', error);
      } catch (err) {
        console.warn('Supabase insert patient exception:', err);
      }
    }

    // Local execution
    const local = getLocalPatients();
    const updated = [newPatient, ...local];
    saveLocalPatients(updated);
    return newPatient;
  },

  // --- UPDATE PATIENT ---
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const local = getLocalPatients();
          const updated = local.map(p => (p.id === id ? (data as Patient) : p));
          saveLocalPatients(updated);
          return data as Patient;
        }
        console.warn('Supabase update patient error:', error);
      } catch (err) {
        console.warn('Supabase update patient exception:', err);
      }
    }

    // Local fallback update
    const local = getLocalPatients();
    const index = local.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Patient with ID ${id} not found`);
    }

    const updatedPatient: Patient = {
      ...local[index],
      ...updates,
      updated_at: now,
    };

    local[index] = updatedPatient;
    saveLocalPatients(local);
    return updatedPatient;
  },

  // --- DELETE PATIENT ---
  async deletePatient(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // In PostgreSQL with ON DELETE CASCADE, foreign appointments are deleted automatically
        const { error } = await supabase
          .from('patients')
          .delete()
          .eq('id', id);

        if (!error) {
          // Sync local
          const local = getLocalPatients().filter(p => p.id !== id);
          saveLocalPatients(local);
          // Also cascade delete related local appointments
          const localApts = getLocalAppointments().filter(a => a.patient_id !== id);
          saveLocalAppointments(localApts);
          return true;
        }
        console.warn('Supabase delete patient error:', error);
      } catch (err) {
        console.warn('Supabase delete patient exception:', err);
      }
    }

    // Local deletion with cascade delete
    const local = getLocalPatients().filter(p => p.id !== id);
    saveLocalPatients(local);

    const localApts = getLocalAppointments().filter(a => a.patient_id !== id);
    saveLocalAppointments(localApts);

    return true;
  },

  // ============================================================================
  // APPOINTMENTS CRUD
  // ============================================================================

  // --- READ ALL APPOINTMENTS ---
  async getAppointments(): Promise<Appointment[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Include patient details via relation
        const { data, error } = await supabase
          .from('appointments')
          .select('*, patient:patients(*)')
          .order('appointment_date', { ascending: false });

        if (!error && data) {
          return data as Appointment[];
        }
        console.warn('Supabase getAppointments error:', error);
      } catch (err) {
        console.warn('Supabase appointments fetch failed:', err);
      }
    }

    // Local appointments populated with patient object
    const localApts = getLocalAppointments();
    const localPatients = getLocalPatients();
    const patientMap = new Map(localPatients.map(p => [p.id, p]));

    return localApts.map(apt => ({
      ...apt,
      patient: patientMap.get(apt.patient_id),
    }));
  },

  // --- CREATE APPOINTMENT ---
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>): Promise<Appointment> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `apt-${Date.now()}`;
    const now = new Date().toISOString();

    const newAppointment: Appointment = {
      ...appointmentData,
      id,
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([newAppointment])
          .select('*, patient:patients(*)')
          .single();

        if (!error && data) {
          const localApts = getLocalAppointments();
          saveLocalAppointments([newAppointment, ...localApts]);
          return data as Appointment;
        }
        console.warn('Supabase create appointment error:', error);
      } catch (err) {
        console.warn('Supabase create appointment exception:', err);
      }
    }

    // Local
    const localApts = getLocalAppointments();
    saveLocalAppointments([newAppointment, ...localApts]);
    const patients = getLocalPatients();
    return {
      ...newAppointment,
      patient: patients.find(p => p.id === newAppointment.patient_id),
    };
  },

  // --- UPDATE APPOINTMENT ---
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    // Avoid passing nested 'patient' relation object to supabase update
    const { patient: _omittedPatient, ...cleanUpdates } = updates;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update({ ...cleanUpdates, updated_at: now })
          .eq('id', id)
          .select('*, patient:patients(*)')
          .single();

        if (!error && data) {
          const local = getLocalAppointments();
          const updated = local.map(a => (a.id === id ? { ...a, ...cleanUpdates, updated_at: now } : a));
          saveLocalAppointments(updated);
          return data as Appointment;
        }
        console.warn('Supabase update appointment error:', error);
      } catch (err) {
        console.warn('Supabase update appointment exception:', err);
      }
    }

    // Local update
    const local = getLocalAppointments();
    const index = local.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }

    const updatedApt: Appointment = {
      ...local[index],
      ...cleanUpdates,
      updated_at: now,
    };

    local[index] = updatedApt;
    saveLocalAppointments(local);

    const patients = getLocalPatients();
    return {
      ...updatedApt,
      patient: patients.find(p => p.id === updatedApt.patient_id),
    };
  },

  // --- DELETE APPOINTMENT ---
  async deleteAppointment(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (!error) {
          const local = getLocalAppointments().filter(a => a.id !== id);
          saveLocalAppointments(local);
          return true;
        }
        console.warn('Supabase delete appointment error:', error);
      } catch (err) {
        console.warn('Supabase delete appointment exception:', err);
      }
    }

    const local = getLocalAppointments().filter(a => a.id !== id);
    saveLocalAppointments(local);
    return true;
  },

  // --- SEED SAMPLE DATA ---
  async seedDemoData(target: 'all' | 'supabase' | 'local' = 'all'): Promise<{ success: boolean; message: string }> {
    // 1. Reset Local Storage
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));

    const supabase = getSupabaseClient();
    if (supabase && (target === 'all' || target === 'supabase')) {
      try {
        // Upsert patients
        const { error: pErr } = await supabase
          .from('patients')
          .upsert(INITIAL_PATIENTS, { onConflict: 'id' });

        if (pErr) {
          return {
            success: false,
            message: `Sample patients seeded locally, but Supabase error: ${pErr.message}`,
          };
        }

        // Upsert appointments
        const { error: aErr } = await supabase
          .from('appointments')
          .upsert(INITIAL_APPOINTMENTS, { onConflict: 'id' });

        if (aErr) {
          return {
            success: false,
            message: `Patients saved to Supabase, but Appointments error: ${aErr.message}`,
          };
        }

        return {
          success: true,
          message: `Successfully seeded 6 patients and 7 appointments to both Supabase and local cache!`,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error syncing to Supabase';
        return { success: false, message };
      }
    }

    return {
      success: true,
      message: 'Fictional sample data successfully reset with 6 patients and 7 appointments!',
    };
  },

  // --- RESET ALL DATA ---
  async resetAllData(): Promise<void> {
    localStorage.removeItem(PATIENTS_STORAGE_KEY);
    localStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
    // Re-seed initial
    saveLocalPatients(INITIAL_PATIENTS);
    saveLocalAppointments(INITIAL_APPOINTMENTS);
  }
};

import { Patient, Appointment } from '../types';
import { getSupabaseClient } from './supabase';

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

// ============================================================================
// PATIENTS CRUD
// ============================================================================

export const dataService = {
  // --- READ ALL PATIENTS ---
  async getPatients(): Promise<Patient[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your project URL and anon key in Settings & DB.');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as Patient[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load patients from Supabase.';
      throw new Error(message);
    }
  },

  // --- READ SINGLE PATIENT ---
  async getPatientById(id: string): Promise<Patient | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your project URL and anon key in Settings & DB.');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      return data ? (data as Patient) : null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch patient from Supabase.';
      throw new Error(message);
    }
  },

  // --- CREATE PATIENT ---
  async createPatient(patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your project URL and anon key in Settings & DB.');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Patient was not returned after insert.');
      }

      return data as Patient;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create patient in Supabase.';
      throw new Error(message);
    }
  },

  // --- UPDATE PATIENT ---
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your project URL and anon key in Settings & DB.');
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(`Patient with ID ${id} not found.`);
      }

      return data as Patient;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update patient in Supabase.';
      throw new Error(message);
    }
  },

  // --- DELETE PATIENT ---
  async deletePatient(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add your project URL and anon key in Settings & DB.');
    }

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete patient from Supabase.';
      throw new Error(message);
    }
  },

  // ============================================================================
  // APPOINTMENTS CRUD
  // ============================================================================

  // --- READ ALL APPOINTMENTS ---
  async getAppointments(): Promise<Appointment[]> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.');
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patients(*)')
        .order('appointment_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as Appointment[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments from Supabase.';
      throw new Error(message);
    }
  },

  // --- CREATE APPOINTMENT ---
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>): Promise<Appointment> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.');
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select('*, patient:patients(*)')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Appointment was not returned after insert.');
      }

      return data as Appointment;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create appointment in Supabase.';
      throw new Error(message);
    }
  },

  // --- UPDATE APPOINTMENT ---
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const supabase = getSupabaseClient();

    const { patient: _omittedPatient, ...cleanUpdates } = updates;

    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.');
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(cleanUpdates)
        .eq('id', id)
        .select('*, patient:patients(*)')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error(`Appointment with ID ${id} not found.`);
      }

      return data as Appointment;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update appointment in Supabase.';
      throw new Error(message);
    }
  },

  // --- DELETE APPOINTMENT ---
  async deleteAppointment(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.');
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete appointment from Supabase.';
      throw new Error(message);
    }
  },
};

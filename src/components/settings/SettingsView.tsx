import React, { useState } from 'react';
import { isSupabaseConfigured } from '../../services/supabase';
import { Database, Copy, Check, CheckCircle2, AlertCircle, Terminal, ExternalLink } from 'lucide-react';

interface SettingsViewProps {
  onDataReset: () => Promise<void>;
  patientCount: number;
  appointmentCount: number;
}

const SQL_SCHEMA_CONTENT = `-- ==============================================================================
-- CareTrack – Patient Management System
-- Database Schema for Supabase / PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(255) NOT NULL,
    medical_condition TEXT NOT NULL,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Required when upgrading a database created before the age field existed.
-- CREATE TABLE IF NOT EXISTS does not modify an existing table.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;
UPDATE patients
SET age = EXTRACT(YEAR FROM age(CURRENT_DATE, date_of_birth))::INTEGER
WHERE age IS NULL;
ALTER TABLE patients ALTER COLUMN age SET NOT NULL;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_age_check;
ALTER TABLE patients
    ADD CONSTRAINT patients_age_check CHECK (age >= 0 AND age <= 130);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    reason_for_visit TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients (full_name);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  patientCount,
  appointmentCount,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings &amp; Database</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review database connectivity and schema details for the live Supabase-backed CareTrack instance.
        </p>
      </div>

      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${
        isConfigured
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">
                {isConfigured ? 'Supabase Live Connected' : 'Supabase Not Configured'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {isConfigured ? 'Live Cloud Database' : 'Environment Required'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isConfigured
                ? 'CareTrack is connected to your Supabase PostgreSQL environment.'
                : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">
            Records: <strong>{patientCount}</strong> Patients, <strong>{appointmentCount}</strong> Appointments
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase Connection</h2>
              <p className="text-xs text-slate-500">The application uses environment-based configuration only.</p>
            </div>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            Supabase Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            {isConfigured ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            )}
            <span>
              {isConfigured
                ? 'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured for this app.'
                : 'Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase SQL Table Schema</h2>
              <p className="text-xs text-slate-500">
                PostgreSQL schema definition with Foreign Key relations, RLS, checks, and indexes
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-64 scrollbar-thin">
            {SQL_SCHEMA_CONTENT}
          </pre>
        </div>
      </div>
    </div>
  );
};

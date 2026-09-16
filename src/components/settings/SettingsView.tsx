import React, { useState, useEffect } from 'react';
import { 
  getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, testConnection, isSupabaseConfigured 
} from '../../services/supabase';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { 
  Database, Copy, Check, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, 
  Server, Key, HardDrive, Trash2, Terminal, Info, ExternalLink
} from 'lucide-react';

interface SettingsViewProps {
  onDataReset: () => Promise<void>;
  patientCount: number;
  appointmentCount: number;
}

const SQL_SCHEMA_CONTENT = `-- ==============================================================================
-- CareTrack – Patient Management System
-- College Mini Web Application Activity: CRUD-Based Web Application
-- Database Schema for Supabase / PostgreSQL
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Patients Table
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

-- 3. Create Appointments Table (Relational: Belongs to a Patient)
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

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients (full_name);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);

-- 5. Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on patients" ON patients;
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on appointments" ON appointments;
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  onDataReset,
  patientCount,
  appointmentCount,
}) => {
  const { showToast } = useToast();

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableFound?: boolean } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);
  }, []);

  const handleSaveConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    showToast('success', 'Configuration Saved', 'Supabase credentials have been updated.');
    handleTest();
  };

  const handleClearConfig = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult(null);
    showToast('info', 'Credentials Cleared', 'Switched to local persistent demo mode.');
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(supabaseUrl, supabaseKey);
      setTestResult(res);
      if (res.success) {
        showToast('success', 'Connection Established', res.message);
      } else {
        showToast('error', 'Connection Failed', res.message);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setIsCopied(true);
    showToast('info', 'SQL Copied', 'Paste this script directly into your Supabase SQL Editor.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await dataService.seedDemoData('all');
      await onDataReset();
      if (res.success) {
        showToast('success', 'Sample Data Seeded', res.message);
      } else {
        showToast('warning', 'Partial Seeding', res.message);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFullReset = async () => {
    if (window.confirm('Reset all patients and appointments back to original sample records?')) {
      await dataService.resetAllData();
      await onDataReset();
      showToast('info', 'Reset Complete', 'Database restored to initial state.');
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings &amp; Database</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure Supabase integration, review database tables &amp; schemas, and manage demonstration data.
        </p>
      </div>

      {/* Connection Status Banner */}
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
                {isConfigured ? 'Supabase Live Connected' : 'Local Storage Mode Active'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {isConfigured ? 'Live Cloud Database' : 'Zero-Config Local'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isConfigured
                ? 'CRUD calls directly query and modify your Supabase PostgreSQL database.'
                : 'Runs instantly with zero setup using browser persistent storage. Connect Supabase below anytime.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700">
            Records: <strong>{patientCount}</strong> Patients, <strong>{appointmentCount}</strong> Appointments
          </span>
        </div>
      </div>

      {/* Supabase Configuration Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase Project Credentials</h2>
              <p className="text-xs text-slate-500">Provide your Supabase URL &amp; public anon key</p>
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

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (<code className="font-mono text-[11px] text-teal-700">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              id="settings-supabase-url"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon / Public API Key (<code className="font-mono text-[11px] text-teal-700">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="password"
              id="settings-supabase-key"
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        {/* Test Connection Output */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold">{testResult.success ? 'Success: ' : 'Error: '}</span>
              {testResult.message}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearConfig}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Clear Credentials
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="test-connection-btn"
              onClick={handleTest}
              disabled={isTesting || !supabaseUrl}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              id="save-connection-btn"
              onClick={handleSaveConfig}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </div>

      {/* SQL Schema Generator (Section 5 of prompt) */}
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

        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Tip for Evaluator / Student:</strong> Go to your Supabase project &gt; <strong>SQL Editor</strong> &gt; <strong>New query</strong> &gt; paste this script &gt; Click <strong>Run</strong>. Then click &quot;Seed Sample Data&quot; below to populate your tables.
        </p>
      </div>

      {/* Sample Data & Reset Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Demonstration Data Seeding</h2>
            <p className="text-xs text-slate-500">Easily reset or populate fictional healthcare test records</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Seed Fictional Patients &amp; Appointments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inserts 6 fictional patient profiles and 7 scheduled/completed appointments with realistic medical conditions.
            </p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Sample Records'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/40 border border-rose-100">
          <div>
            <h3 className="text-xs font-bold text-rose-900">Reset Local Database</h3>
            <p className="text-xs text-rose-700/80 mt-0.5">
              Clears temporary cache and restores initial demo state.
            </p>
          </div>
          <button
            onClick={handleFullReset}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

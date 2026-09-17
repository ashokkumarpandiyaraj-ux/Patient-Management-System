import React from 'react';
import { ActiveTab } from '../../types';
import { X, CheckCircle2, Database, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface CrudGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onTriggerAddPatient: () => void;
  onTriggerAddAppointment: () => void;
}

export const CrudGuideModal: React.FC<CrudGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerAddPatient,
  onTriggerAddAppointment,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="crud-evaluator-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="crud-evaluator-modal"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              College Activity Grading Rubric
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Mini Web Application – CRUD Demonstration Guide
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              CareTrack verifies all four CRUD operations with relational patient-appointment integrity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* CREATE STEP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">CREATE: Add New Patient & Appointment</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('patients');
                  onTriggerAddPatient();
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer"
              >
                Launch Form <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 ml-9">
              Click &quot;Add Patient&quot; or &quot;Add Appointment&quot;, fill the validated fields (name, blood group, emergency contact, reason). On submit, the record is immediately saved to the database and appears in the list.
            </p>
          </div>

          {/* READ STEP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">READ: Search, Filter, Sort & View Details</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('patients');
                }}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Go to Patients <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 ml-9">
              Search by name/ID in the search bar, filter by Blood Group (e.g. O+, A-), filter by Gender, sort alphabetically or by age, and click &quot;View&quot; on any card to see full medical records and appointments history.
            </p>
          </div>

          {/* UPDATE STEP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">UPDATE: Edit Existing Records</h3>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('appointments');
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                Go to Appointments <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 ml-9">
              Click the &quot;Edit&quot; button on any patient or appointment. The modal opens pre-filled with existing data. Modify phone, doctor, medical notes, or change appointment status to &quot;Completed&quot; or &quot;Cancelled&quot;.
            </p>
          </div>

          {/* DELETE STEP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-rose-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h3 className="font-semibold text-slate-900 text-sm">DELETE: Confirmation Dialog & Removal</h3>
              </div>
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                Safe Prompt
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 ml-9">
              Click the &quot;Delete&quot; trash icon on any record. A required confirmation modal protects against accidental deletions (&quot;Are you sure you want to delete this patient? This action cannot be undone.&quot;). Confirming permanently removes the record.
            </p>
          </div>

          {/* SUPABASE SQL & DATABASE ARCHITECTURE */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Supabase Database Schema & Architecture</span>
            </div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              CareTrack features a complete relational PostgreSQL schema (`patients` &amp; `appointments` with foreign keys, checks, indexes &amp; timestamps). Visit the <strong>Settings</strong> tab to view/copy the full SQL script or connect your Supabase project URL &amp; key!
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('settings');
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" /> View Supabase SQL Schema
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Got It, Start Testing
          </button>
        </div>
      </div>
    </div>
  );
};

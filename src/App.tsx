import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Patient, Appointment } from './types';
import { dataService, generateNextPatientId, generateNextAppointmentId } from './services/dataService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthPage } from './components/auth/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { PatientsView } from './components/patients/PatientsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { SettingsView } from './components/settings/SettingsView';
import { CrudGuideModal } from './components/common/CrudGuideModal';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { AppointmentFormModal } from './components/appointments/AppointmentFormModal';
import { AppointmentDetailModal } from './components/appointments/AppointmentDetailModal';

const CareTrackMain: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('patients');
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Global modal triggers
  const [isCrudGuideOpen, setIsCrudGuideOpen] = useState(false);

  // Global Add Patient Modal
  const [isGlobalAddPatientOpen, setIsGlobalAddPatientOpen] = useState(false);

  // Global Add Appointment Modal
  const [isGlobalAddAppointmentOpen, setIsGlobalAddAppointmentOpen] = useState(false);
  const [preselectedPatientForApt, setPreselectedPatientForApt] = useState<Patient | null>(null);

  // Global View/Detail Modals (e.g. when clicked from Dashboard)
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

  // Load all records from service
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [pts, apts] = await Promise.all([
        dataService.getPatients(),
        dataService.getAppointments(),
      ]);
      setPatients(pts);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load records:', err);
      showToast('error', 'Data Load Error', 'Could not retrieve data from database.');
    } finally {
      setIsLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // ============================================================================
  // PATIENT CRUD HANDLERS
  // ============================================================================
  const handleCreatePatient = async (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await dataService.createPatient(data);
      setPatients(prev => [created, ...prev]);
      showToast('success', 'Patient Created', `Patient ${created.full_name} (${created.patient_id}) has been registered.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create patient record';
      showToast('error', 'Create Failed', msg);
      throw err;
    }
  };

  const handleUpdatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const updated = await dataService.updatePatient(id, updates);
      setPatients(prev => prev.map(p => (p.id === id ? updated : p)));
      // Also update local appointments patient relation
      setAppointments(prev =>
        prev.map(a => (a.patient_id === id ? { ...a, patient: updated } : a))
      );
      showToast('success', 'Record Updated', `Information for ${updated.full_name} was saved successfully.`);
      if (detailPatient && detailPatient.id === id) {
        setDetailPatient(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update patient record';
      showToast('error', 'Update Failed', msg);
      throw err;
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      const patientToDelete = patients.find(p => p.id === id);
      await dataService.deletePatient(id);
      setPatients(prev => prev.filter(p => p.id !== id));
      setAppointments(prev => prev.filter(a => a.patient_id !== id));
      showToast('info', 'Patient Deleted', `Patient ${patientToDelete?.full_name || id} and associated appointments removed.`);
      if (detailPatient && detailPatient.id === id) {
        setDetailPatient(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete patient record';
      showToast('error', 'Delete Failed', msg);
      throw err;
    }
  };

  // ============================================================================
  // APPOINTMENT CRUD HANDLERS
  // ============================================================================
  const handleCreateAppointment = async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>) => {
    try {
      const created = await dataService.createAppointment(data);
      setAppointments(prev => [created, ...prev]);
      showToast('success', 'Appointment Scheduled', `Appointment ${created.appointment_id} scheduled for ${created.appointment_date}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not schedule appointment';
      showToast('error', 'Create Failed', msg);
      throw err;
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const updated = await dataService.updateAppointment(id, updates);
      setAppointments(prev => prev.map(a => (a.id === id ? updated : a)));
      showToast('success', 'Appointment Updated', `Appointment ${updated.appointment_id} modified successfully.`);
      if (detailAppointment && detailAppointment.id === id) {
        setDetailAppointment(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update appointment';
      showToast('error', 'Update Failed', msg);
      throw err;
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const aptToDelete = appointments.find(a => a.id === id);
      await dataService.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      showToast('info', 'Appointment Deleted', `Appointment ${aptToDelete?.appointment_id || id} removed from schedule.`);
      if (detailAppointment && detailAppointment.id === id) {
        setDetailAppointment(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not delete appointment';
      showToast('error', 'Delete Failed', msg);
      throw err;
    }
  };

  // Unauthenticated screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-slate-300">
          <div className="w-10 h-10 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Initializing CareTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const nextPatientId = generateNextPatientId(patients);
  const nextAppointmentId = generateNextAppointmentId(appointments);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Persistent Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        patientCount={patients.length}
        appointmentCount={appointments.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenAddPatient={() => setIsGlobalAddPatientOpen(true)}
          onOpenAddAppointment={() => {
            setPreselectedPatientForApt(null);
            setIsGlobalAddAppointmentOpen(true);
          }}
          onOpenCrudGuide={() => setIsCrudGuideOpen(true)}
          onNavigateTab={setActiveTab}
        />

        {/* Tab Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'patients' && (
            <PatientsView
              patients={patients}
              appointments={appointments}
              isLoading={isLoadingData}
              onRefresh={loadData}
              onCreatePatient={handleCreatePatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              nextSuggestedId={nextPatientId}
              onOpenBookAppointment={p => {
                setPreselectedPatientForApt(p);
                setIsGlobalAddAppointmentOpen(true);
              }}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              patients={patients}
              isLoading={isLoadingData}
              onRefresh={loadData}
              onCreateAppointment={handleCreateAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              nextSuggestedId={nextAppointmentId}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onDataReset={loadData}
              patientCount={patients.length}
              appointmentCount={appointments.length}
            />
          )}
        </main>
      </div>

      {/* GLOBAL MODALS (Accessible from any view or header) */}
      <CrudGuideModal
        isOpen={isCrudGuideOpen}
        onClose={() => setIsCrudGuideOpen(false)}
        onNavigateTab={setActiveTab}
        onTriggerAddPatient={() => setIsGlobalAddPatientOpen(true)}
        onTriggerAddAppointment={() => setIsGlobalAddAppointmentOpen(true)}
      />

      {/* Global Add Patient Modal */}
      <PatientFormModal
        isOpen={isGlobalAddPatientOpen}
        onClose={() => setIsGlobalAddPatientOpen(false)}
        onSubmit={handleCreatePatient}
        suggestedPatientId={nextPatientId}
      />

      {/* Global Add Appointment Modal */}
      <AppointmentFormModal
        isOpen={isGlobalAddAppointmentOpen}
        onClose={() => {
          setIsGlobalAddAppointmentOpen(false);
          setPreselectedPatientForApt(null);
        }}
        onSubmit={handleCreateAppointment}
        patients={patients}
        preselectedPatientId={preselectedPatientForApt ? preselectedPatientForApt.id : undefined}
        suggestedAppointmentId={nextAppointmentId}
      />

      {/* Patient Detail Modal (from dashboard click) */}
      <PatientDetailModal
        isOpen={Boolean(detailPatient)}
        onClose={() => setDetailPatient(null)}
        patient={detailPatient}
        appointments={appointments}
        onEdit={p => {
          setDetailPatient(null);
          setActiveTab('patients');
        }}
        onDelete={p => {
          handleDeletePatient(p.id);
          setDetailPatient(null);
        }}
        onBookAppointment={p => {
          setDetailPatient(null);
          setPreselectedPatientForApt(p);
          setIsGlobalAddAppointmentOpen(true);
        }}
      />

      {/* Appointment Detail Modal (from dashboard click) */}
      <AppointmentDetailModal
        isOpen={Boolean(detailAppointment)}
        onClose={() => setDetailAppointment(null)}
        appointment={detailAppointment}
        patient={detailAppointment ? patients.find(p => p.id === detailAppointment.patient_id) : null}
        onEdit={a => {
          setDetailAppointment(null);
          setActiveTab('appointments');
        }}
        onDelete={a => {
          handleDeleteAppointment(a.id);
          setDetailAppointment(null);
        }}
        onQuickStatusChange={async (id, status) => {
          await handleUpdateAppointment(id, { status });
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CareTrackMain />
      </AuthProvider>
    </ToastProvider>
  );
}

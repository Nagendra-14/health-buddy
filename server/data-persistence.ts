import fs from 'fs';
import path from 'path';

// Define the data directory
const DATA_DIR = path.join(__dirname, '../data');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.json');
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const PENDING_DOCTORS_FILE = path.join(DATA_DIR, 'pending-doctors.json');
const VISITS_FILE = path.join(DATA_DIR, 'visits.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const TESTS_FILE = path.join(DATA_DIR, 'tests.json');
const PRESCRIPTIONS_FILE = path.join(DATA_DIR, 'prescriptions.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data directory exists
function ensureDataDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log('Created data directory:', DATA_DIR);
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }
}

// Generic function to save data to a file
export function saveData(filename: string, data: any) {
  ensureDataDirectoryExists();
  
  try {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filename}:`, error);
    return false;
  }
}

// Generic function to load data from a file
export function loadData(filename: string, defaultData: any = []) {
  ensureDataDirectoryExists();
  
  try {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
    }
    return defaultData;
  } catch (error) {
    console.error(`Error loading data from ${filename}:`, error);
    return defaultData;
  }
}

// Specific functions for saving different types of data
export function saveDoctors(doctors: any[]) {
  return saveData(DOCTORS_FILE, doctors);
}

export function loadDoctors(defaultDoctors: any[] = []) {
  return loadData(DOCTORS_FILE, defaultDoctors);
}

export function savePendingDoctors(pendingDoctors: any[]) {
  return saveData(PENDING_DOCTORS_FILE, pendingDoctors);
}

export function loadPendingDoctors(defaultPendingDoctors: any[] = []) {
  return loadData(PENDING_DOCTORS_FILE, defaultPendingDoctors);
}

export function savePatients(patients: any[]) {
  return saveData(PATIENTS_FILE, patients);
}

export function loadPatients(defaultPatients: any[] = []) {
  return loadData(PATIENTS_FILE, defaultPatients);
}

export function saveVisits(visits: any[]) {
  return saveData(VISITS_FILE, visits);
}

export function loadVisits(defaultVisits: any[] = []) {
  return loadData(VISITS_FILE, defaultVisits);
}

export function saveAppointments(appointments: any[]) {
  return saveData(APPOINTMENTS_FILE, appointments);
}

export function loadAppointments(defaultAppointments: any[] = []) {
  return loadData(APPOINTMENTS_FILE, defaultAppointments);
}

export function saveTests(tests: any[]) {
  return saveData(TESTS_FILE, tests);
}

export function loadTests(defaultTests: any[] = []) {
  return loadData(TESTS_FILE, defaultTests);
}

export function savePrescriptions(prescriptions: any[]) {
  return saveData(PRESCRIPTIONS_FILE, prescriptions);
}

export function loadPrescriptions(defaultPrescriptions: any[] = []) {
  return loadData(PRESCRIPTIONS_FILE, defaultPrescriptions);
}

export function saveReports(reports: any[]) {
  return saveData(REPORTS_FILE, reports);
}

export function loadReports(defaultReports: any[] = []) {
  return loadData(REPORTS_FILE, defaultReports);
}
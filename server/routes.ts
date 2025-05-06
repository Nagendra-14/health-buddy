import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static HTML, CSS, and JS files for Health Buddy
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
  });
  
  app.get('/style.css', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../style.css'));
  });
  
  app.get('/script.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../script.js'));
  });
  
  // API routes for Health Buddy application
  
  // Define shared data structures for users
  // Create endpoints for user visits
  let userVisits: { userId: string; timestamp: string; }[] = [];
  
  // Store pending doctor registrations for admin verification
  let pendingDoctors: any[] = [];
  
  // Define all doctors
  const allDoctors = [
    { 
      id: 'D001', 
      name: 'Dr. Sarah Chen', 
      username: 'schen', 
      password: 'chen2025', 
      specialty: 'Internal Medicine',
      contact: '555-0001',
      availability: 'Mon-Fri, 9AM-5PM',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'D002', 
      name: 'Dr. James Wilson', 
      username: 'jwilson', 
      password: 'wilson2025', 
      specialty: 'Family Medicine',
      contact: '555-0002',
      availability: 'Mon-Thu, 8AM-4PM',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    }
  ];
  
  // Define all patients
  const allPatients = [
    { 
      id: 'P001', 
      name: 'John Smith', 
      username: 'jsmith', 
      password: 'smith2025', 
      doctorId: 'D001', 
      age: 45, 
      gender: 'Male', 
      contact: '555-1234', 
      medicalHistory: 'Hypertension, Diabetes',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P002', 
      name: 'Maria Garcia', 
      username: 'mgarcia', 
      password: 'garcia2025', 
      doctorId: 'D001', 
      age: 35, 
      gender: 'Female', 
      contact: '555-2345', 
      medicalHistory: 'Asthma',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P003', 
      name: 'David Johnson', 
      username: 'djohnson', 
      password: 'johnson2025', 
      doctorId: 'D001', 
      age: 52, 
      gender: 'Male', 
      contact: '555-3456', 
      medicalHistory: 'High cholesterol',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P004', 
      name: 'Sarah Williams', 
      username: 'swilliams', 
      password: 'williams2025', 
      doctorId: 'D001', 
      age: 29, 
      gender: 'Female', 
      contact: '555-4567', 
      medicalHistory: 'Migraine',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P005', 
      name: 'Michael Brown', 
      username: 'mbrown', 
      password: 'brown2025', 
      doctorId: 'D001', 
      age: 67, 
      gender: 'Male', 
      contact: '555-5678', 
      medicalHistory: 'Arthritis',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P006', 
      name: 'Emma Davis', 
      username: 'edavis', 
      password: 'davis2025', 
      doctorId: 'D002', 
      age: 31, 
      gender: 'Female', 
      contact: '555-6789', 
      medicalHistory: 'Anxiety disorder',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P007', 
      name: 'James Miller', 
      username: 'jmiller', 
      password: 'miller2025', 
      doctorId: 'D002', 
      age: 48, 
      gender: 'Male', 
      contact: '555-7890', 
      medicalHistory: 'GERD',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P008', 
      name: 'Sophia Wilson', 
      username: 'swilson', 
      password: 'wilson2025', 
      doctorId: 'D002', 
      age: 55, 
      gender: 'Female', 
      contact: '555-8901', 
      medicalHistory: 'Hypothyroidism',
      avatarUrl: 'https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P009', 
      name: 'Oliver Taylor', 
      username: 'otaylor', 
      password: 'taylor2025',
      doctorId: 'D002', 
      age: 42, 
      gender: 'Male', 
      contact: '555-9012', 
      medicalHistory: 'Depression',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      id: 'P010', 
      name: 'Ava Anderson', 
      username: 'aanderson', 
      password: 'anderson2025', 
      doctorId: 'D002', 
      age: 27, 
      gender: 'Female', 
      contact: '555-0123', 
      medicalHistory: 'Allergies',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    }
  ];

  // Get all appointments
  app.get('/api/appointments', (req, res) => {
    const doctorId = req.query.doctorId as string;
    const patientId = req.query.patientId as string;
    
    const allAppointments = [
      // Dr. Sarah Chen's appointments
      { 
        id: 'A001',
        patientName: 'John Smith', 
        patientId: 'P001',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        date: 'May 15, 2025', 
        time: '09:00 AM', 
        purpose: 'General Checkup', 
        status: 'Scheduled',
        notes: 'Annual wellness visit',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A002',
        patientName: 'Maria Garcia', 
        patientId: 'P002',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen', 
        date: 'May 15, 2025', 
        time: '10:15 AM', 
        purpose: 'Follow-up', 
        status: 'In Progress',
        notes: 'Follow up on asthma treatment',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A003',
        patientName: 'David Johnson', 
        patientId: 'P003',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen', 
        date: 'May 15, 2025', 
        time: '11:30 AM', 
        purpose: 'Consultation', 
        status: 'Scheduled',
        notes: 'Discussion about cholesterol management',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A004',
        patientName: 'Sarah Williams', 
        patientId: 'P004',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen', 
        date: 'May 14, 2025', 
        time: '02:00 PM', 
        purpose: 'Migraine Treatment', 
        status: 'Completed',
        notes: 'Discussed new migraine medication options',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A005',
        patientName: 'Michael Brown', 
        patientId: 'P005',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen', 
        date: 'May 14, 2025', 
        time: '03:30 PM', 
        purpose: 'Arthritis Management', 
        status: 'Completed',
        notes: 'Reviewed physical therapy progress',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      
      // Dr. James Wilson's appointments
      { 
        id: 'A006',
        patientName: 'Emma Davis', 
        patientId: 'P006',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 16, 2025', 
        time: '09:00 AM', 
        purpose: 'Anxiety Check-up', 
        status: 'Scheduled',
        notes: 'Monthly follow-up for anxiety management',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A007',
        patientName: 'James Miller', 
        patientId: 'P007',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 16, 2025', 
        time: '10:30 AM', 
        purpose: 'GERD Treatment', 
        status: 'Scheduled',
        notes: 'Evaluation of new medication effectiveness',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A008',
        patientName: 'Sophia Wilson', 
        patientId: 'P008',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 16, 2025', 
        time: '01:00 PM', 
        purpose: 'Thyroid Evaluation', 
        status: 'Scheduled',
        notes: 'Review latest thyroid panel results',
        avatar: 'https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A009',
        patientName: 'Oliver Taylor', 
        patientId: 'P009',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 14, 2025', 
        time: '11:00 AM', 
        purpose: 'Depression Treatment', 
        status: 'Completed',
        notes: 'Monthly mental health check-in',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A010',
        patientName: 'Ava Anderson', 
        patientId: 'P010',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 13, 2025', 
        time: '02:30 PM', 
        purpose: 'Allergy Test Results', 
        status: 'Completed',
        notes: 'Review of comprehensive allergy test panel',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      
      // Additional appointments
      { 
        id: 'A011',
        patientName: 'John Smith', 
        patientId: 'P001',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen', 
        date: 'May 22, 2025', 
        time: '10:00 AM', 
        purpose: 'Diabetes Management', 
        status: 'Scheduled',
        notes: 'Quarterly diabetes check-up',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'A012',
        patientName: 'Ava Anderson', 
        patientId: 'P010',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson', 
        date: 'May 27, 2025', 
        time: '11:15 AM', 
        purpose: 'Allergy Follow-up', 
        status: 'Scheduled',
        notes: 'Follow-up on allergy treatment plan',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ];
    
    // Filter appointments by doctorId if provided
    if (doctorId) {
      const filteredAppointments = allAppointments.filter(appointment => appointment.doctorId === doctorId);
      return res.json(filteredAppointments);
    }
    
    // Filter appointments by patientId if provided
    if (patientId) {
      const filteredAppointments = allAppointments.filter(appointment => appointment.patientId === patientId);
      return res.json(filteredAppointments);
    }
    
    // Return all appointments if no filters are provided
    res.json(allAppointments);
  });

  // Get doctors list
  app.get('/api/doctors', (req, res) => {
    // Return all doctors (including those that are verified from the pendingDoctors list)
    // Filter out unverified doctors
    const doctors = allDoctors.filter(doctor => doctor.verified !== false);
    res.json(doctors);
  });

  // Get patients list
  app.get('/api/patients', (req, res) => {
    const doctorId = req.query.doctorId as string;
    
    // If a doctorId is provided, filter patients by that doctor
    if (doctorId) {
      const filteredPatients = allPatients.filter(patient => patient.doctorId === doctorId);
      return res.json(filteredPatients);
    }
    
    // Otherwise return all patients
    res.json(allPatients);
  });
  
  // API endpoint to register a new doctor
  app.post('/api/register/doctor', (req, res) => {
    const { username, password, name, email, contact, specialty, license, availability } = req.body;
    
    // Check if username already exists
    const existingDoctor = allDoctors.find(doctor => doctor.username === username);
    if (existingDoctor) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Generate a new ID based on the highest existing ID
    const lastId = allDoctors.length > 0 
      ? parseInt(allDoctors[allDoctors.length - 1].id.substring(1))
      : 0;
    const newId = `D${String(lastId + 1).padStart(3, '0')}`;
    
    // Create new doctor object (starts as unverified)
    const newDoctor = {
      id: newId,
      name,
      username,
      password,
      specialty,
      license,
      contact,
      email,
      availability,
      verified: false,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    
    // Add to pending doctors list
    pendingDoctors.push(newDoctor);
    
    // Return success
    res.status(201).json({ message: 'Doctor registration submitted for verification', doctor: { ...newDoctor, password: undefined } });
  });
  
  // API endpoint to register a new patient
  app.post('/api/register/patient', (req, res) => {
    const { username, password, name, email, contact, age, gender, medicalHistory, doctorId } = req.body;
    
    // Check if username already exists
    const existingPatient = allPatients.find(patient => patient.username === username);
    if (existingPatient) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Generate a new ID based on the highest existing ID
    const lastId = allPatients.length > 0 
      ? parseInt(allPatients[allPatients.length - 1].id.substring(1))
      : 0;
    const newId = `P${String(lastId + 1).padStart(3, '0')}`;
    
    // Create new patient object
    const newPatient = {
      id: newId,
      name,
      username,
      password,
      email,
      contact,
      age,
      gender,
      medicalHistory: medicalHistory || '',
      doctorId: doctorId || null,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    
    // Add to patients list
    allPatients.push(newPatient);
    
    // Return success
    res.status(201).json({ message: 'Patient registered successfully', patient: { ...newPatient, password: undefined } });
  });
  
  // API endpoint to verify a doctor (admin only)
  app.put('/api/admin/verify-doctor/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    
    // Find doctor in pending list
    const pendingDoctorIndex = pendingDoctors.findIndex(doctor => doctor.id === doctorId);
    
    if (pendingDoctorIndex === -1) {
      return res.status(404).json({ message: 'Doctor not found in pending list' });
    }
    
    // Set as verified and move to active doctors list
    const verifiedDoctor = { ...pendingDoctors[pendingDoctorIndex], verified: true };
    allDoctors.push(verifiedDoctor);
    
    // Remove from pending list
    pendingDoctors.splice(pendingDoctorIndex, 1);
    
    res.status(200).json({ message: 'Doctor verified successfully', doctor: { ...verifiedDoctor, password: undefined } });
  });
  
  // API endpoint to get pending doctors (admin only)
  app.get('/api/admin/pending-doctors', (req, res) => {
    // Return pending doctors list (exclude passwords for security)
    const sanitizedPendingDoctors = pendingDoctors.map(doctor => {
      const { password, ...sanitizedDoctor } = doctor;
      return sanitizedDoctor;
    });
    
    res.json(sanitizedPendingDoctors);
  });
  
  // API endpoint to record a user visit
  app.post('/api/visits', (req, res) => {
    const { userId, timestamp } = req.body;
    
    // Add to visits list
    userVisits.push({ userId, timestamp });
    
    res.status(201).json({ message: 'Visit recorded successfully' });
  });
  
  // API endpoint to get user visits (can be filtered by userId and date range)
  app.get('/api/admin/visits', (req, res) => {
    const { userId, startDate, endDate } = req.query;
    
    let filteredVisits = [...userVisits];
    
    if (userId) {
      filteredVisits = filteredVisits.filter(visit => visit.userId === userId);
    }
    
    if (startDate) {
      const start = new Date(startDate as string);
      filteredVisits = filteredVisits.filter(visit => new Date(visit.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      filteredVisits = filteredVisits.filter(visit => new Date(visit.timestamp) <= end);
    }
    
    // Group visits by user for counting
    const visitCounts: Record<string, number> = {};
    filteredVisits.forEach(visit => {
      visitCounts[visit.userId] = (visitCounts[visit.userId] || 0) + 1;
    });
    
    res.json({
      visits: filteredVisits,
      totalVisits: filteredVisits.length,
      visitsByUser: visitCounts
    });
  });

  // Get available tests
  app.get('/api/tests', (req, res) => {
    res.json([
      { id: 'T001', name: 'Complete Blood Count', category: 'Blood Test', description: 'Measures different components of blood including red and white blood cells, hemoglobin, and platelets.' },
      { id: 'T002', name: 'Lipid Panel', category: 'Blood Test', description: 'Measures cholesterol and triglyceride levels to assess cardiovascular health.' },
      { id: 'T003', name: 'Basic Metabolic Panel', category: 'Blood Test', description: 'Measures glucose, electrolytes, calcium, and kidney function.' },
      { id: 'T004', name: 'Thyroid Function Tests', category: 'Blood Test', description: 'Measures thyroid hormones to assess thyroid function.' },
      { id: 'T005', name: 'Urinalysis', category: 'Urine Test', description: 'Analyzes urine for various substances to check kidney and liver function.' },
      { id: 'T006', name: 'Chest X-Ray', category: 'Imaging', description: 'Images of chest to examine heart, lungs, blood vessels, and bones.' },
      { id: 'T007', name: 'MRI', category: 'Imaging', description: 'Detailed images of organs and tissues using magnetic fields.' },
      { id: 'T008', name: 'CT Scan', category: 'Imaging', description: 'Detailed cross-sectional images of the body using X-rays.' },
      { id: 'T009', name: 'Allergy Test', category: 'Other', description: 'Identifies specific allergens causing reactions.' },
      { id: 'T010', name: 'ECG/EKG', category: 'Other', description: 'Records electrical activity of the heart.' },
      { id: 'T011', name: 'Colonoscopy', category: 'Procedure', description: 'Examination of the large intestine using a flexible camera.' },
      { id: 'T012', name: 'Endoscopy', category: 'Procedure', description: 'Examination of the upper digestive tract using a flexible camera.' },
      { id: 'T013', name: 'Ultrasound', category: 'Imaging', description: 'Images of internal organs using sound waves.' },
      { id: 'T014', name: 'Stress Test', category: 'Other', description: 'Evaluates heart function during physical activity.' },
      { id: 'T015', name: 'Psychological Assessment', category: 'Psychological', description: 'Evaluates mental health status and function.' }
    ]);
  });

  // Create a new test
  app.post('/api/tests', (req, res) => {
    const testData = req.body;
    // In a real app, we would save to database here
    res.status(201).json({ success: true, message: "Test created successfully", data: testData });
  });

  // Get all prescriptions
  app.get('/api/prescriptions', (req, res) => {
    const doctorId = req.query.doctorId as string;
    const patientId = req.query.patientId as string;
    
    const allPrescriptions = [
      // Dr. Sarah Chen's prescriptions
      {
        id: 'PRE001',
        patientId: 'P001',
        patientName: 'John Smith',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        medications: [
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', instructions: 'Take with meals' },
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', instructions: 'Take in the morning' }
        ],
        validFrom: 'Apr 15, 2025',
        validUntil: 'Jul 15, 2025',
        notes: 'Monitor blood glucose levels daily.'
      },
      {
        id: 'PRE002',
        patientId: 'P002',
        patientName: 'Maria Garcia',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        medications: [
          { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', instructions: 'Two puffs every 4-6 hours as needed for shortness of breath' },
          { name: 'Fluticasone Inhaler', dosage: '110mcg', frequency: 'Twice daily', instructions: 'Two puffs in the morning and evening' }
        ],
        validFrom: 'Apr 20, 2025',
        validUntil: 'Oct 20, 2025',
        notes: 'Use rescue inhaler before exercise if needed.'
      },
      {
        id: 'PRE003',
        patientId: 'P003',
        patientName: 'David Johnson',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        medications: [
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', instructions: 'Take at bedtime' }
        ],
        validFrom: 'May 1, 2025',
        validUntil: 'Nov 1, 2025',
        notes: 'Follow low cholesterol diet. Schedule lipid panel in 3 months.'
      },
      {
        id: 'PRE004',
        patientId: 'P004',
        patientName: 'Sarah Williams',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        medications: [
          { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', instructions: 'Take at onset of migraine, may repeat after 2 hours if needed' },
          { name: 'Propranolol', dosage: '40mg', frequency: 'Once daily', instructions: 'Take in the morning' }
        ],
        validFrom: 'Apr 10, 2025',
        validUntil: 'Oct 10, 2025',
        notes: 'Keep migraine diary. Avoid known triggers.'
      },
      {
        id: 'PRE005',
        patientId: 'P005',
        patientName: 'Michael Brown',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        medications: [
          { name: 'Meloxicam', dosage: '15mg', frequency: 'Once daily', instructions: 'Take with food' },
          { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed', instructions: 'Take up to 4 times daily for pain' }
        ],
        validFrom: 'Apr 25, 2025',
        validUntil: 'Jul 25, 2025',
        notes: 'Continue physical therapy exercises. Apply heat to affected joints.'
      },
      
      // Dr. James Wilson's prescriptions
      {
        id: 'PRE006',
        patientId: 'P006',
        patientName: 'Emma Davis',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson',
        medications: [
          { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily', instructions: 'Take in the morning' },
          { name: 'Lorazepam', dosage: '0.5mg', frequency: 'As needed', instructions: 'Take for acute anxiety, not more than twice daily' }
        ],
        validFrom: 'May 3, 2025',
        validUntil: 'Aug 3, 2025',
        notes: 'Continue weekly therapy sessions. Practice daily mindfulness exercises.'
      },
      {
        id: 'PRE007',
        patientId: 'P007',
        patientName: 'James Miller',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson',
        medications: [
          { name: 'Omeprazole', dosage: '40mg', frequency: 'Once daily', instructions: 'Take 30 minutes before breakfast' },
          { name: 'Sucralfate', dosage: '1g', frequency: 'Four times daily', instructions: 'Take on empty stomach, 1 hour before meals and at bedtime' }
        ],
        validFrom: 'Apr 28, 2025',
        validUntil: 'Jul 28, 2025',
        notes: 'Avoid spicy foods, alcohol, and caffeine. Elevate head of bed at night.'
      },
      {
        id: 'PRE008',
        patientId: 'P008',
        patientName: 'Sophia Wilson',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson',
        medications: [
          { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', instructions: 'Take on empty stomach, 30-60 minutes before breakfast' }
        ],
        validFrom: 'May 2, 2025',
        validUntil: 'Nov 2, 2025',
        notes: 'Check TSH and Free T4 in 6 weeks to assess dose.'
      },
      {
        id: 'PRE009',
        patientId: 'P009',
        patientName: 'Oliver Taylor',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson',
        medications: [
          { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', instructions: 'Take in the morning with food' }
        ],
        validFrom: 'May 1, 2025',
        validUntil: 'Aug 1, 2025',
        notes: 'Continue bi-weekly therapy sessions. Monitor for side effects.'
      },
      {
        id: 'PRE010',
        patientId: 'P010',
        patientName: 'Ava Anderson',
        doctorId: 'D002',
        doctorName: 'Dr. James Wilson',
        medications: [
          { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', instructions: 'Take in the evening' },
          { name: 'Fluticasone Nasal Spray', dosage: '50mcg', frequency: 'Once daily', instructions: 'One spray in each nostril daily' },
          { name: 'EpiPen', dosage: '0.3mg', frequency: 'As needed', instructions: 'Use in case of severe allergic reaction' }
        ],
        validFrom: 'Apr 27, 2025',
        validUntil: 'Oct 27, 2025',
        notes: 'Avoid known allergens. Carry EpiPen at all times due to peanut allergy.'
      }
    ];
    
    // Filter by doctor ID if provided
    if (doctorId) {
      const filteredPrescriptions = allPrescriptions.filter(prescription => prescription.doctorId === doctorId);
      return res.json(filteredPrescriptions);
    }
    
    // Filter by patient ID if provided
    if (patientId) {
      const filteredPrescriptions = allPrescriptions.filter(prescription => prescription.patientId === patientId);
      return res.json(filteredPrescriptions);
    }
    
    // Return all prescriptions if no filters provided
    res.json(allPrescriptions);
  });

  // Save a prescription
  app.post('/api/prescriptions', (req, res) => {
    const prescriptionData = req.body;
    // In a real app, we would save to database here
    res.status(201).json({ success: true, message: "Prescription saved successfully", data: prescriptionData });
  });

  // Get patient reports
  app.get('/api/reports', (req, res) => {
    const doctorId = req.query.doctorId as string;
    const patientId = req.query.patientId as string;
    
    const allReports = [
      // Dr. Sarah Chen's patient reports
      { 
        id: 'R001',
        name: 'Complete Blood Count', 
        category: 'Blood Test', 
        patientId: 'P001',
        patientName: 'John Smith', 
        doctorId: 'D001',
        date: 'May 1, 2025', 
        status: 'Normal', 
        summary: 'All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 7.5 k/uL, Platelets: 250 k/uL.',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R002',
        name: 'Lipid Panel', 
        category: 'Blood Test', 
        patientId: 'P002',
        patientName: 'Maria Garcia', 
        doctorId: 'D001',
        date: 'May 2, 2025', 
        status: 'Borderline', 
        summary: 'Total Cholesterol: 205 mg/dL (slightly elevated), LDL: 130 mg/dL (borderline), HDL: 45 mg/dL, Triglycerides: 150 mg/dL',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R003',
        name: 'Urinalysis', 
        category: 'Urine Test', 
        patientId: 'P003',
        patientName: 'David Johnson', 
        doctorId: 'D001',
        date: 'May 3, 2025', 
        status: 'Normal', 
        summary: 'Color: Yellow, Clarity: Clear, pH: 6.0, Protein: Negative, Glucose: Negative, Ketones: Negative',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R004',
        name: 'Chest X-Ray', 
        category: 'Imaging', 
        patientId: 'P004',
        patientName: 'Sarah Williams', 
        doctorId: 'D001',
        date: 'May 4, 2025', 
        status: 'Normal', 
        summary: 'No evidence of active disease. Heart size normal. Lungs clear. No pleural effusion.',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R005',
        name: 'Arthritis Panel', 
        category: 'Blood Test', 
        patientId: 'P005',
        patientName: 'Michael Brown', 
        doctorId: 'D001',
        date: 'May 5, 2025', 
        status: 'Abnormal', 
        summary: 'Rheumatoid Factor: Positive (75 IU/mL), ESR: 30 mm/hr (elevated), CRP: 15 mg/L (elevated)',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R006',
        name: 'Blood Glucose', 
        category: 'Blood Test', 
        patientId: 'P001',
        patientName: 'John Smith', 
        doctorId: 'D001',
        date: 'May 1, 2025', 
        status: 'Borderline', 
        summary: 'Fasting Blood Glucose: 115 mg/dL (borderline), HbA1c: 6.4% (pre-diabetic range)',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R007',
        name: 'MRI - Knee', 
        category: 'Imaging', 
        patientId: 'P005',
        patientName: 'Michael Brown', 
        doctorId: 'D001',
        date: 'Apr 20, 2025', 
        status: 'Abnormal', 
        summary: 'Moderate osteoarthritis. Mild joint effusion. No meniscal tear. Small Baker\'s cyst posterior.',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R008',
        name: 'Liver Function Test', 
        category: 'Blood Test', 
        patientId: 'P003',
        patientName: 'David Johnson', 
        doctorId: 'D001',
        date: 'Apr 25, 2025', 
        status: 'Normal', 
        summary: 'ALT: 25 U/L, AST: 22 U/L, Alkaline Phosphatase: 70 U/L, Total Bilirubin: 0.8 mg/dL',
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        id: 'R009',
        name: 'Allergy Test', 
        category: 'Other', 
        patientId: 'P001',
        patientName: 'John Smith', 
        doctorId: 'D001',
        date: 'Apr 15, 2025', 
        status: 'Pending', 
        summary: 'Testing for common environmental allergens including pollen, dust mites, mold, and pet dander.',
        orderedBy: 'Dr. Sarah Chen' 
      },
      
      // Dr. James Wilson's patient reports
      { 
        id: 'R010',
        name: 'Anxiety Assessment', 
        category: 'Psychological', 
        patientId: 'P006',
        patientName: 'Emma Davis', 
        doctorId: 'D002',
        date: 'May 3, 2025', 
        status: 'Abnormal', 
        summary: 'GAD-7 Score: 12 (Moderate anxiety). Patient reports difficulty with sleep, concentration, and persistent worry.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R011',
        name: 'Endoscopy', 
        category: 'Procedure', 
        patientId: 'P007',
        patientName: 'James Miller', 
        doctorId: 'D002',
        date: 'Apr 28, 2025', 
        status: 'Abnormal', 
        summary: 'Mild esophagitis and gastritis observed. Small hiatal hernia present. Biopsy taken for H. pylori testing.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R012',
        name: 'TSH, Free T4', 
        category: 'Blood Test', 
        patientId: 'P008',
        patientName: 'Sophia Wilson', 
        doctorId: 'D002',
        date: 'May 2, 2025', 
        status: 'Abnormal', 
        summary: 'TSH: 6.5 mIU/L (elevated), Free T4: 0.8 ng/dL (low normal). Results consistent with hypothyroidism.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R013',
        name: 'Depression Inventory', 
        category: 'Psychological', 
        patientId: 'P009',
        patientName: 'Oliver Taylor', 
        doctorId: 'D002',
        date: 'May 1, 2025', 
        status: 'Borderline', 
        summary: 'PHQ-9 Score: 10 (Moderate depression). Improvement from last visit (score 15). Medication appears to be helping.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R014',
        name: 'Allergy Panel - Comprehensive', 
        category: 'Blood Test', 
        patientId: 'P010',
        patientName: 'Ava Anderson', 
        doctorId: 'D002',
        date: 'Apr 25, 2025', 
        status: 'Abnormal', 
        summary: 'Positive IgE reactions to: Tree pollen (moderate), Dust mites (severe), Cat dander (moderate), Peanuts (mild).',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R015',
        name: 'Skin Prick Test', 
        category: 'Other', 
        patientId: 'P010',
        patientName: 'Ava Anderson', 
        doctorId: 'D002',
        date: 'Apr 27, 2025', 
        status: 'Abnormal', 
        summary: 'Positive reactions to multiple allergens. Strongest reactions to dust mites and tree pollen. Confirms blood test results.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R016',
        name: 'Sleep Study', 
        category: 'Other', 
        patientId: 'P006',
        patientName: 'Emma Davis', 
        doctorId: 'D002',
        date: 'Apr 15, 2025', 
        status: 'Normal', 
        summary: 'No evidence of sleep apnea. Normal sleep architecture. Sleep efficiency 87%. Sleep latency slightly prolonged at 25 minutes.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R017',
        name: 'Acid Reflux Monitoring', 
        category: 'Procedure', 
        patientId: 'P007',
        patientName: 'James Miller', 
        doctorId: 'D002',
        date: 'Apr 10, 2025', 
        status: 'Abnormal', 
        summary: 'DeMeester score 18.5 (elevated). Abnormal acid exposure in distal esophagus, consistent with GERD diagnosis.',
        orderedBy: 'Dr. James Wilson' 
      },
      { 
        id: 'R018',
        name: 'Vitamin D Level', 
        category: 'Blood Test', 
        patientId: 'P008',
        patientName: 'Sophia Wilson', 
        doctorId: 'D002',
        date: 'Apr 20, 2025', 
        status: 'Abnormal', 
        summary: 'Vitamin D (25-OH): 18 ng/mL (deficient). Recommend supplementation and follow-up testing in 3 months.',
        orderedBy: 'Dr. James Wilson' 
      }
    ];
    
    // Filter by doctor ID if provided
    if (doctorId) {
      const filteredReports = allReports.filter(report => report.doctorId === doctorId);
      return res.json(filteredReports);
    }
    
    // Filter by patient ID if provided
    if (patientId) {
      const filteredReports = allReports.filter(report => report.patientId === patientId);
      return res.json(filteredReports);
    }
    
    // Return all reports if no filters provided
    res.json(allReports);
  });

  const httpServer = createServer(app);

  return httpServer;
}

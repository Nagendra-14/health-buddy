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

  // Get patients list
  app.get('/api/patients', (req, res) => {
    const doctorId = req.query.doctorId as string;
    
    const allPatients = [
      { id: 'P001', name: 'John Smith', doctorId: 'D001', age: 45, gender: 'Male', contact: '555-1234', medicalHistory: 'Hypertension, Diabetes' },
      { id: 'P002', name: 'Maria Garcia', doctorId: 'D001', age: 38, gender: 'Female', contact: '555-2345', medicalHistory: 'Asthma' },
      { id: 'P003', name: 'David Johnson', doctorId: 'D001', age: 52, gender: 'Male', contact: '555-3456', medicalHistory: 'High cholesterol' },
      { id: 'P004', name: 'Sarah Williams', doctorId: 'D001', age: 29, gender: 'Female', contact: '555-4567', medicalHistory: 'Migraine' },
      { id: 'P005', name: 'Michael Brown', doctorId: 'D001', age: 61, gender: 'Male', contact: '555-5678', medicalHistory: 'Arthritis' },
      { id: 'P006', name: 'Emma Davis', doctorId: 'D002', age: 33, gender: 'Female', contact: '555-6789', medicalHistory: 'Anxiety' },
      { id: 'P007', name: 'James Miller', doctorId: 'D002', age: 47, gender: 'Male', contact: '555-7890', medicalHistory: 'GERD' },
      { id: 'P008', name: 'Sophia Wilson', doctorId: 'D002', age: 55, gender: 'Female', contact: '555-8901', medicalHistory: 'Hypothyroidism' },
      { id: 'P009', name: 'Oliver Taylor', doctorId: 'D002', age: 42, gender: 'Male', contact: '555-9012', medicalHistory: 'Depression' },
      { id: 'P010', name: 'Ava Anderson', doctorId: 'D002', age: 27, gender: 'Female', contact: '555-0123', medicalHistory: 'Allergies' }
    ];
    
    // If a doctorId is provided, filter patients by that doctor
    if (doctorId) {
      const filteredPatients = allPatients.filter(patient => patient.doctorId === doctorId);
      return res.json(filteredPatients);
    }
    
    // Otherwise return all patients
    res.json(allPatients);
  });

  // Create a new test
  app.post('/api/tests', (req, res) => {
    const testData = req.body;
    // In a real app, we would save to database here
    res.status(201).json({ success: true, message: "Test created successfully", data: testData });
  });

  // Save a prescription
  app.post('/api/prescriptions', (req, res) => {
    const prescriptionData = req.body;
    // In a real app, we would save to database here
    res.status(201).json({ success: true, message: "Prescription saved successfully", data: prescriptionData });
  });

  // Get patient reports
  app.get('/api/reports', (req, res) => {
    res.json([
      { 
        name: 'Complete Blood Count', 
        category: 'Blood Test', 
        patientName: 'John Smith', 
        date: 'Oct 15, 2023', 
        status: 'Normal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Lipid Panel', 
        category: 'Blood Test', 
        patientName: 'Maria Garcia', 
        date: 'Oct 14, 2023', 
        status: 'Borderline', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Urinalysis', 
        category: 'Urine Test', 
        patientName: 'David Johnson', 
        date: 'Oct 13, 2023', 
        status: 'Normal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Chest X-Ray', 
        category: 'Imaging', 
        patientName: 'Sarah Williams', 
        date: 'Oct 12, 2023', 
        status: 'Normal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Thyroid Function Test', 
        category: 'Blood Test', 
        patientName: 'Robert Brown', 
        date: 'Oct 11, 2023', 
        status: 'Abnormal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Blood Glucose', 
        category: 'Blood Test', 
        patientName: 'Jennifer Lee', 
        date: 'Oct 10, 2023', 
        status: 'Borderline', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'MRI - Knee', 
        category: 'Imaging', 
        patientName: 'Michael Chen', 
        date: 'Oct 9, 2023', 
        status: 'Abnormal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Liver Function Test', 
        category: 'Blood Test', 
        patientName: 'Elizabeth Taylor', 
        date: 'Oct 8, 2023', 
        status: 'Normal', 
        orderedBy: 'Dr. Sarah Chen' 
      },
      { 
        name: 'Allergy Test', 
        category: 'Other', 
        patientName: 'John Smith', 
        date: 'Oct 7, 2023', 
        status: 'Pending', 
        orderedBy: 'Dr. Sarah Chen' 
      }
    ]);
  });

  const httpServer = createServer(app);

  return httpServer;
}

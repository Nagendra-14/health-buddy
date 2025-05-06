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
    res.json([
      { 
        patientName: 'John Smith', 
        patientId: 'P001', 
        date: 'Oct 18, 2023', 
        time: '09:00 AM', 
        purpose: 'General Checkup', 
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Maria Garcia', 
        patientId: 'P002', 
        date: 'Oct 18, 2023', 
        time: '10:15 AM', 
        purpose: 'Follow-up', 
        status: 'In Progress',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'David Johnson', 
        patientId: 'P003', 
        date: 'Oct 18, 2023', 
        time: '11:30 AM', 
        purpose: 'Consultation', 
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Sarah Williams', 
        patientId: 'P004', 
        date: 'Oct 17, 2023', 
        time: '02:00 PM', 
        purpose: 'Annual Physical', 
        status: 'Completed',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Robert Brown', 
        patientId: 'P005', 
        date: 'Oct 17, 2023', 
        time: '03:30 PM', 
        purpose: 'Medication Review', 
        status: 'Completed',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Jennifer Lee', 
        patientId: 'P006', 
        date: 'Oct 16, 2023', 
        time: '10:00 AM', 
        purpose: 'Lab Results Review', 
        status: 'Cancelled',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Michael Chen', 
        patientId: 'P007', 
        date: 'Oct 19, 2023', 
        time: '09:30 AM', 
        purpose: 'Follow-up', 
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        patientName: 'Elizabeth Taylor', 
        patientId: 'P008', 
        date: 'Oct 19, 2023', 
        time: '11:00 AM', 
        purpose: 'New Patient Consultation', 
        status: 'Scheduled',
        avatar: 'https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
  });

  // Get patients list
  app.get('/api/patients', (req, res) => {
    res.json([
      { id: 'P001', name: 'John Smith' },
      { id: 'P002', name: 'Maria Garcia' },
      { id: 'P003', name: 'David Johnson' },
      { id: 'P004', name: 'Sarah Williams' },
      { id: 'P005', name: 'Robert Brown' },
      { id: 'P006', name: 'Jennifer Lee' },
      { id: 'P007', name: 'Michael Chen' },
      { id: 'P008', name: 'Elizabeth Taylor' }
    ]);
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

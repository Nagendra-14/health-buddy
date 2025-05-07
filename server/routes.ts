import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from '../db';
import { 
  doctors, patients, pendingDoctors, appointments, 
  tests, prescriptions, reports, userVisits 
} from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Get the directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define shared data structures for users that are not yet in database
// Create endpoints for user visits
let visitsData: { userId: string; timestamp: string; }[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database and load data
  try {
    // Check if tables exist and create them if needed
    await db.query.doctors.findMany();
    console.log('Database tables exist');
  } catch (error) {
    console.error('Error checking database tables, they may need to be created:', error);
    console.log('Running db:push to create tables...');
    // We'll handle this in the UI by showing a message
  }

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
  
  // Admin dashboard for viewing all data
  app.get('/admin', (req, res) => {
    // Check for admin auth in query params or session
    const adminAuth = req.query.key;
    const adminKey = 'health-buddy-2025'; // Simple admin key
    
    if (adminAuth === adminKey) {
      // Set a cookie for future access
      res.cookie('admin_auth', adminKey, { 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      res.sendFile(path.resolve(__dirname, '../admin.html'));
    } else if (req.cookies && req.cookies.admin_auth === adminKey) {
      // Already authenticated via cookie
      res.sendFile(path.resolve(__dirname, '../admin.html'));
    } else {
      // Show login page
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --primary: #1e88e5;
                    --primary-light: #bbdefb;
                    --primary-dark: #1565c0;
                    --gray-100: #f8f9fa;
                    --gray-800: #343a40;
                    --white: #ffffff;
                    --spacing-md: 1rem;
                    --spacing-lg: 1.5rem;
                    --spacing-xl: 2rem;
                    --border-radius: 0.5rem;
                    --shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                }
                body {
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
                    height: 100vh;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .login-container {
                    background-color: var(--white);
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-lg);
                    padding: var(--spacing-xl);
                    width: 100%;
                    max-width: 400px;
                }
                h1 {
                    text-align: center;
                    margin-bottom: var(--spacing-lg);
                    color: var(--gray-800);
                }
                .form-group {
                    margin-bottom: var(--spacing-lg);
                }
                label {
                    display: block;
                    margin-bottom: var(--spacing-md);
                    font-weight: 500;
                }
                input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 0.25rem;
                    font-size: 1rem;
                }
                button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: var(--primary);
                    color: var(--white);
                    border: none;
                    border-radius: 0.25rem;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--primary-dark);
                }
                .error {
                    color: #dc3545;
                    margin-top: var(--spacing-md);
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h1>Admin Login</h1>
                <form id="adminForm">
                    <div class="form-group">
                        <label for="adminKey">Admin Key</label>
                        <div style="position: relative;">
                            <input type="password" id="adminKey" name="key" placeholder="Enter your admin key" required>
                            <button type="button" id="togglePassword" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer;">
                                <i class="fas fa-eye" style="color: #777;"></i>
                            </button>
                        </div>
                    </div>
                    <button type="submit">Login</button>
                    ${req.query.error ? '<p class="error">Invalid admin key. Please try again.</p>' : ''}
                </form>
            </div>
            <script>
                document.getElementById('adminForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    const key = document.getElementById('adminKey').value;
                    window.location.href = '/admin?key=' + encodeURIComponent(key);
                });
                
                // Toggle password visibility
                document.getElementById('togglePassword').addEventListener('click', function() {
                    const passwordInput = document.getElementById('adminKey');
                    const icon = this.querySelector('i');
                    
                    // Toggle the input type between password and text
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        passwordInput.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                });
            </script>
        </body>
        </html>
      `);
    }
  });
  
  // ==========================================================
  // API routes for Health Buddy application using PostgreSQL
  // ==========================================================

  // Get all doctors
  app.get('/api/doctors', async (req, res) => {
    try {
      // Get all verified doctors from the database
      const allDoctors = await db.query.doctors.findMany({
        where: eq(doctors.verified, true)
      });
      res.json(allDoctors);
    } catch (error) {
      console.error('Error getting doctors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get pending doctors (admin only)
  app.get('/api/admin/pending-doctors', async (req, res) => {
    try {
      const pendingDocs = await db.query.pendingDoctors.findMany();
      res.json(pendingDocs);
    } catch (error) {
      console.error('Error getting pending doctors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get patients list
  app.get('/api/patients', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string;
      
      if (doctorId) {
        // If a doctorId is provided, filter patients by that doctor
        const filteredPatients = await db.query.patients.findMany({
          where: eq(patients.doctorId, doctorId)
        });
        return res.json(filteredPatients);
      }
      
      // Otherwise return all patients
      const allPatients = await db.query.patients.findMany();
      res.json(allPatients);
    } catch (error) {
      console.error('Error getting patients:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // API endpoint to register a new doctor
  app.post('/api/register/doctor', async (req, res) => {
    try {
      const { username, password, name, email, contact, specialty, license, availability } = req.body;
      
      // Check if username already exists
      const existingDoctor = await db.query.doctors.findFirst({
        where: eq(doctors.username, username)
      });
      
      if (existingDoctor) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Generate a new ID based on the highest existing ID
      const allDoctorsResult = await db.query.doctors.findMany();
      const pendingDoctorsResult = await db.query.pendingDoctors.findMany();
      
      const allDoctorIds = [...allDoctorsResult, ...pendingDoctorsResult].map(d => 
        parseInt(d.id.substring(1)));
      const lastId = allDoctorIds.length > 0 ? Math.max(...allDoctorIds) : 0;
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
      await db.insert(pendingDoctors).values(newDoctor);
      
      // Return success
      res.status(201).json({ 
        message: 'Doctor registration submitted for verification', 
        doctor: { ...newDoctor, password: undefined } 
      });
    } catch (error) {
      console.error('Error registering doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // API endpoint to register a new patient
  app.post('/api/register/patient', async (req, res) => {
    try {
      const { username, password, name, email, contact, age, gender, medicalHistory, doctorId } = req.body;
      
      // Check if username already exists
      const existingPatient = await db.query.patients.findFirst({
        where: eq(patients.username, username)
      });
      
      if (existingPatient) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Generate a new ID based on the highest existing ID
      const allPatientsResult = await db.query.patients.findMany();
      const lastId = allPatientsResult.length > 0 
        ? parseInt(allPatientsResult[allPatientsResult.length - 1].id.substring(1))
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
      await db.insert(patients).values(newPatient);
      
      // Return success
      res.status(201).json({ 
        message: 'Patient registered successfully', 
        patient: { ...newPatient, password: undefined }
      });
    } catch (error) {
      console.error('Error registering patient:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // API endpoint to verify a doctor (admin only)
  app.put('/api/admin/verify-doctor/:doctorId', async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      // Find the doctor in pending doctors
      const pendingDoctor = await db.query.pendingDoctors.findFirst({
        where: eq(pendingDoctors.id, doctorId)
      });
      
      if (!pendingDoctor) {
        return res.status(404).json({ message: 'Doctor not found in pending list' });
      }
      
      // Insert into verified doctors
      await db.insert(doctors).values({
        ...pendingDoctor,
        verified: true
      });
      
      // Remove from pending doctors
      await db.delete(pendingDoctors).where(eq(pendingDoctors.id, doctorId));
      
      res.status(200).json({ message: 'Doctor verified successfully' });
    } catch (error) {
      console.error('Error verifying doctor:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Authenticate user
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password, userType } = req.body;
      
      if (userType === 'doctor') {
        // Find doctor by username
        const doctor = await db.query.doctors.findFirst({
          where: eq(doctors.username, username)
        });
        
        if (!doctor || doctor.password !== password) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Record this login
        await db.insert(userVisits).values({
          userId: doctor.id,
          timestamp: new Date()
        });
        
        // Return doctor with password removed
        const { password: _, ...doctorWithoutPassword } = doctor;
        return res.status(200).json(doctorWithoutPassword);
      } else if (userType === 'patient') {
        // Find patient by username
        const patient = await db.query.patients.findFirst({
          where: eq(patients.username, username)
        });
        
        if (!patient || patient.password !== password) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Record this login
        await db.insert(userVisits).values({
          userId: patient.id,
          timestamp: new Date()
        });
        
        // Return patient with password removed
        const { password: _, ...patientWithoutPassword } = patient;
        return res.status(200).json(patientWithoutPassword);
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get all appointments
  app.get('/api/appointments', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string;
      const patientId = req.query.patientId as string;
      const date = req.query.date as string;
      
      // Create query based on filters
      if (doctorId && date) {
        // Filter by both doctor and date
        const result = await db.query.appointments.findMany({
          where: and(
            eq(appointments.doctorId, doctorId),
            eq(appointments.date, date)
          )
        });
        return res.json(result);
      } else if (doctorId) {
        // Filter by doctor only
        const result = await db.query.appointments.findMany({
          where: eq(appointments.doctorId, doctorId)
        });
        return res.json(result);
      } else if (patientId && date) {
        // Filter by both patient and date
        const result = await db.query.appointments.findMany({
          where: and(
            eq(appointments.patientId, patientId),
            eq(appointments.date, date)
          )
        });
        return res.json(result);
      } else if (patientId) {
        // Filter by patient only
        const result = await db.query.appointments.findMany({
          where: eq(appointments.patientId, patientId)
        });
        return res.json(result);
      } else if (date) {
        // Filter by date only
        const result = await db.query.appointments.findMany({
          where: eq(appointments.date, date)
        });
        return res.json(result);
      } else {
        // Return all appointments if no filter is provided
        const result = await db.query.appointments.findMany();
        return res.json(result);
      }
      
      // This section is now handled by the code above
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get all prescriptions
  app.get('/api/prescriptions', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string;
      const patientId = req.query.patientId as string;
      
      console.log('Fetching prescriptions with filters:', { doctorId, patientId, currentUser: req.query.currentUser });
      
      let prescriptionsData;
      
      // Filter prescriptions by doctorId if provided
      if (doctorId) {
        console.log(`Finding prescriptions for doctor: ${doctorId}`);
        prescriptionsData = await db.query.prescriptions.findMany({
          where: eq(prescriptions.doctorId, doctorId)
        });
      } 
      // Filter prescriptions by patientId if provided
      else if (patientId) {
        console.log(`Finding prescriptions for patient: ${patientId}`);
        prescriptionsData = await db.query.prescriptions.findMany({
          where: eq(prescriptions.patientId, patientId)
        });
      }
      // Get all prescriptions if no filter is provided
      else {
        console.log('No filters provided, returning all prescriptions');
        prescriptionsData = await db.query.prescriptions.findMany();
      }
      
      console.log(`Found ${prescriptionsData.length} prescriptions`);
      
      // Parse medications from JSON string
      const results = prescriptionsData.map(prescription => {
        try {
          return {
            ...prescription,
            medications: prescription.medications ? JSON.parse(prescription.medications) : []
          };
        } catch (err) {
          console.error(`Error parsing medications for prescription ${prescription.id}:`, err);
          return {
            ...prescription,
            medications: [] // Default to empty array if parsing fails
          };
        }
      });
      
      res.json(results);
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      res.status(500).json({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Save a new prescription
  app.post('/api/prescriptions', async (req, res) => {
    try {
      console.log('Prescription data received:', req.body);
      let { patientId, patientName, doctorId, doctorName, diagnosis, medications, instructions, details } = req.body;
      
      // Ensure diagnosis is not null (required field)
      if (!diagnosis) {
        if (details) {
          diagnosis = details; // Use details as fallback
        } else {
          diagnosis = "General prescription"; // Default value
        }
      }
      
      // Find the highest existing ID
      const existingPrescriptions = await db.query.prescriptions.findMany();
      const lastId = existingPrescriptions.length > 0
        ? parseInt(existingPrescriptions[existingPrescriptions.length - 1].id.substring(3))
        : 0;
      const newId = `PRE${(lastId + 1).toString().padStart(3, '0')}`;
      
      // Ensure medications is stored as a JSON string
      let medicationsJson;
      if (typeof medications === 'string') {
        try {
          // Check if it's already a valid JSON string
          JSON.parse(medications);
          medicationsJson = medications;
        } catch (e) {
          // If it's not valid JSON, wrap it as a single item array
          medicationsJson = JSON.stringify([{
            name: medications,
            dosage: '',
            frequency: '',
            instructions: ''
          }]);
        }
      } else if (Array.isArray(medications)) {
        medicationsJson = JSON.stringify(medications);
      } else {
        medicationsJson = JSON.stringify([]);
      }
      
      // Create new prescription
      const newPrescription = {
        id: newId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        diagnosis,
        medications: medicationsJson,
        instructions
      };
      
      // Save to database
      await db.insert(prescriptions).values(newPrescription);
      
      // Return success with the created prescription
      res.status(201).json({ 
        message: 'Prescription created successfully',
        prescription: {
          ...newPrescription,
          medications: medications // Send back parsed medications
        }
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Update an existing prescription
  app.put('/api/prescriptions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { diagnosis, medications, instructions } = req.body;
      
      // Check if prescription exists
      const existingPrescription = await db.query.prescriptions.findFirst({
        where: eq(prescriptions.id, id)
      });
      
      if (!existingPrescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      
      // Ensure medications is stored as a JSON string
      let medicationsJson;
      if (typeof medications === 'string') {
        try {
          // Check if it's already a valid JSON string
          JSON.parse(medications);
          medicationsJson = medications;
        } catch (e) {
          // If it's not valid JSON, wrap it as a single item array
          medicationsJson = JSON.stringify([{
            name: medications,
            dosage: '',
            frequency: '',
            instructions: ''
          }]);
        }
      } else if (Array.isArray(medications)) {
        medicationsJson = JSON.stringify(medications);
      } else {
        medicationsJson = JSON.stringify([]);
      }
      
      // Update prescription
      await db.update(prescriptions)
        .set({
          diagnosis,
          medications: medicationsJson,
          instructions
        })
        .where(eq(prescriptions.id, id));
      
      // Return success
      res.status(200).json({ message: 'Prescription updated successfully' });
    } catch (error) {
      console.error('Error updating prescription:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get all tests
  app.get('/api/tests', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string;
      const patientId = req.query.patientId as string;
      
      let testsData;
      
      // Filter tests by doctorId if provided
      if (doctorId) {
        testsData = await db.query.tests.findMany({
          where: eq(tests.doctorId, doctorId)
        });
      }
      // Filter tests by patientId if provided
      else if (patientId) {
        testsData = await db.query.tests.findMany({
          where: eq(tests.patientId, patientId)
        });
      }
      // Get all tests if no filter is provided
      else {
        testsData = await db.query.tests.findMany();
      }
      res.json(testsData);
    } catch (error) {
      console.error('Error getting tests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Create a new test
  app.post('/api/tests', async (req, res) => {
    try {
      let { patientId, patientName, doctorId, doctorName, testType, results, notes } = req.body;
      
      // Verify that the doctor exists
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.id, doctorId)
      });
      
      if (!doctor) {
        // If doctor doesn't exist, try getting the first verified doctor
        const firstDoctor = await db.query.doctors.findFirst({
          where: eq(doctors.verified, true)
        });
        
        if (!firstDoctor) {
          return res.status(400).json({ message: "No valid doctor found to assign the test" });
        }
        
        // Use this doctor instead
        console.log(`Doctor ID ${doctorId} not found. Using doctor ${firstDoctor.id} instead.`);
        doctorId = firstDoctor.id;
        doctorName = firstDoctor.name;
      }
      
      // Find the highest existing ID
      const existingTests = await db.query.tests.findMany();
      const lastId = existingTests.length > 0
        ? parseInt(existingTests[existingTests.length - 1].id.substring(1))
        : 0;
      const newId = `T${(lastId + 1).toString().padStart(3, '0')}`;
      
      // Create new test
      const newTest = {
        id: newId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        testType,
        testDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        results: results || '',
        status: results ? 'Completed' : 'Pending',
        notes: notes || ''
      };
      
      // Save to database
      await db.insert(tests).values(newTest);
      
      // Return success with the created test
      res.status(201).json({ 
        message: 'Test created successfully',
        test: newTest
      });
    } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Update an existing test
  app.put('/api/tests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { results, status, notes } = req.body;
      
      // Check if test exists
      const existingTest = await db.query.tests.findFirst({
        where: eq(tests.id, id)
      });
      
      if (!existingTest) {
        return res.status(404).json({ message: 'Test not found' });
      }
      
      // Update test
      await db.update(tests)
        .set({
          results,
          status,
          notes
        })
        .where(eq(tests.id, id));
      
      // Return success
      res.status(200).json({ message: 'Test updated successfully' });
    } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get all medical reports
  app.get('/api/reports', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string | undefined;
      const patientId = req.query.patientId as string | undefined;
      const category = req.query.category as string | undefined;
      
      // For debugging
      console.log('Reports API query params:', { doctorId, patientId, category });
      
      // Execute query with filters
      const reportsData = await db.query.reports.findMany({ 
        where: (reports, { eq, and }) => {
          const conditions = [];
          
          if (doctorId) {
            conditions.push(eq(reports.doctorId, doctorId));
          }
          
          if (patientId) {
            conditions.push(eq(reports.patientId, patientId));
          }
          
          if (category && category !== 'all') {
            conditions.push(eq(reports.category, category));
          }
          
          return conditions.length > 0 ? and(...conditions) : undefined;
        }
      });
      
      res.json(reportsData);
    } catch (error) {
      console.error('Error getting reports:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Create a new medical report
  app.post('/api/reports', async (req, res) => {
    try {
      const { patientId, patientName, doctorId, doctorName, category, title, content } = req.body;
      
      // Find the highest existing ID
      const existingReports = await db.query.reports.findMany();
      const lastId = existingReports.length > 0
        ? parseInt(existingReports[existingReports.length - 1].id.substring(1))
        : 0;
      const newId = `R${(lastId + 1).toString().padStart(3, '0')}`;
      
      // Create new report
      const newReport = {
        id: newId,
        patientId,
        patientName,
        doctorId,
        doctorName,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category,
        title,
        content
      };
      
      // Save to database
      await db.insert(reports).values(newReport);
      
      // Return success with the created report
      res.status(201).json({ 
        message: 'Report created successfully',
        report: newReport
      });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get available test types
  app.get('/api/test-types', (req, res) => {
    // Sample test types
    const testTypes = [
      'Blood Pressure',
      'Blood Test',
      'Cholesterol',
      'ECG',
      'A1C (Diabetes)',
      'Thyroid',
      'Liver Function',
      'Kidney Function',
      'Complete Blood Count',
      'Urinalysis',
      'Vision Test',
      'Hearing Test',
      'Lung Function',
      'Allergy Test',
      'COVID-19 Test'
    ];
    
    res.json(testTypes);
  });
  
  // Add endpoint for creating appointments
  app.post('/api/appointments', async (req, res) => {
    try {
      const { patientId, doctorId, date, time, purpose, notes, status } = req.body;
      
      // Validate time format (should be in HH:MM format)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        return res.status(400).json({ 
          message: 'Invalid time format. Time should be in HH:MM format (24-hour)' 
        });
      }
      
      // Function to get 30-minute time slot from appointment time
      const getTimeSlot = (appointmentTime: string): string => {
        const [hours, minutes] = appointmentTime.split(':').map(Number);
        // Return the slot start time (each slot is 30 minutes)
        const slotMinute = minutes < 30 ? 0 : 30;
        return `${hours.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      };
      
      // Get the time slot for the new appointment
      const newAppointmentSlot = getTimeSlot(time);
      
      // Check for conflicting appointments (same doctor, same date, same time)
      const doctorAppointments = await db.query.appointments.findMany({
        where: and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date)
        )
      });
      
      // Organize doctor's appointments by time slot
      const doctorTimeSlots = new Map();
      
      // Map existing appointments to 30-minute slots
      doctorAppointments.forEach(app => {
        // Skip cancelled appointments
        if (app.status === 'Cancelled') return;
        
        const timeSlot = getTimeSlot(app.time);
        doctorTimeSlots.set(timeSlot, app);
      });
      
      // Check if the doctor's time slot is already booked
      if (doctorTimeSlots.has(newAppointmentSlot)) {
        const conflictingAppointment = doctorTimeSlots.get(newAppointmentSlot);
        return res.status(409).json({ 
          message: `The doctor already has an appointment at this time with ${conflictingAppointment.patientName}. Please select a different time.`,
          conflictingAppointment: {
            time: conflictingAppointment.time,
            patientName: conflictingAppointment.patientName
          }
        });
      }
      
      // ALSO check if the patient already has an appointment at this time
      const patientAppointments = await db.query.appointments.findMany({
        where: and(
          eq(appointments.patientId, patientId),
          eq(appointments.date, date)
        )
      });
      
      // Organize patient's appointments by time slot
      const patientTimeSlots = new Map();
      
      // Map existing patient appointments to 30-minute slots
      patientAppointments.forEach(app => {
        // Skip cancelled appointments
        if (app.status === 'Cancelled') return;
        
        const timeSlot = getTimeSlot(app.time);
        patientTimeSlots.set(timeSlot, app);
      });
      
      // Check if the patient already has an appointment at this time
      if (patientTimeSlots.has(newAppointmentSlot)) {
        const conflictingAppointment = patientTimeSlots.get(newAppointmentSlot);
        return res.status(409).json({ 
          message: `You already have an appointment at this time with Dr. ${conflictingAppointment.doctorName}. Please select a different time.`,
          conflictingAppointment: {
            time: conflictingAppointment.time,
            doctorName: conflictingAppointment.doctorName
          }
        });
      }
      
      // Generate a new ID based on the highest existing ID
      const allAppointmentsResult = await db.query.appointments.findMany();
      const lastId = allAppointmentsResult.length > 0 
        ? parseInt(allAppointmentsResult[allAppointmentsResult.length - 1].id.substring(1))
        : 0;
      const newId = `A${String(lastId + 1).padStart(3, '0')}`;
      
      // Get patient and doctor names
      const patient = await db.query.patients.findFirst({
        where: eq(patients.id, patientId)
      });
      
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.id, doctorId)
      });
      
      if (!patient || !doctor) {
        return res.status(400).json({ message: 'Invalid patient or doctor ID' });
      }
      
      // Create new appointment - standardize time to MM:30 or MM:00 format
      const standardizedTime = time.replace(timeRegex, (match: string, hour: string, minute: string) => {
        const mins = parseInt(minute) < 30 ? '00' : '30';
        return `${hour.padStart(2, '0')}:${mins}`;
      });
      
      const newAppointment = {
        id: newId,
        patientId,
        patientName: patient.name,
        doctorId,
        doctorName: doctor.name,
        date,
        time: standardizedTime,
        purpose: purpose || 'General Consultation',
        notes: notes || '',
        status: status || 'Scheduled',
        createdAt: new Date()
      };
      
      // Add to appointments
      await db.insert(appointments).values(newAppointment);
      
      // Return success
      res.status(201).json({
        message: 'Appointment created successfully',
        appointment: newAppointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Record user visit for analytics
  app.post('/api/visits', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
      
      // Add visit to database
      await db.insert(userVisits).values({
        userId,
        timestamp: new Date()
      });
      
      res.status(201).json({ message: 'Visit recorded successfully' });
    } catch (error) {
      console.error('Error recording visit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get user visits for analytics
  app.get('/api/admin/visits', async (req, res) => {
    try {
      // Get all visits from database
      const visitsData = await db.query.userVisits.findMany();
      
      // Calculate statistics
      const totalVisits = visitsData.length;
      
      // Count visits by user
      const visitsByUser: {[key: string]: number} = {};
      visitsData.forEach(visit => {
        visitsByUser[visit.userId] = (visitsByUser[visit.userId] || 0) + 1;
      });
      
      res.json({
        visits: visitsData,
        totalVisits,
        visitsByUser
      });
    } catch (error) {
      console.error('Error getting visits:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
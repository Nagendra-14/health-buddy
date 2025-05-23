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
import { eq, and, desc, sql, ne } from 'drizzle-orm';

// Get the directory name from the file URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define shared data structures for users that are not yet in database
// Create endpoints for user visits
let visitsData: { userId: string; timestamp: string; }[] = [];

import { pendingReceptionists, pendingLabTechnicians, receptionists, labTechnicians } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database and load data
    // Initialize database and load data
  try {
    // Check if tables exist and create them if needed
    await db.query.doctors.findMany();
    console.log('Database tables exist');
  } catch (error) {
    console.error('Error checking database tables, they may need to be created:', error);
    console.log('Running db:push to create tables...');
    
    // Automatically create tables if they don't exist
    try {
      // Create doctors table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS doctors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          specialty TEXT NOT NULL,
          license TEXT,
          contact TEXT,
          email TEXT,
          availability TEXT,
          verified BOOLEAN DEFAULT FALSE,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create patients table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          doctor_id TEXT REFERENCES doctors(id),
          age INTEGER,
          gender TEXT,
          contact TEXT,
          email TEXT,
          medical_history TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create receptionists table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS receptionists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          contact TEXT,
          email TEXT,
          department TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create lab_technicians table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS lab_technicians (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          specialization TEXT,
          contact TEXT,
          email TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create pending_doctors table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pending_doctors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          specialty TEXT NOT NULL,
          license TEXT,
          contact TEXT,
          email TEXT,
          availability TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create pending_receptionists table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pending_receptionists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          contact TEXT,
          email TEXT,
          department TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create pending_lab_technicians table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pending_lab_technicians (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          specialization TEXT,
          contact TEXT,
          email TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create appointments table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL REFERENCES patients(id),
          patient_name TEXT NOT NULL,
          doctor_id TEXT NOT NULL REFERENCES doctors(id),
          doctor_name TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          purpose TEXT NOT NULL,
          status TEXT NOT NULL,
          notes TEXT,
          avatar TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create tests table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS tests (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL REFERENCES patients(id),
          patient_name TEXT NOT NULL,
          doctor_id TEXT NOT NULL REFERENCES doctors(id),
          doctor_name TEXT NOT NULL,
          test_type TEXT NOT NULL,
          test_date TEXT NOT NULL,
          results TEXT,
          status TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create prescriptions table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS prescriptions (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL REFERENCES patients(id),
          patient_name TEXT NOT NULL,
          doctor_id TEXT NOT NULL REFERENCES doctors(id),
          doctor_name TEXT NOT NULL,
          date TEXT NOT NULL,
          diagnosis TEXT NOT NULL,
          medications TEXT NOT NULL,
          instructions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create reports table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL REFERENCES patients(id),
          patient_name TEXT NOT NULL,
          doctor_id TEXT NOT NULL REFERENCES doctors(id),
          doctor_name TEXT NOT NULL,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      // Create user_visits table for analytics
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user_visits (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
      
      console.log('Database tables created successfully');
    } catch (createError) {
      console.error('Error creating database tables:', createError);
      // We'll continue and let the app try to operate
    }
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
  
  // Serve user-role-functions.js
  app.get('/user-role-functions.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../user-role-functions.js'));
  });
  
  // Ensure all static assets for Health Buddy are explicitly routed
  app.use('/assets', (req, res, next) => {
    const filePath = path.resolve(__dirname, `../assets${req.path}`);
    // Check if file exists and serve it
    if (require('fs').existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
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
  
  // Get pending receptionists (admin only)
  app.get('/api/admin/pending-receptionists', async (req, res) => {
    try {
      const pendingReceptionists = await db.query.pendingReceptionists.findMany();
      res.json(pendingReceptionists);
    } catch (error) {
      console.error('Error getting pending receptionists:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get pending lab technicians (admin only)
  app.get('/api/admin/pending-lab-technicians', async (req, res) => {
    try {
      const pendingLabTechnicians = await db.query.pendingLabTechnicians.findMany();
      res.json(pendingLabTechnicians);
    } catch (error) {
      console.error('Error getting pending lab technicians:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get receptionists (admin only)
  app.get('/api/admin/receptionists', async (req, res) => {
    try {
      const allReceptionists = await db.query.receptionists.findMany();
      res.json(allReceptionists);
    } catch (error) {
      console.error('Error getting receptionists:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Get lab technicians (admin only)
  app.get('/api/admin/lab-technicians', async (req, res) => {
    try {
      const allLabTechnicians = await db.query.labTechnicians.findMany();
      res.json(allLabTechnicians);
    } catch (error) {
      console.error('Error getting lab technicians:', error);
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
        avatar_Url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
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
        avatar_Url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
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
  
  // API endpoint to register a new receptionist (pending verification)
  app.post('/api/register/receptionist', async (req, res) => {
    try {
      const { username, password, name, email, contact, department } = req.body;
      
      // Check if username already exists
      const existingReceptionist = await db.query.receptionists.findFirst({
        where: eq(receptionists.username, username)
      });
      
      // Also check pending receptionists
      const existingPendingReceptionist = await db.query.pendingReceptionists.findFirst({
        where: eq(pendingReceptionists.username, username)
      });
      
      if (existingReceptionist || existingPendingReceptionist) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Generate a new ID based on the highest existing ID
      const allReceptionistsResult = await db.query.receptionists.findMany();
      const pendingReceptionistsResult = await db.query.pendingReceptionists.findMany();
      
      // Extract IDs and find the highest one
      const allReceptionistIds = [...allReceptionistsResult, ...pendingReceptionistsResult]
        .map(r => parseInt(r.id.substring(1)))
        .filter(id => !isNaN(id));
      
      const lastId = allReceptionistIds.length > 0 ? Math.max(...allReceptionistIds) : 0;
      const newId = `R${String(lastId + 1).padStart(3, '0')}`;
      
      // Create new receptionist object
      const newReceptionist = {
        id: newId,
        name,
        username,
        password,
        department,
        contact,
        email,
        avatar_Url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      
      // Add to pending receptionists list
      await db.insert(pendingReceptionists).values(newReceptionist);
      
      // Return success
      res.status(201).json({ 
        message: 'Receptionist registration submitted for verification', 
        receptionist: { ...newReceptionist, password: undefined } 
      });
    } catch (error) {
      console.error('Error registering receptionist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // API endpoint to register a new lab technician (pending verification)
  app.post('/api/register/labTechnician', async (req, res) => {
    try {
      const { username, password, name, email, contact, specialization } = req.body;
      
      // Check if username already exists
      const existingLabTechnician = await db.query.labTechnicians.findFirst({
        where: eq(labTechnicians.username, username)
      });
      
      // Also check pending lab technicians
      const existingPendingLabTechnician = await db.query.pendingLabTechnicians.findFirst({
        where: eq(pendingLabTechnicians.username, username)
      });
      
      if (existingLabTechnician || existingPendingLabTechnician) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Generate a new ID based on the highest existing ID
      const allLabTechniciansResult = await db.query.labTechnicians.findMany();
      const pendingLabTechniciansResult = await db.query.pendingLabTechnicians.findMany();
      
      // Extract IDs and find the highest one
      const allLabTechnicianIds = [...allLabTechniciansResult, ...pendingLabTechniciansResult]
        .map(l => parseInt(l.id.substring(1)))
        .filter(id => !isNaN(id));
      
      const lastId = allLabTechnicianIds.length > 0 ? Math.max(...allLabTechnicianIds) : 0;
      const newId = `L${String(lastId + 1).padStart(3, '0')}`;
      
      // Create new lab technician object
      const newLabTechnician = {
        id: newId,
        name,
        username,
        password,
        specialization,
        contact,
        email,
        avatar_Url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      
      // Add to pending lab technicians list
      await db.insert(pendingLabTechnicians).values(newLabTechnician);
      
      // Return success
      res.status(201).json({ 
        message: 'Lab Technician registration submitted for verification', 
        labTechnician: { ...newLabTechnician, password: undefined } 
      });
    } catch (error) {
      console.error('Error registering lab technician:', error);
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
  
  // API endpoint to verify a receptionist (admin only)
  app.put('/api/admin/verify-receptionist/:receptionistId', async (req, res) => {
    try {
      const { receptionistId } = req.params;
      
      // Find the receptionist in pending list
      const pendingReceptionist = await db.query.pendingReceptionists.findFirst({
        where: eq(pendingReceptionists.id, receptionistId)
      });
      
      if (!pendingReceptionist) {
        return res.status(404).json({ message: 'Receptionist not found in pending list' });
      }
      
      // Insert into verified receptionists
      await db.insert(receptionists).values(pendingReceptionist);
      
      // Remove from pending receptionists
      await db.delete(pendingReceptionists).where(eq(pendingReceptionists.id, receptionistId));
      
      res.status(200).json({ message: 'Receptionist verified successfully' });
    } catch (error) {
      console.error('Error verifying receptionist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // API endpoint to verify a lab technician (admin only)
  app.put('/api/admin/verify-lab-technician/:labTechnicianId', async (req, res) => {
    try {
      const { labTechnicianId } = req.params;
      
      // Find the lab technician in pending list
      const pendingLabTechnician = await db.query.pendingLabTechnicians.findFirst({
        where: eq(pendingLabTechnicians.id, labTechnicianId)
      });
      
      if (!pendingLabTechnician) {
        return res.status(404).json({ message: 'Lab Technician not found in pending list' });
      }
      
      // Insert into verified lab technicians
      await db.insert(labTechnicians).values(pendingLabTechnician);
      
      // Remove from pending lab technicians
      await db.delete(pendingLabTechnicians).where(eq(pendingLabTechnicians.id, labTechnicianId));
      
      res.status(200).json({ message: 'Lab Technician verified successfully' });
    } catch (error) {
      console.error('Error verifying lab technician:', error);
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
      } else if (userType === 'receptionist') {
        // Find receptionist by username
        const receptionist = await db.query.receptionists.findFirst({
          where: eq(receptionists.username, username)
        });
        
        if (!receptionist || receptionist.password !== password) {
          // Check if it's in pending receptionists
          const pendingReceptionist = await db.query.pendingReceptionists.findFirst({
            where: eq(pendingReceptionists.username, username)
          });
          
          if (pendingReceptionist && pendingReceptionist.password === password) {
            return res.status(401).json({ message: 'Your account is pending verification by our administrators. Please check back later.' });
          }
          
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Record this login
        await db.insert(userVisits).values({
          userId: receptionist.id,
          timestamp: new Date()
        });
        
        // Return receptionist with password removed
        const { password: _, ...receptionistWithoutPassword } = receptionist;
        return res.status(200).json(receptionistWithoutPassword);
      } else if (userType === 'labTechnician') {
        // Find lab technician by username
        const labTechnician = await db.query.labTechnicians.findFirst({
          where: eq(labTechnicians.username, username)
        });
        
        if (!labTechnician || labTechnician.password !== password) {
          // Check if it's in pending lab technicians
          const pendingLabTechnician = await db.query.pendingLabTechnicians.findFirst({
            where: eq(pendingLabTechnicians.username, username)
          });
          
          if (pendingLabTechnician && pendingLabTechnician.password === password) {
            return res.status(401).json({ message: 'Your account is pending verification by our administrators. Please check back later.' });
          }
          
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        // Record this login
        await db.insert(userVisits).values({
          userId: labTechnician.id,
          timestamp: new Date()
        });
        
        // Return lab technician with password removed
        const { password: _, ...labTechnicianWithoutPassword } = labTechnician;
        return res.status(200).json(labTechnicianWithoutPassword);
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
      // Get the appointments based on filters
      let result;
      if (doctorId && date) {
        // Filter by both doctor and date
        result = await db.query.appointments.findMany({
          where: and(
            eq(appointments.doctorId, doctorId),
            eq(appointments.date, date)
          )
        });
      } else if (doctorId) {
        // Filter by doctor only
        result = await db.query.appointments.findMany({
          where: eq(appointments.doctorId, doctorId)
        });
      } else if (patientId && date) {
        // Filter by both patient and date
        result = await db.query.appointments.findMany({
          where: and(
            eq(appointments.patientId, patientId),
            eq(appointments.date, date)
          )
        });
      } else if (patientId) {
        // Filter by patient only
        result = await db.query.appointments.findMany({
          where: eq(appointments.patientId, patientId)
        });
      } else {
        // Get all appointments
        result = await db.query.appointments.findMany();
      }
      
      // Add flags for conflicting appointments (existing data)
      const appointmentsByDateAndTime: { [key: string]: { [key: string]: { [key: string]: any[] } } } = {};
      const doctorAppointmentsByDateAndTime: { [key: string]: { [key: string]: { [key: string]: any[] } } } = {};
      const patientAppointmentsByDateAndTime: { [key: string]: { [key: string]: { [key: string]: any[] } } } = {};
      
      // Group appointments by date, doctor, and time
      result.forEach(app => {
        // Skip cancelled appointments for conflict detection
        if (app.status === 'Cancelled') return;
        
        // For general appointments
        if (!appointmentsByDateAndTime[app.date]) {
          appointmentsByDateAndTime[app.date] = {};
        }
        
        if (!appointmentsByDateAndTime[app.date][app.doctorId]) {
          appointmentsByDateAndTime[app.date][app.doctorId] = {};
        }
        
        if (!appointmentsByDateAndTime[app.date][app.doctorId][app.time]) {
          appointmentsByDateAndTime[app.date][app.doctorId][app.time] = [];
        }
        
        appointmentsByDateAndTime[app.date][app.doctorId][app.time].push(app);
        
        // For doctor appointments
        if (!doctorAppointmentsByDateAndTime[app.date]) {
          doctorAppointmentsByDateAndTime[app.date] = {};
        }
        
        if (!doctorAppointmentsByDateAndTime[app.date][app.doctorId]) {
          doctorAppointmentsByDateAndTime[app.date][app.doctorId] = {};
        }
        
        if (!doctorAppointmentsByDateAndTime[app.date][app.doctorId][app.time]) {
          doctorAppointmentsByDateAndTime[app.date][app.doctorId][app.time] = [];
        }
        
        doctorAppointmentsByDateAndTime[app.date][app.doctorId][app.time].push(app);
        
        // For patient appointments
        if (!patientAppointmentsByDateAndTime[app.date]) {
          patientAppointmentsByDateAndTime[app.date] = {};
        }
        
        if (!patientAppointmentsByDateAndTime[app.date][app.patientId]) {
          patientAppointmentsByDateAndTime[app.date][app.patientId] = {};
        }
        
        if (!patientAppointmentsByDateAndTime[app.date][app.patientId][app.time]) {
          patientAppointmentsByDateAndTime[app.date][app.patientId][app.time] = [];
        }
        
        patientAppointmentsByDateAndTime[app.date][app.patientId][app.time].push(app);
      });
      
      // Add warning flag for conflicting appointments
      const resultWithWarnings = result.map(app => {
        // Skip cancelled appointments
        if (app.status === 'Cancelled') return app;
        
        // Check for doctor conflicts
        const doctorConflictCount = doctorAppointmentsByDateAndTime[app.date]?.[app.doctorId]?.[app.time]?.length || 0;
        
        // Check for patient conflicts
        const patientConflictCount = patientAppointmentsByDateAndTime[app.date]?.[app.patientId]?.[app.time]?.length || 0;
        
        // Flag conflicts
        const hasConflict = doctorConflictCount > 1 || patientConflictCount > 1;
        const conflictCount = Math.max(doctorConflictCount, patientConflictCount);
        
        // If there's a conflict, add warning flags
        if (hasConflict) {
          return { 
            ...app, 
            hasConflict: true,
            conflictCount: conflictCount,
            conflictType: doctorConflictCount > 1 ? (patientConflictCount > 1 ? 'both' : 'doctor') : 'patient'
          };
        }
        
        return app;
      });
      
      return res.json(resultWithWarnings);
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
  
  // Get available time slots for appointment scheduling
  app.get('/api/available-time-slots', async (req, res) => {
    try {
      const doctorId = req.query.doctorId as string;
      const date = req.query.date as string;
      const appointmentId = req.query.appointmentId as string; // Optional for excluding current appointment when editing
      
      if (!doctorId || !date) {
        return res.status(400).json({ message: 'doctorId and date are required parameters' });
      }
      
      // Get all appointments for the doctor on the requested date
      const doctorAppointments = await db.query.appointments.findMany({
        where: and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date)
        )
      });
      
      // Generate all possible 30-minute slots from 8:00 to 17:00
      const allTimeSlots = [];
      for (let hour = 8; hour < 17; hour++) {
        allTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allTimeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      
      // Find booked slots (filter out cancelled appointments and current appointment if editing)
      const bookedTimeSlots = doctorAppointments
        .filter(app => app.status !== 'Cancelled' && (!appointmentId || app.id !== appointmentId))
        .map(app => app.time);
      
      // Filter out booked slots
      const availableTimeSlots = allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
      
      res.json(availableTimeSlots);
    } catch (error) {
      console.error('Error getting available time slots:', error);
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
  
  // Update an existing appointment
  app.put('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, time, date, purpose } = req.body;

      // Check if appointment exists
      const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, id)
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // If time or date is being changed, check for conflicts
      if ((time && time !== appointment.time) || (date && date !== appointment.date)) {
        // New date and time values to check against
        const newDate = date || appointment.date;
        const newTime = time || appointment.time;
        
        // Check if the doctor already has an appointment at this time
        const existingDoctorAppointments = await db.query.appointments.findMany({
          where: and(
            eq(appointments.doctorId, appointment.doctorId),
            eq(appointments.date, newDate),
            eq(appointments.time, newTime),
            ne(appointments.id, id) // Exclude the current appointment
          )
        });
        
        // Check if the patient already has an appointment at this time
        const existingPatientAppointments = await db.query.appointments.findMany({
          where: and(
            eq(appointments.patientId, appointment.patientId),
            eq(appointments.date, newDate),
            eq(appointments.time, newTime),
            ne(appointments.id, id) // Exclude the current appointment
          )
        });
        
        // Handle conflicts
        if (existingDoctorAppointments.length > 0) {
          return res.status(409).json({ 
            message: 'Doctor already has an appointment at this time',
            conflict: 'doctor',
            existingAppointments: existingDoctorAppointments
          });
        }
        
        if (existingPatientAppointments.length > 0) {
          return res.status(409).json({ 
            message: 'Patient already has an appointment at this time',
            conflict: 'patient',
            existingAppointments: existingPatientAppointments
          });
        }
      }

      // Update appointment with all provided fields
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (time !== undefined) updateData.time = time;
      if (date !== undefined) updateData.date = date;
      if (purpose !== undefined) updateData.purpose = purpose;
      
      await db.update(appointments)
        .set(updateData)
        .where(eq(appointments.id, id));

      res.status(200).json({ 
        message: 'Appointment updated successfully',
        appointment: {
          ...appointment,
          ...updateData
        }
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Delete an appointment
  app.delete('/api/appointments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if appointment exists
      const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, id)
      });
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      // Delete the appointment
      await db.delete(appointments).where(eq(appointments.id, id));
      
      res.status(200).json({ 
        message: 'Appointment deleted successfully',
        appointment
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
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
  // Create test conflicts endpoint
  app.post('/api/create-test-conflicts', async (req, res) => {
    try {
      // Get the latest appointment ID
      const allAppointmentsResult = await db.query.appointments.findMany();
      let lastId = 10; // Default to A010
      
      if (allAppointmentsResult.length > 0) {
        const ids = allAppointmentsResult.map(a => {
          const num = parseInt(a.id.substring(1));
          return isNaN(num) ? 0 : num;
        });
        lastId = Math.max(...ids);
      }
      
      // Create two appointments with the same doctor and time
      const conflictDate = "2025-05-25"; // Future date
      const conflictTime = "10:00";
      
      const appointments1 = {
        id: `A${String(lastId + 1).padStart(3, '0')}`,
        patientId: "P001",
        patientName: "Priya Sharma",
        doctorId: "D002",
        doctorName: "Dr. Arvinder Singh",
        date: conflictDate,
        time: conflictTime,
        purpose: "Test Conflict 1",
        status: "Scheduled",
        notes: "First conflicting appointment",
        createdAt: new Date()
      };
      
      const appointments2 = {
        id: `A${String(lastId + 2).padStart(3, '0')}`,
        patientId: "P002",
        patientName: "Anil Kumar",
        doctorId: "D002",
        doctorName: "Dr. Arvinder Singh",
        date: conflictDate,
        time: conflictTime,
        purpose: "Test Conflict 2",
        status: "Scheduled",
        notes: "Second conflicting appointment",
        createdAt: new Date()
      };
      
      // Insert the conflicting appointments
      await db.insert(appointments).values(appointments1);
      await db.insert(appointments).values(appointments2);
      
      res.status(200).json({
        message: "Test conflicts created successfully",
        appointments: [appointments1, appointments2]
      });
    } catch (error) {
      console.error("Error creating test conflicts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}

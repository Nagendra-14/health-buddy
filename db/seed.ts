import { db } from './index';
import { 
  doctors, patients, pendingDoctors, appointments, 
  tests, prescriptions, reports, userVisits,
  receptionists, labTechnicians
} from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Starting database seeding...');

  try {
    // First check if we already have data
    const existingDoctors = await db.select().from(doctors);
    
    if (existingDoctors.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    // Seed doctors
    await db.insert(doctors).values([
      { 
        id: 'D001', 
        name: 'Dr. Sarah Chen', 
        username: 'schen', 
        password: 'chen2025', 
        specialty: 'Internal Medicine',
        contact: '555-0001',
        email: 'sarah.chen@example.com',
        availability: 'Mon-Fri, 9AM-5PM',
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'D002', 
        name: 'Dr. James Wilson', 
        username: 'jwilson', 
        password: 'wilson2025', 
        specialty: 'Family Medicine',
        contact: '555-0002',
        email: 'james.wilson@example.com',
        availability: 'Mon-Thu, 8AM-4PM',
        verified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
    console.log('Doctors seeded');

    // Seed pending doctors
    await db.insert(pendingDoctors).values([
      {
        id: 'D003',
        name: 'Dr. Nagendra',
        username: 'nagendra',
        password: 'nagendra2025',
        specialty: 'Cardiology',
        contact: '555-9999',
        email: 'nagendra@example.com',
        license: 'MED-12345',
        availability: 'Mon-Fri, 8AM-4PM',
        avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
    console.log('Pending doctors seeded');

    // Seed patients
    await db.insert(patients).values([
      { 
        id: 'P011',
        name: 'Test User',
        username: 'testuser',
        password: 'password123',
        doctorId: 'D001',
        age: 25,
        gender: 'Male',
        contact: '555-8888',
        email: 'test@example.com',
        medicalHistory: 'None',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      },
      { 
        id: 'P001', 
        name: 'John Smith', 
        username: 'jsmith', 
        password: 'smith2025', 
        doctorId: 'D001', 
        age: 45, 
        gender: 'Male', 
        contact: '555-1234', 
        email: 'john.smith@example.com',
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
        email: 'maria.garcia@example.com',
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
        email: 'david.johnson@example.com',
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
        email: 'sarah.williams@example.com',
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
        email: 'michael.brown@example.com',
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
        email: 'emma.davis@example.com',
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
        email: 'james.miller@example.com',
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
        email: 'sophia.wilson@example.com',
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
        email: 'oliver.taylor@example.com',
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
        email: 'ava.anderson@example.com',
        medicalHistory: 'Allergies',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
    console.log('Patients seeded');

    // Seed appointments
    await db.insert(appointments).values([
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
      }
    ]);
    console.log('Appointments seeded');

    // Sample prescription data
    await db.insert(prescriptions).values([
      {
        id: 'PRE001',
        patientId: 'P001',
        patientName: 'John Smith',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        date: 'May 10, 2025',
        diagnosis: 'Hypertension',
        medications: JSON.stringify([
          { name: 'Lisinopril', dosage: '10mg daily' },
          { name: 'Hydrochlorothiazide', dosage: '12.5mg daily' }
        ]),
        instructions: 'Take with food. Monitor blood pressure daily.'
      },
      {
        id: 'PRE002',
        patientId: 'P002',
        patientName: 'Maria Garcia',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        date: 'May 5, 2025',
        diagnosis: 'Asthma',
        medications: JSON.stringify([
          { name: 'Albuterol Inhaler', dosage: '2 puffs as needed' },
          { name: 'Fluticasone', dosage: '1 puff twice daily' }
        ]),
        instructions: 'Use albuterol before exercise. Keep track of frequency of use.'
      }
    ]);
    console.log('Prescriptions seeded');
    
    // Seed receptionists
    await db.insert(receptionists).values([
      {
        id: 'R001',
        name: 'Priya Sharma',
        username: 'psharma',
        password: 'sharma2025',
        contact: '555-7001',
        email: 'priya.sharma@example.com',
        department: 'Main Reception',
        avatar_url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
    console.log('Receptionists seeded');
    
    // Seed lab technicians
    await db.insert(labTechnicians).values([
      {
        id: 'L001',
        name: 'Arjun Patel',
        username: 'apatel',
        password: 'patel2025',
        specialization: 'Hematology',
        contact: '555-8001',
        email: 'arjun.patel@example.com',
        avatar_url: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
      }
    ]);
    console.log('Lab Technicians seeded');

    // Test data
    await db.insert(tests).values([
      {
        id: 'T001',
        patientId: 'P001',
        patientName: 'John Smith',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        testType: 'Blood Pressure',
        testDate: 'May 5, 2025',
        results: 'Systolic: 130, Diastolic: 85',
        status: 'Completed',
        notes: 'Slightly elevated, continue monitoring'
      },
      {
        id: 'T002',
        patientId: 'P002',
        patientName: 'Maria Garcia',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        testType: 'Lung Function',
        testDate: 'May 4, 2025',
        results: 'FEV1: 80% of predicted',
        status: 'Completed',
        notes: 'Shows improvement from previous test'
      }
    ]);
    console.log('Tests seeded');

    // Reports data
    await db.insert(reports).values([
      {
        id: 'R001',
        patientId: 'P001',
        patientName: 'John Smith',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        date: 'May 10, 2025',
        category: 'Lab Results',
        title: 'Cholesterol Panel',
        content: 'Total Cholesterol: 190 mg/dL\nHDL: 55 mg/dL\nLDL: 120 mg/dL\nTriglycerides: 150 mg/dL\n\nResults are within normal range. Continue current treatment plan.'
      },
      {
        id: 'R002',
        patientId: 'P002',
        patientName: 'Maria Garcia',
        doctorId: 'D001',
        doctorName: 'Dr. Sarah Chen',
        date: 'May 8, 2025',
        category: 'Radiology',
        title: 'Chest X-Ray',
        content: 'Findings: Clear lung fields with no evidence of infiltrates, effusions, or pneumothorax. Cardiac silhouette is within normal limits. No masses or nodules identified.\n\nImpression: Normal chest X-ray.'
      }
    ]);
    console.log('Reports seeded');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seeding completed, exiting process');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
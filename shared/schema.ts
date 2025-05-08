import { pgTable, serial, text, integer, timestamp, boolean, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Doctors table
export const doctors = pgTable('doctors', {
  id: text('id').primaryKey(), // Using the existing format like 'D001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  specialty: text('specialty').notNull(),
  license: text('license'),
  contact: text('contact'),
  email: text('email'),
  availability: text('availability'),
  verified: boolean('verified').default(false),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Patients table
export const patients = pgTable('patients', {
  id: text('id').primaryKey(), // Using the existing format like 'P001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  doctorId: text('doctor_id').references(() => doctors.id),
  age: integer('age'),
  gender: text('gender'),
  contact: text('contact'),
  email: text('email'),
  medicalHistory: text('medical_history'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Receptionists table
export const receptionists = pgTable('receptionists', {
  id: text('id').primaryKey(), // Using the format 'R001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  contact: text('contact'),
  email: text('email'),
  department: text('department'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Lab Technicians table
export const labTechnicians = pgTable('lab_technicians', {
  id: text('id').primaryKey(), // Using the format 'L001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(), 
  password: text('password').notNull(),
  specialization: text('specialization'),
  contact: text('contact'),
  email: text('email'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Pending doctors waiting for verification
export const pendingDoctors = pgTable('pending_doctors', {
  id: text('id').primaryKey(), // Using the existing format like 'D003'
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  specialty: text('specialty').notNull(),
  license: text('license'),
  contact: text('contact'),
  email: text('email'),
  availability: text('availability'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Pending receptionists waiting for verification
export const pendingReceptionists = pgTable('pending_receptionists', {
  id: text('id').primaryKey(), // Using the format 'R001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  contact: text('contact'),
  email: text('email'),
  department: text('department'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Pending lab technicians waiting for verification
export const pendingLabTechnicians = pgTable('pending_lab_technicians', {
  id: text('id').primaryKey(), // Using the format 'L001'
  name: text('name').notNull(),
  username: text('username').notNull().unique(), 
  password: text('password').notNull(),
  specialization: text('specialization'),
  contact: text('contact'),
  email: text('email'),
  avatar_Url: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(), // Using the existing format like 'A001'
  patientId: text('patient_id').references(() => patients.id).notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: text('doctor_id').references(() => doctors.id).notNull(),
  doctorName: text('doctor_name').notNull(),
  date: text('date').notNull(), // Keeping as text for format compatibility
  time: text('time').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Medical tests table
export const tests = pgTable('tests', {
  id: text('id').primaryKey(), // Using the existing format like 'T001'
  patientId: text('patient_id').references(() => patients.id).notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: text('doctor_id').references(() => doctors.id).notNull(),
  doctorName: text('doctor_name').notNull(),
  testType: text('test_type').notNull(),
  testDate: text('test_date').notNull(),
  results: text('results'),
  status: text('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(), // Using the existing format like 'PRE001'
  patientId: text('patient_id').references(() => patients.id).notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: text('doctor_id').references(() => doctors.id).notNull(),
  doctorName: text('doctor_name').notNull(),
  date: text('date').notNull(),
  diagnosis: text('diagnosis').notNull(),
  medications: text('medications').notNull(), // JSON string for medications array
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Medical reports table
export const reports = pgTable('reports', {
  id: text('id').primaryKey(), // Using the existing format like 'R001'
  patientId: text('patient_id').references(() => patients.id).notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: text('doctor_id').references(() => doctors.id).notNull(),
  doctorName: text('doctor_name').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// User visits for analytics
export const userVisits = pgTable('user_visits', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Define relations
export const doctorsRelations = relations(doctors, ({ many }) => ({
  patients: many(patients),
  appointments: many(appointments),
  tests: many(tests),
  prescriptions: many(prescriptions),
  reports: many(reports)
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [patients.doctorId],
    references: [doctors.id]
  }),
  appointments: many(appointments),
  tests: many(tests),
  prescriptions: many(prescriptions),
  reports: many(reports)
}));

// Define schemas for validation (used in API endpoints)
export const doctorInsertSchema = createInsertSchema(doctors);
export type DoctorInsert = z.infer<typeof doctorInsertSchema>;
export type Doctor = typeof doctors.$inferSelect;

export const patientInsertSchema = createInsertSchema(patients);
export type PatientInsert = z.infer<typeof patientInsertSchema>;
export type Patient = typeof patients.$inferSelect;

export const pendingDoctorInsertSchema = createInsertSchema(pendingDoctors);
export type PendingDoctorInsert = z.infer<typeof pendingDoctorInsertSchema>;
export type PendingDoctor = typeof pendingDoctors.$inferSelect;

export const appointmentInsertSchema = createInsertSchema(appointments);
export type AppointmentInsert = z.infer<typeof appointmentInsertSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const testInsertSchema = createInsertSchema(tests);
export type TestInsert = z.infer<typeof testInsertSchema>;
export type Test = typeof tests.$inferSelect;

export const prescriptionInsertSchema = createInsertSchema(prescriptions);
export type PrescriptionInsert = z.infer<typeof prescriptionInsertSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

export const reportInsertSchema = createInsertSchema(reports);
export type ReportInsert = z.infer<typeof reportInsertSchema>;
export type Report = typeof reports.$inferSelect;

export const userVisitInsertSchema = createInsertSchema(userVisits);
export type UserVisitInsert = z.infer<typeof userVisitInsertSchema>;
export type UserVisit = typeof userVisits.$inferSelect;

export const receptionistInsertSchema = createInsertSchema(receptionists);
export type ReceptionistInsert = z.infer<typeof receptionistInsertSchema>;
export type Receptionist = typeof receptionists.$inferSelect;

export const labTechnicianInsertSchema = createInsertSchema(labTechnicians);
export type LabTechnicianInsert = z.infer<typeof labTechnicianInsertSchema>;
export type LabTechnician = typeof labTechnicians.$inferSelect;

export const pendingReceptionistInsertSchema = createInsertSchema(pendingReceptionists);
export type PendingReceptionistInsert = z.infer<typeof pendingReceptionistInsertSchema>;
export type PendingReceptionist = typeof pendingReceptionists.$inferSelect;

export const pendingLabTechnicianInsertSchema = createInsertSchema(pendingLabTechnicians);
export type PendingLabTechnicianInsert = z.infer<typeof pendingLabTechnicianInsertSchema>;
export type PendingLabTechnician = typeof pendingLabTechnicians.$inferSelect;

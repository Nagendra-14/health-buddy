import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";

// Component for the main Health Buddy application
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [activePage, setActivePage] = useState('dashboard');
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  // Form data for test form
  const [newTest, setNewTest] = useState({
    patientId: '',
    testType: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    details: '',
    urgency: 'routine'
  });

  // Form data for prescription form
  const [prescription, setPrescription] = useState({
    patientId: '',
    details: '',
    notes: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: getDatePlusMonths(3)
  });

  // Sample data for patients
  const patients = [
    { id: 'P001', name: 'John Smith' },
    { id: 'P002', name: 'Maria Garcia' },
    { id: 'P003', name: 'David Johnson' },
    { id: 'P004', name: 'Sarah Williams' },
    { id: 'P005', name: 'Robert Brown' },
    { id: 'P006', name: 'Jennifer Lee' },
    { id: 'P007', name: 'Michael Chen' },
    { id: 'P008', name: 'Elizabeth Taylor' }
  ];

  // Sample data for dashboard appointments
  const dashboardAppointments = [
    { 
      patientName: 'John Smith', 
      patientId: 'P001', 
      date: 'Today', 
      time: '09:00 AM', 
      purpose: 'General Checkup', 
      status: 'Scheduled',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      patientName: 'Maria Garcia', 
      patientId: 'P002', 
      date: 'Today', 
      time: '10:15 AM', 
      purpose: 'Follow-up', 
      status: 'In Progress',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    },
    { 
      patientName: 'David Johnson', 
      patientId: 'P003', 
      date: 'Today', 
      time: '11:30 AM', 
      purpose: 'Consultation', 
      status: 'Scheduled',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100'
    }
  ];

  // Sample data for all appointments
  const appointments = [
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
  ];

  // Sample data for recent tests
  const recentTests = [
    { 
      patientName: 'Sarah Williams', 
      testType: 'Complete Blood Count (CBC)', 
      date: 'Oct 17, 2023', 
      status: 'Completed' 
    },
    { 
      patientName: 'John Smith', 
      testType: 'Lipid Panel', 
      date: 'Oct 16, 2023', 
      status: 'Completed' 
    },
    { 
      patientName: 'Maria Garcia', 
      testType: 'Thyroid Function', 
      date: 'Oct 15, 2023', 
      status: 'In Progress' 
    },
    { 
      patientName: 'Robert Brown', 
      testType: 'Urinalysis', 
      date: 'Oct 14, 2023', 
      status: 'Completed' 
    },
    { 
      patientName: 'David Johnson', 
      testType: 'Blood Glucose', 
      date: 'Oct 13, 2023', 
      status: 'Completed' 
    },
    { 
      patientName: 'Jennifer Lee', 
      testType: 'Liver Function', 
      date: 'Oct 12, 2023', 
      status: 'Pending' 
    }
  ];

  // Sample data for recent prescriptions
  const recentPrescriptions = [
    { 
      patientName: 'John Smith', 
      details: 'Lisinopril 10mg, 1 tablet daily for blood pressure. Take in the morning.', 
      validFrom: 'Oct 15, 2023', 
      validUntil: 'Jan 15, 2024' 
    },
    { 
      patientName: 'Maria Garcia', 
      details: 'Metformin 500mg, 1 tablet twice daily with meals for diabetes management.',
      validFrom: 'Oct 10, 2023', 
      validUntil: 'Apr 10, 2024' 
    },
    { 
      patientName: 'David Johnson', 
      details: 'Atorvastatin 20mg, 1 tablet daily at bedtime for cholesterol management.',
      validFrom: 'Oct 5, 2023', 
      validUntil: 'Apr 5, 2024' 
    },
    { 
      patientName: 'Sarah Williams', 
      details: 'Levothyroxine 50mcg, 1 tablet daily on empty stomach for hypothyroidism.',
      validFrom: 'Sep 28, 2023', 
      validUntil: 'Mar 28, 2024' 
    },
    { 
      patientName: 'Robert Brown', 
      details: 'Amoxicillin 500mg, 1 capsule three times daily for bacterial infection. Complete full course.',
      validFrom: 'Oct 12, 2023', 
      validUntil: 'Oct 19, 2023' 
    }
  ];

  // Sample data for patient reports
  const patientReports = [
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
  ];

  // Handle window resize for responsive sidebar
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get a date plus n months
  function getDatePlusMonths(months: number) {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  }

  // Toggle sidebar
  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  // Navigate to a page
  function navigateTo(page: string) {
    setActivePage(page);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  // Show notification
  function showNotification(message: string, type: string = 'success') {
    setNotification({ message, type, visible: true });
    
    // Hide after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }

  // Handle test form submission
  function handleTestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patientName = patients.find(p => p.id === newTest.patientId)?.name;
    
    // Show notification
    showNotification(`Test initiated successfully for ${patientName}`);
    
    // Reset form
    setNewTest({
      patientId: '',
      testType: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      details: '',
      urgency: 'routine'
    });
  }

  // Handle prescription form submission
  function handlePrescriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patientName = patients.find(p => p.id === prescription.patientId)?.name;
    
    // Show notification
    showNotification(`Prescription saved successfully for ${patientName}`);
    
    // Reset form
    setPrescription({
      patientId: '',
      details: '',
      notes: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: getDatePlusMonths(3)
    });
  }

  // Edit prescription
  function editPrescription(p: any) {
    setPrescription({
      patientId: patients.find(patient => patient.name === p.patientName)?.id || '',
      details: p.details,
      notes: '',
      validFrom: p.validFrom,
      validUntil: p.validUntil
    });
    
    // Navigate to prescriptions page
    navigateTo('prescriptions');
  }

  // Get page title
  function getPageTitle() {
    const titles: {[key: string]: string} = {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      tests: 'Start Tests',
      prescriptions: 'Prescriptions',
      reports: 'Patient Reports'
    };
    
    return titles[activePage] || 'Dashboard';
  }

  return (
    <div className="flex h-screen">
      {/* Notification Toast */}
      {notification.visible && (
        <div className={`toast toast-${notification.type} toast-visible`}>
          {notification.message}
        </div>
      )}
      
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary p-1 bg-primary/10 rounded-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            {sidebarOpen && <span className="text-primary font-semibold text-lg ml-3">Health Buddy</span>}
          </div>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-primary focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {/* Dashboard */}
            <li>
              <button 
                onClick={() => navigateTo('dashboard')} 
                className={`nav-link ${activePage === 'dashboard' ? 'active' : ''} w-full text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </button>
            </li>
            
            {/* Appointments */}
            <li>
              <button 
                onClick={() => navigateTo('appointments')} 
                className={`nav-link ${activePage === 'appointments' ? 'active' : ''} w-full text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Appointments</span>}
              </button>
            </li>
            
            {/* Start Tests */}
            <li>
              <button 
                onClick={() => navigateTo('tests')} 
                className={`nav-link ${activePage === 'tests' ? 'active' : ''} w-full text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Start Tests</span>}
              </button>
            </li>
            
            {/* Prescriptions */}
            <li>
              <button 
                onClick={() => navigateTo('prescriptions')} 
                className={`nav-link ${activePage === 'prescriptions' ? 'active' : ''} w-full text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {sidebarOpen && <span className="ml-3">Prescriptions</span>}
              </button>
            </li>
            
            {/* Patient Reports */}
            <li>
              <button 
                onClick={() => navigateTo('reports')} 
                className={`nav-link ${activePage === 'reports' ? 'active' : ''} w-full text-left`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {sidebarOpen && <span className="ml-3">Patient Reports</span>}
              </button>
            </li>
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">Dr. Sarah Chen</p>
                <p className="text-xs text-gray-500">Cardiologist</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="text-gray-500 hover:text-primary focus:outline-none md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <h1 className="ml-4 md:ml-0 text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-primary focus:outline-none relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full"></span>
              </button>
              
              <button className="text-gray-500 hover:text-primary focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F7FA]">
          {/* Dashboard Page */}
          <div className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Stats Card - Appointments */}
              <div className="stats-card">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
                    <p className="text-2xl font-semibold">8</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Card - Patients */}
              <div className="stats-card">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
                    <p className="text-2xl font-semibold">248</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Card - Tests */}
              <div className="stats-card">
                <div className="flex items-center">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Tests</h3>
                    <p className="text-2xl font-semibold">12</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Card - Reports */}
              <div className="stats-card">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm font-medium">New Reports</h3>
                    <p className="text-2xl font-semibold">5</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-lg">Recent Appointments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Patient</th>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Purpose</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardAppointments.map((appointment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={appointment.avatar} alt={appointment.patientName} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-sm text-gray-500">{appointment.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`
                              status-badge
                              ${appointment.status === 'Completed' ? 'status-badge-completed' : ''}
                              ${appointment.status === 'Scheduled' ? 'status-badge-scheduled' : ''}
                              ${appointment.status === 'In Progress' ? 'status-badge-progress' : ''}
                              ${appointment.status === 'Cancelled' ? 'status-badge-cancelled' : ''}
                            `}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-primary hover:text-primary-dark mr-2">View</button>
                          <button className="text-gray-500 hover:text-gray-700">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t">
                <button 
                  onClick={() => navigateTo('appointments')}
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View all appointments →
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Test */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">Quick Test</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Initiate a new test for your patient</p>
                <button 
                  onClick={() => navigateTo('tests')}
                  className="w-full btn btn-secondary"
                >
                  Start New Test
                </button>
              </div>
              
              {/* Create Prescription */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">Write Prescription</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Create a new prescription for your patient</p>
                <button 
                  onClick={() => navigateTo('prescriptions')}
                  className="w-full btn btn-primary"
                >
                  New Prescription
                </button>
              </div>
              
              {/* Patient Reports */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium">View Reports</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Check the latest patient test results</p>
                <button 
                  onClick={() => navigateTo('reports')}
                  className="w-full btn btn-accent"
                >
                  View All Reports
                </button>
              </div>
            </div>
          </div>
          
          {/* Appointments Page */}
          <div className={`page ${activePage === 'appointments' ? 'active' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6 border-b flex flex-col md:flex-row justify-between md:items-center">
                <h2 className="font-semibold text-lg mb-4 md:mb-0">All Appointments</h2>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search appointments..." 
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    New Appointment
                  </button>
                </div>
              </div>
              
              {/* Filter Options */}
              <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap gap-4">
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-gray-600">Filter:</label>
                  <select className="form-select">
                    <option>All Appointments</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-gray-600">Status:</label>
                  <select className="form-select">
                    <option>Any Status</option>
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                    <option>In Progress</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <label className="mr-2 text-sm text-gray-600">Sort:</label>
                  <select className="form-select">
                    <option>Latest First</option>
                    <option>Oldest First</option>
                    <option>Patient Name (A-Z)</option>
                    <option>Patient Name (Z-A)</option>
                  </select>
                </div>
              </div>
              
              {/* Appointments Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Patient</th>
                      <th className="px-6 py-3">Appointment</th>
                      <th className="px-6 py-3">Purpose</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full" src={appointment.avatar} alt={appointment.patientName} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-sm text-gray-500">{appointment.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`
                              status-badge
                              ${appointment.status === 'Completed' ? 'status-badge-completed' : ''}
                              ${appointment.status === 'Scheduled' ? 'status-badge-scheduled' : ''}
                              ${appointment.status === 'In Progress' ? 'status-badge-progress' : ''}
                              ${appointment.status === 'Cancelled' ? 'status-badge-cancelled' : ''}
                            `}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-primary hover:text-primary-dark mr-3">View</button>
                          <button className="text-gray-500 hover:text-gray-700 mr-3">Edit</button>
                          <button className="text-red-500 hover:text-red-700">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">35</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 border rounded-md bg-primary text-white">1</button>
                  <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">3</button>
                  <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">4</button>
                  <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">Next</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Start Tests Page */}
          <div className={`page ${activePage === 'tests' ? 'active' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Test Form */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-6">Start New Test</h2>
                  
                  <form onSubmit={handleTestSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Patient Selection */}
                      <div>
                        <label className="form-label">Patient</label>
                        <div className="relative">
                          <select 
                            value={newTest.patientId}
                            onChange={(e) => setNewTest({...newTest, patientId: e.target.value})}
                            className="form-select"
                            required
                          >
                            <option value="" disabled>Select a patient</option>
                            {patients.map((patient) => (
                              <option key={patient.id} value={patient.id}>{patient.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Test Type */}
                      <div>
                        <label className="form-label">Test Type</label>
                        <div className="relative">
                          <select 
                            value={newTest.testType}
                            onChange={(e) => setNewTest({...newTest, testType: e.target.value})}
                            className="form-select"
                            required
                          >
                            <option value="" disabled>Select test type</option>
                            <option value="blood">Complete Blood Count (CBC)</option>
                            <option value="urine">Urinalysis</option>
                            <option value="lipid">Lipid Panel</option>
                            <option value="glucose">Blood Glucose</option>
                            <option value="liver">Liver Function</option>
                            <option value="kidney">Kidney Function</option>
                            <option value="thyroid">Thyroid Function</option>
                            <option value="vitamin">Vitamin Panel</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Date</label>
                          <input 
                            type="date" 
                            value={newTest.date}
                            onChange={(e) => setNewTest({...newTest, date: e.target.value})}
                            className="form-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Time</label>
                          <input 
                            type="time" 
                            value={newTest.time}
                            onChange={(e) => setNewTest({...newTest, time: e.target.value})}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Test Details */}
                      <div>
                        <label className="form-label">Test Details</label>
                        <textarea 
                          value={newTest.details}
                          onChange={(e) => setNewTest({...newTest, details: e.target.value})}
                          rows={4} 
                          className="form-input"
                          placeholder="Enter specific test requirements or additional details..."
                        />
                      </div>
                      
                      {/* Urgency */}
                      <div>
                        <label className="form-label mb-2">Urgency Level</label>
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input 
                              type="radio" 
                              checked={newTest.urgency === 'routine'} 
                              onChange={() => setNewTest({...newTest, urgency: 'routine'})} 
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Routine</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input 
                              type="radio" 
                              checked={newTest.urgency === 'priority'} 
                              onChange={() => setNewTest({...newTest, urgency: 'priority'})} 
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Priority</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input 
                              type="radio" 
                              checked={newTest.urgency === 'urgent'} 
                              onChange={() => setNewTest({...newTest, urgency: 'urgent'})} 
                              className="focus:ring-primary h-4 w-4 text-primary border-gray-300" 
                            />
                            <span className="ml-2 text-sm text-gray-700">Urgent</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Submit Buttons */}
                      <div className="flex justify-end space-x-3">
                        <button 
                          type="button"
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Start Test
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Recent Tests */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Tests</h2>
                  
                  <div className="space-y-4">
                    {recentTests.slice(0, 5).map((test, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{test.patientName}</p>
                            <p className="text-sm text-gray-500">{test.testType}</p>
                            <p className="text-xs text-gray-400 mt-1">{test.date}</p>
                          </div>
                          <span 
                            className={`
                              px-2 py-1 text-xs font-semibold rounded-full
                              ${test.status === 'Pending' ? 'bg-blue-100 text-blue-800' : ''}
                              ${test.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}
                              ${test.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : ''}
                            `}
                          >
                            {test.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View all tests →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prescriptions Page */}
          <div className={`page ${activePage === 'prescriptions' ? 'active' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prescription Form */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-6">Write Prescription</h2>
                  
                  <form onSubmit={handlePrescriptionSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                      {/* Patient Selection */}
                      <div>
                        <label className="form-label">Patient</label>
                        <div className="relative">
                          <select 
                            value={prescription.patientId}
                            onChange={(e) => setPrescription({...prescription, patientId: e.target.value})}
                            className="form-select"
                            required
                          >
                            <option value="" disabled>Select a patient</option>
                            {patients.map((patient) => (
                              <option key={patient.id} value={patient.id}>{patient.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Prescription Details */}
                      <div>
                        <label className="form-label">Prescription Details</label>
                        <textarea 
                          value={prescription.details}
                          onChange={(e) => setPrescription({...prescription, details: e.target.value})}
                          rows={10} 
                          className="form-input"
                          placeholder="Enter medication details, dosage, frequency, duration, etc."
                          required
                        />
                      </div>
                      
                      {/* Additional Notes */}
                      <div>
                        <label className="form-label">Additional Notes</label>
                        <textarea 
                          value={prescription.notes}
                          onChange={(e) => setPrescription({...prescription, notes: e.target.value})}
                          rows={3} 
                          className="form-input"
                          placeholder="Enter any additional instructions or notes..."
                        />
                      </div>
                      
                      {/* Validity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Valid From</label>
                          <input 
                            type="date" 
                            value={prescription.validFrom}
                            onChange={(e) => setPrescription({...prescription, validFrom: e.target.value})}
                            className="form-input"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Valid Until</label>
                          <input 
                            type="date" 
                            value={prescription.validUntil}
                            onChange={(e) => setPrescription({...prescription, validUntil: e.target.value})}
                            className="form-input"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Submit Buttons */}
                      <div className="flex justify-end space-x-3">
                        <button 
                          type="button"
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Save Prescription
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Recent Prescriptions */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">Recent Prescriptions</h2>
                  
                  <div className="space-y-4">
                    {recentPrescriptions.slice(0, 5).map((p, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{p.patientName}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Valid: {p.validFrom} to {p.validUntil}
                            </p>
                          </div>
                          <button 
                            onClick={() => editPrescription(p)}
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{p.details}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">
                      View all prescriptions →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Patient Reports Page */}
          <div className={`page ${activePage === 'reports' ? 'active' : ''}`}>
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-lg font-semibold mb-4 md:mb-0">Patient Reports</h2>
                  
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search reports..." 
                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-full"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <select className="form-select">
                      <option>All Types</option>
                      <option>Blood Tests</option>
                      <option>Urine Tests</option>
                      <option>Imaging</option>
                      <option>Other Tests</option>
                    </select>
                    
                    <select className="form-select">
                      <option>Latest First</option>
                      <option>Oldest First</option>
                    </select>
                  </div>
                </div>
                
                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patientReports.map((report, index) => (
                    <div key={index} className="report-card">
                      <div 
                        className={`
                          report-card-header
                          ${report.category === 'Blood Test' ? 'report-blood' : ''}
                          ${report.category === 'Urine Test' ? 'report-urine' : ''}
                          ${report.category === 'Imaging' ? 'report-imaging' : ''}
                          ${report.category === 'Other' ? 'report-other' : ''}
                        `}
                      >
                        <div className="flex items-center">
                          <span 
                            className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3
                              ${report.category === 'Blood Test' ? 'text-blue-700 bg-blue-100' : ''}
                              ${report.category === 'Urine Test' ? 'text-green-700 bg-green-100' : ''}
                              ${report.category === 'Imaging' ? 'text-purple-700 bg-purple-100' : ''}
                              ${report.category === 'Other' ? 'text-orange-700 bg-orange-100' : ''}
                            `}
                          >
                            {report.category.charAt(0)}
                          </span>
                          <span className="font-medium text-sm">{report.name}</span>
                        </div>
                        <span 
                          className={`
                            px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${report.status === 'Normal' ? 'bg-green-100 text-green-800' : ''}
                            ${report.status === 'Borderline' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${report.status === 'Abnormal' ? 'bg-red-100 text-red-800' : ''}
                            ${report.status === 'Pending' ? 'bg-gray-100 text-gray-800' : ''}
                          `}
                        >
                          {report.status}
                        </span>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between mb-3">
                          <p className="text-sm text-gray-500">Patient</p>
                          <p className="text-sm font-medium">{report.patientName}</p>
                        </div>
                        
                        <div className="flex justify-between mb-3">
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-sm">{report.date}</p>
                        </div>
                        
                        <div className="flex justify-between mb-3">
                          <p className="text-sm text-gray-500">Ordered By</p>
                          <p className="text-sm">{report.orderedBy}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between">
                            <button className="text-primary hover:text-primary-dark text-sm font-medium">
                              View Details
                            </button>
                            <button className="text-gray-500 hover:text-gray-700 text-sm">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="mt-6 pt-4 border-t flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">9</span> of <span className="font-medium">24</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border rounded-md bg-primary text-white">1</button>
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">2</button>
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">3</button>
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

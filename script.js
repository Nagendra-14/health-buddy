// Health Buddy - Doctor & Patient Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // ===============================================================
    // MOCK DATA (This would come from a real API in a production app)
    // ===============================================================
    
    // User data
    const users = {
        doctors: [
            { id: 'D001', username: 'doctor', password: 'doctor123', name: 'Dr. Sarah Chen' }
        ],
        patients: [
            { id: 'P001', username: 'patient', password: 'patient123', name: 'John Smith' },
            { id: 'P002', username: 'maria', password: 'maria123', name: 'Maria Garcia' },
            { id: 'P003', username: 'david', password: 'david123', name: 'David Johnson' },
            { id: 'P004', username: 'sarah', password: 'sarah123', name: 'Sarah Williams' }
        ]
    };
    
    // Appointment data
    const appointments = [
        // Doctor's view of all appointments
        { 
            id: 'A001',
            patientId: 'P001',
            patientName: 'John Smith',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            date: '2025-05-06',
            time: '09:00 AM',
            purpose: 'General Checkup',
            status: 'Scheduled'
        },
        { 
            id: 'A002',
            patientId: 'P002',
            patientName: 'Maria Garcia',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            date: '2025-05-06',
            time: '10:15 AM',
            purpose: 'Follow-up',
            status: 'In Progress'
        },
        { 
            id: 'A003',
            patientId: 'P003',
            patientName: 'David Johnson',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            date: '2025-05-06',
            time: '11:30 AM',
            purpose: 'Consultation',
            status: 'Scheduled'
        },
        { 
            id: 'A004',
            patientId: 'P004',
            patientName: 'Sarah Williams',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            date: '2025-05-05',
            time: '02:00 PM',
            purpose: 'Annual Physical',
            status: 'Completed'
        },
        { 
            id: 'A005',
            patientId: 'P001',
            patientName: 'John Smith',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            date: '2025-05-10',
            time: '09:30 AM',
            purpose: 'Follow-up',
            status: 'Scheduled'
        }
    ];
    
    // Test data
    const tests = [
        { 
            id: 'T001',
            patientId: 'P004',
            patientName: 'Sarah Williams',
            testType: 'Complete Blood Count (CBC)',
            date: '2025-05-05',
            status: 'Completed' 
        },
        { 
            id: 'T002',
            patientId: 'P001',
            patientName: 'John Smith',
            testType: 'Lipid Panel',
            date: '2025-05-04',
            status: 'Completed' 
        },
        { 
            id: 'T003',
            patientId: 'P002',
            patientName: 'Maria Garcia',
            testType: 'Thyroid Function',
            date: '2025-05-03',
            status: 'In Progress' 
        },
        { 
            id: 'T004',
            patientId: 'P003',
            patientName: 'David Johnson',
            testType: 'Blood Glucose',
            date: '2025-05-01',
            status: 'Completed' 
        }
    ];
    
    // Prescription data
    const prescriptions = [
        { 
            id: 'PR001',
            patientId: 'P001',
            patientName: 'John Smith',
            details: 'Lisinopril 10mg, 1 tablet daily for blood pressure. Take in the morning.',
            validFrom: '2025-05-01',
            validUntil: '2025-08-01' 
        },
        { 
            id: 'PR002',
            patientId: 'P002',
            patientName: 'Maria Garcia',
            details: 'Metformin 500mg, 1 tablet twice daily with meals for diabetes management.',
            validFrom: '2025-04-25',
            validUntil: '2025-10-25' 
        },
        { 
            id: 'PR003',
            patientId: 'P003',
            patientName: 'David Johnson',
            details: 'Atorvastatin 20mg, 1 tablet daily at bedtime for cholesterol management.',
            validFrom: '2025-04-20',
            validUntil: '2025-10-20' 
        }
    ];
    
    // Report data
    const reports = [
        { 
            id: 'R001',
            name: 'Complete Blood Count',
            category: 'Blood Test',
            patientId: 'P001',
            patientName: 'John Smith',
            date: '2025-05-01',
            status: 'Normal',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            details: 'All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 7.5 x10^9/L, Platelets: 250 x10^9/L.'
        },
        { 
            id: 'R002',
            name: 'Lipid Panel',
            category: 'Blood Test',
            patientId: 'P002',
            patientName: 'Maria Garcia',
            date: '2025-04-28',
            status: 'Borderline',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            details: 'Total Cholesterol: 210 mg/dL (borderline high), LDL: 140 mg/dL (borderline high), HDL: 45 mg/dL, Triglycerides: 150 mg/dL.'
        },
        { 
            id: 'R003',
            name: 'Urinalysis',
            category: 'Urine Test',
            patientId: 'P003',
            patientName: 'David Johnson',
            date: '2025-04-27',
            status: 'Normal',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            details: 'Normal results. No protein, glucose, ketones, blood, or leukocytes detected.'
        },
        { 
            id: 'R004',
            name: 'Chest X-Ray',
            category: 'Imaging',
            patientId: 'P004',
            patientName: 'Sarah Williams',
            date: '2025-04-26',
            status: 'Normal',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            details: 'Lungs appear clear. No consolidation, effusion, or pneumothorax. Heart size normal.'
        },
        { 
            id: 'R005',
            name: 'Thyroid Function Test',
            category: 'Blood Test',
            patientId: 'P001',
            patientName: 'John Smith',
            date: '2025-04-25',
            status: 'Abnormal',
            doctorId: 'D001',
            doctorName: 'Dr. Sarah Chen',
            details: 'TSH: 5.8 mIU/L (high), Free T4: 0.8 ng/dL (low-normal). Results suggest hypothyroidism. Recommend endocrinology referral.'
        }
    ];

    // ===============================================================
    // APPLICATION STATE
    // ===============================================================
    
    let currentUser = null;
    let currentPage = '';
    
    // Check for existing login
    function checkExistingLogin() {
        const savedUser = localStorage.getItem('healthBuddyUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                currentUser = user;
                document.body.dataset.userType = user.type;
                showDashboard();
                setupNavigation();
                updateUserInfo();
            } catch (e) {
                // Invalid saved user data
                localStorage.removeItem('healthBuddyUser');
            }
        }
    }
    
    // ===============================================================
    // EVENT LISTENERS
    // ===============================================================
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        
        // Authenticate user
        let authenticatedUser = null;
        
        if (userType === 'doctor') {
            authenticatedUser = users.doctors.find(
                doctor => doctor.username === username && doctor.password === password
            );
            
            if (authenticatedUser) {
                currentUser = {
                    id: authenticatedUser.id,
                    name: authenticatedUser.name,
                    type: 'doctor'
                };
            }
        } else if (userType === 'patient') {
            authenticatedUser = users.patients.find(
                patient => patient.username === username && patient.password === password
            );
            
            if (authenticatedUser) {
                currentUser = {
                    id: authenticatedUser.id,
                    name: authenticatedUser.name,
                    type: 'patient'
                };
            }
        }
        
        if (currentUser) {
            // Save user to localStorage
            localStorage.setItem('healthBuddyUser', JSON.stringify(currentUser));
            document.body.dataset.userType = currentUser.type;
            
            // Show dashboard and setup navigation
            showDashboard();
            setupNavigation();
            updateUserInfo();
            
            // Depending on user type, set default page
            const defaultPage = currentUser.type === 'doctor' ? 'doctorDashboard' : 'patientDashboard';
            navigateTo(defaultPage);
            
            // Show welcome notification
            showToast(`Welcome, ${currentUser.name}!`, 'success');
        } else {
            showToast('Invalid username or password. Please try again.', 'error');
        }
    });
    
    // Toggle sidebar on mobile
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // Clear user data
        localStorage.removeItem('healthBuddyUser');
        currentUser = null;
        
        // Return to login page
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        
        loginPage.classList.add('active');
        dashboardPage.classList.remove('active');
        
        // Reset form
        document.getElementById('loginForm').reset();
        
        // Show logout notification
        showToast('You have been logged out successfully.', 'success');
    });
    
    // Test form submission
    document.getElementById('testForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('testPatient').value;
        const testType = document.getElementById('testType').value;
        const patient = users.patients.find(p => p.id === patientId);
        
        showToast(`Test initiated successfully for ${patient.name}`, 'success');
        
        // Reset form
        this.reset();
        
        // Set current date as default
        document.getElementById('testDate').value = new Date().toISOString().split('T')[0];
    });
    
    // Prescription form submission
    document.getElementById('prescriptionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('prescriptionPatient').value;
        const patient = users.patients.find(p => p.id === patientId);
        
        showToast(`Prescription saved successfully for ${patient.name}`, 'success');
        
        // Reset form
        this.reset();
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        
        document.getElementById('validFrom').value = today;
        document.getElementById('validUntil').value = threeMonthsLater.toISOString().split('T')[0];
    });
    
    // Add click event listeners for all navigation buttons
    document.addEventListener('click', function(e) {
        // Handle navigation link clicks within the app
        if (e.target.closest('.btn-link') && e.target.closest('.btn-link').dataset.page) {
            const page = e.target.closest('.btn-link').dataset.page;
            navigateTo(page);
        }
    });
    
    // Report category filters
    document.getElementById('reportCategoryFilter').addEventListener('change', function() {
        const category = this.value;
        filterReports('doctorReportsGrid', category);
    });
    
    document.getElementById('patientReportCategoryFilter').addEventListener('change', function() {
        const category = this.value;
        filterReports('patientReportsGrid', category);
    });
    
    // Close toast notification
    document.querySelector('.toast-close').addEventListener('click', function() {
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
    });
    
    // ===============================================================
    // PAGE NAVIGATION & UI FUNCTIONS
    // ===============================================================
    
    // Switch between login page and dashboard
    function showDashboard() {
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
    }
    
    // Set up navigation based on user type
    function setupNavigation() {
        const navLinksContainer = document.getElementById('navLinks');
        navLinksContainer.innerHTML = '';
        
        // Links that are shown to both doctors and patients
        const sharedLinks = [
            { id: 'doctorDashboard', id2: 'patientDashboard', label: 'Dashboard', icon: 'fa-home' }
        ];
        
        if (currentUser.type === 'doctor') {
            // Doctor-specific navigation links
            const doctorLinks = [
                { id: 'doctorAppointments', label: 'Appointments', icon: 'fa-calendar-check' },
                { id: 'startTests', label: 'Start Tests', icon: 'fa-flask' },
                { id: 'prescriptions', label: 'Prescriptions', icon: 'fa-pills' },
                { id: 'doctorReports', label: 'Reports', icon: 'fa-file-medical' }
            ];
            
            // Add links to navigation
            const links = [...sharedLinks, ...doctorLinks];
            links.forEach(link => {
                const id = link.id;
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" data-page="${id}" class="nav-link">
                        <i class="fas ${link.icon}"></i>
                        <span>${link.label}</span>
                    </a>
                `;
                navLinksContainer.appendChild(li);
                
                // Add click event listener
                li.querySelector('a').addEventListener('click', function(e) {
                    e.preventDefault();
                    navigateTo(id);
                });
            });
            
            // Load doctor data
            loadDoctorData();
            
        } else if (currentUser.type === 'patient') {
            // Patient-specific navigation links
            const patientLinks = [
                { id: 'patientAppointments', label: 'Appointments', icon: 'fa-calendar-check' },
                { id: 'patientReports', label: 'Reports', icon: 'fa-file-medical' }
            ];
            
            // Add links to navigation
            const links = [...sharedLinks, ...patientLinks];
            links.forEach(link => {
                const id = currentUser.type === 'doctor' ? link.id : link.id2 || link.id;
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" data-page="${id}" class="nav-link">
                        <i class="fas ${link.icon}"></i>
                        <span>${link.label}</span>
                    </a>
                `;
                navLinksContainer.appendChild(li);
                
                // Add click event listener
                li.querySelector('a').addEventListener('click', function(e) {
                    e.preventDefault();
                    navigateTo(id);
                });
            });
            
            // Load patient data
            loadPatientData();
        }
    }
    
    // Navigate to a specific page
    function navigateTo(pageId) {
        // Hide all content pages
        const contentPages = document.querySelectorAll('.content-page');
        contentPages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show the selected page
        const selectedPage = document.getElementById(pageId);
        if (selectedPage) {
            selectedPage.classList.add('active');
            currentPage = pageId;
            
            // Update page title
            updatePageTitle(pageId);
            
            // Update active navigation link
            updateActiveNavLink(pageId);
        }
        
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('active');
        }
    }
    
    // Update the page title based on current page
    function updatePageTitle(pageId) {
        const pageTitle = document.getElementById('pageTitle');
        const titles = {
            doctorDashboard: 'Doctor Dashboard',
            patientDashboard: 'Patient Dashboard',
            doctorAppointments: 'Appointments',
            patientAppointments: 'My Appointments',
            startTests: 'Start Tests',
            prescriptions: 'Prescriptions',
            doctorReports: 'Patient Reports',
            patientReports: 'My Reports'
        };
        
        pageTitle.textContent = titles[pageId] || 'Dashboard';
    }
    
    // Update active navigation link
    function updateActiveNavLink(pageId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });
    }
    
    // Update user information in sidebar
    function updateUserInfo() {
        if (currentUser) {
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userRole').textContent = currentUser.type === 'doctor' ? 'Doctor' : 'Patient';
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Set message and type
        toastMessage.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // ===============================================================
    // DATA LOADING FUNCTIONS
    // ===============================================================
    
    // Load doctor-specific data
    function loadDoctorData() {
        // Load patients dropdown for tests and prescriptions
        const testPatientSelect = document.getElementById('testPatient');
        const prescriptionPatientSelect = document.getElementById('prescriptionPatient');
        
        // Clear existing options
        testPatientSelect.innerHTML = '<option value="">Select Patient</option>';
        prescriptionPatientSelect.innerHTML = '<option value="">Select Patient</option>';
        
        // Add patient options
        users.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            
            testPatientSelect.appendChild(option.cloneNode(true));
            prescriptionPatientSelect.appendChild(option);
        });
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
        
        document.getElementById('testDate').value = today;
        document.getElementById('validFrom').value = today;
        document.getElementById('validUntil').value = threeMonthsLater.toISOString().split('T')[0];
        
        // Load appointments for dashboard
        loadDoctorAppointments();
        
        // Load recent tests
        loadRecentTests();
        
        // Load prescriptions
        loadPrescriptions();
        
        // Load patient reports
        loadReports('doctorReportsGrid', reports);
    }
    
    // Load patient-specific data
    function loadPatientData() {
        // Get patient-specific appointments
        const patientAppointments = appointments.filter(app => app.patientId === currentUser.id);
        
        // Load appointments for patient dashboard
        const dashboardAppsList = document.getElementById('patientAppointmentsList');
        dashboardAppsList.innerHTML = '';
        
        if (patientAppointments.length > 0) {
            // Show only upcoming appointments for dashboard
            const upcomingAppointments = patientAppointments
                .filter(app => new Date(app.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3);
            
            upcomingAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.doctorName}</td>
                    <td>${formatDate(app.date)}</td>
                    <td>${app.time}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                `;
                dashboardAppsList.appendChild(tr);
            });
        } else {
            dashboardAppsList.innerHTML = '<tr><td colspan="4" class="text-center">No upcoming appointments</td></tr>';
        }
        
        // Load patient appointments table
        const patientAppsTable = document.getElementById('patientAppointmentsTable');
        patientAppsTable.innerHTML = '';
        
        if (patientAppointments.length > 0) {
            patientAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            patientAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.doctorName}</td>
                    <td>${formatDate(app.date)}</td>
                    <td>${app.time}</td>
                    <td>${app.purpose}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                `;
                patientAppsTable.appendChild(tr);
            });
        } else {
            patientAppsTable.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found</td></tr>';
        }
        
        // Load patient reports
        const patientReports = reports.filter(report => report.patientId === currentUser.id);
        loadReports('patientReportsGrid', patientReports);
    }
    
    // Load doctor appointments
    function loadDoctorAppointments() {
        // Dashboard appointments (today's only)
        const dashboardAppsList = document.getElementById('dashboardAppointmentsList');
        dashboardAppsList.innerHTML = '';
        
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = appointments.filter(app => app.date === today);
        
        if (todaysAppointments.length > 0) {
            todaysAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.patientName}</td>
                    <td>${app.time}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                `;
                dashboardAppsList.appendChild(tr);
            });
        } else {
            dashboardAppsList.innerHTML = '<tr><td colspan="3" class="text-center">No appointments today</td></tr>';
        }
        
        // All appointments
        const appsTable = document.getElementById('doctorAppointmentsTable');
        appsTable.innerHTML = '';
        
        if (appointments.length > 0) {
            // Sort by date, most recent first
            const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${app.patientName}</td>
                    <td>${formatDate(app.date)}</td>
                    <td>${app.time}</td>
                    <td>${app.purpose}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-link" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-link" title="Cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </td>
                `;
                appsTable.appendChild(tr);
            });
        } else {
            appsTable.innerHTML = '<tr><td colspan="6" class="text-center">No appointments found</td></tr>';
        }
    }
    
    // Load recent tests
    function loadRecentTests() {
        const recentTestsTable = document.getElementById('recentTestsTable');
        recentTestsTable.innerHTML = '';
        
        if (tests.length > 0) {
            // Sort by date, most recent first
            const sortedTests = [...tests].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedTests.forEach(test => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${test.patientName}</td>
                    <td>${test.testType}</td>
                    <td>${formatDate(test.date)}</td>
                    <td><span class="status-badge status-${test.status.toLowerCase().replace(' ', '-')}">${test.status}</span></td>
                `;
                recentTestsTable.appendChild(tr);
            });
        } else {
            recentTestsTable.innerHTML = '<tr><td colspan="4" class="text-center">No recent tests</td></tr>';
        }
    }
    
    // Load prescriptions
    function loadPrescriptions() {
        const prescriptionsTable = document.getElementById('recentPrescriptionsTable');
        prescriptionsTable.innerHTML = '';
        
        if (prescriptions.length > 0) {
            // Sort by date, most recent first
            const sortedPrescriptions = [...prescriptions].sort((a, b) => 
                new Date(b.validFrom) - new Date(a.validFrom)
            );
            
            sortedPrescriptions.forEach(prescription => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${prescription.patientName}</td>
                    <td>${truncateText(prescription.details, 50)}</td>
                    <td>${formatDate(prescription.validFrom)} to ${formatDate(prescription.validUntil)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-link edit-prescription" data-id="${prescription.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-link" title="Print">
                                <i class="fas fa-print"></i>
                            </button>
                        </div>
                    </td>
                `;
                prescriptionsTable.appendChild(tr);
                
                // Add event listener for edit button
                const editBtn = tr.querySelector('.edit-prescription');
                editBtn.addEventListener('click', function() {
                    editPrescription(prescription.id);
                });
            });
        } else {
            prescriptionsTable.innerHTML = '<tr><td colspan="4" class="text-center">No prescriptions found</td></tr>';
        }
    }
    
    // Load reports
    function loadReports(containerId, reportsData) {
        const reportsContainer = document.getElementById(containerId);
        reportsContainer.innerHTML = '';
        
        if (reportsData.length > 0) {
            // Sort by date, most recent first
            const sortedReports = [...reportsData].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sortedReports.forEach(report => {
                // Determine CSS class based on category
                let categoryClass = '';
                if (report.category.toLowerCase().includes('blood')) {
                    categoryClass = 'blood';
                } else if (report.category.toLowerCase().includes('urine')) {
                    categoryClass = 'urine';
                } else if (report.category.toLowerCase().includes('imaging')) {
                    categoryClass = 'imaging';
                } else {
                    categoryClass = 'other';
                }
                
                // Determine status class
                let statusClass = '';
                if (report.status.toLowerCase() === 'normal') {
                    statusClass = 'report-result-normal';
                } else if (report.status.toLowerCase() === 'borderline') {
                    statusClass = 'report-result-borderline';
                } else if (report.status.toLowerCase() === 'abnormal') {
                    statusClass = 'report-result-abnormal';
                } else {
                    statusClass = 'report-result-pending';
                }
                
                const reportCard = document.createElement('div');
                reportCard.className = `report-card report-${categoryClass}`;
                reportCard.dataset.category = categoryClass;
                reportCard.innerHTML = `
                    <div class="report-header">
                        <h3>${report.name}</h3>
                        <span class="report-category">${report.category}</span>
                    </div>
                    <div class="report-body">
                        <div class="report-info">
                            <i class="fas fa-user"></i>
                            <span>${containerId === 'doctorReportsGrid' ? report.patientName : 'Your Report'}</span>
                        </div>
                        <div class="report-info">
                            <i class="fas fa-calendar"></i>
                            <span>${formatDate(report.date)}</span>
                        </div>
                        <div class="report-info">
                            <i class="fas fa-user-md"></i>
                            <span>${report.doctorName}</span>
                        </div>
                        <div class="report-status ${statusClass}">
                            <strong>${report.status}</strong>
                        </div>
                    </div>
                `;
                reportsContainer.appendChild(reportCard);
                
                // Add click event to show full report details
                reportCard.addEventListener('click', function() {
                    showReportDetails(report);
                });
            });
        } else {
            reportsContainer.innerHTML = '<div class="text-center p-5">No reports found</div>';
        }
    }
    
    // Filter reports by category
    function filterReports(containerId, category) {
        const reportCards = document.querySelectorAll(`#${containerId} .report-card`);
        
        reportCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Edit prescription
    function editPrescription(prescriptionId) {
        const prescription = prescriptions.find(p => p.id === prescriptionId);
        
        if (prescription) {
            // Populate prescription form
            document.getElementById('prescriptionPatient').value = prescription.patientId;
            document.getElementById('prescriptionDetails').value = prescription.details;
            document.getElementById('validFrom').value = prescription.validFrom;
            document.getElementById('validUntil').value = prescription.validUntil;
            
            // Navigate to prescriptions page
            navigateTo('prescriptions');
            
            // Show notification
            showToast('Editing prescription for ' + prescription.patientName, 'info');
        }
    }
    
    // Show report details (could be implemented with a modal in a real app)
    function showReportDetails(report) {
        // For this demo, we'll just show a notification
        // In a real app, this would open a modal with all details
        showToast(`Viewing report: ${report.name}`, 'info');
    }
    
    // ===============================================================
    // UTILITY FUNCTIONS
    // ===============================================================
    
    // Format date from YYYY-MM-DD to MMM DD, YYYY
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    // Truncate text with ellipsis
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }
    
    // ===============================================================
    // INITIALIZE APPLICATION
    // ===============================================================
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('testDate').value = today;
    
    // Check for existing login
    checkExistingLogin();
});
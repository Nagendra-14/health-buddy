// Health Buddy - Doctor & Patient Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Detect mobile devices and add a class to the body
    function isMobileDevice() {
        return (window.innerWidth <= 768) || 
               (navigator.maxTouchPoints > 0 && /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
    
    // Add mobile class to body if on mobile device
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // Update on resize
    window.addEventListener('resize', function() {
        if (isMobileDevice()) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    });
    // ===============================================================
    // DATA (Fetched from API endpoints)
    // ===============================================================
    
    // User data (for authentication)
    const users = {
        doctors: [
            { id: 'D001', username: 'doctor', password: 'doctor123', name: 'Dr. Sarah Chen' },
            { id: 'D002', username: 'doctor2', password: 'doctor123', name: 'Dr. James Wilson' }
        ],
        patients: [
            { id: 'P001', username: 'patient', password: 'patient123', name: 'John Smith', doctor: 'D001' },
            { id: 'P002', username: 'maria', password: 'maria123', name: 'Maria Garcia', doctor: 'D001' },
            { id: 'P003', username: 'david', password: 'david123', name: 'David Johnson', doctor: 'D001' },
            { id: 'P004', username: 'sarah', password: 'sarah123', name: 'Sarah Williams', doctor: 'D001' },
            { id: 'P005', username: 'michael', password: 'michael123', name: 'Michael Brown', doctor: 'D001' },
            { id: 'P006', username: 'emma', password: 'emma123', name: 'Emma Davis', doctor: 'D002' },
            { id: 'P007', username: 'james', password: 'james123', name: 'James Miller', doctor: 'D002' },
            { id: 'P008', username: 'sophia', password: 'sophia123', name: 'Sophia Wilson', doctor: 'D002' },
            { id: 'P009', username: 'oliver', password: 'oliver123', name: 'Oliver Taylor', doctor: 'D002' },
            { id: 'P010', username: 'ava', password: 'ava123', name: 'Ava Anderson', doctor: 'D002' }
        ]
    };
    
    // Appointment data
    let appointments = [];
    let tests = [];
    let prescriptions = [];
    let reports = [];
    
    // API function to fetch appointments
    async function fetchAppointments(doctorId = null, patientId = null) {
        try {
            let url = '/api/appointments';
            // Add query parameters if provided
            if (doctorId) {
                url += `?doctorId=${doctorId}`;
            } else if (patientId) {
                url += `?patientId=${patientId}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showToast('Error loading appointments. Please try again.', 'error');
            return [];
        }
    }
    
    // API function to fetch patients list
    async function fetchPatients() {
        try {
            const response = await fetch('/api/patients');
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            showToast('Error loading patient list. Please try again.', 'error');
            return [];
        }
    }
    
    // API function to create a new test
    async function createTest(testData) {
        try {
            const response = await fetch('/api/tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create test');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error creating test:', error);
            showToast('Error creating test. Please try again.', 'error');
            throw error;
        }
    }
    
    // API function to save a prescription
    async function savePrescription(prescriptionData) {
        try {
            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prescriptionData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save prescription');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving prescription:', error);
            showToast('Error saving prescription. Please try again.', 'error');
            throw error;
        }
    }
    
    // API function to fetch reports
    async function fetchReports() {
        try {
            const response = await fetch('/api/reports');
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast('Error loading reports. Please try again.', 'error');
            return [];
        }
    }

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
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggleSidebar');
        
        // If sidebar is active and click is outside sidebar and not on toggle button
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            e.target !== toggleBtn && 
            !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Add touchstart event for better mobile responsiveness
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const sidebar = document.getElementById('sidebar');
        const swipeDistance = Math.abs(touchEndX - touchStartX);
        
        // If swipe is significant enough (to avoid small finger movements)
        if (swipeDistance > 50) {
            // Right to left swipe (close sidebar)
            if (touchEndX < touchStartX && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
            // Left to right swipe (open sidebar)
            else if (touchEndX > touchStartX && !sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
            }
        }
    }
    
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
    async function loadDoctorData() {
        try {
            // Fetch patients from API
            const allPatients = await fetchPatients();
            
            // If doctor has specific patients, filter them
            let doctorPatients = allPatients;
            if (currentUser && currentUser.type === 'doctor') {
                doctorPatients = allPatients.filter(p => p.doctorId === currentUser.id);
            }
            
            // Load patients dropdown for tests and prescriptions
            const testPatientSelect = document.getElementById('testPatient');
            const prescriptionPatientSelect = document.getElementById('prescriptionPatient');
            
            // Clear existing options
            testPatientSelect.innerHTML = '<option value="">Select Patient</option>';
            prescriptionPatientSelect.innerHTML = '<option value="">Select Patient</option>';
            
            // Add patient options
            doctorPatients.forEach(patient => {
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
            
            // Fetch appointments data
            appointments = await fetchAppointments();
            
            // Load appointments for dashboard
            loadDoctorAppointments();
            
            // Load recent tests
            await loadRecentTests();
            
            // Load prescriptions
            await loadPrescriptions();
            
            // Load patient reports
            await loadReports('doctorReportsGrid');
        } catch (error) {
            console.error('Error loading doctor data:', error);
            showToast('Error loading doctor data. Please try again.', 'error');
        }
    }
    
    // Load patient-specific data
    async function loadPatientData() {
        try {
            // Fetch patient-specific appointments
            if (currentUser && currentUser.id) {
                // Fetch fresh appointments
                const patientAppointmentsData = await fetchAppointments(null, currentUser.id);
                appointments = patientAppointmentsData;
                
                // Load appointments for patient dashboard
                const dashboardAppsList = document.getElementById('patientAppointmentsList');
                dashboardAppsList.innerHTML = '';
                
                if (appointments.length > 0) {
                    // Show only upcoming appointments for dashboard
                    const upcomingAppointments = appointments
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
                
                if (appointments.length > 0) {
                    appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    appointments.forEach(app => {
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
                
                // Load patient reports from API
                await loadReports('patientReportsGrid');
                
                // Get prescriptions
                await loadPrescriptions();
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
            showToast('Error loading patient data. Please try again.', 'error');
        }
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
    
    // API function to fetch test types
    async function fetchTestTypes() {
        try {
            const response = await fetch('/api/tests');
            if (!response.ok) {
                throw new Error('Failed to fetch test types');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching test types:', error);
            showToast('Error loading test types. Please try again.', 'error');
            return [];
        }
    }
    
    // Load recent tests
    async function loadRecentTests() {
        const recentTestsTable = document.getElementById('recentTestsTable');
        recentTestsTable.innerHTML = '';
        
        try {
            // Temporarily populate with mock data for demonstration
            // In a real app, this would be fetched from the server
            tests = [
                {
                    id: 'RT001',
                    patientId: 'P001',
                    patientName: 'John Smith',
                    testType: 'Complete Blood Count',
                    date: 'May 1, 2025',
                    status: 'Completed'
                },
                {
                    id: 'RT002',
                    patientId: 'P002',
                    patientName: 'Maria Garcia',
                    testType: 'Lipid Panel',
                    date: 'May 2, 2025',
                    status: 'Pending'
                },
                {
                    id: 'RT003',
                    patientId: 'P005',
                    patientName: 'Michael Brown',
                    testType: 'MRI - Knee',
                    date: 'Apr 20, 2025',
                    status: 'Completed'
                },
                {
                    id: 'RT004',
                    patientId: 'P003',
                    patientName: 'David Johnson',
                    testType: 'Urinalysis',
                    date: 'May 3, 2025',
                    status: 'In Progress'
                }
            ];
            
            // Also populate the test type dropdown
            const testTypeSelect = document.getElementById('testType');
            if (testTypeSelect) {
                testTypeSelect.innerHTML = '<option value="">Select Test Type</option>';
                
                // Fetch test types from API
                const testTypes = await fetchTestTypes();
                
                testTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.name;
                    testTypeSelect.appendChild(option);
                });
            }
            
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
        } catch (error) {
            console.error('Error loading recent tests:', error);
            recentTestsTable.innerHTML = '<tr><td colspan="4" class="text-center">Error loading test data</td></tr>';
        }
    }
    
    // Fetch prescriptions data
    async function fetchPrescriptions(doctorId = null, patientId = null) {
        try {
            let url = '/api/prescriptions';
            if (doctorId) {
                url += `?doctorId=${doctorId}`;
            } else if (patientId) {
                url += `?patientId=${patientId}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch prescriptions');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            showToast('Error loading prescriptions. Please try again.', 'error');
            return [];
        }
    }
    
    // Load prescriptions
    async function loadPrescriptions() {
        const prescriptionsTable = document.getElementById('recentPrescriptionsTable');
        prescriptionsTable.innerHTML = '';
        
        try {
            // If user is a doctor, load prescriptions they created
            // If user is a patient, load their prescriptions
            if (currentUser) {
                const paramKey = currentUser.type === 'doctor' ? 'doctorId' : 'patientId';
                const prescriptionsData = await fetchPrescriptions(
                    currentUser.type === 'doctor' ? currentUser.id : null,
                    currentUser.type === 'patient' ? currentUser.id : null
                );
                prescriptions = prescriptionsData;
            }
            
            if (prescriptions.length > 0) {
                // Sort by date, most recent first
                const sortedPrescriptions = [...prescriptions].sort((a, b) => 
                    new Date(b.validFrom) - new Date(a.validFrom)
                );
                
                sortedPrescriptions.forEach(prescription => {
                    const tr = document.createElement('tr');
                    // Get medication names
                    const medicationNames = prescription.medications 
                        ? prescription.medications.map(med => med.name).join(', ')
                        : 'No medications listed';
                        
                    tr.innerHTML = `
                        <td>${prescription.patientName}</td>
                        <td>${truncateText(medicationNames, 50)}</td>
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
        } catch (error) {
            console.error('Error loading prescriptions:', error);
            prescriptionsTable.innerHTML = '<tr><td colspan="4" class="text-center">Error loading prescription data</td></tr>';
        }
    }
    
    // Fetch reports data
    async function fetchReportsData(doctorId = null, patientId = null) {
        try {
            let url = '/api/reports';
            if (doctorId) {
                url += `?doctorId=${doctorId}`;
            } else if (patientId) {
                url += `?patientId=${patientId}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching reports:', error);
            showToast('Error loading reports. Please try again.', 'error');
            return [];
        }
    }
    
    // Load reports
    async function loadReports(containerId, reportsDataParam = null) {
        const reportsContainer = document.getElementById(containerId);
        reportsContainer.innerHTML = '';
        
        try {
            let reportsData = reportsDataParam;
            
            // If reports aren't provided, fetch them based on user type
            if (!reportsData) {
                if (currentUser) {
                    if (currentUser.type === 'doctor') {
                        reportsData = await fetchReportsData(currentUser.id, null);
                    } else if (currentUser.type === 'patient') {
                        reportsData = await fetchReportsData(null, currentUser.id);
                    }
                    reports = reportsData;
                }
            }
            
            if (reportsData && reportsData.length > 0) {
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
                    } else if (report.category.toLowerCase().includes('psych')) {
                        categoryClass = 'imaging'; // Use imaging style for psychological reports
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
                    reportCard.dataset.reportId = report.id;
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
                                <span>${report.orderedBy}</span>
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
        } catch (error) {
            console.error('Error loading reports:', error);
            reportsContainer.innerHTML = '<div class="text-center p-5">Error loading reports. Please try again.</div>';
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
            
            // Prepare medication details from the medications array
            const medicationDetails = prescription.medications 
                ? prescription.medications.map(med => 
                    `${med.name} ${med.dosage}, ${med.frequency}. ${med.instructions}`
                ).join('\n\n')
                : '';
                
            document.getElementById('prescriptionDetails').value = medicationDetails || prescription.details || '';
            
            // Set dates
            // Convert date format if needed
            try {
                const validFromDate = new Date(prescription.validFrom);
                const validUntilDate = new Date(prescription.validUntil);
                
                // Use standard format for form input (YYYY-MM-DD)
                document.getElementById('validFrom').value = validFromDate.toISOString().split('T')[0];
                document.getElementById('validUntil').value = validUntilDate.toISOString().split('T')[0];
            } catch (e) {
                // If date parsing fails, use the original strings
                document.getElementById('validFrom').value = prescription.validFrom;
                document.getElementById('validUntil').value = prescription.validUntil;
            }
            
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
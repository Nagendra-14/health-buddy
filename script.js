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
            // Convert medications array to JSON string if it's an array
            let processedData = { ...prescriptionData };
            
            // Add date field if not present
            if (!processedData.date) {
                processedData.date = new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
            }
            
            // Make sure diagnosis is included - this is required by the database schema
            if (!processedData.diagnosis) {
                if (processedData.details) {
                    processedData.diagnosis = processedData.details;
                } else {
                    processedData.diagnosis = "General prescription"; // Default value if no diagnosis or details
                }
            }
            
            // Ensure medications are properly formatted as a JSON string
            if (Array.isArray(processedData.medications)) {
                processedData.medications = JSON.stringify(processedData.medications);
            } else if (typeof processedData.medications === 'string') {
                // If it's already a string, check if it's valid JSON
                try {
                    // Test if it's parseable
                    JSON.parse(processedData.medications);
                    // If it parses, it's already valid JSON - keep as is
                } catch (e) {
                    // If not valid JSON, wrap it in an array and stringify
                    processedData.medications = JSON.stringify([{
                        name: processedData.medications,
                        dosage: '',
                        frequency: '',
                        instructions: ''
                    }]);
                }
            } else if (!processedData.medications) {
                // If medications is null or undefined, set as empty array
                processedData.medications = JSON.stringify([]);
            }
            
            // Set the date if not provided
            if (!processedData.date) {
                processedData.date = new Date().toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                });
            }
            
            console.log('Sending prescription data:', processedData);
            
            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(processedData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save prescription');
            }
            
            const savedPrescription = await response.json();
            
            // After saving a prescription, reload the prescriptions list
            // This ensures the new prescription shows up in the patient dashboard
            await loadPrescriptions();
            
            return savedPrescription;
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
                
                // Ensure the dashboard page is visible
                const loginPage = document.getElementById('loginPage');
                const dashboardPage = document.getElementById('dashboardPage');
                loginPage.classList.remove('active');
                dashboardPage.classList.add('active');
                
                // Explicitly ensure the sidebar is visible by directly accessing it
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    console.log("Found sidebar element, making it visible");
                    sidebar.style.display = 'flex';
                    sidebar.style.visibility = 'visible';
                    sidebar.style.opacity = '1';
                    sidebar.style.transform = 'translateX(0)';
                } else {
                    console.error("Sidebar element not found in the DOM!");
                }
                
                // Perform navigation setup and load user data
                setupNavigation();
                updateUserInfo();
                
                // Add debug info
                console.log("Login check complete - user loaded:", user.name);
            } catch (e) {
                console.error("Error in checkExistingLogin:", e);
                // Invalid saved user data
                localStorage.removeItem('healthBuddyUser');
            }
        }
    }
    
    // API function to authenticate a user
    async function authenticateUser(username, password, userType) {
        try {
            // Use the login API endpoint
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, userType })
            });
            
            if (!response.ok) {
                // Handle auth errors
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed');
            }
            
            // Return the authenticated user data
            return await response.json();
        } catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }
    
    // API function to register a new user
    async function registerUser(userData) {
        try {
            const endpoint = userData.userType === 'doctor' ? '/api/register/doctor' : '/api/register/patient';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Registration failed');
            }
            
            return { success: true, data: result };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message };
        }
    }
    
    // API function to load doctors for the registration form
    async function loadDoctorsForRegistration() {
        try {
            const response = await fetch('/api/doctors');
            
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            
            const doctors = await response.json();
            const verifiedDoctors = doctors.filter(doctor => doctor.verified !== false);
            
            // Populate doctor dropdown in registration form
            const doctorSelect = document.getElementById('registerDoctor');
            doctorSelect.innerHTML = '<option value="">Select a Doctor</option>';
            
            verifiedDoctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.name} (${doctor.specialty})`;
                doctorSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading doctors for registration:', error);
        }
    }
    
    // API function to record a user visit
    async function recordUserVisit(userId) {
        try {
            const response = await fetch('/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, timestamp: new Date().toISOString() })
            });
            
            if (!response.ok) {
                throw new Error('Failed to record visit');
            }
            
            return true;
        } catch (error) {
            console.error('Error recording visit:', error);
            return false;
        }
    }
    
    // ===============================================================
    // EVENT LISTENERS
    // ===============================================================
    
    // Auth tabs switching
    document.getElementById('loginTabBtn').addEventListener('click', function() {
        document.getElementById('loginTabBtn').classList.add('active');
        document.getElementById('registerTabBtn').classList.remove('active');
        document.getElementById('loginFormContainer').classList.add('active');
        document.getElementById('registerFormContainer').classList.remove('active');
    });
    
    document.getElementById('registerTabBtn').addEventListener('click', function() {
        document.getElementById('registerTabBtn').classList.add('active');
        document.getElementById('loginTabBtn').classList.remove('active');
        document.getElementById('registerFormContainer').classList.add('active');
        document.getElementById('loginFormContainer').classList.remove('active');
        loadDoctorsForRegistration();
    });
    
    // Toggle doctor/patient specific fields in registration form
    document.getElementById('registerUserType').addEventListener('change', function() {
        const userType = this.value;
        const doctorFields = document.getElementById('doctorFields');
        const patientFields = document.getElementById('patientFields');
        
        if (userType === 'doctor') {
            doctorFields.style.display = 'block';
            patientFields.style.display = 'none';
        } else {
            doctorFields.style.display = 'none';
            patientFields.style.display = 'block';
        }
    });
    
    // Password visibility toggle functionality
    function setupPasswordToggle(toggleButtonId, passwordInputId) {
        const toggleButton = document.getElementById(toggleButtonId);
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                const passwordInput = document.getElementById(passwordInputId);
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
        }
    }
    
    // Setup password toggles for login and registration forms
    setupPasswordToggle('toggleLoginPassword', 'password');
    setupPasswordToggle('toggleRegisterPassword', 'registerPassword');
    setupPasswordToggle('toggleRegisterConfirmPassword', 'registerConfirmPassword');
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;
        
        // Show loading indicator
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        try {
            // Authenticate user via API
            const authenticatedUser = await authenticateUser(username, password, userType);
            
            if (authenticatedUser) {
                // Check if doctor account is verified
                if (userType === 'doctor' && authenticatedUser.verified === false) {
                    showToast('Your doctor account is pending verification. You will be notified once your account is verified.', 'warning');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }
                
                currentUser = {
                    id: authenticatedUser.id,
                    name: authenticatedUser.name,
                    type: userType,
                    // Include avatar if available
                    avatar: authenticatedUser.avatarUrl || null
                };
                
                // Save user to localStorage
                localStorage.setItem('healthBuddyUser', JSON.stringify(currentUser));
                document.body.dataset.userType = currentUser.type;
                
                // Record this login for visit tracking
                await recordUserVisit(authenticatedUser.id);
                
                // Explicitly show dashboard and ensure sidebar visibility
                const loginPage = document.getElementById('loginPage');
                const dashboardPage = document.getElementById('dashboardPage');
                loginPage.classList.remove('active');
                dashboardPage.classList.add('active');
                
                // Ensure the sidebar is visible
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.style.display = 'flex';
                    sidebar.style.visibility = 'visible';
                    sidebar.style.opacity = '1';
                    sidebar.style.transform = 'translateX(0)';
                    console.log("Sidebar explicitly made visible during login");
                } else {
                    console.error("Sidebar element not found during login!");
                }
                
                // Setup navigation and update user info
                setupNavigation();
                updateUserInfo();
                
                // Depending on user type, set default page
                const defaultPage = currentUser.type === 'doctor' ? 'doctorDashboard' : 'patientDashboard';
                navigateTo(defaultPage);
                
                // Load user-specific data
                if (currentUser.type === 'doctor') {
                    await loadDoctorData();
                } else {
                    await loadPatientData();
                }
                
                // Show welcome notification
                showToast(`Welcome, ${currentUser.name}!`, 'success');
            } else {
                showToast('Invalid username or password. Please try again.', 'error');
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('An error occurred during login. Please try again.', 'error');
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
    
    // Registration form submission
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get common form data
        const userType = document.getElementById('registerUserType').value;
        const name = document.getElementById('registerName').value.trim();
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const email = document.getElementById('registerEmail').value.trim();
        const contact = document.getElementById('registerContact').value.trim();
        
        // Validate password match
        if (password !== confirmPassword) {
            showToast('Passwords do not match. Please try again.', 'error');
            return;
        }
        
        // Show loading indicator
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        submitBtn.disabled = true;
        
        try {
            let userData = {
                name,
                username,
                password,
                email,
                contact,
                userType
            };
            
            // Add user type specific fields
            if (userType === 'doctor') {
                const specialty = document.getElementById('registerSpecialty').value;
                const license = document.getElementById('registerLicense').value.trim();
                const availability = document.getElementById('registerAvailability').value.trim();
                
                // Validate doctor fields
                if (!specialty) {
                    showToast('Please select a specialty.', 'error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }
                
                if (!license) {
                    showToast('Please enter your medical license number.', 'error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }
                
                userData = {
                    ...userData,
                    specialty,
                    license,
                    availability,
                    verified: false // Doctors start as unverified
                };
            } else {
                // Patient specific fields
                const age = document.getElementById('registerAge').value;
                const gender = document.getElementById('registerGender').value;
                const medicalHistory = document.getElementById('registerMedicalHistory').value.trim();
                const doctorId = document.getElementById('registerDoctor').value;
                
                // Validate patient fields
                if (!age) {
                    showToast('Please enter your age.', 'error');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    return;
                }
                
                userData = {
                    ...userData,
                    age: parseInt(age),
                    gender,
                    medicalHistory,
                    doctorId: doctorId || null
                };
            }
            
            // Register user via API
            const result = await registerUser(userData);
            
            if (result.success) {
                // Clear form
                this.reset();
                
                // Show appropriate message based on user type
                if (userType === 'doctor') {
                    showToast('Registration successful! Your account is pending verification by our administrators.', 'success');
                    // Switch back to login tab
                    document.getElementById('loginTabBtn').click();
                } else {
                    showToast('Registration successful! You can now log in.', 'success');
                    // Switch back to login tab
                    document.getElementById('loginTabBtn').click();
                }
            } else {
                showToast(result.message || 'Registration failed. Please try again.', 'error');
            }
            
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        } catch (error) {
            console.error('Registration error:', error);
            showToast('An error occurred during registration. Please try again.', 'error');
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
    
    // Toggle sidebar on mobile
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });
    
    // Appointment Request Button - show modal when clicked
    const requestAppointmentBtn = document.getElementById('requestAppointmentBtn');
    if (requestAppointmentBtn) {
        requestAppointmentBtn.addEventListener('click', function() {
            // Get references to date and doctor selection elements
            const dateInput = document.getElementById('appointmentDate');
            const doctorSelect = document.getElementById('appointmentDoctor');
            const timeSelect = document.getElementById('appointmentTime');
            
            // Set current date as minimum date and default value
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
            
            // Show toast notification about time slots
            showToast('Select doctor and date to view available 30-minute appointment slots', 'info');
            
            // Add event listeners to date and doctor selects to update time slots
            if (dateInput && doctorSelect && timeSelect) {
                // Update time slots when doctor changes
                doctorSelect.addEventListener('change', function() {
                    const selectedDoctorId = this.value;
                    const selectedDate = dateInput.value;
                    
                    if (selectedDoctorId && selectedDate) {
                        updateTimeSlotOptions(timeSelect, selectedDoctorId, selectedDate);
                    }
                });
                
                // Update time slots when date changes
                dateInput.addEventListener('change', function() {
                    const selectedDate = this.value;
                    const selectedDoctorId = doctorSelect.value;
                    
                    if (selectedDoctorId && selectedDate) {
                        updateTimeSlotOptions(timeSelect, selectedDoctorId, selectedDate);
                    }
                });
            }
            
            // Load doctors list
            loadDoctorsForAppointment();
            
            // Show modal
            const modal = document.getElementById('appointmentRequestModal');
            modal.style.display = 'block';
        });
    }
    
    // Function to generate 30-minute time slots
    function generateTimeSlots(startHour = 8, endHour = 17) {
        const slots = [];
        
        // Generate slots from startHour to endHour
        for (let hour = startHour; hour <= endHour; hour++) {
            // Add :00 slot
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            
            // Add :30 slot
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        
        return slots;
    }
    
    // Function to filter time slots based on existing appointments
    async function getAvailableTimeSlots(doctorId, appointmentDate, patientId = null) {
        if (!doctorId || !appointmentDate) {
            return generateTimeSlots(); // Return all slots if no doctor or date selected
        }
        
        try {
            // Get all slots
            const allSlots = generateTimeSlots();
            const bookedSlots = new Set();
            
            // Get doctor's appointments for that date
            const doctorResponse = await fetch(`/api/appointments?doctorId=${doctorId}&date=${appointmentDate}`);
            
            if (doctorResponse.ok) {
                const doctorAppointments = await doctorResponse.json();
                
                // Add doctor's booked slots
                doctorAppointments
                    .filter(app => app.status !== 'Cancelled')
                    .forEach(app => bookedSlots.add(app.time));
            } else {
                console.error('Failed to fetch doctor appointments');
            }
            
            // If patientId is provided, also check patient's appointments for that date
            if (patientId) {
                const patientResponse = await fetch(`/api/appointments?patientId=${patientId}&date=${appointmentDate}`);
                
                if (patientResponse.ok) {
                    const patientAppointments = await patientResponse.json();
                    
                    // Add patient's booked slots
                    patientAppointments
                        .filter(app => app.status !== 'Cancelled')
                        .forEach(app => bookedSlots.add(app.time));
                } else {
                    console.error('Failed to fetch patient appointments');
                }
            }
            
            // Return available slots (those not in the bookedSlots set)
            return allSlots.filter(slot => !bookedSlots.has(slot));
        } catch (error) {
            console.error('Error getting available time slots:', error);
            return generateTimeSlots(); // Return all slots on error
        }
    }
    
    // Function to update time slot options in appointment forms
    async function updateTimeSlotOptions(selectElement, doctorId, appointmentDate, patientId = null) {
        if (!selectElement) return;
        
        try {
            // Show loading indicator
            selectElement.innerHTML = '<option value="">Loading time slots...</option>';
            
            // If no patientId was provided but current user is a patient, use their ID
            if (!patientId && currentUser && currentUser.type === 'patient') {
                patientId = currentUser.id;
            }
            
            console.log(`Getting available time slots for doctor: ${doctorId}, date: ${appointmentDate}, patient: ${patientId || 'none'}`);
            
            // Get available slots checking both doctor and patient conflicts
            const availableSlots = await getAvailableTimeSlots(doctorId, appointmentDate, patientId);
            
            // Clear and populate select element
            selectElement.innerHTML = '<option value="">Select a time</option>';
            
            availableSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                selectElement.appendChild(option);
            });
            
            // If no available slots, show message and notification
            if (availableSlots.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No available slots for this date";
                selectElement.appendChild(option);
                
                // Show user-friendly toast notification about why there are no slots
                if (patientId) {
                    showToast('No available time slots on this date. Either the doctor is fully booked or you have conflicting appointments.', 'info');
                } else {
                    showToast('No available time slots for this date. Please select another date.', 'info');
                }
            }
        } catch (error) {
            console.error('Error updating time slots:', error);
            selectElement.innerHTML = '<option value="">Error loading time slots</option>';
        }
    }
    
    // Function to load doctors for appointment request
    async function loadDoctorsForAppointment() {
        try {
            console.log('Starting loadDoctorsForAppointment function');
            const response = await fetch('/api/doctors');
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            
            const doctors = await response.json();
            console.log('Doctors loaded:', doctors);
            
            const doctorSelect = document.getElementById('appointmentDoctor');
            if (!doctorSelect) {
                console.error('Doctor select element not found!');
                return;
            }
            
            // Clear existing options except the first one
            while (doctorSelect.options.length > 1) {
                doctorSelect.remove(1);
            }
            
            // Add doctor options
            doctors.forEach(doctor => {
                console.log('Processing doctor:', doctor);
                const option = document.createElement('option');
                option.value = doctor.id;
                
                // Include specialty information if available
                if (doctor.specialty && doctor.specialty.trim() !== '') {
                    option.textContent = `${doctor.name} (${doctor.specialty})`;
                    console.log(`Set option text to ${doctor.name} (${doctor.specialty})`);
                } else {
                    option.textContent = doctor.name;
                    console.log(`Set option text to ${doctor.name} - no specialty found`);
                }
                doctorSelect.appendChild(option);
            });
            
            // Add event listener to display doctor info when selected
            doctorSelect.addEventListener('change', function() {
                const selectedDoctorId = this.value;
                console.log('Doctor selected:', selectedDoctorId);
                if (!selectedDoctorId) return;
                
                const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
                console.log('Selected doctor details:', selectedDoctor);
                
                if (selectedDoctor) {
                    // Try to find existing info element
                    let infoElement = document.getElementById('doctorSpecialtyInfo');
                    let infoParent = document.querySelector('.doctor-info');
                    
                    // Create elements if they don't exist
                    if (!infoElement || !infoParent) {
                        console.log('Doctor info elements not found, creating them...');
                        
                        // If the parent exists but not the span, just create the span
                        if (infoParent && !infoElement) {
                            infoElement = document.createElement('span');
                            infoElement.id = 'doctorSpecialtyInfo';
                            infoParent.appendChild(infoElement);
                        } 
                        // If neither exists, create both
                        else if (!infoParent) {
                            // Find the doctor select element to insert after
                            const doctorSelectGroup = doctorSelect.closest('.form-group');
                            
                            if (doctorSelectGroup) {
                                // Create parent
                                infoParent = document.createElement('div');
                                infoParent.className = 'doctor-info';
                                infoParent.style.display = 'none';
                                infoParent.style.marginTop = '5px';
                                infoParent.style.fontStyle = 'italic';
                                
                                // Create label and span
                                const smallText = document.createElement('small');
                                smallText.textContent = 'Specialty: ';
                                
                                infoElement = document.createElement('span');
                                infoElement.id = 'doctorSpecialtyInfo';
                                
                                // Assemble the elements
                                smallText.appendChild(infoElement);
                                infoParent.appendChild(smallText);
                                
                                // Add to DOM
                                doctorSelectGroup.appendChild(infoParent);
                                console.log('Created and added doctor specialty elements');
                            } else {
                                console.error('Could not find doctor select group to append info');
                                return;
                            }
                        }
                    }
                    
                    // Use a default if specialty is missing or empty
                    const specialty = selectedDoctor.specialty && 
                                      selectedDoctor.specialty.trim() !== '' ? 
                                      selectedDoctor.specialty : 'General Practitioner';
                    
                    infoElement.textContent = specialty;
                    infoParent.style.display = 'block';
                    console.log('Updated specialty info to:', specialty);
                }
            });
            
            // Trigger the change event on the first valid option to show specialty by default
            if (doctorSelect.options.length > 1) {
                doctorSelect.selectedIndex = 1; // Select the first doctor
                doctorSelect.dispatchEvent(new Event('change'));
            }
            
        } catch (error) {
            console.error('Error loading doctors:', error);
            showToast('Error loading doctors. Please try again.', 'error');
        }
    }
    
    // Close modal when clicking the close button or outside the modal
    document.querySelectorAll('.modal .close, .modal .modal-close').forEach(elem => {
        elem.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Appointment Request Form Submission
    const appointmentRequestForm = document.getElementById('appointmentRequestForm');
    if (appointmentRequestForm) {
        appointmentRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Appointment request form submitted');
            
            // Get form data
            const doctorSelect = document.getElementById('appointmentDoctor');
            const doctorId = doctorSelect.value;
            const date = document.getElementById('appointmentDate').value;
            const time = document.getElementById('appointmentTime').value;
            const purpose = document.getElementById('appointmentPurpose').value;
            const notes = document.getElementById('appointmentNotes').value;
            
            console.log('Form fields:', {
                doctorId, 
                doctorOptions: Array.from(doctorSelect.options).map(o => ({value: o.value, text: o.text})),
                date, 
                time, 
                purpose, 
                notes, 
                currentUser
            });
            
            // Validate required fields
            if (!doctorId || !date || !time) {
                showToast('Please fill in all required fields', 'error');
                return;
            }
            
            // Show loading indicator
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';
            submitBtn.disabled = true;
            
            try {
                // Create appointment data
                const appointmentData = {
                    patientId: currentUser.id,
                    doctorId: doctorId,
                    date: date,
                    time: time,
                    purpose: purpose || 'General Consultation',
                    notes: notes || '',
                    status: 'Scheduled'
                };
                
                console.log('Submitting appointment data:', appointmentData);
                
                // Submit request
                const result = await createAppointment(appointmentData);
                
                // Close modal and show success message
                document.getElementById('appointmentRequestModal').style.display = 'none';
                showToast('Appointment requested successfully!', 'success');
                
                // Reset form
                this.reset();
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            } catch (error) {
                console.error('Error requesting appointment:', error);
                showToast('Error requesting appointment. Please try again.', 'error');
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
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
    document.getElementById('testForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('testPatient').value;
        const testType = document.getElementById('testType').value;
        const testDate = document.getElementById('testDate').value;
        const notes = document.getElementById('testNotes').value;
        
        // Get patient name from select element
        const patientName = document.querySelector(`#testPatient option[value="${patientId}"]`).textContent;
        
        try {
            // Prepare test data
            const testData = {
                patientId,
                patientName,
                testType,
                date: testDate,
                notes,
                doctorId: currentUser.id,
                doctorName: currentUser.name,
                status: 'Pending'
            };
            
            // Submit test via API
            const result = await createTest(testData);
            
            if (result) {
                showToast(`Test initiated successfully for ${patientName}`, 'success');
                
                // Reset form
                this.reset();
                
                // Set current date as default
                document.getElementById('testDate').value = new Date().toISOString().split('T')[0];
                
                // Refresh recent tests list
                await loadRecentTests();
            }
        } catch (error) {
            console.error('Error creating test:', error);
            showToast('Error creating test. Please try again.', 'error');
        }
    });
    
    // Prescription form submission
    document.getElementById('prescriptionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const patientId = document.getElementById('prescriptionPatient').value;
        const prescriptionDetails = document.getElementById('prescriptionDetails').value;
        const validFrom = document.getElementById('validFrom').value;
        const validUntil = document.getElementById('validUntil').value;
        
        // Get patient name from select element
        const patientName = document.querySelector(`#prescriptionPatient option[value="${patientId}"]`).textContent;
        
        try {
            // Process prescription details into medication objects
            // Expecting format like "Medication name 500mg, Once daily. Take with food"
            let medications = [];
            
            if (prescriptionDetails) {
                // Split by double newlines to separate medications
                const medicationTexts = prescriptionDetails.split(/\n\s*\n/);
                
                medications = medicationTexts.map(medText => {
                    const parts = medText.trim().split(/\.\s+/);
                    const firstPart = parts[0].split(',');
                    
                    // Extract medication name and dosage
                    const nameAndDosage = firstPart[0].trim().split(/\s+(?=\d+\w+$)/);
                    const name = nameAndDosage.length > 1 ? nameAndDosage[0] : firstPart[0];
                    const dosage = nameAndDosage.length > 1 ? nameAndDosage[1] : '';
                    
                    // Extract frequency
                    const frequency = firstPart.length > 1 ? firstPart[1].trim() : '';
                    
                    // Extract instructions
                    const instructions = parts.length > 1 ? parts[1].trim() : '';
                    
                    return {
                        name,
                        dosage,
                        frequency,
                        instructions
                    };
                });
            }
            
            // Prepare prescription data
            const prescriptionData = {
                patientId,
                patientName,
                doctorId: currentUser.id,
                doctorName: currentUser.name,
                medications,
                validFrom,
                validUntil,
                details: medications.length === 0 ? prescriptionDetails : null, // Fallback if parsing failed
                diagnosis: document.getElementById('prescriptionNotes').value || "General prescription" // Use notes as diagnosis or default value
            };
            
            // Submit prescription via API
            const result = await savePrescription(prescriptionData);
            
            if (result) {
                showToast(`Prescription saved successfully for ${patientName}`, 'success');
                
                // Reset form
                this.reset();
                
                // Set default dates
                const today = new Date().toISOString().split('T')[0];
                const threeMonthsLater = new Date();
                threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
                
                document.getElementById('validFrom').value = today;
                document.getElementById('validUntil').value = threeMonthsLater.toISOString().split('T')[0];
                
                // Refresh prescriptions list
                await loadPrescriptions();
            }
        } catch (error) {
            console.error('Error saving prescription:', error);
            showToast('Error saving prescription. Please try again.', 'error');
        }
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
        const sidebar = document.getElementById('sidebar');
        
        // Make sure sidebar is visible and reset any transforms
        if (sidebar) {
            sidebar.style.transform = window.innerWidth <= 768 ? 'translateX(-100%)' : 'translateX(0)';
            console.log("Sidebar visibility set for width:", window.innerWidth);
        } else {
            console.error("Sidebar element not found!");
        }
        
        loginPage.classList.remove('active');
        dashboardPage.classList.add('active');
        
        // Ensure main content positioning is correct
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginLeft = window.innerWidth <= 768 ? '0' : '260px';
            console.log("Main content margin set for width:", window.innerWidth);
        }
    }
    
    // Set up navigation based on user type
    function setupNavigation() {
        console.log("Setting up navigation for user type:", currentUser.type);
        
        // Ensure sidebar is visible
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'flex';
            sidebar.style.transform = 'translateX(0)';
            console.log("Sidebar display set to flex");
        } else {
            console.error("Sidebar element not found!");
        }
        
        const navLinksContainer = document.getElementById('navLinks');
        if (!navLinksContainer) {
            console.error("Navigation links container not found!");
            return;
        }
        
        // Clear existing links
        navLinksContainer.innerHTML = '';
        console.log("Cleared existing navigation links");
        
        // Links that are shown to both doctors and patients
        const sharedLinks = [
            { id: 'doctorDashboard', id2: 'patientDashboard', label: 'Dashboard', icon: 'fa-home' }
        ];
        
        if (currentUser.type === 'doctor') {
            console.log("Setting up doctor navigation links");
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
            
            console.log("Doctor navigation links added:", links.length);
            
            // Load doctor data
            loadDoctorData();
            
        } else if (currentUser.type === 'patient') {
            console.log("Setting up patient navigation links");
            // Patient-specific navigation links
            const patientLinks = [
                { id: 'patientAppointments', label: 'Appointments', icon: 'fa-calendar-check' },
                { id: 'patientPrescriptions', label: 'Prescriptions', icon: 'fa-pills' },
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
            
            console.log("Patient navigation links added:", links.length);
            
            // Load patient data
            loadPatientData();
        }
        
        // Finally, update the user info in the sidebar
        updateUserInfo();
        
        // Set up layout controls
        setupLayoutControls();
    }
    
    // Handle dynamic layout controls - complete rewrite
    function setupLayoutControls() {
        // Layout control buttons
        const layoutCompact = document.getElementById('layoutCompact');
        const layoutDefault = document.getElementById('layoutDefault');
        const layoutExpanded = document.getElementById('layoutExpanded');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (layoutCompact && layoutDefault && layoutExpanded && sidebar && mainContent) {
            console.log("Setting up dynamic layout controls");
            
            // Helper function to apply layout changes
            function applyLayout(layout) {
                // First, remove all layout classes from body
                document.body.classList.remove('layout-compact', 'layout-expanded');
                
                // Remove any inline styles that could be interfering
                sidebar.removeAttribute('style');
                mainContent.removeAttribute('style');
                
                // Then apply the specific layout class if needed
                if (layout !== 'default') {
                    document.body.classList.add(`layout-${layout}`);
                }
                
                // Update button active states
                document.querySelectorAll('.layout-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to the clicked button
                document.getElementById(`layout${layout.charAt(0).toUpperCase() + layout.slice(1)}`).classList.add('active');
                
                // Save preference
                localStorage.setItem('healthBuddyLayout', layout);
                
                // Force a layout refresh
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 50);
            }
            
            // Compact layout (minimal sidebar)
            layoutCompact.addEventListener('click', function() {
                applyLayout('compact');
            });
            
            // Default layout
            layoutDefault.addEventListener('click', function() {
                applyLayout('default');
            });
            
            // Expanded layout (wider content)
            layoutExpanded.addEventListener('click', function() {
                applyLayout('expanded');
            });
            
            // Load user's saved preference
            const savedLayout = localStorage.getItem('healthBuddyLayout') || 'default';
            applyLayout(savedLayout);
        }
    }
    
    // Navigate to a specific page
    function navigateTo(pageId) {
        console.log("Navigating to page:", pageId, "Current user:", currentUser?.type);
        
        // Special handling for patient prescriptions
        if (pageId === 'patientPrescriptions' && currentUser && currentUser.type === 'patient') {
            console.log("Special handling for patient prescriptions");
            
            // Hide all content pages first
            const contentPages = document.querySelectorAll('.content-page');
            contentPages.forEach(page => {
                page.style.display = 'none';
                page.classList.remove('active');
            });
            
            // Ensure the page exists
            if (!document.getElementById('patientPrescriptions')) {
                console.log("Creating patient prescriptions page on navigation");
                createPatientPrescriptionsPage();
            }
            
            // Get the page and ensure it's visible
            const prescriptionsPage = document.getElementById('patientPrescriptions');
            if (prescriptionsPage) {
                prescriptionsPage.style.display = 'block';
                prescriptionsPage.classList.add('active');
                currentPage = pageId;
                
                // Update UI components
                updatePageTitle(pageId);
                updateActiveNavLink(pageId);
                
                // Load the prescriptions data
                console.log("Loading patient prescriptions from navigation");
                setTimeout(() => {
                    loadPatientPrescriptions();
                }, 100); // Small delay to ensure DOM is ready
            } else {
                console.error("Failed to create or find patient prescriptions page");
                showToast("Error loading prescriptions page", "error");
            }
            
            return;
        }
        
        // Standard navigation for other pages
        // Hide all content pages
        const contentPages = document.querySelectorAll('.content-page');
        contentPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // Show the selected page
        const selectedPage = document.getElementById(pageId);
        if (selectedPage) {
            selectedPage.style.display = 'block';
            selectedPage.classList.add('active');
            currentPage = pageId;
            console.log("Navigated to page:", pageId);
            
            // Update page title
            updatePageTitle(pageId);
            
            // Update active navigation link
            updateActiveNavLink(pageId);
            
            // Initialize specific page components
            if (pageId === 'startTests' && currentUser && currentUser.type === 'doctor') {
                console.log("Should load patients for test form now.");
                // Load test types
                fetchTestTypes().then(types => {
                    const testTypeSelect = document.getElementById('testType');
                    if (testTypeSelect) {
                        testTypeSelect.innerHTML = '<option value="">Select Test Type</option>';
                        types.forEach(type => {
                            const option = document.createElement('option');
                            option.value = type;
                            option.textContent = type;
                            testTypeSelect.appendChild(option);
                        });
                    }
                }).catch(err => console.error('Error loading test types:', err));
                
                // Load patients for test form
                loadPatientsForTest();
            }
            
            if (pageId === 'prescriptions' && currentUser && currentUser.type === 'doctor') {
                // Load patients for prescription form
                loadPatientsForPrescription();
            }
            
            if (pageId === 'patientPrescriptions' && currentUser && currentUser.type === 'patient') {
                // Load prescriptions for the patient
                loadPatientPrescriptions();
            }
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
            patientPrescriptions: 'My Prescriptions',
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
            // Setup doctor appointment creation functionality
            setupDoctorAppointmentForm();
            
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
            console.log('Loading patient data for ID:', currentUser.id);
            
            // Make sure prescription page exists
            if (!document.getElementById('patientPrescriptions')) {
                console.log('Pre-creating patient prescriptions page during loadPatientData');
                createPatientPrescriptionsPage();
            }

            // Fetch patient-specific prescriptions
            const patientPrescriptions = await fetchPrescriptions(null, currentUser.id);
            console.log('Found patient prescriptions:', patientPrescriptions);
            
            // Add a button to the dashboard to show prescriptions
            const dashboardCardContainer = document.querySelector('#patientDashboard .dashboard-cards');
            if (dashboardCardContainer) {
                // Create a prescription quick access card
                const prescriptionCard = document.createElement('div');
                prescriptionCard.className = 'card dashboard-card';
                prescriptionCard.innerHTML = `
                    <div class="card-header">
                        <h3>My Prescriptions</h3>
                    </div>
                    <div class="card-body">
                        <p>${patientPrescriptions.length} prescriptions found.</p>
                        <button id="viewPrescriptionsBtn" class="btn btn-primary">View All Prescriptions</button>
                    </div>
                `;
                
                // Add the card to the dashboard
                dashboardCardContainer.appendChild(prescriptionCard);
                
                // Add click event for the button
                document.getElementById('viewPrescriptionsBtn').addEventListener('click', () => {
                    console.log('View prescriptions button clicked');
                    showPatientPrescriptions();
                });
            }
            
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
                        tr.classList.add('clickable-row');
                        tr.innerHTML = `
                            <td>${app.doctorName}</td>
                            <td>${formatDate(app.date)}</td>
                            <td>${app.time}</td>
                            <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                        `;
                        // Make row clickable to show appointment details
                        tr.addEventListener('click', () => {
                            showAppointmentDetails(app);
                        });
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
                        tr.classList.add('clickable-row');
                        tr.innerHTML = `
                            <td>${app.doctorName}</td>
                            <td>${formatDate(app.date)}</td>
                            <td>${app.time}</td>
                            <td>${app.purpose}</td>
                            <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                        `;
                        // Make row clickable to show appointment details
                        tr.addEventListener('click', () => {
                            showAppointmentDetails(app);
                        });
                        patientAppsTable.appendChild(tr);
                    });
                } else {
                    patientAppsTable.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found</td></tr>';
                }
                
                // Load patient reports from API
                await loadReports('patientReportsGrid');
                
                // Update the patient reports dashboard section
                const dashboardReportsList = document.getElementById('patientRecentReportsList');
                dashboardReportsList.innerHTML = '';
                
                if (reports && reports.length > 0) {
                    // Show most recent reports for dashboard
                    const recentReports = [...reports]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 3);
                    
                    recentReports.forEach(report => {
                        const tr = document.createElement('tr');
                        tr.classList.add('clickable-row');
                        tr.innerHTML = `
                            <td>${report.category}</td>
                            <td>${report.title}</td>
                            <td>${formatDate(report.date)}</td>
                        `;
                        // Make row clickable to show report details
                        tr.addEventListener('click', () => {
                            showReportDetails(report);
                        });
                        dashboardReportsList.appendChild(tr);
                    });
                } else {
                    dashboardReportsList.innerHTML = '<tr><td colspan="3" class="text-center">No recent reports</td></tr>';
                }
                
                // Get prescriptions
                await loadPrescriptions();
                
                // Update the active prescriptions dashboard section
                const dashboardPrescriptionsList = document.getElementById('patientActivePrescriptionsList');
                dashboardPrescriptionsList.innerHTML = '';
                
                if (prescriptions && prescriptions.length > 0) {
                    // Show active prescriptions for dashboard
                    const activePrescriptions = prescriptions.slice(0, 3);
                    
                    activePrescriptions.forEach(prescription => {
                        const medicationNames = prescription.medications 
                            ? prescription.medications.map(med => med.name).join(', ')
                            : 'No medications listed';
                            
                        const tr = document.createElement('tr');
                        tr.classList.add('clickable-row');
                        tr.innerHTML = `
                            <td>${prescription.doctorName}</td>
                            <td>${truncateText(medicationNames, 30)}</td>
                            <td>${formatDate(prescription.date)}</td>
                        `;
                        // Make row clickable to show prescription details
                        tr.addEventListener('click', () => {
                            showPrescriptionDetails(prescription);
                        });
                        dashboardPrescriptionsList.appendChild(tr);
                    });
                } else {
                    dashboardPrescriptionsList.innerHTML = '<tr><td colspan="3" class="text-center">No active prescriptions</td></tr>';
                }
            }
        } catch (error) {
            console.error('Error loading patient data:', error);
            showToast('Error loading patient data. Please try again.', 'error');
        }
    }
    
    // Show appointment details in a modal
    function showAppointmentDetails(appointment) {
        const modal = document.getElementById('appointmentDetailsModal') || createAppointmentDetailsModal();
        
        // Update modal content
        modal.querySelector('.modal-title').textContent = 'Appointment Details';
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="appointment-details">
                <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
                <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${appointment.status.toLowerCase().replace(' ', '-')}">${appointment.status}</span></p>
                ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
            </div>
        `;
        
        // Display modal
        modal.style.display = 'block';
    }
    
    // Function to directly show patient prescriptions page
    function showPatientPrescriptions() {
        console.log('Showing patient prescriptions with direct function');
        
        // Make sure the page exists
        if (!document.getElementById('patientPrescriptions')) {
            console.log('Creating patient prescriptions page in direct function');
            createPatientPrescriptionsPage();
        }
        
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        
        // Show the prescriptions page
        const prescriptionsPage = document.getElementById('patientPrescriptions');
        if (prescriptionsPage) {
            prescriptionsPage.style.display = 'block';
            prescriptionsPage.classList.add('active');
            
            // Update UI elements
            updatePageTitle('patientPrescriptions');
            updateActiveNavLink('patientPrescriptions');
            
            // Load the prescription data
            loadPatientPrescriptions();
            
            // Show confirmation toast
            showToast('Viewing your prescriptions', 'info');
        } else {
            console.error('Failed to find or create patient prescriptions page');
            showToast('Error loading prescriptions page', 'error');
        }
    }
    
    // Show prescription details in a modal
    function showPrescriptionDetails(prescription) {
        console.log('Showing prescription details:', prescription);
        
        try {
            // Create modal if it doesn't exist
            const modal = document.getElementById('prescriptionDetailsModal') || createPrescriptionDetailsModal();
            
            // Update modal content
            modal.querySelector('.modal-title').textContent = 'Prescription Details';
            
            const modalBody = modal.querySelector('.modal-body');
            
            // Format medications list
            let medicationsHtml = '<ul class="medications-list">';
            if (prescription.medications && prescription.medications.length > 0) {
                prescription.medications.forEach(med => {
                    const dosage = med.dosage || 'Dosage not specified';
                    medicationsHtml += `<li><strong>${med.name}</strong> - ${dosage}</li>`;
                });
            } else {
                medicationsHtml += '<li>No medications listed</li>';
            }
            medicationsHtml += '</ul>';
            
            // Format validity period
            const fromDate = prescription.validFrom 
                ? formatDate(prescription.validFrom) 
                : formatDate(prescription.date);
                
            let untilDate = 'Ongoing';
            if (prescription.validUntil) {
                untilDate = formatDate(prescription.validUntil);
            } else {
                // If no validUntil, assume 30 days from date as default
                const dateObj = new Date(prescription.date);
                dateObj.setDate(dateObj.getDate() + 30);
                untilDate = formatDate(dateObj);
            }
            
            // Build the modal content with appropriate fallbacks for missing data
            modalBody.innerHTML = `
                <div class="prescription-details">
                    <div class="prescription-header">
                        <p class="prescription-id"><strong>Prescription ID:</strong> ${prescription.id}</p>
                        <p class="prescription-date"><strong>Date Issued:</strong> ${formatDate(prescription.date)}</p>
                    </div>
                    
                    <div class="patient-doctor-info">
                        <p><strong>Doctor:</strong> ${prescription.doctorName}</p>
                        <p><strong>Patient:</strong> ${prescription.patientName}</p>
                    </div>
                    
                    <div class="prescription-primary-info">
                        <p><strong>Diagnosis:</strong> ${prescription.diagnosis || 'Not specified'}</p>
                        <p><strong>Valid Period:</strong> ${fromDate} to ${untilDate}</p>
                    </div>
                    
                    <div class="medications-section">
                        <p><strong>Medications:</strong></p>
                        ${medicationsHtml}
                    </div>
                    
                    ${prescription.instructions ? 
                        `<div class="instructions-section">
                            <p><strong>Instructions:</strong> ${prescription.instructions}</p>
                         </div>` 
                      : ''}
                </div>
            `;
            
            // Display modal
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error displaying prescription details:', error);
            showToast('Error displaying prescription details', 'error');
        }
    }
    
    // Create modal for appointment details if it doesn't exist
    function createAppointmentDetailsModal() {
        const modal = document.createElement('div');
        modal.id = 'appointmentDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Appointment Details</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Content will be filled dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close modal
        const closeBtn = modal.querySelector('.close');
        const closeBtnFooter = modal.querySelector('.close-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        closeBtnFooter.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close when clicking outside the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    }
    
    // Create modal for prescription details if it doesn't exist
    function createPrescriptionDetailsModal() {
        const modal = document.createElement('div');
        modal.id = 'prescriptionDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Prescription Details</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Content will be filled dynamically -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary close-btn">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners to close modal
        const closeBtn = modal.querySelector('.close');
        const closeBtnFooter = modal.querySelector('.close-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        closeBtnFooter.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close when clicking outside the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    }
    
    // Load doctor appointments
    function loadDoctorAppointments() {
        // Dashboard appointments (today's only)
        const dashboardAppsList = document.getElementById('dashboardAppointmentsList');
        dashboardAppsList.innerHTML = '';
        
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = appointments.filter(app => app.date === today);
        
        // Sort today's appointments by status priority: In Progress, Scheduled, Completed
        const statusOrder = { 'In Progress': 0, 'Scheduled': 1, 'Completed': 2, 'Cancelled': 3 };
        todaysAppointments.sort((a, b) => {
            // Sort by status priority
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            
            // Then by time
            return a.time.localeCompare(b.time);
        });
        
        if (todaysAppointments.length > 0) {
            todaysAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.classList.add('clickable-row');
                // Add warning icon for conflicting appointments
                const conflictWarning = app.hasConflict ? 
                    `<i class="fas fa-exclamation-triangle text-warning" title="This appointment conflicts with ${app.conflictCount-1} other appointment(s)"></i> ` : 
                    '';
                    
                tr.innerHTML = `
                    <td>${conflictWarning}${app.patientName}</td>
                    <td>${app.time}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                `;
                tr.addEventListener('click', () => {
                    showAppointmentDetails(app);
                });
                dashboardAppsList.appendChild(tr);
            });
        } else {
            dashboardAppsList.innerHTML = '<tr><td colspan="3" class="text-center">No appointments today</td></tr>';
        }
        
        // All appointments
        const appsTable = document.getElementById('doctorAppointmentsTable');
        appsTable.innerHTML = '';
        
        if (appointments.length > 0) {
            // Sort by status first: In Progress, Scheduled, Completed
            // Then by date, newest first
            const sortedAppointments = [...appointments].sort((a, b) => {
                // First sort by status
                const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                if (statusDiff !== 0) return statusDiff;
                
                // Then by date (newest first)
                return new Date(a.date) - new Date(b.date);
            });
            
            sortedAppointments.forEach(app => {
                const tr = document.createElement('tr');
                tr.classList.add('clickable-row');
                tr.innerHTML = `
                    <td>${app.patientName}</td>
                    <td>${formatDate(app.date)}</td>
                    <td>${app.time}</td>
                    <td>${app.purpose}</td>
                    <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-link edit-appointment" data-id="${app.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-link cancel-appointment" data-id="${app.id}" title="Cancel">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </td>
                `;
                // Make row clickable
                tr.addEventListener('click', (e) => {
                    // Don't trigger if clicking on buttons
                    if (!e.target.closest('.table-actions')) {
                        showAppointmentDetails(app);
                    }
                });
                
                // Add event listeners for buttons
                appsTable.appendChild(tr);
                
                // Add button event listeners after appending to avoid propagation issues
                const editBtn = tr.querySelector('.edit-appointment');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent row click
                    showToast(`Editing appointment for ${app.patientName}`);
                    // Update appointment status code would go here
                });
                
                const cancelBtn = tr.querySelector('.cancel-appointment');
                cancelBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent row click
                    showToast(`Cancelled appointment for ${app.patientName}`);
                    // Cancellation code would go here
                });
            });
        } else {
            appsTable.innerHTML = '<tr><td colspan="6" class="text-center">No appointments found</td></tr>';
        }
    }
    
    // API function to fetch test types
    async function fetchTestTypes() {
        try {
            const response = await fetch('/api/test-types');
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
            // Fetch tests from API
            const response = await fetch('/api/tests');
            if (!response.ok) {
                throw new Error('Failed to fetch tests');
            }
            tests = await response.json();
            
            // Also populate the test type dropdown
            const testTypeSelect = document.getElementById('testType');
            if (testTypeSelect) {
                testTypeSelect.innerHTML = '<option value="">Select Test Type</option>';
                
                // Get test types from API
                try {
                    const testTypesData = await fetchTestTypes();
                    if (testTypesData && testTypesData.length > 0) {
                        testTypesData.forEach(type => {
                            const option = document.createElement('option');
                            option.value = type;
                            option.textContent = type;
                            testTypeSelect.appendChild(option);
                        });
                    } else {
                        console.error('No test types returned from API');
                    }
                } catch (error) {
                    console.error('Error fetching test types:', error);
                }
            }
            
            // Populate dashboard pending tests section
            const dashboardTestsList = document.getElementById('pendingTestsList');
            if (dashboardTestsList) {
                dashboardTestsList.innerHTML = '';
                
                // Get pending and in-progress tests for dashboard
                const pendingTests = tests
                    .filter(test => test.status === 'Pending' || test.status === 'In Progress')
                    .slice(0, 3);
                
                if (pendingTests.length > 0) {
                    pendingTests.forEach(test => {
                        const tr = document.createElement('tr');
                        tr.classList.add('clickable-row');
                        tr.innerHTML = `
                            <td>${test.patientName}</td>
                            <td>${test.testType}</td>
                            <td><span class="status-badge status-${test.status.toLowerCase().replace(' ', '-')}">${test.status}</span></td>
                        `;
                        // Make row clickable
                        tr.addEventListener('click', () => {
                            // Show test details in a modal
                            showToast(`Viewing test: ${test.testType} for ${test.patientName}`);
                        });
                        dashboardTestsList.appendChild(tr);
                    });
                } else {
                    dashboardTestsList.innerHTML = '<tr><td colspan="3" class="text-center">No pending tests</td></tr>';
                }
            }
            
            if (tests.length > 0) {
                // Sort by status first (Pending, In Progress, then Completed)
                // Then by date, most recent first
                const statusOrder = { 'In Progress': 0, 'Pending': 1, 'Completed': 2 };
                const sortedTests = [...tests].sort((a, b) => {
                    // First sort by status
                    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                    if (statusDiff !== 0) return statusDiff;
                    
                    // Then sort by date (newest first)
                    return new Date(b.date) - new Date(a.date);
                });
                
                sortedTests.forEach(test => {
                    const tr = document.createElement('tr');
                    tr.classList.add('clickable-row');
                    tr.innerHTML = `
                        <td>${test.patientName}</td>
                        <td>${test.testType}</td>
                        <td>${formatDate(test.date)}</td>
                        <td><span class="status-badge status-${test.status.toLowerCase().replace(' ', '-')}">${test.status}</span></td>
                    `;
                    // Make row clickable
                    tr.addEventListener('click', () => {
                        // Show test details in a modal
                        showToast(`Viewing test: ${test.testType} for ${test.patientName}`);
                    });
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
            console.log('Fetching prescriptions for:', { doctorId, patientId, currentUser: currentUser?.id });
            
            // If no patientId provided but we have a patient user, use their ID
            if (!patientId && currentUser && currentUser.type === 'patient') {
                patientId = currentUser.id;
                console.log('Using current patient ID:', patientId);
            }
            
            // Build the URL with parameters
            let url = '/api/prescriptions';
            const params = new URLSearchParams();
            
            if (doctorId) {
                params.append('doctorId', doctorId);
            }
            
            if (patientId) {
                params.append('patientId', patientId);
            }
            
            // Add current user ID for debugging
            if (currentUser && currentUser.id) {
                params.append('currentUser', currentUser.id);
            }
            
            // Add params to URL if any exist
            const paramString = params.toString();
            if (paramString) {
                url += `?${paramString}`;
            }
            
            console.log('Fetching prescriptions from URL:', url);
            
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            try {
                const response = await fetch(url, { 
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'no-cache', 
                        'Pragma': 'no-cache'
                    }
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server response error:', errorText);
                    throw new Error(`Failed to fetch prescriptions: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Fetched prescriptions data successfully:', data.length, 'prescriptions');
                
                // Ensure proper data format
                if (!Array.isArray(data)) {
                    console.error('Expected array of prescriptions but got:', data);
                    return [];
                }
                
                return data;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.error('Fetch request timed out');
                    throw new Error('Request timed out. Server took too long to respond.');
                }
                throw fetchError;
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            showToast('Error loading prescriptions: ' + (error.message || 'Unknown error'), 'error');
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
    
    // Function to load patient-specific prescriptions
    async function loadPatientPrescriptions() {
        try {
            console.log('Loading patient prescriptions for patient ID:', currentUser.id);
            
            // Show a loading message in case prescriptions take time to load
            showToast('Loading your prescriptions...', 'info');
            
            // Check if the patient prescriptions page exists, if not create it
            if (!document.getElementById('patientPrescriptions')) {
                createPatientPrescriptionsPage();
            }
            
            // Fetch prescriptions data for this patient
            const patientPrescriptions = await fetchPrescriptions(null, currentUser.id);
            console.log('Fetched patient prescriptions:', patientPrescriptions);
            
            // Get the patient prescriptions table element
            const patientPrescriptionsTable = document.getElementById('patientPrescriptionsTable');
            
            if (!patientPrescriptionsTable) {
                console.error('Patient prescriptions table element not found!');
                return;
            }
            
            // Clear the table
            patientPrescriptionsTable.innerHTML = '';
            
            if (patientPrescriptions && patientPrescriptions.length > 0) {
                console.log('Processing prescriptions for display:', patientPrescriptions.length);
                
                // Sort by date, most recent first (use the date field instead of validFrom which may not exist)
                const sortedPrescriptions = [...patientPrescriptions].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                );
                
                sortedPrescriptions.forEach(prescription => {
                    console.log('Processing prescription:', prescription.id);
                    
                    // Handle medication names
                    const medicationNames = prescription.medications 
                        ? prescription.medications.map(med => med.name).join(', ')
                        : prescription.details || 'No medications listed';
                    
                    // Format dates in a safe way
                    const fromDate = prescription.validFrom 
                        ? formatDate(prescription.validFrom) 
                        : formatDate(prescription.date);
                    
                    // Calculate until date if not provided
                    let untilDate = 'Ongoing';
                    if (prescription.validUntil) {
                        untilDate = formatDate(prescription.validUntil);
                    } else {
                        // If no validUntil, assume 30 days from date as default
                        const dateObj = new Date(prescription.date);
                        dateObj.setDate(dateObj.getDate() + 30);
                        untilDate = formatDate(dateObj);
                    }
                    
                    // Create the row
                    const tr = document.createElement('tr');
                    tr.classList.add('clickable-row');
                    tr.innerHTML = `
                        <td>${prescription.doctorName}</td>
                        <td>${prescription.diagnosis || 'Not specified'}</td>
                        <td>${truncateText(medicationNames, 30)}</td>
                        <td>${fromDate} - ${untilDate}</td>
                        <td>
                            <button class="btn btn-icon view-prescription" title="View Details"><i class="fas fa-eye"></i></button>
                        </td>
                    `;
                    
                    // Add event listener for view button
                    const viewBtn = tr.querySelector('.view-prescription');
                    if (viewBtn) {
                        viewBtn.addEventListener('click', function(e) {
                            e.stopPropagation(); // Prevent row click event
                            showPrescriptionDetails(prescription);
                        });
                    }
                    
                    // Make entire row clickable
                    tr.addEventListener('click', function() {
                        showPrescriptionDetails(prescription);
                    });
                    
                    // Add the row to the table
                    patientPrescriptionsTable.appendChild(tr);
                });
                
                showToast('Prescriptions loaded successfully', 'success');
            } else {
                console.log('No prescriptions found for this patient');
                patientPrescriptionsTable.innerHTML = '<tr><td colspan="5" class="text-center">No prescriptions found</td></tr>';
            }
        } catch (error) {
            console.error('Error loading patient prescriptions:', error);
            showToast('Error loading prescriptions. Please try again.', 'error');
        }
    }
    
    // Function to create the patient prescriptions page if it doesn't exist
    function createPatientPrescriptionsPage() {
        console.log('Creating patient prescriptions page');
        
        // Check if the page already exists
        if (document.getElementById('patientPrescriptions')) {
            console.log('Patient prescriptions page already exists');
            return;
        }
        
        // Create the page structure
        const pageContainer = document.createElement('div');
        pageContainer.id = 'patientPrescriptions';
        pageContainer.className = 'content-page';
        
        pageContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>My Prescriptions</h2>
                </div>
                <div class="card-body">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Diagnosis</th>
                                <th>Medications</th>
                                <th>Valid Period</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="patientPrescriptionsTable">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Add the page to the main content
        const mainContent = document.getElementById('mainContent');
        mainContent.appendChild(pageContainer);
        
        console.log('Patient prescriptions page created successfully');
    }
    
    // Fetch reports data
    async function fetchReportsData(doctorId = null, patientId = null, category = null) {
        try {
            let url = '/api/reports';
            const params = new URLSearchParams();
            
            if (doctorId) {
                params.append('doctorId', doctorId);
            }
            
            if (patientId) {
                params.append('patientId', patientId);
            }
            
            if (category && category !== 'all') {
                params.append('category', category);
            }
            
            const paramString = params.toString();
            if (paramString) {
                url += `?${paramString}`;
            }
            
            console.log('Fetching reports from URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                const text = await response.text();
                console.error('Error response:', text);
                throw new Error('Failed to fetch reports');
            }
            
            const data = await response.json();
            console.log('Fetched reports:', data);
            return data;
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
            
            // For doctor reports, add the patient search dropdown
            if (containerId === 'doctorReportsGrid' && currentUser && currentUser.type === 'doctor') {
                // Check if the search container already exists
                let searchContainer = document.getElementById('reportsSearchContainer');
                if (!searchContainer) {
                    // Create search elements
                    searchContainer = document.createElement('div');
                    searchContainer.id = 'reportsSearchContainer';
                    searchContainer.className = 'search-container mb-3';
                    
                    // Fetch patients for dropdown
                    const patients = await fetchPatients();
                    
                    // Create patient select dropdown
                    searchContainer.innerHTML = `
                        <div class="row">
                            <div class="col-md-6">
                                <label for="patientReportFilter">Filter by Patient</label>
                                <select id="patientReportFilter" class="form-control">
                                    <option value="">All Patients</option>
                                    ${patients.map(patient => `
                                        <option value="${patient.id}">${patient.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="categoryReportFilter">Filter by Category</label>
                                <select id="categoryReportFilter" class="form-control">
                                    <option value="">All Categories</option>
                                    <option value="blood">Blood Tests</option>
                                    <option value="urine">Urine Tests</option>
                                    <option value="imaging">Imaging</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    `;
                    
                    // Insert search container before the reports container
                    reportsContainer.parentNode.insertBefore(searchContainer, reportsContainer);
                    
                    // Add event listeners for filtering
                    const patientFilter = document.getElementById('patientReportFilter');
                    const categoryFilter = document.getElementById('categoryReportFilter');
                    
                    patientFilter.addEventListener('change', async function() {
                        const patientId = this.value;
                        const category = categoryFilter.value;
                        
                        // Use both doctor ID and filters
                        const doctorIdToUse = patientId ? null : currentUser.id;
                        
                        // Fetch filtered data from the server
                        const filteredData = await fetchReportsData(doctorIdToUse, patientId, category);
                        
                        // Reload the reports container with filtered data
                        loadReports(containerId, filteredData);
                    });
                    
                    categoryFilter.addEventListener('change', function() {
                        // Trigger the patient filter change event to apply both filters
                        patientFilter.dispatchEvent(new Event('change'));
                    });
                }
            }
            
            // Update doctor dashboard recent reports
            if (containerId === 'doctorReportsGrid' && currentUser && currentUser.type === 'doctor') {
                const dashboardReportsList = document.getElementById('doctorRecentReportsList');
                if (dashboardReportsList) {
                    dashboardReportsList.innerHTML = '';
                    
                    if (reportsData && reportsData.length > 0) {
                        // Show most recent reports for dashboard
                        const recentReports = [...reportsData]
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 3);
                        
                        recentReports.forEach(report => {
                            const tr = document.createElement('tr');
                            tr.classList.add('clickable-row');
                            tr.innerHTML = `
                                <td>${report.patientName}</td>
                                <td>${report.title}</td>
                                <td>${formatDate(report.date)}</td>
                            `;
                            // Make row clickable to show report details
                            tr.addEventListener('click', () => {
                                showReportDetails(report);
                            });
                            dashboardReportsList.appendChild(tr);
                        });
                    } else {
                        dashboardReportsList.innerHTML = '<tr><td colspan="3" class="text-center">No recent reports</td></tr>';
                    }
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
    async function filterReports(containerId, category) {
        console.log(`Filtering reports in ${containerId} by category: ${category}`);
        
        try {
            // Get current user and determine doctorId/patientId based on user type
            let doctorId = null;
            let patientId = null;
            
            if (currentUser) {
                if (currentUser.type === 'doctor') {
                    doctorId = currentUser.id;
                } else if (currentUser.type === 'patient') {
                    patientId = currentUser.id;
                }
            }
            
            // Fetch reports with category filter
            const filteredReports = await fetchReportsData(doctorId, patientId, category);
            
            // Reload the reports container with filtered data
            await loadReports(containerId, filteredReports);
            
            console.log(`Reports filtered, found ${filteredReports.length} reports`);
        } catch (error) {
            console.error('Error filtering reports:', error);
            showToast('Error filtering reports. Please try again.', 'error');
        }
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
    
    // Show report details in a modal
    function showReportDetails(report) {
        // Create or get existing modal
        let modal = document.getElementById('reportDetailsModal');
        
        if (!modal) {
            // Create the modal if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'reportDetailsModal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content modal-lg">
                    <div class="modal-header">
                        <h2 class="modal-title">Report Details</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <!-- Content will be filled dynamically -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="printReportBtn">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button type="button" class="btn btn-secondary close-modal-btn">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners to close modal
            const closeBtn = modal.querySelector('.close');
            const closeModalBtn = modal.querySelector('.close-modal-btn');
            
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Print report functionality
            const printBtn = modal.querySelector('#printReportBtn');
            printBtn.addEventListener('click', () => {
                showToast("Printing report...");
                window.print();
            });
            
            // Close when clicking outside the modal
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update modal content with report details
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        // Set the title
        modalTitle.textContent = report.title || report.name || 'Report Details';
        
        // Determine status class
        let statusClass = '';
        let statusText = report.status || 'Pending';
        
        if (statusText.toLowerCase() === 'normal') {
            statusClass = 'report-result-normal';
        } else if (statusText.toLowerCase() === 'borderline') {
            statusClass = 'report-result-borderline';
        } else if (statusText.toLowerCase() === 'abnormal') {
            statusClass = 'report-result-abnormal';
        } else {
            statusClass = 'report-result-pending';
        }
        
        // Fill the modal body with report details
        modalBody.innerHTML = `
            <div class="report-details">
                <div class="report-info-section">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Patient:</strong> ${report.patientName}</p>
                            <p><strong>Date:</strong> ${formatDate(report.date)}</p>
                            <p><strong>Category:</strong> ${report.category}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Ordered By:</strong> ${report.orderedBy}</p>
                            <p><strong>Status:</strong> <span class="${statusClass}">${statusText}</span></p>
                            <p><strong>Report ID:</strong> ${report.id}</p>
                        </div>
                    </div>
                </div>
                
                <div class="report-content">
                    <h4>Results</h4>
                    <div class="report-results">
                        ${report.content ? report.content : 
                            `<div class="report-placeholder">
                                <h3>Report Summary</h3>
                                <p>${report.summary || 'This is a summary of the ' + report.category + ' report for ' + report.patientName}</p>
                                <div class="result-table">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Test</th>
                                                <th>Result</th>
                                                <th>Reference Range</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Test 1</td>
                                                <td>Value 1</td>
                                                <td>Normal Range 1</td>
                                                <td><span class="report-result-normal">Normal</span></td>
                                            </tr>
                                            <tr>
                                                <td>Test 2</td>
                                                <td>Value 2</td>
                                                <td>Normal Range 2</td>
                                                <td><span class="report-result-borderline">Borderline</span></td>
                                            </tr>
                                            <tr>
                                                <td>Test 3</td>
                                                <td>Value 3</td>
                                                <td>Normal Range 3</td>
                                                <td><span class="report-result-normal">Normal</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>`
                        }
                    </div>
                    
                    ${report.doctorNotes ? 
                        `<div class="doctor-notes">
                            <h4>Doctor's Notes</h4>
                            <p>${report.doctorNotes}</p>
                        </div>` : ''
                    }
                </div>
            </div>
        `;
        
        // Show the modal
        modal.style.display = 'block';
    }
    
    // Setup doctor appointment form functionality
    function setupDoctorAppointmentForm() {
        const newDoctorAppointmentBtn = document.getElementById('newDoctorAppointmentBtn');
        const doctorAppointmentModal = document.getElementById('doctorAppointmentModal');
        
        if (newDoctorAppointmentBtn && doctorAppointmentModal) {
            // Open modal when button is clicked
            newDoctorAppointmentBtn.addEventListener('click', function() {
                doctorAppointmentModal.style.display = 'block';
                
                // Get references to form elements
                const dateInput = document.getElementById('doctorAppointmentDate');
                const patientSelect = document.getElementById('doctorAppointmentPatient');
                const timeSelect = document.getElementById('doctorAppointmentTime');
                
                // Set default date to today
                const today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
                dateInput.value = today;
                
                // Load patients for the select dropdown
                loadPatientsForAppointment();
                
                // Function to update time slots based on both doctor and selected patient
                function updateAvailableTimeSlots() {
                    const doctorId = currentUser.id;
                    const selectedDate = dateInput.value;
                    const selectedPatientId = patientSelect.value || null;
                    
                    // Update time slots with both doctor and patient constraints
                    if (doctorId && selectedDate) {
                        updateTimeSlotOptions(timeSelect, doctorId, selectedDate, selectedPatientId);
                    }
                }
                
                // Add event listeners to update time slots when date changes
                dateInput.addEventListener('change', updateAvailableTimeSlots);
                
                // Add event listeners to update time slots when patient changes
                patientSelect.addEventListener('change', updateAvailableTimeSlots);
                
                // Initialize time slots for today
                if (currentUser && currentUser.id) {
                    updateTimeSlotOptions(timeSelect, currentUser.id, today);
                }
                
                // Show a note about the available time slots
                showToast('Select a date to view available 30-minute appointment slots', 'info');
            });
            
            // Close modal when X is clicked
            const closeBtn = doctorAppointmentModal.querySelector('.close');
            closeBtn.addEventListener('click', function() {
                doctorAppointmentModal.style.display = 'none';
            });
            
            // Close modal when Cancel button is clicked
            const cancelBtn = doctorAppointmentModal.querySelector('.modal-close');
            cancelBtn.addEventListener('click', function() {
                doctorAppointmentModal.style.display = 'none';
            });
            
            // Close when clicking outside the modal
            window.addEventListener('click', function(event) {
                if (event.target === doctorAppointmentModal) {
                    doctorAppointmentModal.style.display = 'none';
                }
            });
            
            // Handle form submission
            const doctorAppointmentForm = document.getElementById('doctorAppointmentForm');
            doctorAppointmentForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                console.log('Doctor appointment form submitted');
                
                // Get form data
                const patientId = document.getElementById('doctorAppointmentPatient').value;
                const date = document.getElementById('doctorAppointmentDate').value;
                const time = document.getElementById('doctorAppointmentTime').value;
                const purpose = document.getElementById('doctorAppointmentPurpose').value;
                const notes = document.getElementById('doctorAppointmentNotes').value;
                const status = document.getElementById('doctorAppointmentStatus').value;
                
                console.log('Form data:', { patientId, date, time, purpose, notes, status });
                
                // Validate required fields
                if (!patientId || !date || !time) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                // Show loading indicator
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
                submitBtn.disabled = true;
                
                try {
                    // Create appointment data
                    const appointmentData = {
                        patientId: patientId,
                        doctorId: currentUser.id,
                        date: date,
                        time: time,
                        purpose: purpose || 'General Appointment',
                        notes: notes || '',
                        status: status || 'Scheduled'
                    };
                    
                    console.log('Submitting appointment data:', appointmentData);
                    
                    // Submit appointment
                    const result = await createAppointment(appointmentData);
                    
                    // Close modal and show success message
                    doctorAppointmentModal.style.display = 'none';
                    showToast('Appointment scheduled successfully!', 'success');
                    
                    // Reset form
                    this.reset();
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    
                    // Reload appointments
                    appointments = await fetchAppointments(currentUser.id, null);
                    loadDoctorAppointments();
                } catch (error) {
                    console.error('Error scheduling appointment:', error);
                    showToast('Error scheduling appointment. Please try again.', 'error');
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    }
    
    // Load patients for doctor appointment form
    async function loadPatientsForAppointment() {
        try {
            const patients = await fetchPatients();
            
            const patientSelect = document.getElementById('doctorAppointmentPatient');
            if (patientSelect) {
                patientSelect.innerHTML = '<option value="">Select a patient</option>';
                
                patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    patientSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading patients for appointment:', error);
            showToast('Failed to load patients. Please try again.', 'error');
        }
    }
    
    // Load patients for test form
    async function loadPatientsForTest() {
        try {
            console.log("Loading patients for test form", currentUser);
            // Ensure dropdown exists before proceeding
            const patientSelect = document.getElementById('testPatient');
            console.log("Patient select element exists:", patientSelect !== null);
            
            if (!patientSelect) {
                console.error("Test patient select element not found in DOM");
                // Check if we're even on the correct page
                const testPage = document.getElementById('startTests');
                console.log("Start Tests page exists:", testPage !== null, "Is active:", testPage?.classList.contains('active'));
                return;
            }
            
            // Get patients from API
            const patients = await fetchPatients();
            console.log("Fetched patients:", patients);
            
            // Clear existing options
            patientSelect.innerHTML = '<option value="">Select Patient</option>';
            
            // Only show patients assigned to this doctor
            let filteredPatients = patients;
            if (currentUser && currentUser.type === 'doctor') {
                console.log("Filtering patients for doctor ID:", currentUser.id);
                filteredPatients = patients.filter(p => p.doctorId === currentUser.id);
                console.log("Filtered patients count:", filteredPatients.length);
                if (filteredPatients.length === 0) {
                    // If no patients are assigned to this doctor, show all patients
                    console.log("No patients found for this doctor, using all patients instead");
                    filteredPatients = patients;
                }
            }
            
            filteredPatients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.name;
                patientSelect.appendChild(option);
            });
            
            console.log(`Loaded ${filteredPatients.length} patients for test form`);
        } catch (error) {
            console.error('Error loading patients for test form:', error);
            showToast('Failed to load patients for tests. Please try again.', 'error');
        }
    }
    
    // Load patients for prescription form
    async function loadPatientsForPrescription() {
        try {
            console.log("Loading patients for prescription form");
            // Get patients from API
            const patients = await fetchPatients();
            
            // Populate select dropdown
            const patientSelect = document.getElementById('prescriptionPatient');
            if (patientSelect) {
                patientSelect.innerHTML = '<option value="">Select Patient</option>';
                
                // Only show patients assigned to this doctor
                let filteredPatients = patients;
                if (currentUser && currentUser.type === 'doctor') {
                    filteredPatients = patients.filter(p => p.doctorId === currentUser.id);
                    if (filteredPatients.length === 0) {
                        // If no patients are assigned to this doctor, show all patients
                        filteredPatients = patients;
                    }
                }
                
                filteredPatients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    patientSelect.appendChild(option);
                });
                
                console.log(`Loaded ${filteredPatients.length} patients for prescription form`);
            } else {
                console.error("Prescription patient select element not found");
            }
        } catch (error) {
            console.error('Error loading patients for prescription form:', error);
            showToast('Failed to load patients for prescriptions. Please try again.', 'error');
        }
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
    
    // Function to create a new appointment
    async function createAppointment(appointmentData) {
        try {
            console.log('Creating appointment with data:', appointmentData);
            
            // Make sure required fields are present
            if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.date || !appointmentData.time) {
                const error = new Error('Missing required appointment fields');
                console.error(error);
                showToast('Please fill in all required appointment fields', 'error');
                throw error;
            }
            
            // Format time to match 30-minute slots (either HH:00 or HH:30)
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (timeRegex.test(appointmentData.time)) {
                const [_, hour, minute] = appointmentData.time.match(timeRegex);
                const roundedMinute = parseInt(minute) < 30 ? '00' : '30';
                appointmentData.time = `${hour.padStart(2, '0')}:${roundedMinute}`;
                console.log('Standardized appointment time to 30-minute slot:', appointmentData.time);
            }
            
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });
            
            const responseText = await response.text();
            let result;
            
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response:', responseText);
                showToast('Server returned an invalid response', 'error');
                throw new Error('Invalid server response');
            }
            
            // Handle conflict (409) status code specifically for double-booking
            if (response.status === 409) {
                console.error('Time slot conflict:', result);
                
                // Show the detailed error message from the server
                // This message will specify whether it's a doctor's conflict or patient's conflict
                if (result.message) {
                    showToast(result.message, 'error');
                } else {
                    showToast('This time slot is already booked. Please select a different time.', 'error');
                }
                
                // Update available time slots in the UI if possible
                if (appointmentData.doctorId) {
                    const timeSelect = document.getElementById('appointmentTime') || document.getElementById('doctorAppointmentTime');
                    const dateInput = document.getElementById('appointmentDate') || document.getElementById('doctorAppointmentDate');
                    
                    if (timeSelect && dateInput && dateInput.value) {
                        updateTimeSlotOptions(timeSelect, appointmentData.doctorId, dateInput.value);
                    }
                }
                
                // Return a specific result so the UI can handle the conflict
                return { success: false, error: 'conflict', message: result.message, details: result.conflictingAppointment };
            }
            
            if (!response.ok) {
                console.error('Server returned error:', result);
                showToast(result.message || 'Failed to create appointment', 'error');
                throw new Error(result.message || 'Failed to create appointment');
            }
            
            console.log('Appointment created successfully:', result);
            
            // Reload appointments after creating a new one
            if (currentUser.type === 'doctor') {
                appointments = await fetchAppointments(currentUser.id, null);
                loadDoctorAppointments();
            } else {
                appointments = await fetchAppointments(null, currentUser.id);
                
                // Reload the patient dashboard and appointments
                const dashboardAppsList = document.getElementById('patientAppointmentsList');
                if (dashboardAppsList) {
                    const upcomingAppointments = appointments
                        .filter(app => new Date(app.date) >= new Date())
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .slice(0, 3);
                    
                    dashboardAppsList.innerHTML = '';
                    
                    if (upcomingAppointments.length > 0) {
                        upcomingAppointments.forEach(app => {
                            const tr = document.createElement('tr');
                            tr.classList.add('clickable-row');
                            tr.innerHTML = `
                                <td>${app.doctorName}</td>
                                <td>${formatDate(app.date)}</td>
                                <td>${app.time}</td>
                                <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                            `;
                            tr.addEventListener('click', () => {
                                showAppointmentDetails(app);
                            });
                            dashboardAppsList.appendChild(tr);
                        });
                    } else {
                        dashboardAppsList.innerHTML = '<tr><td colspan="4" class="text-center">No upcoming appointments</td></tr>';
                    }
                }
                
                // Reload the appointments page
                const patientAppsTable = document.getElementById('patientAppointmentsTable');
                if (patientAppsTable) {
                    patientAppsTable.innerHTML = '';
                    
                    if (appointments.length > 0) {
                        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
                        
                        appointments.forEach(app => {
                            const tr = document.createElement('tr');
                            tr.classList.add('clickable-row');
                            tr.innerHTML = `
                                <td>${app.doctorName}</td>
                                <td>${formatDate(app.date)}</td>
                                <td>${app.time}</td>
                                <td>${app.purpose}</td>
                                <td><span class="status-badge status-${app.status.toLowerCase().replace(' ', '-')}">${app.status}</span></td>
                            `;
                            tr.addEventListener('click', () => {
                                showAppointmentDetails(app);
                            });
                            patientAppsTable.appendChild(tr);
                        });
                    } else {
                        patientAppsTable.innerHTML = '<tr><td colspan="5" class="text-center">No appointments found</td></tr>';
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error creating appointment:', error);
            showToast('Error scheduling appointment. Please try again.', 'error');
            throw error;
        }
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
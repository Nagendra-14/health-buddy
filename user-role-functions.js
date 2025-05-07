// Helper functions
// Show toast notification - will call the main script's toast queue function
function showToast(message, type = 'success') {
    // If the main script has a toast queue function, use that
    if (window.toastQueue) {
        // This means we're in the main script context with the queue
        window.toastQueue.push({ message, type });
        if (!window.isShowingToast) {
            window.processToastQueue();
        }
        return;
    }
    
    // Fallback if queue isn't available
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        const toastMessage = toast.querySelector('.toast-message');
        if (!toastMessage) return;
        
        // Get the success and error icons
        const successIcon = toast.querySelector('.toast-icon.success');
        const errorIcon = toast.querySelector('.toast-icon.error');
        
        // Set message and type
        toastMessage.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        // Show only the appropriate icon
        if (successIcon && errorIcon) {
            if (type === 'success') {
                successIcon.style.display = 'block';
                errorIcon.style.display = 'none';
            } else if (type === 'error') {
                successIcon.style.display = 'none';
                errorIcon.style.display = 'block';
            } else {
                // For other types like 'info' or 'warning', hide both icons
                successIcon.style.display = 'none';
                errorIcon.style.display = 'none';
            }
        }
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } catch (error) {
        console.error('Error showing toast in user-role-functions:', error);
    }
}

// Format date into a readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Receptionist data loading function
async function loadReceptionistData() {
    try {
        // Fetch all appointments for receptionist view
        const appointmentsResponse = await fetch('/api/appointments');
        
        if (appointmentsResponse.ok) {
            const appointments = await appointmentsResponse.json();
            
            // Get today's appointments
            const today = new Date().toDateString();
            const todayAppointments = appointments.filter(app => {
                const appDate = new Date(app.date).toDateString();
                return appDate === today && app.status !== 'Cancelled';
            });
            
            // Update receptionist dashboard statistics
            const todayElement = document.querySelector('#receptionistDashboard .stat-card:nth-child(1) .stat-value');
            if (todayElement) {
                todayElement.textContent = todayAppointments.length;
            }
            
            // Get pending appointments
            const pendingAppointments = appointments.filter(app => app.status === 'Pending');
            const pendingElement = document.querySelector('#receptionistDashboard .stat-card:nth-child(2) .stat-value');
            if (pendingElement) {
                pendingElement.textContent = pendingAppointments.length;
            }
            
            // Update appointments table in the dashboard
            const appointmentsList = document.getElementById('receptionistAppointmentsList');
            if (appointmentsList) {
                appointmentsList.innerHTML = '';
                
                if (todayAppointments.length === 0) {
                    appointmentsList.innerHTML = '<tr><td colspan="4" class="text-center">No appointments scheduled for today</td></tr>';
                } else {
                    // Show appointments sorted by time
                    todayAppointments
                        .sort((a, b) => {
                            if (a.time < b.time) return -1;
                            if (a.time > b.time) return 1;
                            return 0;
                        })
                        .slice(0, 5) // Show only the first 5
                        .forEach(app => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${app.patientName}</td>
                                <td>${app.doctorName}</td>
                                <td>${app.time}</td>
                                <td><span class="status-badge ${app.status.toLowerCase()}">${app.status}</span></td>
                            `;
                            appointmentsList.appendChild(row);
                        });
                }
            }
        }
        
        // Fetch patient count data
        const patientsResponse = await fetch('/api/patients');
        
        if (patientsResponse.ok) {
            const patients = await patientsResponse.json();
            
            // Update total patients count
            const patientsElement = document.querySelector('#receptionistDashboard .stat-card:nth-child(3) .stat-value');
            if (patientsElement) {
                patientsElement.textContent = patients.length;
            }
        }
    } catch (error) {
        console.error('Error loading receptionist data:', error);
        showToast('Error loading receptionist data. Please refresh the page.', 'error');
    }
}

// Lab technician data loading function
async function loadLabTechnicianData() {
    try {
        // Fetch all test data
        const testsResponse = await fetch('/api/tests');
        
        if (testsResponse.ok) {
            const tests = await testsResponse.json();
            
            // Filter pending tests
            const pendingTests = tests.filter(test => test.status === 'Pending');
            
            // Update dashboard statistics
            const pendingElement = document.querySelector('#labTechnicianDashboard .stat-card:nth-child(1) .stat-value');
            if (pendingElement) {
                pendingElement.textContent = pendingTests.length;
            }
            
            // Filter completed tests
            const completedTests = tests.filter(test => test.status === 'Completed');
            const completedElement = document.querySelector('#labTechnicianDashboard .stat-card:nth-child(2) .stat-value');
            if (completedElement) {
                completedElement.textContent = completedTests.length;
            }
            
            // Count unique patients
            const uniquePatients = new Set();
            tests.forEach(test => uniquePatients.add(test.patientId));
            
            const patientsElement = document.querySelector('#labTechnicianDashboard .stat-card:nth-child(3) .stat-value');
            if (patientsElement) {
                patientsElement.textContent = uniquePatients.size;
            }
            
            // Populate test type filter dropdown using the centralized function
            if (window.populateTestTypeDropdown) {
                try {
                    await window.populateTestTypeDropdown('testTypeFilter');
                    // Add "All Tests" option at the beginning
                    const allOption = document.createElement('option');
                    allOption.value = "";
                    allOption.textContent = "All Tests";
                    const testTypeFilter = document.getElementById('testTypeFilter');
                    if (testTypeFilter) {
                        testTypeFilter.insertBefore(allOption, testTypeFilter.firstChild);
                    }
                } catch (err) {
                    console.error('Error populating test type filter:', err);
                }
            } else {
                console.error('populateTestTypeDropdown function not available');
            }
            
            // Update pending tests table
            const testsList = document.getElementById('labTechnicianTestsList');
            if (testsList) {
                testsList.innerHTML = '';
                
                if (pendingTests.length === 0) {
                    testsList.innerHTML = '<tr><td colspan="4" class="text-center">No pending tests</td></tr>';
                } else {
                    // Sort by test date (descending)
                    pendingTests
                        .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
                        .slice(0, 5) // Show only the first 5
                        .forEach(test => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${test.patientName}</td>
                                <td>${test.testType}</td>
                                <td>${formatDate(test.testDate)}</td>
                                <td><span class="status-badge ${test.status.toLowerCase()}">${test.status}</span></td>
                            `;
                            testsList.appendChild(row);
                        });
                }
            }
        }
    } catch (error) {
        console.error('Error loading lab technician data:', error);
        showToast('Error loading lab technician data. Please refresh the page.', 'error');
    }
}
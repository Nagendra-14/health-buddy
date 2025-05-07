// Helper functions
// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const toastMessage = toast.querySelector('.toast-message');
    if (!toastMessage) return;
    
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
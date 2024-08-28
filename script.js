const users = {
    admin: { password: "admin123", role: "admin" },
};

const attendanceData = {};

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (users[username] && users[username].password === password) {
        if (users[username].role === "admin") {
            document.getElementById("admin-section").classList.remove("hidden");
            populateStaffSelect();
            showAllStaffReport(); // Show all staff reports on admin login
        } else {
            document.getElementById("attendance-section").classList.remove("hidden");
            document.getElementById("staff-name").innerText = username;
        }
        document.getElementById("login-section").classList.add("hidden");
    } else {
        alert("Invalid username or password!");
    }
}

function showPasswordReset() {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("password-reset-section").classList.remove("hidden");
}

function hidePasswordReset() {
    document.getElementById("password-reset-section").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
}

function resetPassword() {
    const username = document.getElementById("reset-username").value;
    const masterPassword = document.getElementById("reset-master-password").value;

    if (masterPassword === "Onmyown360D!6369945750") {
        if (users[username]) {
            users[username].password = prompt("Enter new password for " + username);
            alert("Password reset successful!");
            hidePasswordReset();
        } else {
            alert("Username does not exist!");
        }
    } else {
        alert("Invalid master password!");
    }
}

function changePassword() {
    const username = document.getElementById("staff-name").innerText || "admin";
    const oldPassword = prompt("Enter your current password:");
    const newPassword = prompt("Enter your new password:");

    if (users[username] && users[username].password === oldPassword) {
        users[username].password = newPassword;
        alert("Password changed successfully!");
    } else {
        alert("Incorrect current password!");
    }
}

function logout() {
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("attendance-section").classList.add("hidden");
    document.getElementById("admin-section").classList.add("hidden");
    document.getElementById("password-reset-section").classList.add("hidden");
}

function markAttendance(type) {
    const staffName = document.getElementById("staff-name").innerText;
    const now = new Date();
    const today = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    let record = attendanceData[staffName]?.find(record => record.date === today);
    if (!record) {
        record = { date: today, inTime: "", outTime: "" };
        if (!attendanceData[staffName]) attendanceData[staffName] = [];
        attendanceData[staffName].push(record);
    }

    if (type === 'in') {
        record.inTime = time;
        const inTimeBtn = document.getElementById("in-time-btn");
        inTimeBtn.disabled = true;
        inTimeBtn.classList.add("btn-disabled");
        alert(`Marked In Time for ${today} at ${time}`);
    } else if (type === 'out') {
        record.outTime = time;
        const outTimeBtn = document.getElementById("out-time-btn");
        outTimeBtn.disabled = true;
        outTimeBtn.classList.add("btn-disabled");
        alert(`Marked Out Time for ${today} at ${time}`);
    }

    // Update the report after marking attendance
    showAllStaffReport();
}

function addNewStaff() {
    const newStaffName = document.getElementById("new-staff-name").value.trim();
    if (newStaffName && !users[newStaffName]) {
        users[newStaffName] = { password: `${newStaffName.toLowerCase()}123`, role: "staff" };
        attendanceData[newStaffName] = [];
        alert(`New staff added: ${newStaffName}`);
        populateStaffSelect();
    } else {
        alert("Invalid staff name or staff already exists!");
    }
}

function removeStaff() {
    const staffName = document.getElementById("remove-staff-select").value;
    if (staffName && users[staffName]) {
        delete users[staffName];
        delete attendanceData[staffName];
        alert(`Staff removed: ${staffName}`);
        populateStaffSelect();
    } else {
        alert("Invalid staff name!");
    }
}

function populateStaffSelect() {
    const removeStaffSelect = document.getElementById("remove-staff-select");
    removeStaffSelect.innerHTML = `<option value="">Select Staff to Remove</option>`;
    for (let staffName in users) {
        if (users[staffName].role === "staff") {
            removeStaffSelect.innerHTML += `<option value="${staffName}">${staffName}</option>`;
        }
    }
}

function showAllStaffReport() {
    let reportContent = `<table>
        <thead>
            <tr>
                <th>S.No</th>
                <th>Staff Name</th>
                <th>Date</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Present/Absent</th>
            </tr>
        </thead>
        <tbody>`;

    let sNo = 1;

    for (let staffName in attendanceData) {
        attendanceData[staffName].forEach(record => {
            const isPresent = record.inTime ? "Present" : "Absent";
            reportContent += `<tr>
                <td>${sNo++}</td>
                <td>${staffName}</td>
                <td>${record.date}</td>
                <td>${record.inTime || "N/A"}</td>
                <td>${record.outTime || "N/A"}</td>
                <td>${isPresent}</td>
            </tr>`;
        });
    }

    reportContent += `</tbody></table>`;
    document.getElementById("report-section").innerHTML = reportContent;
}

function exportAllStaffReports() {
    const reportData = [];

    let sNo = 1;
    for (let staffName in attendanceData) {
        attendanceData[staffName].forEach(record => {
            const isPresent = record.inTime ? "Present" : "Absent";
            reportData.push({
                SNo: sNo++,
                StaffName: staffName,
                Date: record.date,
                InTime: record.inTime || "N/A",
                OutTime: record.outTime || "N/A",
                Status: isPresent,
            });
        });
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, "All_Staff_Attendance_Report");

    XLSX.writeFile(wb, `All_Staff_Attendance_Report.xlsx`);
}

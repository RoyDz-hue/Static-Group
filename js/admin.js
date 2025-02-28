import { getAuth, getFirestore } from '../js/config.js';

let auth, db;
let currentAdmin = false;

async function initializeAdminDashboard() {
    auth = await getAuth();
    const { collection, getDocs, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    db = await getFirestore();

    // Check if logged in as admin
    auth.onAuthStateChanged(async (user) => {
        if (user && user.email === 'admin@system.com') {
            currentAdmin = true;
            loadDashboard();
        } else {
            window.location.href = '../index.html';
        }
    });
}

async function loadDashboard() {
    setupNavigation();
    await loadUsers();
    await loadGroups();
    setupEventListeners();
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.admin-nav-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden'));
            // Remove active class from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected section
            const targetId = button.id.replace('show', '').toLowerCase() + 'Section';
            document.getElementById(targetId).classList.remove('hidden');
            button.classList.add('active');
        });
    });
}

async function loadUsers() {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    const usersList = document.getElementById('usersList');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    const tableHTML = `
        <table class="data-grid">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Group</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${snapshot.docs.map(doc => {
                    const user = doc.data();
                    return `
                        <tr class="user-row">
                            <td>${user.name || 'N/A'}</td>
                            <td>${user.email}</td>
                            <td>${user.groupId || 'Unassigned'}</td>
                            <td>
                                <button onclick="reassignUser('${doc.id}')" class="action-btn">
                                    Reassign
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    usersList.innerHTML = tableHTML;
}

async function loadGroups() {
    const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    const groupsList = document.getElementById('groupsList');
    const groupsRef = collection(db, 'groups');
    const snapshot = await getDocs(groupsRef);

    const tableHTML = `
        <table class="data-grid">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Members</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${snapshot.docs.map(doc => {
                    const group = doc.data();
                    return `
                        <tr class="group-row">
                            <td>${group.name}</td>
                            <td>${group.members.length}</td>
                            <td>${new Date(group.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="manageGroup('${doc.id}')" class="action-btn">
                                    Manage
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    groupsList.innerHTML = tableHTML;
}

async function regenerateGroups() {
    const { collection, getDocs, writeBatch } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    try {
        const groupSize = parseInt(document.getElementById('groupSize').value) || 5;
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        // Get all non-admin users
        const users = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => !user.isAdmin);
        
        // Shuffle users
        for (let i = users.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [users[i], users[j]] = [users[j], users[i]];
        }
        
        const batch = writeBatch(db);
        
        // Create groups
        for (let i = 0; i < users.length; i += groupSize) {
            const groupMembers = users.slice(i, i + groupSize);
            const groupId = `group_${Date.now()}_${i}`;
            
            // Create group
            const groupRef = doc(db, 'groups', groupId);
            batch.set(groupRef, {
                name: `Group ${Math.floor(i / groupSize) + 1}`,
                members: groupMembers.map(u => u.id),
                createdAt: Date.now()
            });
            
            // Update user group assignments
            groupMembers.forEach(user => {
                const userRef = doc(db, 'users', user.id);
                batch.update(userRef, { groupId });
            });
        }
        
        await batch.commit();
        await loadGroups();
        await loadUsers();
        
        showMessage('Groups regenerated successfully', 'success');
    } catch (error) {
        console.error('Error regenerating groups:', error);
        showMessage('Error regenerating groups', 'error');
    }
}

function setupEventListeners() {
    // Regenerate groups button
    document.getElementById('regenerateGroups').addEventListener('click', regenerateGroups);
    
    // Save settings button
    document.getElementById('saveSettings').addEventListener('click', async () => {
        const groupSize = parseInt(document.getElementById('groupSize').value);
        if (groupSize < 2) {
            showMessage('Group size must be at least 2', 'error');
            return;
        }
        
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
        try {
            await setDoc(doc(db, 'config', 'groupSettings'), {
                groupSize,
                updatedAt: Date.now()
            });
            showMessage('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showMessage('Error saving settings', 'error');
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.querySelector('.admin-content').prepend(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 5000);
}

// Initialize the admin dashboard
initializeAdminDashboard();

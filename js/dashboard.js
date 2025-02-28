import { getAuth, getFirestore } from './config.js';

let auth, db;
let currentUser = null;

async function initializeDashboard() {
    auth = await getAuth();
    const { getFirestore, collection, query, where, onSnapshot } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    db = getFirestore();

    // Check authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            document.getElementById('userEmail').textContent = user.email;
            loadGroupDetails();
            initializeChat();
        } else {
            window.location.href = 'index.html';
        }
    });
}

async function loadGroupDetails() {
    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('members', 'array-contains', currentUser.uid));
    
    const querySnapshot = await getDocs(q);
    const groupDetailsDiv = document.getElementById('groupDetails');
    
    if (querySnapshot.empty) {
        groupDetailsDiv.innerHTML = '<p>You are not assigned to any group yet.</p>';
        return;
    }

    const group = querySnapshot.docs[0].data();
    const membersPromises = group.members.map(async (memberId) => {
        const userDoc = await getDocs(doc(db, 'users', memberId));
        return userDoc.data();
    });

    const members = await Promise.all(membersPromises);
    
    groupDetailsDiv.innerHTML = `
        <h3>${group.name}</h3>
        <p>${group.description}</p>
        <h4>Members:</h4>
        <div class="members-list">
            ${members.map(member => `
                <div class="group-member">
                    <div>${member.name}</div>
                    <div class="text-muted">${member.email}</div>
                </div>
            `).join('')}
        </div>
    `;
}

async function initializeChat() {
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');

    // Subscribe to messages
    const { collection, query, where, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('groupId', '==', currentUser.groupId),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.docs.reverse().forEach(doc => {
            const message = doc.data();
            const isCurrentUser = message.userId === currentUser.uid;
            
            chatMessages.innerHTML += `
                <div class="message-bubble ${isCurrentUser ? 'sent' : 'received'}">
                    <div class="message-info">
                        ${isCurrentUser ? 'You' : message.userName}
                    </div>
                    ${message.text}
                </div>
            `;
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Send message
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;

        const { addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js');
        try {
            await addDoc(messagesRef, {
                text,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                groupId: currentUser.groupId,
                timestamp: serverTimestamp()
            });
            messageInput.value = '';
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Initialize dashboard
initializeDashboard();

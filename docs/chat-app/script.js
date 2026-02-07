// Конфигурация Firebase (замените на свою)
const firebaseConfig = {
  apiKey: "AIzaSyC04pWtk9BHpsm57qEMb9rYbwCJyeustnI",
  authDomain: "chat-app-e4502.firebaseapp.com",
  projectId: "chat-app-e4502",
  storageBucket: "chat-app-e4502.firebasestorage.app",
  messagingSenderId: "748200318530",
  appId: "1:748200318530:web:4dc41916ca43abdce8ffdb",
  measurementId: "G-LYZ3CJE20D"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM элементы
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const usernameInput = document.getElementById('username');
const colorPicker = document.getElementById('colorPicker');
const colorInput = document.getElementById('colorInput');
const onlineCountSpan = document.getElementById('onlineCount');
const messageCountSpan = document.getElementById('messageCount');
const notification = document.getElementById('notification');

// Генерация уникального ID пользователя
const userId = 'user_' + Math.random().toString(36).substr(2, 9);
let userColor = '#2196f3';
let onlineUsers = {};

// Отслеживание онлайн статуса
const userRef = database.ref('online/' + userId);
userRef.set({
    lastSeen: firebase.database.ServerValue.TIMESTAMP,
    name: 'Аноним'
});

userRef.onDisconnect().remove();

// Обновление онлайн статуса каждые 30 секунд
setInterval(() => {
    userRef.update({ lastSeen: firebase.database.ServerValue.TIMESTAMP });
}, 30000);

// Отслеживание онлайн пользователей
database.ref('online').on('value', (snapshot) => {
    const users = snapshot.val() || {};
    onlineUsers = users;
    
    // Удаляем неактивных пользователей (больше 60 секунд)
    const now = Date.now();
    Object.keys(users).forEach(key => {
        if (now - users[key].lastSeen > 60000) {
            database.ref('online/' + key).remove();
        }
    });
    
    onlineCountSpan.textContent = Object.keys(users).length;
});

// Загрузка сообщений
database.ref('messages').limitToLast(50).on('value', (snapshot) => {
    const messages = snapshot.val() || {};
    displayMessages(messages);
});

// Отображение сообщений
function displayMessages(messages) {
    messagesDiv.innerHTML = '';
    
    if (Object.keys(messages).length === 0) {
        messagesDiv.innerHTML = `
            <div class="empty-state">
                <p>💭 Здесь пока нет сообщений...</p>
                <p>Будьте первым, кто напишет что-то!</p>
            </div>
        `;
        messageCountSpan.textContent = '0';
        return;
    }
    
    const sortedMessages = Object.entries(messages)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    messageCountSpan.textContent = sortedMessages.length;
    
    sortedMessages.forEach(([id, msg]) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.style.borderLeftColor = msg.color || '#2196f3';
        
        const time = new Date(msg.timestamp);
        const timeString = time.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-user">
                    <span class="user-color" style="background-color: ${msg.color || '#2196f3'}"></span>
                    ${msg.username || 'Аноним'}
                </div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-content">${escapeHtml(msg.text)}</div>
        `;
        
        messagesDiv.appendChild(messageElement);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Отправка сообщения
function sendMessage() {
    const text = messageInput.value.trim();
    const username = usernameInput.value.trim() || 'Аноним';
    
    if (!text) {
        showNotification('Введите сообщение!', 'error');
        return;
    }
    
    if (text.length > 500) {
        showNotification('Сообщение слишком длинное!', 'error');
        return;
    }
    
    const message = {
        text: text,
        username: username,
        userId: userId,
        color: userColor,
        timestamp: Date.now()
    };
    
    database.ref('messages').push(message)
        .then(() => {
            messageInput.value = '';
            messageInput.focus();
            
            // Автоматическое удаление старых сообщений
            cleanupOldMessages();
        })
        .catch((error) => {
            showNotification('Ошибка отправки: ' + error.message, 'error');
        });
}

// Очистка старых сообщений (старше 24 часов)
function cleanupOldMessages() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    database.ref('messages').once('value', (snapshot) => {
        const updates = {};
        snapshot.forEach((child) => {
            if (child.val().timestamp < oneDayAgo) {
                updates[child.key] = null;
            }
        });
        
        if (Object.keys(updates).length > 0) {
            database.ref('messages').update(updates);
        }
    });
}

// Показ уведомлений
function showNotification(text, type = 'success') {
    notification.textContent = text;
    notification.className = 'notification ' + type;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обработчики событий
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

colorPicker.addEventListener('click', () => {
    colorInput.click();
});

colorInput.addEventListener('input', (e) => {
    userColor = e.target.value;
    colorPicker.style.backgroundColor = userColor;
});

// Автоматическая очистка старых сообщений при загрузке
window.addEventListener('load', () => {
    cleanupOldMessages();
    
    // Очистка каждые 10 минут
    setInterval(cleanupOldMessages, 10 * 60 * 1000);
});

// Сохранение имени пользователя в localStorage
usernameInput.addEventListener('change', () => {
    localStorage.setItem('chatUsername', usernameInput.value);
});

// Загрузка сохраненного имени
window.addEventListener('load', () => {
    const savedName = localStorage.getItem('chatUsername');
    if (savedName) {
        usernameInput.value = savedName;
    }
});

// ========================================
// LOCAL STORAGE KEYS
// ========================================
const STORAGE_KEYS = {
    USER_NAME: 'lifeDashboard_userName',
    THEME: 'lifeDashboard_theme',
    TODOS: 'lifeDashboard_todos',
    LINKS: 'lifeDashboard_links'
};

// ========================================
// GREETING SECTION
// ========================================

// Update time display every second
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('timeDisplay').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update date display
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', options);
}

// Update greeting based on time of day
function updateGreeting() {
    const hour = new Date().getHours();
    const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
    let greetingText = '';

    if (hour < 12) {
        greetingText = 'Good Morning';
    } else if (hour < 18) {
        greetingText = 'Good Afternoon';
    } else {
        greetingText = 'Good Evening';
    }

    if (userName) {
        greetingText += `, ${userName}!`;
        document.getElementById('nameInput').value = userName;
    }

    document.getElementById('greeting').textContent = greetingText;
}

// Save user name to local storage
function saveName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        updateGreeting();
    }
}

// ========================================
// FOCUS TIMER (POMODORO)
// ========================================

let timerInterval = null;
let timerDuration = 25 * 60; // Default 25 minutes in seconds
let timeRemaining = timerDuration;

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Update timer display
function updateTimerDisplay() {
    document.getElementById('timerDisplay').textContent = formatTime(timeRemaining);
}

// Change timer duration
function changeTimerDuration() {
    const select = document.getElementById('timerDuration');
    const customInput = document.getElementById('customDuration');
    const selectedValue = select.value;
    
    // Show or hide custom input based on selection
    if (selectedValue === 'custom') {
        customInput.style.display = 'block';
        customInput.focus();
        // Don't update timer yet, wait for user to enter custom value
        return;
    } else {
        customInput.style.display = 'none';
        const minutes = parseInt(selectedValue);
        
        // Stop the timer if it's running
        stopTimer();
        
        // Update duration and reset
        timerDuration = minutes * 60;
        timeRemaining = timerDuration;
        updateTimerDisplay();
    }
}

// Handle custom duration input
function handleCustomDuration() {
    const customInput = document.getElementById('customDuration');
    const minutes = parseInt(customInput.value);
    
    // Validate input
    if (isNaN(minutes) || minutes < 1 || minutes > 999) {
        alert('Please enter a valid number between 1 and 999 minutes');
        return;
    }
    
    // Stop the timer if it's running
    stopTimer();
    
    // Update duration and reset
    timerDuration = minutes * 60;
    timeRemaining = timerDuration;
    updateTimerDisplay();
}

// Start timer
function startTimer() {
    if (timerInterval) return; // Prevent multiple intervals
    
    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            stopTimer();
            // Optional: Play sound or show notification when timer ends
            alert('Focus session complete!');
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset timer
function resetTimer() {
    stopTimer();
    timeRemaining = timerDuration;
    updateTimerDisplay();
}

// ========================================
// TO-DO LIST
// ========================================

let todos = [];

// Load todos from local storage
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
    todos = stored ? JSON.parse(stored) : [];
    renderTodos();
}

// Save todos to local storage
function saveTodos() {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
}

// Render todos to the DOM
function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${index})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="btn-edit" onclick="editTodo(${index})">Edit</button>
                <button class="btn-delete" onclick="deleteTodo(${index})">Delete</button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

// Add new todo
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) {
        alert('Please enter a task');
        return;
    }
    
    // Check for duplicates
    if (todos.some(todo => todo.text.toLowerCase() === text.toLowerCase())) {
        alert('This task already exists!');
        return;
    }
    
    todos.push({ text, completed: false });
    saveTodos();
    renderTodos();
    input.value = '';
}

// Toggle todo completion
function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

// Edit todo
function editTodo(index) {
    const newText = prompt('Edit task:', todos[index].text);
    
    if (newText === null) return; // User cancelled
    
    const trimmedText = newText.trim();
    
    if (!trimmedText) {
        alert('Task cannot be empty');
        return;
    }
    
    // Check for duplicates (excluding current item)
    if (todos.some((todo, i) => i !== index && todo.text.toLowerCase() === trimmedText.toLowerCase())) {
        alert('This task already exists!');
        return;
    }
    
    todos[index].text = trimmedText;
    saveTodos();
    renderTodos();
}

// Delete todo
function deleteTodo(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }
}

// Sort todos alphabetically
function sortTodos() {
    todos.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
    saveTodos();
    renderTodos();
}

// ========================================
// QUICK LINKS
// ========================================

let links = [];

// Load links from local storage
function loadLinks() {
    const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
    links = stored ? JSON.parse(stored) : [];
    renderLinks();
}

// Save links to local storage
function saveLinks() {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
}

// Render links to the DOM
function renderLinks() {
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';

    links.forEach((link, index) => {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'link-button';
        a.textContent = link.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'link-delete';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            deleteLink(index);
        };
        
        a.appendChild(deleteBtn);
        linksList.appendChild(a);
    });
}

// Add new link
function addLink() {
    const nameInput = document.getElementById('linkName');
    const urlInput = document.getElementById('linkUrl');
    
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!name || !url) {
        alert('Please enter both name and URL');
        return;
    }
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }
    
    links.push({ name, url });
    saveLinks();
    renderLinks();
    
    nameInput.value = '';
    urlInput.value = '';
}

// Delete link
function deleteLink(index) {
    if (confirm('Are you sure you want to delete this link?')) {
        links.splice(index, 1);
        saveLinks();
        renderLinks();
    }
}

// ========================================
// DARK MODE
// ========================================

// Load theme from local storage
function loadTheme() {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
}

// Update theme toggle icon
function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize greeting section
    updateTime();
    updateDate();
    updateGreeting();
    setInterval(updateTime, 1000);
    
    // Name input
    document.getElementById('saveName').addEventListener('click', saveName);
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveName();
    });
    
    // Timer controls
    document.getElementById('timerDuration').addEventListener('change', changeTimerDuration);
    document.getElementById('customDuration').addEventListener('input', handleCustomDuration);
    document.getElementById('customDuration').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCustomDuration();
    });
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('stopTimer').addEventListener('click', stopTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    updateTimerDisplay();
    
    // Todo list
    document.getElementById('addTodo').addEventListener('click', addTodo);
    document.getElementById('sortTodos').addEventListener('click', sortTodos);
    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    loadTodos();
    
    // Quick links
    document.getElementById('addLink').addEventListener('click', addLink);
    document.getElementById('linkUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addLink();
    });
    loadLinks();
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    loadTheme();
});

let tasks = [];
let transactions = [];
let balance = 0;
let streak = 0;
let lastHabitDate = null;
let weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Initialize the app
function init() {
  loadData();
  renderTasks();
  renderTransactions();
  updateStats();
  renderWeekCalendar();
  updateMotivation();
  setupEventListeners();
  updateCurrentDate();
}

// Load data from localStorage
function loadData() {
  const savedTasks = localStorage.getItem('lifeOS_tasks');
  const savedTransactions = localStorage.getItem('lifeOS_transactions');
  const savedBalance = localStorage.getItem('lifeOS_balance');
  const savedStreak = localStorage.getItem('lifeOS_streak');
  const savedLastHabitDate = localStorage.getItem('lifeOS_lastHabitDate');
  
  if (savedTasks) tasks = JSON.parse(savedTasks);
  if (savedTransactions) transactions = JSON.parse(savedTransactions);
  if (savedBalance) balance = parseFloat(savedBalance);
  if (savedStreak) streak = parseInt(savedStreak);
  if (savedLastHabitDate) lastHabitDate = new Date(savedLastHabitDate);
  
  // Update balance display
  document.getElementById('balance').innerText = `₹${balance.toFixed(2)}`;
  document.getElementById('streak').innerText = streak;
}

// Setup event listeners
function setupEventListeners() {
  // Enter key for adding tasks
  document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });
  
  // Enter key for adding transactions
  document.getElementById('amount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addTransaction();
    }
  });
  
  // Focus on amount input when category changes
  document.getElementById('category').addEventListener('change', function() {
    document.getElementById('amount').focus();
  });
}

// Update current date display
function updateCurrentDate() {
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
}

// Update all stats
function updateStats() {
  const completedTasks = tasks.filter(t => t.completed).length;
  document.getElementById('totalTasks').innerText = tasks.length;
  document.getElementById('totalTransactions').innerText = transactions.length;
  document.getElementById('currentStreak').innerText = streak;
  document.getElementById('taskCount').innerText = tasks.length;
  document.getElementById('transactionCount').innerText = transactions.length;
  
  // Update warning if balance is negative
  const warningElement = document.getElementById('warning');
  if (balance < 0) {
    warningElement.style.display = 'flex';
  } else {
    warningElement.style.display = 'none';
  }
  
  // Update balance color based on value
  const balanceElement = document.getElementById('balance');
  if (balance < 0) {
    balanceElement.style.color = 'var(--color-danger)';
  } else if (balance > 0) {
    balanceElement.style.color = 'var(--color-success)';
  } else {
    balanceElement.style.color = 'var(--color-dark)';
  }
}

// Task functions
function addTask() {
  const input = document.getElementById('taskInput');
  const taskText = input.value.trim();
  
  if (!taskText) {
    input.focus();
    return;
  }
  
  tasks.push({
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString()
  });
  
  input.value = '';
  input.focus();
  renderTasks();
  updateStats();
  saveToLocalStorage();
  
  // Show animation
  const addBtn = document.querySelector('.add-btn');
  addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
  setTimeout(() => {
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
  }, 1000);
}

function renderTasks() {
  const list = document.getElementById('taskList');
  
  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>No tasks yet. Add your first task above!</p>
      </div>
    `;
    return;
  }
  
  // Sort tasks: incomplete first, then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  list.innerHTML = '';
  
  sortedTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
      <div class="task-content">
        <span class="task-text">${task.text}</span>
        <span class="task-time">${formatTime(task.createdAt)}</span>
      </div>
      <div class="task-actions">
        <button onclick="toggleTask(${task.id})" class="task-btn complete-btn" title="${task.completed ? 'Mark Incomplete' : 'Mark Complete'}">
          <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
        </button>
        <button onclick="deleteTask(${task.id})" class="task-btn delete-btn" title="Delete Task">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    renderTasks();
    saveToLocalStorage();
  }
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    updateStats();
    saveToLocalStorage();
  }
}

function clearCompletedTasks() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showNotification('No completed tasks to clear!', 'info');
    return;
  }
  
  if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
    tasks = tasks.filter(t => !t.completed);
    renderTasks();
    updateStats();
    saveToLocalStorage();
    showNotification(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}!`, 'success');
  }
}

// Finance functions
function selectType(type) {
  document.getElementById('type').value = type;
  
  // Update UI
  document.querySelectorAll('.type-option').forEach(option => {
    if (option.dataset.type === type) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
}

function addTransaction() {
  const amountInput = document.getElementById('amount');
  const amount = parseFloat(amountInput.value);
  const category = document.getElementById('category').value;
  const type = document.getElementById('type').value;
  
  if (!amount || amount <= 0) {
    showNotification('Please enter a valid amount', 'warning');
    amountInput.focus();
    return;
  }
  
  const transaction = {
    id: Date.now(),
    amount: amount,
    category: category,
    type: type,
    date: new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    }),
    time: new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  transactions.unshift(transaction); // Add to beginning
  
  // Update balance
  balance += type === 'income' ? amount : -amount;
  
  // Clear and focus input
  amountInput.value = '';
  amountInput.focus();
  
  // Update UI
  document.getElementById('balance').innerText = `₹${balance.toFixed(2)}`;
  renderTransactions();
  updateStats();
  saveToLocalStorage();
  
  // Show success animation
  const addBtn = document.querySelector('.add-transaction-btn');
  const originalHTML = addBtn.innerHTML;
  addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
  addBtn.style.background = 'var(--gradient-success)';
  
  setTimeout(() => {
    addBtn.innerHTML = originalHTML;
    addBtn.style.background = 'var(--gradient-secondary)';
  }, 1000);
  
  showNotification(`Added ${type}: ₹${amount.toFixed(2)} for ${category}`, 'success');
}

function renderTransactions() {
  const list = document.getElementById('transactionList');
  
  if (transactions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt"></i>
        <p>No transactions yet. Add your first transaction!</p>
      </div>
    `;
    return;
  }
  
  // Show only the last 5 transactions
  const recentTransactions = transactions.slice(0, 5);
  
  list.innerHTML = '';
  
  recentTransactions.forEach(t => {
    const li = document.createElement('li');
    li.className = t.type;
    
    li.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-category">${t.category}</div>
        <div class="transaction-meta">
          <span class="transaction-date">${t.date}</span>
          <span class="transaction-time">${t.time}</span>
        </div>
      </div>
      <div class="transaction-amount ${t.type}">
        ${t.type === 'expense' ? '-' : '+'}₹${t.amount.toFixed(2)}
      </div>
    `;
    
    list.appendChild(li);
  });
}

// ========== IMPROVED HABIT TRACKER FUNCTIONS ==========

function markHabit() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if habit was already marked today
  if (lastHabitDate) {
    const lastDate = new Date(lastHabitDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      showNotification("🎯 Already marked today! Great job maintaining consistency!", 'info');
      animateTodayButton();
      return;
    } else if (diffDays === 1) {
      // Consecutive day
      streak++;
      showNotification(`🔥 Streak continues! Day ${streak} complete!`, 'success');
    } else if (diffDays > 1) {
      // Broken streak
      showNotification(`💔 Streak broken after ${streak} days! Starting fresh...`, 'warning');
      streak = 1;
    }
  } else {
    // First time
    streak = 1;
    showNotification('🌟 First day of your new streak! Keep it up!', 'success');
  }
  
  lastHabitDate = today;
  
  // Update UI
  updateStreakDisplay();
  updateStats();
  renderWeekCalendar();
  updateMotivation();
  saveToLocalStorage();
  
  // Show celebration for milestones
  celebrateStreakMilestone();
  
  // Button animation
  animateTodayButton();
}

function updateStreakDisplay() {
  const streakElement = document.getElementById('streak');
  const flameIcon = document.querySelector('.flame-icon');
  
  // Animate the streak number
  streakElement.style.transform = 'scale(1.2)';
  streakElement.style.transition = 'transform 0.3s ease';
  
  setTimeout(() => {
    streakElement.style.transform = 'scale(1)';
    streakElement.innerText = streak;
  }, 150);
  
  // Enhance flame animation for higher streaks
  if (streak >= 7) {
    flameIcon.style.animationDuration = '1s';
    flameIcon.style.filter = 'drop-shadow(0 2px 6px rgba(255, 107, 53, 0.8)) drop-shadow(0 0 15px rgba(255, 107, 53, 0.6))';
  } else if (streak >= 3) {
    flameIcon.style.animationDuration = '1.2s';
  }
}

function celebrateStreakMilestone() {
  const celebration = document.getElementById('streakCelebration');
  
  if (streak % 7 === 0) {
    // Weekly milestone
    celebration.innerHTML = '🎉 WEEK!';
    celebration.style.display = 'block';
    
    setTimeout(() => {
      celebration.style.display = 'none';
    }, 2000);
    
    showNotification(`🎊 AMAZING! ${streak}-day streak! That's ${streak/7} week${streak/7 > 1 ? 's' : ''}!`, 'success');
  } else if (streak === 30) {
    // Monthly milestone
    celebration.innerHTML = '🏆 MONTH!';
    celebration.style.display = 'block';
    
    setTimeout(() => {
      celebration.style.display = 'none';
    }, 2000);
    
    showNotification('🏆 INCREDIBLE! You have maintained a 30-day streak!', 'success');
  } else if (streak === 100) {
    // 100 days milestone
    celebration.innerHTML = '💯 DAYS!';
    celebration.style.display = 'block';
    
    setTimeout(() => {
      celebration.style.display = 'none';
    }, 2000);
    
    showNotification('💯 LEGENDARY! 100 days of consistency! You are unstoppable!', 'success');
  }
}

function resetStreak() {
  if (streak === 0) {
    showNotification('No active streak to reset!', 'info');
    return;
  }
  
  if (confirm(`Are you sure you want to reset your ${streak}-day streak? This cannot be undone.`)) {
    const oldStreak = streak;
    streak = 0;
    lastHabitDate = null;
    
    updateStreakDisplay();
    updateStats();
    renderWeekCalendar();
    updateMotivation();
    saveToLocalStorage();
    
    showNotification(`Streak reset. Previous streak: ${oldStreak} days. Start fresh!`, 'info');
  }
}

function renderWeekCalendar() {
  const weekContainer = document.getElementById('weekCalendar');
  
  weekContainer.innerHTML = '';
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    
    // Check if this day should be marked
    let isActive = false;
    let isToday = false;
    
    // Check if it's today
    if (day.getDate() === today.getDate() && 
        day.getMonth() === today.getMonth() && 
        day.getFullYear() === today.getFullYear()) {
      isToday = true;
    }
    
    // Check if habit was marked on this day
    if (lastHabitDate) {
      const habitDate = new Date(lastHabitDate);
      habitDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(day);
      checkDate.setHours(0, 0, 0, 0);
      
      // Check if the dates match
      if (habitDate.getTime() === checkDate.getTime()) {
        isActive = true;
      }
      
      // For streak visualization, show active days for current streak
      if (streak > 0) {
        const daysAgo = Math.floor((today - day) / (1000 * 60 * 60 * 24));
        // Show active for today and past streak days
        if (daysAgo >= 0 && daysAgo < streak) {
          isActive = true;
        }
      }
    }
    
    dayElement.innerHTML = `
      <div class="day-name">${weekDays[i].substring(0, 3)}</div>
      <div class="day-circle ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}">
        ${day.getDate()}
      </div>
    `;
    
    // Add click event to mark day
    dayElement.querySelector('.day-circle').addEventListener('click', function() {
      if (!isActive) {
        // For demo purposes, allow marking any day
        markDay(day);
      }
    });
    
    weekContainer.appendChild(dayElement);
  }
}

// Helper function to mark a specific day
function markDay(date) {
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  if (confirm(`Mark habit for ${formattedDate}?`)) {
    // For demo - update streak and last habit date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Check if this date is in the future
    if (selectedDate > today) {
      showNotification("Cannot mark future dates!", 'warning');
      return;
    }
    
    // Check if this date is already marked
    if (lastHabitDate) {
      const lastDate = new Date(lastHabitDate);
      lastDate.setHours(0, 0, 0, 0);
      
      if (lastDate.getTime() === selectedDate.getTime()) {
        showNotification("This date is already marked!", 'info');
        return;
      }
    }
    
    // Update streak based on date
    if (!lastHabitDate || selectedDate.getTime() === today.getTime()) {
      streak++;
    } else {
      // For past dates, just mark them without affecting streak
      showNotification(`Marked habit for ${formattedDate}!`, 'success');
    }
    
    lastHabitDate = selectedDate;
    
    updateStreakDisplay();
    updateStats();
    renderWeekCalendar();
    updateMotivation();
    saveToLocalStorage();
  }
}

function updateMotivation() {
  const motivationText = document.getElementById('motivationText');
  
  const motivations = {
    0: "Every great journey begins with a single step. Start your streak today!",
    1: "Great start! The first day is the hardest. Keep going!",
    2: "Two days in a row! You're building momentum!",
    3: "Three-day streak! Consistency is becoming a habit!",
    4: "Four days! You're officially building a routine!",
    5: "Five days strong! Almost a full week!",
    6: "Six days! One more day for your first weekly milestone!",
    7: "🎉 ONE WEEK! You've mastered the first milestone!",
    14: "🏆 TWO WEEKS! Your dedication is inspiring!",
    21: "🌟 THREE WEEKS! You're developing powerful discipline!",
    30: "💯 ONE MONTH! You are a habit master!",
    60: "🔥 TWO MONTHS! Unstoppable consistency!",
    90: "🏅 THREE MONTHS! You've transformed your life!",
    100: "👑 100 DAYS! Legendary commitment!"
  };
  
  // Find the closest milestone or use generic message
  let closestKey = 0;
  for (const key in motivations) {
    if (streak >= parseInt(key)) {
      closestKey = key;
    }
  }
  
  motivationText.innerText = motivations[closestKey] || 
    `${streak} days! Your consistency is truly remarkable!`;
}

// Animation for today button
function animateTodayButton() {
  const todayBtn = document.querySelector('.primary-btn');
  const originalText = todayBtn.innerHTML;
  
  todayBtn.innerHTML = '<i class="fas fa-check"></i> Marked!';
  todayBtn.style.background = 'var(--gradient-success)';
  todayBtn.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    todayBtn.innerHTML = originalText;
    todayBtn.style.background = 'var(--gradient-primary)';
    todayBtn.style.transform = 'scale(1)';
  }, 1000);
}

// Helper functions
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Add notification styles if not already present
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--radius-small);
        background: white;
        box-shadow: var(--shadow-heavy);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        max-width: 350px;
        border-left: 4px solid var(--color-gray);
      }
      
      .notification.success {
        border-left-color: var(--color-success);
      }
      
      .notification.warning {
        border-left-color: var(--color-warning);
      }
      
      .notification.info {
        border-left-color: var(--color-secondary);
      }
      
      .notification i {
        font-size: 1.3rem;
      }
      
      .notification.success i {
        color: var(--color-success);
      }
      
      .notification.warning i {
        color: var(--color-warning);
      }
      
      .notification.info i {
        color: var(--color-secondary);
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem('lifeOS_tasks', JSON.stringify(tasks));
  localStorage.setItem('lifeOS_transactions', JSON.stringify(transactions));
  localStorage.setItem('lifeOS_balance', balance.toString());
  localStorage.setItem('lifeOS_streak', streak.toString());
  if (lastHabitDate) {
    localStorage.setItem('lifeOS_lastHabitDate', lastHabitDate.toISOString());
  }
}

// Simulate save to backend
function saveData() {
  saveToLocalStorage();
  
  // Show success animation
  const saveBtn = document.querySelector('.save-btn');
  const originalHTML = saveBtn.innerHTML;
  
  saveBtn.innerHTML = '<i class="fas fa-check"></i> All Data Saved!';
  saveBtn.style.background = 'var(--gradient-success)';
  
  showNotification('All data has been saved successfully!', 'success');
  
  setTimeout(() => {
    saveBtn.innerHTML = originalHTML;
    saveBtn.style.background = 'var(--gradient-primary)';
  }, 2000);
}

// Initialize the app when the page loads
window.onload = init;
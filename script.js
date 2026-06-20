// DOM Elements
let randomTypeBtn, memorableTypeBtn, pinTypeBtn;
let lengthSlider, lengthDisplay, passwordField;
let copyBtn, refreshBtn, generateBtn, historyBtn;
let uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox;
let randomOptions, charCountDisplay, strengthLevel, copyFeedback;
let historyModal, historyList, closeModalBtn, closeModalBtn2, clearHistoryBtn;

// State
let currentPasswordType = 'random';
let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

// Character Sets
const charsets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/\\',
};

const memorableWords = [
    'crystal', 'thunder', 'phantom', 'nebula', 'dragon',
    'aurora', 'meteor', 'eclipse', 'quantum', 'horizon',
    'velocity', 'zenith', 'pyramid', 'whisper', 'falcon',
    'shadow', 'beacon', 'mystic', 'legacy', 'prism',
];

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    initializeEventListeners();
    generatePassword();
    updateCharacterCount();
});

function initializeDOMElements() {
    // Select all DOM elements after DOMContentLoaded
    randomTypeBtn = document.getElementById('random-type');
    memorableTypeBtn = document.getElementById('memorable-type');
    pinTypeBtn = document.getElementById('pin-type');
    lengthSlider = document.getElementById('length-slider');
    lengthDisplay = document.getElementById('length-display');
    passwordField = document.getElementById('password-field');
    copyBtn = document.getElementById('copy-btn');
    refreshBtn = document.getElementById('refresh-btn');
    generateBtn = document.getElementById('generate-btn');
    historyBtn = document.getElementById('history-btn');
    uppercaseCheckbox = document.getElementById('uppercase');
    lowercaseCheckbox = document.getElementById('lowercase');
    numbersCheckbox = document.getElementById('numbers');
    symbolsCheckbox = document.getElementById('symbols');
    randomOptions = document.getElementById('random-options');
    charCountDisplay = document.getElementById('char-count');
    strengthLevel = document.getElementById('strength-level');
    copyFeedback = document.getElementById('copy-feedback');
    historyModal = document.getElementById('history-modal');
    historyList = document.getElementById('history-list');
    closeModalBtn = document.getElementById('close-modal');
    closeModalBtn2 = document.getElementById('close-modal-btn');
    clearHistoryBtn = document.getElementById('clear-history-btn');
}

function initializeEventListeners() {
    // Password Type Selection
    randomTypeBtn.addEventListener('click', () => setPasswordType('random'));
    memorableTypeBtn.addEventListener('click', () => setPasswordType('memorable'));
    pinTypeBtn.addEventListener('click', () => setPasswordType('pin'));

    // Length Slider
    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
        generatePassword();
    });

    // Character Options
    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(
        (checkbox) => {
            checkbox.addEventListener('change', () => {
                updateCharacterCount();
                generatePassword();
            });
        }
    );

    // Action Buttons
    generateBtn.addEventListener('click', generatePassword);
    refreshBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);
    historyBtn.addEventListener('click', openHistoryModal);
    closeModalBtn.addEventListener('click', closeHistoryModal);
    closeModalBtn2.addEventListener('click', closeHistoryModal);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistoryModal();
        }
    });
}

// ================================
// PASSWORD TYPE MANAGEMENT
// ================================

function setPasswordType(type) {
    currentPasswordType = type;
    
    // Update button states
    [randomTypeBtn, memorableTypeBtn, pinTypeBtn].forEach((btn) => btn.classList.remove('selected'));
    
    switch (type) {
        case 'random':
            randomTypeBtn.classList.add('selected');
            randomOptions.style.display = 'grid';
            break;
        case 'memorable':
            memorableTypeBtn.classList.add('selected');
            randomOptions.style.display = 'none';
            break;
        case 'pin':
            pinTypeBtn.classList.add('selected');
            randomOptions.style.display = 'none';
            break;
    }
    
    generatePassword();
}

// ================================
// PASSWORD GENERATION
// ================================

function generatePassword() {
    let password = '';
    const length = parseInt(lengthSlider.value);

    switch (currentPasswordType) {
        case 'random':
            password = generateRandomPassword(length);
            break;
        case 'memorable':
            password = generateMemorablePassword(length);
            break;
        case 'pin':
            password = generatePINPassword(length);
            break;
    }

    passwordField.value = password;
    updatePasswordStrength(password);
    addToHistory(password);
}

function generateRandomPassword(length) {
    let characters = '';

    if (uppercaseCheckbox.checked) characters += charsets.uppercase;
    if (lowercaseCheckbox.checked) characters += charsets.lowercase;
    if (numbersCheckbox.checked) characters += charsets.numbers;
    if (symbolsCheckbox.checked) characters += charsets.symbols;

    if (characters.length === 0) {
        alert('Please select at least one character type!');
        return '';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return password;
}

function generateMemorablePassword(length) {
    let password = '';
    
    while (password.length < length) {
        const word = memorableWords[Math.floor(Math.random() * memorableWords.length)];
        if (password.length > 0) {
            password += '-' + word;
        } else {
            password += word;
        }
    }

    return password.slice(0, length);
}

function generatePINPassword(length) {
    let password = '';
    
    for (let i = 0; i < length; i++) {
        password += Math.floor(Math.random() * 10).toString();
    }

    return password;
}

// ================================
// CHARACTER COUNT & STRENGTH
// ================================

function updateCharacterCount() {
    if (currentPasswordType !== 'random') return;

    let count = 0;
    if (uppercaseCheckbox.checked) count += charsets.uppercase.length;
    if (lowercaseCheckbox.checked) count += charsets.lowercase.length;
    if (numbersCheckbox.checked) count += charsets.numbers.length;
    if (symbolsCheckbox.checked) count += charsets.symbols.length;

    charCountDisplay.textContent = count;
}

function updatePasswordStrength(password) {
    const length = password.length;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_\-=+[\]{}|;:,.<>?/\\]/.test(password);

    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (length >= 16) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumbers) strength++;
    if (hasSymbols) strength++;

    let level = 'Weak';
    let className = 'weak';

    if (strength >= 6) {
        level = 'Strong';
        className = 'strong';
    } else if (strength >= 4) {
        level = 'Medium';
        className = 'medium';
    }

    strengthLevel.textContent = level;
    strengthLevel.className = `strength-level ${className}`;
}

// ================================
// CLIPBOARD & UI INTERACTIONS
// ================================

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(passwordField.value);
        
        // Show feedback with better animation
        copyFeedback.classList.add('show');
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            copyFeedback.classList.remove('show');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy password to clipboard');
    }
}

// ================================
// PASSWORD HISTORY
// ================================

function addToHistory(password) {
    if (!password || passwordHistory.some((item) => item.password === password)) return;

    passwordHistory.unshift({
        password,
        timestamp: new Date().toLocaleTimeString(),
    });

    // Keep only last 20 passwords
    if (passwordHistory.length > 20) {
        passwordHistory.pop();
    }

    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
}

function openHistoryModal() {
    historyModal.classList.add('show');
    displayHistory();
}

function closeHistoryModal() {
    historyModal.classList.remove('show');
}

function displayHistory() {
    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No passwords generated yet</p>';
        return;
    }

    historyList.innerHTML = passwordHistory
        .map(
            (item, index) => `
        <div class="history-item">
            <span class="history-item-text">${escapeHtml(item.password)}</span>
            <span class="history-item-time">${item.timestamp}</span>
            <button class="history-item-btn" onclick="useHistoryPassword(${index})">
                Use
            </button>
        </div>
    `
        )
        .join('');
}

function useHistoryPassword(index) {
    passwordField.value = passwordHistory[index].password;
    updatePasswordStrength(passwordHistory[index].password);
    closeHistoryModal();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all password history?')) {
        passwordHistory = [];
        localStorage.removeItem('passwordHistory');
        displayHistory();
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
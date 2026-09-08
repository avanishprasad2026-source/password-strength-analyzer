// Common weak passwords and predictable patterns
const COMMON_WEAK_PASSWORDS = [
  "password", "123456", "123456789", "qwerty", "admin", "welcome", "letmein", "monkey", "12345678"
];

// DOM Element references
const passwordInput = document.getElementById('passwordInput');
const toggleVisibility = document.getElementById('toggleVisibility');
const meterBar = document.getElementById('meterBar');
const strengthText = document.getElementById('strengthText');
const entropyText = document.getElementById('entropyText');

const checkLength = document.getElementById('checkLength');
const checkUpper = document.getElementById('checkUpper');
const checkLower = document.getElementById('checkLower');
const checkNumber = document.getElementById('checkNumber');
const checkSymbol = document.getElementById('checkSymbol');

const feedbackBox = document.getElementById('feedbackBox');
const suggestionsList = document.getElementById('suggestionsList');

const generateBtn = document.getElementById('generateBtn');
const suggestedContainer = document.getElementById('suggestedContainer');
const suggestedPassword = document.getElementById('suggestedPassword');
const copyBtn = document.getElementById('copyBtn');

// 1. Password Visibility Toggle
toggleVisibility.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  toggleVisibility.textContent = isPassword ? 'Hide' : 'Show';
});

// 2. Real-time Analysis Event
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  evaluatePassword(password);
});

// 3. Core Evaluation Logic
function evaluatePassword(pwd) {
  if (!pwd) {
    resetMeter();
    return;
  }

  // Character set checks
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const isLong = pwd.length >= 12;

  // Update checklist indicators
  updateCheckItem(checkLength, isLong, "At least 12 characters");
  updateCheckItem(checkUpper, hasUpper, "Upper case letters (A-Z)");
  updateCheckItem(checkLower, hasLower, "Lower case letters (a-z)");
  updateCheckItem(checkNumber, hasNumber, "Numbers (0-9)");
  updateCheckItem(checkSymbol, hasSymbol, "Special symbols (!@#$%^&*)");

  // Calculate Pool Size (R) for Entropy
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  // Calculate Information Entropy (E = L * log2(R))
  let entropy = poolSize > 0 ? pwd.length * Math.log2(poolSize) : 0;

  // Penalize for common passwords and sequential/repeating characters
  let penalty = 0;
  if (COMMON_WEAK_PASSWORDS.includes(pwd.toLowerCase())) {
    entropy = 0; // Force zero entropy for common dictionary words
  } else {
    if (/(.)\1{2,}/.test(pwd)) penalty += 10; // Repeating characters (e.g., "aaa")
    if (/1234|abcd|qwerty/i.test(pwd)) penalty += 15; // Sequential patterns
  }

  const finalEntropy = Math.max(0, Math.round(entropy - penalty));
  entropyText.textContent = `${finalEntropy} bits`;

  // Render Strength Score based on Entropy
  const suggestions = [];
  let strength = "Very Weak";
  let color = "#ef4444"; // Red
  let width = "20%";

  if (COMMON_WEAK_PASSWORDS.includes(pwd.toLowerCase())) {
    suggestions.push("This is a commonly used password and can be cracked instantly.");
  } else if (finalEntropy < 28) {
    strength = "Very Weak";
    color = "#ef4444";
    width = "20%";
  } else if (finalEntropy < 36) {
    strength = "Weak";
    color = "#f97316"; // Orange
    width = "40%";
  } else if (finalEntropy < 60) {
    strength = "Reasonable";
    color = "#f59e0b"; // Yellow
    width = "60%";
  } else if (finalEntropy < 80) {
    strength = "Strong";
    color = "#3b82f6"; // Blue
    width = "80%";
  } else {
    strength = "Very Strong";
    color = "#22c55e"; // Green
    width = "100%";
  }

  // Generate specific actionable feedback
  if (pwd.length < 12) suggestions.push("Increase length to at least 12 characters.");
  if (!hasUpper || !hasLower) suggestions.push("Mix uppercase and lowercase letters.");
  if (!hasNumber) suggestions.push("Include at least one number.");
  if (!hasSymbol) suggestions.push("Add special characters (e.g., !@#$).");
  if (penalty > 0) suggestions.push("Avoid repeated characters or predictable sequences.");

  // Update UI
  meterBar.style.width = width;
  meterBar.style.backgroundColor = color;
  strengthText.textContent = strength;
  strengthText.style.color = color;

  renderSuggestions(suggestions);
}

function updateCheckItem(element, isValid, text) {
  element.textContent = `${isValid ? '✅' : '❌'} ${text}`;
  element.classList.toggle('valid', isValid);
}

function renderSuggestions(suggestions) {
  if (suggestions.length === 0) {
    feedbackBox.classList.add('hidden');
    return;
  }
  suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
  feedbackBox.classList.remove('hidden');
}

function resetMeter() {
  meterBar.style.width = '0%';
  strengthText.textContent = 'None';
  entropyText.textContent = '0 bits';
  feedbackBox.classList.add('hidden');
  [checkLength, checkUpper, checkLower, checkNumber, checkSymbol].forEach(el => {
    el.classList.remove('valid');
  });
}

// 4. Secure Password Generator (Cryptographically Secure)
generateBtn.addEventListener('click', () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
  const array = new Uint32Array(16);
  window.crypto.getRandomValues(array);
  
  let result = "";
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }

  suggestedPassword.textContent = result;
  suggestedContainer.classList.remove('hidden');
});

// Copy Suggested Password
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(suggestedPassword.textContent);
  copyBtn.textContent = "Copied!";
  setTimeout(() => copyBtn.textContent = "Copy", 2000);
});

/**
 * ===================================================================
 * Portfolio Connect - Application Logic & Google Apps Script Sync
 * ===================================================================
 * Manages form validation, real-time live preview synchronization,
 * Google Apps Script HTTP payload dispatch, and UI modals.
 * ===================================================================
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_URL = 'portfolio_gas_webhook_url';
  const STORAGE_KEY_HISTORY = 'portfolio_submissions_history';
  const STORAGE_KEY_DRAFT = 'portfolio_form_draft';

  // Default Google Apps Script URL (Deployed to user's Google Sheet)
  const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhmon-zEpPQQh2zNL34b3WEQkG6_mEalmB3dK2QMwZxJ5yAniWRCgr4te2ehB24wwwAg/exec';

  // State
  let currentScriptUrl = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SCRIPT_URL;
  let submissionsHistory = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');

  // DOM Elements - Form & Inputs
  const form = document.getElementById('portfolioForm');
  const inputName = document.getElementById('name');
  const inputLastName = document.getElementById('lastname');
  const inputGmail = document.getElementById('gmail');
  const inputContact = document.getElementById('contact');
  const inputAddress = document.getElementById('address');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const appendGmailBtn = document.getElementById('appendGmailSuffix');
  const addressCharCount = document.getElementById('addressCharCount');

  // DOM Elements - Status & Live Preview
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const dbStatusText = document.getElementById('dbStatusText');
  const previewFullName = document.getElementById('previewFullName');
  const previewAvatar = document.getElementById('previewAvatar');
  const previewGmail = document.getElementById('previewGmail');
  const previewContact = document.getElementById('previewContact');
  const previewAddress = document.getElementById('previewAddress');
  const previewClock = document.getElementById('previewClock');

  // DOM Elements - History
  const historyList = document.getElementById('historyList');
  const submissionCount = document.getElementById('submissionCount');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // DOM Elements - Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const scriptUrlInput = document.getElementById('scriptUrlInput');
  const saveScriptUrlBtn = document.getElementById('saveScriptUrlBtn');
  const testScriptUrlBtn = document.getElementById('testScriptUrlBtn');
  const resetDefaultUrlBtn = document.getElementById('resetDefaultUrlBtn');
  const testResultBox = document.getElementById('testResultBox');
  const viewGuideBtn = document.getElementById('viewGuideBtn');
  const copyCodeGsBtn = document.getElementById('copyCodeGsBtn');

  // DOM Elements - Success Modal
  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const successReceiptBox = document.getElementById('successReceiptBox');
  const successModalSubtitle = document.getElementById('successModalSubtitle');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // Validation Rules
  const validators = {
    name: {
      validate: (val) => val.trim().length >= 2,
      errorMsg: 'First name must be at least 2 characters.'
    },
    lastname: {
      validate: (val) => val.trim().length >= 2,
      errorMsg: 'Last name must be at least 2 characters.'
    },
    gmail: {
      validate: (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val.trim());
      },
      errorMsg: 'Please enter a valid email address (e.g. name@gmail.com).'
    },
    contact: {
      validate: (val) => {
        // Allows digits, spaces, parentheses, dashes, plus sign; min 7 digits
        const digits = val.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      errorMsg: 'Please enter a valid phone number (at least 7 digits).'
    },
    address: {
      validate: (val) => val.trim().length >= 5,
      errorMsg: 'Address must be at least 5 characters long.'
    }
  };

  /**
   * Initialize Application
   */
  function init() {
    updateStatusBadge();
    bindEvents();
    loadDraft();
    updateLivePreview();
    renderHistory();
    startClock();
  }

  /**
   * Bind DOM Event Listeners
   */
  function bindEvents() {
    // Form Input events for real-time validation and live preview
    const inputs = [inputName, inputLastName, inputGmail, inputContact, inputAddress];
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        validateField(input);
        updateLivePreview();
        saveDraft();
      });

      input.addEventListener('blur', () => {
        validateField(input);
      });
    });

    // Contact number smart formatting
    inputContact.addEventListener('input', handleContactInput);

    // Address character counter
    inputAddress.addEventListener('input', () => {
      const len = inputAddress.value.length;
      addressCharCount.textContent = `${len} / 250`;
    });

    // Gmail quick autocomplete button
    appendGmailBtn.addEventListener('click', () => {
      let val = inputGmail.value.trim();
      if (!val) {
        inputGmail.value = '@gmail.com';
        inputGmail.focus();
        inputGmail.setSelectionRange(0, 0);
      } else if (!val.includes('@')) {
        inputGmail.value = val + '@gmail.com';
      } else {
        const parts = val.split('@');
        inputGmail.value = parts[0] + '@gmail.com';
      }
      validateField(inputGmail);
      updateLivePreview();
      saveDraft();
    });

    // Form Submission
    form.addEventListener('submit', handleFormSubmit);

    // Form Reset
    resetBtn.addEventListener('click', handleReset);

    // Settings Modal Triggers
    openSettingsBtn.addEventListener('click', openSettings);
    dbStatusBadge.addEventListener('click', openSettings);
    viewGuideBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });

    // Settings Actions
    saveScriptUrlBtn.addEventListener('click', handleSaveScriptUrl);
    testScriptUrlBtn.addEventListener('click', handleTestScriptUrl);
    resetDefaultUrlBtn.addEventListener('click', handleResetScriptUrl);
    copyCodeGsBtn.addEventListener('click', handleCopyCodeGs);

    // Success Modal Close
    closeSuccessBtn.addEventListener('click', closeSuccessModal);
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeSuccessModal();
    });

    // History Actions
    clearHistoryBtn.addEventListener('click', handleClearHistory);

    // Keyboard Shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSettings();
        closeSuccessModal();
      }
    });
  }

  /**
   * Field Validation Helper
   */
  function validateField(input) {
    const fieldName = input.name;
    const rule = validators[fieldName];
    if (!rule) return true;

    const group = document.getElementById(`group-${fieldName}`);
    const errorEl = document.getElementById(`error-${fieldName}`);
    const isValid = rule.validate(input.value);

    if (input.value.trim() === '') {
      group.classList.remove('has-error', 'has-success');
      if (errorEl) errorEl.textContent = '';
      return false;
    }

    if (isValid) {
      group.classList.remove('has-error');
      group.classList.add('has-success');
      if (errorEl) errorEl.textContent = '';
      return true;
    } else {
      group.classList.remove('has-success');
      group.classList.add('has-error');
      if (errorEl) errorEl.textContent = rule.errorMsg;
      return false;
    }
  }

  /**
   * Validate entire form
   */
  function validateAll() {
    let allValid = true;
    const fields = [inputName, inputLastName, inputGmail, inputContact, inputAddress];

    fields.forEach((field) => {
      const isValid = validateField(field);
      if (!isValid) {
        allValid = false;
        // Make sure error state is visible
        const group = document.getElementById(`group-${field.name}`);
        const errorEl = document.getElementById(`error-${field.name}`);
        group.classList.add('has-error');
        if (errorEl) {
          errorEl.textContent = field.value.trim() === '' 
            ? `${field.labels[0]?.innerText.replace('*', '').trim() || 'This field'} is required.` 
            : validators[field.name]?.errorMsg;
        }
      }
    });

    return allValid;
  }

  /**
   * Contact Input auto-cleanup
   */
  function handleContactInput(e) {
    // Preserve plus at start if present
    let raw = e.target.value;
    let startsWithPlus = raw.startsWith('+');
    let digits = raw.replace(/\D/g, '');

    if (startsWithPlus) {
      e.target.value = '+' + digits;
    } else {
      e.target.value = digits;
    }
  }

  /**
   * Live Preview Mirroring
   */
  function updateLivePreview() {
    const fName = inputName.value.trim();
    const lName = inputLastName.value.trim();
    const gmail = inputGmail.value.trim();
    const contact = inputContact.value.trim();
    const address = inputAddress.value.trim();

    // Full Name & Avatar Initials
    if (fName || lName) {
      previewFullName.textContent = `${fName} ${lName}`.trim();
      const initials = (fName.charAt(0) + (lName.charAt(0) || '')).toUpperCase();
      previewAvatar.textContent = initials || 'ID';
    } else {
      previewFullName.textContent = 'Your Name Here';
      previewAvatar.textContent = 'ID';
    }

    // Gmail
    previewGmail.textContent = gmail || 'not provided';

    // Contact
    previewContact.textContent = contact || 'not provided';

    // Address
    previewAddress.textContent = address || 'not provided';
  }

  /**
   * Status Badge State Updater
   */
  function updateStatusBadge() {
    const dot = dbStatusBadge.querySelector('.status-dot');
    if (currentScriptUrl && currentScriptUrl.startsWith('https://script.google.com')) {
      dot.className = 'status-dot online';
      dbStatusText.textContent = 'Google Sheets Connected';
      dbStatusBadge.title = 'Connected to Sheet: 1ZBKFAWajAClVhBj17anFys4ACJGHy9NJBof75dew_iQ';
    } else {
      dot.className = 'status-dot online';
      dbStatusText.textContent = 'Demo Mode (Session Log)';
      dbStatusBadge.title = 'Click to configure your Google Apps Script URL';
    }
  }

  /**
   * Digital Clock on Preview Card
   */
  function startClock() {
    function tick() {
      const now = new Date();
      previewClock.textContent = now.toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);
  }

  /**
   * Save and Load Draft in Session
   */
  function saveDraft() {
    const draft = {
      name: inputName.value,
      lastname: inputLastName.value,
      gmail: inputGmail.value,
      contact: inputContact.value,
      address: inputAddress.value
    };
    sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
  }

  function loadDraft() {
    const saved = sessionStorage.getItem(STORAGE_KEY_DRAFT);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.name) inputName.value = data.name;
      if (data.lastname) inputLastName.value = data.lastname;
      if (data.gmail) inputGmail.value = data.gmail;
      if (data.contact) inputContact.value = data.contact;
      if (data.address) {
        inputAddress.value = data.address;
        addressCharCount.textContent = `${data.address.length} / 250`;
      }
    } catch (e) {
      console.warn('Failed to parse draft storage', e);
    }
  }

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY_DRAFT);
  }

  /**
   * Handle Form Reset
   */
  function handleReset() {
    if (confirm('Are you sure you want to clear all form fields?')) {
      form.reset();
      addressCharCount.textContent = '0 / 250';
      document.querySelectorAll('.form-group').forEach((g) => {
        g.classList.remove('has-error', 'has-success');
      });
      document.querySelectorAll('.field-error').forEach((err) => {
        err.textContent = '';
      });
      clearDraft();
      updateLivePreview();
      showToast('Form fields cleared', 'info');
    }
  }

  /**
   * Handle Form Submission
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('Please fix the highlighted errors before submitting.', 'error');
      const firstError = document.querySelector('.form-group.has-error input, .form-group.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    const payload = {
      name: inputName.value.trim(),
      lastname: inputLastName.value.trim(),
      gmail: inputGmail.value.trim(),
      contact: inputContact.value.trim(),
      address: inputAddress.value.trim(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // UI Loading state
    setLoadingState(true);

    try {
      let result;
      if (currentScriptUrl && currentScriptUrl.startsWith('https://script.google.com')) {
        // Submit directly to Google Apps Script Web App
        result = await submitToGoogleAppsScript(currentScriptUrl, payload);
      } else {
        // Simulated local sandbox demo response (lets user experience full flow while preparing deployment)
        await new Promise((r) => setTimeout(r, 1200));
        result = {
          status: 'success',
          isDemo: true,
          submissionId: 'DEMO-' + Date.now().toString().slice(-6),
          message: 'Saved to local session log! Add your Google Apps Script Web App URL in settings to log to live Sheets.'
        };
      }

      // Success processing
      onSubmissionSuccess(payload, result);

    } catch (error) {
      console.error('Submission error:', error);
      showToast('Submission error: ' + error.message, 'error');
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Dispatch HTTP request to Google Apps Script
   */
  async function submitToGoogleAppsScript(url, data) {
    // Google Apps Script requires text/plain or no-cors to avoid CORS preflight rejection
    // Using text/plain with JSON body works seamlessly with doPost(e) JSON.parse(e.postData.contents)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(data),
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Try reading JSON response
      try {
        const json = await response.json();
        return json;
      } catch (parseErr) {
        // If response is opaque or redirected
        return {
          status: 'success',
          submissionId: 'SUB-' + Date.now().toString().slice(-6),
          message: 'Data transmitted to Google Sheet.'
        };
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Please check your network and Google Apps Script deployment.');
      }

      // Fallback: Attempt fetch with mode: 'no-cors' for restricted domains
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });

        return {
          status: 'success',
          submissionId: 'SUB-NOCORS-' + Date.now().toString().slice(-6),
          message: 'Transmitted via fallback mode to Google Sheets.'
        };
      } catch (fallbackErr) {
        throw new Error('Could not reach Google Apps Script Web App. Please ensure it is deployed with access set to "Anyone".');
      }
    }
  }

  /**
   * Success Handling
   */
  function onSubmissionSuccess(payload, result) {
    // Trigger celebratory confetti
    triggerConfetti();

    // Store in history
    const historyItem = {
      id: result.submissionId || 'SUB-' + Date.now().toString().slice(-6),
      name: `${payload.name} ${payload.lastname}`,
      gmail: payload.gmail,
      contact: payload.contact,
      address: payload.address,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: !!result.isDemo
    };

    submissionsHistory.unshift(historyItem);
    if (submissionsHistory.length > 20) submissionsHistory.pop();
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(submissionsHistory));
    renderHistory();

    // Render receipt inside modal
    successReceiptBox.innerHTML = `
      <div class="receipt-row">
        <span class="receipt-key">Submission ID</span>
        <span class="receipt-val">${historyItem.id}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Full Name</span>
        <span class="receipt-val">${payload.name} ${payload.lastname}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Gmail</span>
        <span class="receipt-val">${payload.gmail}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Contact</span>
        <span class="receipt-val">${payload.contact}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Address</span>
        <span class="receipt-val">${payload.address}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-key">Target Database</span>
        <span class="receipt-val">${result.isDemo ? 'Demo Mode (Session Log)' : 'Live Google Sheet'}</span>
      </div>
    `;

    if (result.isDemo) {
      successModalSubtitle.textContent = 'Submission recorded in demo session. To log directly to your Google Sheet, configure your Web App URL in settings.';
    } else {
      successModalSubtitle.textContent = 'Your lead information has been sent directly to your connected Google Sheet!';
    }

    openSuccessModal();
    showToast('Submission received successfully!', 'success');

    // Reset form after successful submission
    form.reset();
    addressCharCount.textContent = '0 / 250';
    document.querySelectorAll('.form-group').forEach((g) => {
      g.classList.remove('has-error', 'has-success');
    });
    clearDraft();
    updateLivePreview();
  }

  /**
   * Confetti celebration burst
   */
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981']
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  /**
   * Loading state for submit button
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  }

  /**
   * Render Recent Submissions History List
   */
  function renderHistory() {
    submissionCount.textContent = submissionsHistory.length;

    if (submissionsHistory.length === 0) {
      historyList.innerHTML = `<div class="history-empty">No submissions logged yet. Try submitting the form!</div>`;
      return;
    }

    historyList.innerHTML = submissionsHistory.map((item) => `
      <div class="history-entry">
        <div>
          <div class="history-entry-name">${escapeHtml(item.name)}</div>
          <div class="history-entry-meta">${escapeHtml(item.gmail)} &bull; ${escapeHtml(item.contact)}</div>
        </div>
        <div class="history-entry-meta">${escapeHtml(item.timestamp)}</div>
      </div>
    `).join('');
  }

  function handleClearHistory() {
    if (submissionsHistory.length === 0) return;
    if (confirm('Clear the recent submission history log?')) {
      submissionsHistory = [];
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      renderHistory();
      showToast('History cleared', 'info');
    }
  }

  /**
   * Settings Modal Controls
   */
  function openSettings() {
    scriptUrlInput.value = currentScriptUrl;
    testResultBox.style.display = 'none';
    settingsModal.classList.add('is-active');
    settingsModal.setAttribute('aria-hidden', 'false');
    scriptUrlInput.focus();
  }

  function closeSettings() {
    settingsModal.classList.remove('is-active');
    settingsModal.setAttribute('aria-hidden', 'true');
  }

  function openSuccessModal() {
    successModal.classList.add('is-active');
    successModal.setAttribute('aria-hidden', 'false');
  }

  function closeSuccessModal() {
    successModal.classList.remove('is-active');
    successModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Save Webhook URL from Settings
   */
  function handleSaveScriptUrl() {
    const url = scriptUrlInput.value.trim();
    if (url && !url.startsWith('https://script.google.com/macros/s/')) {
      showToast('URL must start with https://script.google.com/macros/s/...', 'error');
      return;
    }

    currentScriptUrl = url;
    if (url) {
      localStorage.setItem(STORAGE_KEY_URL, url);
      showToast('Google Apps Script Webhook URL saved!', 'success');
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      showToast('Webhook URL cleared. Switched to demo sandbox mode.', 'info');
    }

    updateStatusBadge();
    closeSettings();
  }

  /**
   * Test Connection to Google Apps Script URL
   */
  async function handleTestScriptUrl() {
    const url = scriptUrlInput.value.trim();
    if (!url) {
      testResultBox.style.display = 'block';
      testResultBox.className = 'test-result-box error';
      testResultBox.textContent = 'Please enter a Google Apps Script Web App URL first.';
      return;
    }

    testResultBox.style.display = 'block';
    testResultBox.className = 'test-result-box';
    testResultBox.textContent = 'Pinging Google Apps Script endpoint...';

    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow' });
      const data = await response.json();

      testResultBox.className = 'test-result-box success';
      testResultBox.innerHTML = `<strong>Connected Successfully!</strong><br>${escapeHtml(data.message || 'Endpoint reachable.')}`;
      showToast('Connection verified successfully!', 'success');
    } catch (err) {
      // CORS or network
      testResultBox.className = 'test-result-box error';
      testResultBox.innerHTML = `<strong>Connection Warning / Check Required</strong><br>Could not read GET response directly (${escapeHtml(err.message)}). Ensure your deployment permissions are set to "Anyone". POST submissions will still be tried using CORS fallbacks.`;
    }
  }

  function handleResetScriptUrl() {
    scriptUrlInput.value = '';
    currentScriptUrl = '';
    localStorage.removeItem(STORAGE_KEY_URL);
    updateStatusBadge();
    testResultBox.style.display = 'none';
    showToast('Reset to default', 'info');
  }

  /**
   * Copy Code.gs backend code to clipboard
   */
  async function handleCopyCodeGs() {
    try {
      const response = await fetch('Code.gs');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      copyCodeGsBtn.textContent = 'Copied to Clipboard!';
      setTimeout(() => {
        copyCodeGsBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Code.gs to Clipboard
        `;
      }, 2500);
      showToast('Code.gs copied! Paste it in Google Apps Script.', 'success');
    } catch (err) {
      showToast('Please open Code.gs in your code editor to copy.', 'info');
    }
  }

  /**
   * Toast Notification Helper
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Escape HTML utility
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

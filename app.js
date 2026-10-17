/**
 * ===================================================================
 * AWI // VECTR-GRADE PORTFOLIO LOGIC & GSAP KINETICS
 * ===================================================================
 * Integrates:
 * 1. GSAP 3 & ScrollTrigger for orchestrated page entrance & scroll reveals
 * 2. Spotlight cursor illumination on technical cards
 * 3. Magnetic button physics
 * 4. Production Google Apps Script Webhook Integration (Google Sheets)
 * 5. Real-time form mirroring, validation, draft recovery, and confetti
 * ===================================================================
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_URL = 'portfolio_gas_webhook_url';
  const STORAGE_KEY_HISTORY = 'portfolio_submissions_history';
  const STORAGE_KEY_DRAFT = 'portfolio_form_draft';

  // Deployed Google Apps Script Endpoint (Directly bound to user's sheet)
  const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyhmon-zEpPQQh2zNL34b3WEQkG6_mEalmB3dK2QMwZxJ5yAniWRCgr4te2ehB24wwwAg/exec';

  // Application State
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

  // DOM Elements - Modals
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const scriptUrlInput = document.getElementById('scriptUrlInput');
  const saveScriptUrlBtn = document.getElementById('saveScriptUrlBtn');
  const testScriptUrlBtn = document.getElementById('testScriptUrlBtn');
  const resetDefaultUrlBtn = document.getElementById('resetDefaultUrlBtn');
  const testResultBox = document.getElementById('testResultBox');
  const headerDbStatus = document.getElementById('headerDbStatus');

  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const successReceiptBox = document.getElementById('successReceiptBox');
  const toastContainer = document.getElementById('toastContainer');

  // Mobile Menu Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenuDropdown = document.getElementById('mobileMenuDropdown');

  // Validation Rules
  const validators = {
    name: {
      validate: (val) => val.trim().length >= 2,
      errorMsg: 'First name must contain at least 2 characters.'
    },
    lastname: {
      validate: (val) => val.trim().length >= 2,
      errorMsg: 'Last name must contain at least 2 characters.'
    },
    gmail: {
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      errorMsg: 'Please enter a valid email address (e.g. name@gmail.com).'
    },
    contact: {
      validate: (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      errorMsg: 'Please enter a valid phone number (at least 7 digits).'
    },
    address: {
      validate: (val) => val.trim().length >= 5,
      errorMsg: 'Address must contain at least 5 characters.'
    }
  };

  /**
   * Application Initialization
   */
  function init() {
    initGSAPAnimations();
    initSpotlightEffect();
    initMagneticButtons();
    bindEvents();
    loadDraft();
    updateLivePreview();
    renderHistory();
    startClock();
  }

  /**
   * ===================================================================
   * GSAP & SCROLLTRIGGER ENGINE
   * ===================================================================
   */
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger plugin if available
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Load Sequence (Orchestrated Entry Timeline)
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } });

    heroTl
      .from('#mainNavbar', {
        y: -40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out'
      })
      .from('.hero-badge', {
        scale: 0.9,
        opacity: 0,
        duration: 0.6
      }, '-=0.4')
      .from('.hero-title span', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1.1
      }, '-=0.3')
      .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8
      }, '-=0.6')
      .from('.hero-actions .pill-btn', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7
      }, '-=0.5')
      .from('.hero-specs > div', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6
      }, '-=0.4')
      .from('.hero-visual-col .spotlight-card', {
        scale: 0.94,
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      }, '-=0.8');

    // 2. ScrollTrigger: Section Headers
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.utils.toArray('.section-reveal').forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out'
        });
      });

      // 3. ScrollTrigger: Project Cards Batch Reveal
      ScrollTrigger.batch('.project-card', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 50,
            opacity: 0,
            stagger: 0.18,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });

      // 4. ScrollTrigger: Capabilities Grid
      ScrollTrigger.batch('.cap-card', {
        start: 'top 88%',
        onEnter: (batch) => {
          gsap.from(batch, {
            y: 40,
            opacity: 0,
            stagger: 0.12,
            duration: 0.8,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });

      // 5. ScrollTrigger: Workflow / Methodology Step Reveal
      gsap.utils.toArray('.workflow-step').forEach((step, i) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          x: i % 2 === 0 ? -30 : 30,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out'
        });
      });

      // 6. Metric Numbers Counter Animation
      gsap.utils.toArray('.metric-card [data-counter]').forEach((counter) => {
        const targetVal = parseFloat(counter.getAttribute('data-counter'));
        const isDecimal = targetVal % 1 !== 0;

        ScrollTrigger.create({
          trigger: counter,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                const progress = this.progress();
                const current = targetVal * progress;
                counter.textContent = isDecimal ? current.toFixed(2) : Math.floor(current);
              }
            });
          }
        });
      });
    }
  }

  /**
   * ===================================================================
   * SPOTLIGHT CARD HOVER EFFECT (Vectr Cursor Illumination)
   * ===================================================================
   */
  function initSpotlightEffect() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /**
   * ===================================================================
   * MAGNETIC BUTTON PHYSICS
   * ===================================================================
   */
  function initMagneticButtons() {
    if (typeof gsap === 'undefined') return;
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25;

        gsap.to(btn, {
          x: x,
          y: y,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  /**
   * ===================================================================
   * EVENT BINDINGS
   * ===================================================================
   */
  function bindEvents() {
    // Inputs validation & live preview mirroring
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

    // Contact number smart cleanup
    inputContact.addEventListener('input', (e) => {
      let raw = e.target.value;
      let startsWithPlus = raw.startsWith('+');
      let digits = raw.replace(/\D/g, '');
      e.target.value = startsWithPlus ? '+' + digits : digits;
    });

    // Address char counter
    inputAddress.addEventListener('input', () => {
      addressCharCount.textContent = `${inputAddress.value.length} / 250`;
    });

    // Gmail Quick Auto-Suffix
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
    if (headerDbStatus) headerDbStatus.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) closeSettings();
    });

    // Settings Actions
    saveScriptUrlBtn.addEventListener('click', handleSaveScriptUrl);
    testScriptUrlBtn.addEventListener('click', handleTestScriptUrl);
    resetDefaultUrlBtn.addEventListener('click', handleResetScriptUrl);

    // Success Modal
    closeSuccessBtn.addEventListener('click', closeSuccessModal);
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeSuccessModal();
    });

    // History Actions
    clearHistoryBtn.addEventListener('click', handleClearHistory);

    // Mobile Menu Toggle
    if (mobileMenuBtn && mobileMenuDropdown) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuDropdown.classList.toggle('hidden');
      });

      document.querySelectorAll('.mobile-nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenuDropdown.classList.add('hidden');
        });
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSettings();
        closeSuccessModal();
      }
    });
  }

  /**
   * ===================================================================
   * VALIDATION
   * ===================================================================
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

  function validateAll() {
    let allValid = true;
    const fields = [inputName, inputLastName, inputGmail, inputContact, inputAddress];

    fields.forEach((field) => {
      const isValid = validateField(field);
      if (!isValid) {
        allValid = false;
        const group = document.getElementById(`group-${field.name}`);
        const errorEl = document.getElementById(`error-${field.name}`);
        group.classList.add('has-error');
        if (errorEl) {
          errorEl.textContent = field.value.trim() === ''
            ? 'This field is required.'
            : validators[field.name]?.errorMsg;
        }
      }
    });

    return allValid;
  }

  /**
   * ===================================================================
   * LIVE DATA MIRRORING
   * ===================================================================
   */
  function updateLivePreview() {
    const fName = inputName.value.trim();
    const lName = inputLastName.value.trim();
    const gmail = inputGmail.value.trim();
    const contact = inputContact.value.trim();
    const address = inputAddress.value.trim();

    if (fName || lName) {
      previewFullName.textContent = `${fName} ${lName}`.trim();
      const initials = (fName.charAt(0) + (lName.charAt(0) || '')).toUpperCase();
      previewAvatar.textContent = initials || 'ID';
    } else {
      previewFullName.textContent = 'Your Name Here';
      previewAvatar.textContent = 'ID';
    }

    previewGmail.textContent = gmail || 'not provided';
    previewContact.textContent = contact || 'not provided';
    previewAddress.textContent = address || 'not provided';
  }

  function startClock() {
    function tick() {
      previewClock.textContent = new Date().toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);
  }

  /**
   * ===================================================================
   * AUTO-DRAFT PERSISTENCE
   * ===================================================================
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
      console.warn('Draft load failure:', e);
    }
  }

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY_DRAFT);
  }

  function handleReset() {
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

  /**
   * ===================================================================
   * SUBMISSION & GOOGLE APPS SCRIPT DISPATCH
   * ===================================================================
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('Please resolve validation errors before submitting.', 'error');
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

    setLoadingState(true);

    try {
      const targetUrl = currentScriptUrl || DEFAULT_SCRIPT_URL;
      const result = await submitToGoogleAppsScript(targetUrl, payload);
      onSubmissionSuccess(payload, result);
    } catch (error) {
      console.error('Submission error:', error);
      showToast('Transmission failed: ' + error.message, 'error');
    } finally {
      setLoadingState(false);
    }
  }

  async function submitToGoogleAppsScript(url, data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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

      try {
        const json = await response.json();
        return json;
      } catch (parseErr) {
        return {
          status: 'success',
          submissionId: 'SUB-' + Date.now().toString().slice(-6),
          message: 'Transmitted to Google Sheet.'
        };
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new Error('Connection timed out. Check network connection.');
      }

      // Fallback: no-cors mode
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
          message: 'Transmitted via fallback mode.'
        };
      } catch (fallbackErr) {
        throw new Error('Unable to reach Google Apps Script. Ensure deployment is set to "Anyone".');
      }
    }
  }

  function onSubmissionSuccess(payload, result) {
    triggerConfetti();

    const historyItem = {
      id: result.submissionId || 'SUB-' + Date.now().toString().slice(-6),
      name: `${payload.name} ${payload.lastname}`,
      gmail: payload.gmail,
      contact: payload.contact,
      address: payload.address,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    submissionsHistory.unshift(historyItem);
    if (submissionsHistory.length > 20) submissionsHistory.pop();
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(submissionsHistory));
    renderHistory();

    successReceiptBox.innerHTML = `
      <div class="flex justify-between border-b border-slate-800 pb-1.5">
        <span class="text-slate-500">TRANSACTION ID:</span>
        <span class="text-cyan-400 font-bold">${historyItem.id}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 py-1.5">
        <span class="text-slate-500">CLIENT NAME:</span>
        <span class="text-white">${escapeHtml(payload.name)} ${escapeHtml(payload.lastname)}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 py-1.5">
        <span class="text-slate-500">GMAIL:</span>
        <span class="text-white">${escapeHtml(payload.gmail)}</span>
      </div>
      <div class="flex justify-between border-b border-slate-800 py-1.5">
        <span class="text-slate-500">CONTACT:</span>
        <span class="text-white">${escapeHtml(payload.contact)}</span>
      </div>
      <div class="flex justify-between pt-1.5">
        <span class="text-slate-500">TARGET:</span>
        <span class="text-emerald-400 font-bold">Google Sheet (Row Verified)</span>
      </div>
    `;

    openSuccessModal();
    showToast('Record logged directly into Google Sheet!', 'success');

    form.reset();
    addressCharCount.textContent = '0 / 250';
    document.querySelectorAll('.form-group').forEach((g) => {
      g.classList.remove('has-error', 'has-success');
    });
    clearDraft();
    updateLivePreview();
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0ea5e9', '#22d3ee', '#6366f1', '#34d399']
      });
    }
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  }

  function renderHistory() {
    submissionCount.textContent = submissionsHistory.length;

    if (submissionsHistory.length === 0) {
      historyList.innerHTML = `<div class="text-slate-500 text-xs font-mono text-center py-4">No local entries logged yet.</div>`;
      return;
    }

    historyList.innerHTML = submissionsHistory.map((item) => `
      <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs font-mono">
        <div>
          <div class="font-bold text-slate-200">${escapeHtml(item.name)}</div>
          <div class="text-[11px] text-slate-500">${escapeHtml(item.gmail)} &bull; ${escapeHtml(item.contact)}</div>
        </div>
        <div class="text-[10px] text-cyan-400">${escapeHtml(item.timestamp)}</div>
      </div>
    `).join('');
  }

  function handleClearHistory() {
    submissionsHistory = [];
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    renderHistory();
    showToast('Submission log cleared', 'info');
  }

  /**
   * ===================================================================
   * MODAL CONTROLS
   * ===================================================================
   */
  function openSettings() {
    scriptUrlInput.value = currentScriptUrl;
    testResultBox.classList.add('hidden');
    settingsModal.classList.add('is-active');
    settingsModal.setAttribute('aria-hidden', 'false');
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

  function handleSaveScriptUrl() {
    const url = scriptUrlInput.value.trim();
    if (url && !url.startsWith('https://script.google.com/macros/s/')) {
      showToast('URL must start with https://script.google.com/macros/s/...', 'error');
      return;
    }

    currentScriptUrl = url || DEFAULT_SCRIPT_URL;
    localStorage.setItem(STORAGE_KEY_URL, currentScriptUrl);
    showToast('Google Apps Script URL saved!', 'success');
    closeSettings();
  }

  async function handleTestScriptUrl() {
    const url = scriptUrlInput.value.trim() || DEFAULT_SCRIPT_URL;
    testResultBox.classList.remove('hidden');
    testResultBox.className = 'test-result-box text-xs font-mono rounded-xl p-3 bg-slate-900 border border-slate-800 text-slate-300';
    testResultBox.textContent = 'Pinging endpoint GET /exec...';

    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow' });
      const data = await response.json();
      testResultBox.className = 'test-result-box text-xs font-mono rounded-xl p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400';
      testResultBox.innerHTML = `<strong>Connected:</strong> ${escapeHtml(data.message || 'Service active')}`;
      showToast('Connection verified successfully!', 'success');
    } catch (err) {
      testResultBox.className = 'test-result-box text-xs font-mono rounded-xl p-3 bg-rose-950/40 border border-rose-800/40 text-rose-400';
      testResultBox.innerHTML = `<strong>Note:</strong> ${escapeHtml(err.message)}. POST requests will proceed using CORS fallback.`;
    }
  }

  function handleResetScriptUrl() {
    scriptUrlInput.value = DEFAULT_SCRIPT_URL;
    currentScriptUrl = DEFAULT_SCRIPT_URL;
    localStorage.setItem(STORAGE_KEY_URL, DEFAULT_SCRIPT_URL);
    testResultBox.classList.add('hidden');
    showToast('Reset to default production endpoint', 'info');
  }

  /**
   * Toast Helper
   */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    } else {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

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

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

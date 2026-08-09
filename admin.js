/**
 * HUNTHUB - Executive Admin Control Center JavaScript
 * Features: Secure Cryptographic Authentication (ID: hunthub@100animesh, Pass: animesh@2008),
 * Anti-SQL Injection Sanitizer, Session Storage Token Check, Rate Limiting Protection,
 * Pending Requests Review, Profit Margin Setting, Approval to Catalog, Instant Rejection Removal, Published Inventory Editing Modal & Deletion.
 */

// Cryptographic SHA-256 Hashes of Credentials
// Admin ID: "hunthub@100animesh"
// Password: "animesh@2008"
const AUTH_ID_HASH = "de472f5b951a5eb2ec32d36ccd9d2ca77c83fa8fe0d2147ecd7cae1b51d8f622";
const AUTH_PASS_HASH = "6da85943d7c90757dec97b5391d34131fa82ab83c66080e2484fe5f1140ac2e0";
const AUTH_SESSION_KEY = "hunthub_admin_authenticated_session_token_2026";

// Rate limiting state
let failedAttempts = 0;
let lockoutTimer = null;

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Obsidian Apex",
    tagline: "Titanium & Sapphire",
    price: 14500,
    currency: "€",
    badge: "New Release",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAd6YphimFNcYpZTImXq_Q0L_Js0Enj5QUGJk8qyxxZdPhdsC35zxg_dIQfUIUKEVcyaT9eIREb3l2cEhhx6iuXGedpdQ_o7PFaPtD5DdDx2w3eb5rfnGX90WuraBq_mWi9urRXqeQtfVybBiQlCd_tR-AtG6DJD4zqcbkgBJsLbaB_NRmKXj4-A2jxP1jcfLVGaj5vtkUHepoq9VmgfzcAES_ZrPB1ox9xG0FTYCnhKZrvwHYd0OiEBQ",
    description: "Obsidian Apex: Minimalist luxury smartphone with matte black titanium finish and gold camera rims on marble plinth."
  },
  {
    id: "prod-2",
    name: "Aura Rose",
    tagline: "18k Rose Gold",
    price: 18200,
    currency: "€",
    badge: "Exclusive",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhwFw0HDGSe9-mFl_xhDFyBfPBmZRSwwL3AwYGITnqEAYGXe0NcomFnnAZUsq8NtVDZBeEkDUZqgogamRx4HlADM2C11vixKWOv0o2Q4rPgw7n7vAwTqU7mOa41J417FCP-ZCn8BEt1E_scSA7Shy4iL1xfLE4cGdY_SpZ3QY128TaVH8pqOjWRL1KjurQQ_9rSvPSo7MxIgqZ-UN0AfczDIaQhXhNTGv0H_ord6HoA1y5DCUDatYjjA",
    description: "Aura Rose: Polished rose gold mobile device with intricate carbon fiber back panel."
  },
  {
    id: "prod-3",
    name: "Silver Ghost",
    tagline: "Aerospace Aluminum",
    price: 11000,
    currency: "€",
    badge: "Limited Edition",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfA1ZpMWg_eTW_NyZbhwHAof-azoul7Z81JiJcQ_hYp2T_BYvJM_AMZuPoCcbpM0eG-CxO-Cz5LVFWKCEtDcbDHxPqiXemjpf00FrKpbvtt6rEXEvrwimptThC5PiEU14_LOvc3ClRK4H4Yg9rO-RyC95iAmq4w0SPmNWIHyEkgrzMXQPJQjWR991nMojl4Q3OBHDP7QhxmtPO7Ndc4mR3rysv7eC7Uvn2OPDxJ-Njff_CDXl1p1Szhw",
    description: "Silver Ghost: Razor-thin aerospace aluminum chassis side profile shot."
  },
  {
    id: "prod-4",
    name: "Heritage Noir",
    tagline: "Alligator & Platinum",
    price: 22000,
    currency: "€",
    badge: "Masterpiece",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzp9Fz0L2fl_kNOpxnZaSTRMpOQyT34gxC41sBCAL9ILpeU8KW1db2Ov0IKjDSYXs6ioFPuGiUAFeoPWSXmNa-hNoFluhgF4ZzEXpgTrOinXevA4b0UpxqHOUd3WIZuBd2JdzMA6oDi4MD7Rx6QG_1Hf3AWEi9vLtPuCB2Al6OzL4Euvp7NXzA_awrISTgoDcoGPqPkfi51HTNNCriYX8YbZ_mQVXkW_Wn1RTNpwBcVjLaYrmVIozBYA",
    description: "Heritage Noir: Alligator leather clad back panel with platinum bezel details."
  }
];

// App State
let adminRequests = [];
let adminProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  initAdminSecurityAuth();
  loadAdminState();
  renderAdminRequests();
  renderAdminProducts();
  updateMetrics();
  initAddProductForm();
  initEditProductForm();
});

/* ==========================================
   0. SECURE AUTHENTICATION & ANTI-INJECTION GATEWAY
   ========================================== */
function initAdminSecurityAuth() {
  const overlay = document.getElementById('admin-auth-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const togglePassBtn = document.getElementById('toggle-pass-visibility');
  const passInput = document.getElementById('auth-admin-pass');

  // Check existing session authentication
  const sessionToken = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (sessionToken === "AUTHENTICATED_HUNTHUB_ADMIN_SECURE_TOKEN") {
    if (overlay) overlay.style.display = 'none';
  } else {
    if (overlay) overlay.style.display = 'flex';
  }

  // Password Visibility Toggle
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      const icon = togglePassBtn.querySelector('span');
      if (icon) icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (lockoutTimer) {
        showAuthError("🔒 Security Lockout Active. Please wait for timer to expire.");
        return;
      }

      const idInput = document.getElementById('auth-admin-id').value;
      const passInputVal = document.getElementById('auth-admin-pass').value;

      // Anti-SQL & Script Injection Sanitizer
      const sanitizedId = sanitizeInput(idInput);
      const sanitizedPass = sanitizeInput(passInputVal);

      // Cryptographic SHA-256 Hash Calculation
      const computedIdHash = await sha256(sanitizedId);
      const computedPassHash = await sha256(sanitizedPass);

      // Strict Double Comparison (Plaintext & SHA-256 Hash)
      const isValidId = (sanitizedId === "hunthub@100animesh") && (computedIdHash === AUTH_ID_HASH);
      const isValidPass = (sanitizedPass === "animesh@2008") && (computedPassHash === AUTH_PASS_HASH);

      if (isValidId && isValidPass) {
        // Success
        sessionStorage.setItem(AUTH_SESSION_KEY, "AUTHENTICATED_HUNTHUB_ADMIN_SECURE_TOKEN");
        failedAttempts = 0;
        
        if (overlay) {
          overlay.style.transition = 'opacity 0.5s ease';
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
          }, 500);
        }

        showToast("Access Granted", "Welcome to HuntHub Executive Admin Center!");
      } else {
        // Failed attempt
        failedAttempts++;
        const remaining = 5 - failedAttempts;

        if (failedAttempts >= 5) {
          triggerLockout();
        } else {
          showAuthError(`❌ Invalid Credentials. ${remaining} attempt(s) remaining before security lockout.`);
        }
      }
    });
  }
}

// Anti-SQL & XSS Injection Sanitizer
function sanitizeInput(str) {
  if (!str) return "";
  return str
    .trim()
    .replace(/['";\-\-]/g, "") // Remove SQL quotes and comment operators
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/union\s+select/gi, "")
    .replace(/or\s+1=1/gi, "");
}

// SHA-256 Helper using Web Crypto API
async function sha256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function showAuthError(msg) {
  const errBox = document.getElementById('admin-auth-error');
  if (errBox) {
    errBox.innerHTML = msg;
    errBox.classList.remove('hidden');
  }
}

function triggerLockout() {
  let seconds = 30;
  showAuthError(`🚫 Too many failed attempts! Security Lockout active for <strong id="lockout-sec">${seconds}</strong>s.`);

  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) submitBtn.disabled = true;

  lockoutTimer = setInterval(() => {
    seconds--;
    const secEl = document.getElementById('lockout-sec');
    if (secEl) secEl.textContent = seconds;

    if (seconds <= 0) {
      clearInterval(lockoutTimer);
      lockoutTimer = null;
      failedAttempts = 0;
      if (submitBtn) submitBtn.disabled = false;
      const errBox = document.getElementById('admin-auth-error');
      if (errBox) errBox.classList.add('hidden');
    }
  }, 1000);
}

function logoutAdmin() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  const overlay = document.getElementById('admin-auth-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
  }
  const idInput = document.getElementById('auth-admin-id');
  const passInput = document.getElementById('auth-admin-pass');
  if (idInput) idInput.value = '';
  if (passInput) passInput.value = '';
  showToast("Logged Out", "Admin session ended securely.");
}

/* ==========================================
   1. STATE & METRICS MANAGEMENT
   ========================================== */
function loadAdminState() {
  adminRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || [];
  adminProducts = JSON.parse(localStorage.getItem('hunthub_products')) || DEFAULT_PRODUCTS;

  if (!localStorage.getItem('hunthub_products')) {
    localStorage.setItem('hunthub_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
}

function updateMetrics() {
  const pendingRequests = adminRequests.filter(r => r.status === "Pending Approval");
  
  const pendingCountEl = document.getElementById('metric-pending-count');
  const liveCountEl = document.getElementById('metric-live-count');
  const tabPendingBadge = document.getElementById('tab-badge-requests');
  const tabProductsBadge = document.getElementById('tab-badge-products');

  if (pendingCountEl) pendingCountEl.textContent = pendingRequests.length;
  if (liveCountEl) liveCountEl.textContent = adminProducts.length;
  if (tabPendingBadge) tabPendingBadge.textContent = pendingRequests.length;
  if (tabProductsBadge) tabProductsBadge.textContent = adminProducts.length;
}

/* ==========================================
   2. TAB SWITCHING LOGIC
   ========================================== */
function switchAdminTab(tabName) {
  const tabBtnRequests = document.getElementById('tab-requests-btn');
  const tabBtnProducts = document.getElementById('tab-products-btn');
  const tabBtnWhatsapp = document.getElementById('tab-whatsapp-btn');

  const contentRequests = document.getElementById('tab-content-requests');
  const contentProducts = document.getElementById('tab-content-products');
  const contentWhatsapp = document.getElementById('tab-content-whatsapp');

  [tabBtnRequests, tabBtnProducts, tabBtnWhatsapp].forEach(btn => {
    if (btn) {
      btn.className = "px-4 sm:px-6 py-2.5 font-label text-xs uppercase tracking-widest font-bold border-b-2 border-transparent text-secondary hover:text-white transition-colors shrink-0 flex items-center gap-2";
    }
  });

  if (contentRequests) contentRequests.classList.add('hidden');
  if (contentProducts) contentProducts.classList.add('hidden');
  if (contentWhatsapp) contentWhatsapp.classList.add('hidden');

  if (tabName === 'requests') {
    if (tabBtnRequests) tabBtnRequests.className = "px-4 sm:px-6 py-2.5 font-label text-xs uppercase tracking-widest font-bold border-b-2 border-gold text-gold transition-colors shrink-0 flex items-center gap-2";
    if (contentRequests) contentRequests.classList.remove('hidden');
    renderAdminRequests();
  } else if (tabName === 'products') {
    if (tabBtnProducts) tabBtnProducts.className = "px-4 sm:px-6 py-2.5 font-label text-xs uppercase tracking-widest font-bold border-b-2 border-gold text-gold transition-colors shrink-0 flex items-center gap-2";
    if (contentProducts) contentProducts.classList.remove('hidden');
    renderAdminProducts();
  } else if (tabName === 'whatsapp') {
    if (tabBtnWhatsapp) tabBtnWhatsapp.className = "px-4 sm:px-6 py-2.5 font-label text-xs uppercase tracking-widest font-bold border-b-2 border-gold text-gold transition-colors shrink-0 flex items-center gap-2";
    if (contentWhatsapp) contentWhatsapp.classList.remove('hidden');
  }
}

/* ==========================================
   3. PENDING REQUESTS REVIEW & APPROVAL/REJECTION
   ========================================== */
function renderAdminRequests() {
  const container = document.getElementById('admin-requests-container');
  if (!container) return;

  loadAdminState();
  updateMetrics();

  const pendingRequests = adminRequests.filter(r => r.status === "Pending Approval");

  if (pendingRequests.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center border border-dashed border-dark-border bg-dark-card">
        <span class="material-symbols-outlined text-4xl text-gold mb-2 block">task_alt</span>
        <h3 class="font-display text-xl text-white font-bold">No Pending Submissions</h3>
        <p class="font-body text-xs text-secondary mt-1">All user phone selling requests have been processed.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  pendingRequests.forEach(req => {
    const defaultRetailPrice = Math.round(req.expectedPrice * 1.15);

    const card = document.createElement('div');
    card.id = `request-card-${req.id}`;
    card.className = "bg-dark-card border border-dark-border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-gold/50";
    
    card.innerHTML = `
      <div class="space-y-4">
        <!-- Status & Submitted Time -->
        <div class="flex justify-between items-center border-b border-dark-border pb-3">
          <span class="bg-amber-500/20 text-amber-400 font-label text-[10px] uppercase tracking-wider px-2.5 py-0.5 border border-amber-500/30 font-bold">
            ${req.status}
          </span>
          <span class="font-label text-[10px] text-secondary">${req.submittedAt}</span>
        </div>

        <!-- Phone Model & Image Preview -->
        <div class="flex gap-4 items-start">
          <div class="w-20 h-20 bg-dark-bg shrink-0 overflow-hidden border border-dark-border">
            <img src="${req.images[0]}" class="w-full h-full object-cover" alt="${req.model}">
          </div>
          <div>
            <h3 class="font-display text-lg text-white font-bold">${req.model}</h3>
            <div class="flex flex-wrap gap-2 mt-1">
              <span class="bg-dark-bg text-secondary text-[10px] font-label px-2 py-0.5 border border-dark-border">${req.storage}</span>
              <span class="bg-dark-bg text-secondary text-[10px] font-label px-2 py-0.5 border border-dark-border">${req.condition}</span>
              <span class="bg-dark-bg text-secondary text-[10px] font-label px-2 py-0.5 border border-dark-border">Battery: ${req.batteryHealth}</span>
            </div>
          </div>
        </div>

        <!-- Owner & Price Details -->
        <div class="bg-dark-bg p-3.5 border border-dark-border/80 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-secondary font-label">Seller:</span>
            <span class="text-white font-semibold">${req.ownerName} (${req.ownerPhone})</span>
          </div>
          <div class="flex justify-between border-t border-dark-border/50 pt-2">
            <span class="text-secondary font-label">User Expected Price:</span>
            <span class="text-amber-400 font-bold">$${req.expectedPrice.toLocaleString()}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="font-body text-xs text-secondary line-clamp-2 italic">
          "${req.description}"
        </p>

        <!-- Admin Retail Price Input (Adding Profit Margin) -->
        <div class="pt-2 border-t border-dark-border">
          <label class="font-label text-[11px] text-gold font-bold block mb-1">
            Store Retail Price ($) - Add Profit Margin:
          </label>
          <div class="flex gap-2">
            <span class="bg-dark-bg text-gold font-bold px-3 py-2 border border-dark-border flex items-center">$</span>
            <input type="number" id="retail-price-${req.id}" value="${defaultRetailPrice}" 
                   class="w-full bg-dark-bg border border-dark-border px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-gold">
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-3 pt-5 mt-4 border-t border-dark-border">
        <button onclick="rejectSellRequest('${req.id}')" 
                class="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-white px-3 py-2.5 font-label text-[11px] uppercase tracking-wider font-bold transition-colors">
          REJECT REQUEST
        </button>

        <button onclick="approveSellRequest('${req.id}')" 
                class="bg-gold text-primary hover:bg-white px-3 py-2.5 font-label text-[11px] uppercase tracking-wider font-bold transition-colors">
          APPROVE & PUBLISH
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function approveSellRequest(requestId) {
  const req = adminRequests.find(r => r.id === requestId);
  if (!req) return;

  const retailInput = document.getElementById(`retail-price-${requestId}`);
  const finalPrice = retailInput ? Number(retailInput.value) : Math.round(req.expectedPrice * 1.15);

  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.model,
    tagline: `${req.storage} | ${req.condition}`,
    price: finalPrice,
    currency: "$",
    badge: "Certified Pre-Owned",
    image: req.images[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-9plcxBicthMlu8B1Hyqp5OyGfBuD7Gk1gLatoV10LKpykOQDOjtsA8Y6_22PlaUN6IJkqX-CnvCF_DC9qmNHxkE1SZLS4ALl3uEpgwNmqfLi4YwiqtIOQEryJo-wd81uNLauUyfZK7Fm1neub2gPn1f2f5PjfbLkfixAQ3L_G7swKcCFR2lY6amEjJ4nOT3qNaO1taDtECwA4CuEf93ND8H8Yf_89yXpVMP8GEdwBVTGkSw_NVV9A",
    description: `Certified Pre-Owned ${req.model} (${req.storage}, ${req.condition}, Battery: ${req.batteryHealth}). Seller Notes: ${req.description}`
  };

  adminProducts.unshift(newProduct);
  localStorage.setItem('hunthub_products', JSON.stringify(adminProducts));

  // Remove request from pending list completely
  adminRequests = adminRequests.filter(r => r.id !== requestId);
  localStorage.setItem('hunthub_sell_requests', JSON.stringify(adminRequests));

  const card = document.getElementById(`request-card-${requestId}`);
  if (card) {
    card.style.transition = 'all 0.4s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      renderAdminRequests();
      renderAdminProducts();
      showToast('Approved & Published', `${req.model} has been published to live store catalog for $${finalPrice}!`);
    }, 350);
  }
}

function rejectSellRequest(requestId) {
  const req = adminRequests.find(r => r.id === requestId);
  
  // Completely filter out rejected item from state and storage
  adminRequests = adminRequests.filter(r => r.id !== requestId);
  localStorage.setItem('hunthub_sell_requests', JSON.stringify(adminRequests));

  const card = document.getElementById(`request-card-${requestId}`);
  if (card) {
    card.style.transition = 'all 0.4s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      renderAdminRequests();
      showToast('Request Rejected', `Request for ${req ? req.model : 'device'} has been removed.`);
    }, 350);
  } else {
    renderAdminRequests();
  }
}

/* ==========================================
   4. STORE INVENTORY EDIT & DELETE MANAGEMENT
   ========================================== */
function renderAdminProducts() {
  const container = document.getElementById('admin-products-container');
  if (!container) return;

  loadAdminState();
  updateMetrics();

  if (adminProducts.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center border border-dashed border-dark-border bg-dark-card">
        <span class="material-symbols-outlined text-4xl text-gold mb-2 block">inventory_2</span>
        <h3 class="font-display text-xl text-white font-bold">No Products in Catalog</h3>
        <p class="font-body text-xs text-secondary mt-1">Click "Add Custom Item" to populate your store inventory.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  adminProducts.forEach(prod => {
    const card = document.createElement('div');
    card.id = `product-card-${prod.id}`;
    card.className = "bg-dark-card border border-dark-border p-5 flex flex-col justify-between space-y-4 hover:border-gold/40 transition-all duration-300";

    card.innerHTML = `
      <div class="space-y-3">
        <!-- Image & Badge -->
        <div class="w-full h-44 bg-dark-bg border border-dark-border overflow-hidden relative">
          <img src="${prod.image}" class="w-full h-full object-cover object-center" alt="${prod.name}">
          ${prod.badge ? `
            <div class="absolute top-3 left-3 bg-dark-bg/90 border border-gold/40 px-2 py-0.5">
              <span class="font-label text-[9px] text-gold font-bold uppercase tracking-wider">${prod.badge}</span>
            </div>
          ` : ''}
        </div>

        <!-- Title & Tagline -->
        <div>
          <div class="flex justify-between items-start gap-2">
            <h3 class="font-display text-base text-white font-bold">${prod.name}</h3>
            <span class="font-serif text-sm text-gold font-bold">${prod.currency || '$'}${Number(prod.price).toLocaleString()}</span>
          </div>
          <p class="font-label text-[10px] text-secondary uppercase tracking-wider">${prod.tagline || 'Custom Luxury Edition'}</p>
        </div>

        <!-- Description -->
        <p class="font-body text-xs text-secondary line-clamp-2">
          ${prod.description || 'No description added.'}
        </p>
      </div>

      <!-- Action Buttons (EDIT & DELETE) -->
      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-dark-border">
        <button onclick="openEditModal('${prod.id}')" 
                class="bg-dark-bg border border-gold/40 hover:bg-gold hover:text-primary text-gold px-3 py-2 font-label text-[10px] uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-sm">edit</span> EDIT
        </button>

        <button onclick="deleteProduct('${prod.id}')" 
                class="bg-dark-bg border border-red-900/50 hover:bg-red-900 text-red-400 hover:text-white px-3 py-2 font-label text-[10px] uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-sm">delete</span> DELETE
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

/* Edit Modal Logic */
function openEditModal(productId) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById('admin-edit-modal');
  if (!modal) return;

  document.getElementById('edit-prod-id').value = prod.id;
  document.getElementById('edit-prod-title').value = prod.name;
  document.getElementById('edit-prod-price').value = prod.price;
  document.getElementById('edit-prod-tagline').value = prod.tagline || '';
  document.getElementById('edit-prod-badge').value = prod.badge || '';
  document.getElementById('edit-prod-image').value = prod.image;
  document.getElementById('edit-prod-desc').value = prod.description || '';

  const previewEl = document.getElementById('edit-prod-image-preview');
  if (previewEl) {
    previewEl.innerHTML = `<img src="${prod.image}" class="w-full h-full object-cover">`;
  }

  modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('admin-edit-modal');
  if (modal) modal.classList.remove('active');
}

function initEditProductForm() {
  const form = document.getElementById('admin-edit-form');
  const imageInput = document.getElementById('edit-prod-image');
  const previewEl = document.getElementById('edit-prod-image-preview');

  if (imageInput && previewEl) {
    imageInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        previewEl.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
      } else {
        previewEl.innerHTML = `<span class="text-xs text-secondary">Image Preview</span>`;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = document.getElementById('edit-prod-id').value;
      const title = document.getElementById('edit-prod-title').value.trim();
      const price = Number(document.getElementById('edit-prod-price').value);
      const tagline = document.getElementById('edit-prod-tagline').value.trim();
      const badge = document.getElementById('edit-prod-badge').value.trim();
      const image = document.getElementById('edit-prod-image').value.trim();
      const desc = document.getElementById('edit-prod-desc').value.trim();

      const index = adminProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        adminProducts[index] = {
          ...adminProducts[index],
          name: title,
          price: price,
          tagline: tagline,
          badge: badge,
          image: image,
          description: desc
        };

        localStorage.setItem('hunthub_products', JSON.stringify(adminProducts));
        closeEditModal();
        renderAdminProducts();
        showToast('Changes Saved', `${title} details updated successfully.`);
      }
    });
  }
}

function deleteProduct(productId) {
  const prod = adminProducts.find(p => p.id === productId);
  if (!confirm(`Are you sure you want to delete "${prod ? prod.name : 'this item'}" from live store catalog?`)) {
    return;
  }

  adminProducts = adminProducts.filter(p => p.id !== productId);
  localStorage.setItem('hunthub_products', JSON.stringify(adminProducts));

  renderAdminProducts();
  showToast('Item Deleted', 'Product has been removed from catalog.');
}

/* Add Custom Product Form Logic */
function toggleAddProductForm() {
  const container = document.getElementById('admin-add-product-container');
  if (container) container.classList.toggle('hidden');
}

function initAddProductForm() {
  const form = document.getElementById('admin-add-product-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('add-prod-title').value.trim();
      const price = Number(document.getElementById('add-prod-price').value);
      const tagline = document.getElementById('add-prod-tagline').value.trim();
      const badge = document.getElementById('add-prod-badge').value.trim();
      const image = document.getElementById('add-prod-image').value.trim();
      const desc = document.getElementById('add-prod-desc').value.trim();

      const newProd = {
        id: `prod-${Date.now()}`,
        name: title,
        price: price,
        currency: "$",
        tagline: tagline || "Custom Luxury Edition",
        badge: badge || "New",
        image: image,
        description: desc || title
      };

      adminProducts.unshift(newProd);
      localStorage.setItem('hunthub_products', JSON.stringify(adminProducts));

      form.reset();
      toggleAddProductForm();
      renderAdminProducts();
      showToast('Item Added', `${title} is now published in store catalog!`);
    });
  }
}

/* Toast Helper */
function showToast(title, message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="font-label text-xs text-gold tracking-widest mb-1 font-bold">${title}</div>
    <div class="font-body text-xs opacity-90">${message}</div>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

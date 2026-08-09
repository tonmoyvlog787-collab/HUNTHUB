/**
 * HUNTHUB - Dedicated Admin Control Center JavaScript
 * Handles: Rejection Removal, Edit Product Modal (Photos, Titles, Descriptions, Prices), Store Inventory & WhatsApp Orders
 */

const WHATSAPP_NUMBER = "917086869464";

// Default Store Products
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

// Default Pending Requests
const DEFAULT_SELL_REQUESTS = [
  {
    id: "req-101",
    model: "iPhone 15 Pro Max",
    expectedPrice: 1100,
    condition: "Mint (Flawless)",
    batteryHealth: "98%",
    storage: "512GB",
    ownerName: "Alexander Vance",
    ownerPhone: "+91 9876543210",
    description: "Barely used, original box and titanium case included. No scratches.",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDT-9plcxBicthMlu8B1Hyqp5OyGfBuD7Gk1gLatoV10LKpykOQDOjtsA8Y6_22PlaUN6IJkqX-CnvCF_DC9qmNHxkE1SZLS4ALl3uEpgwNmqfLi4YwiqtIOQEryJo-wd81uNLauUyfZK7Fm1neub2gPn1f2f5PjfbLkfixAQ3L_G7swKcCFR2lY6amEjJ4nOT3qNaO1taDtECwA4CuEf93ND8H8Yf_89yXpVMP8GEdwBVTGkSw_NVV9A"],
    status: "Pending Approval",
    submittedAt: "2026-08-09 09:30 AM"
  }
];

// Load State from LocalStorage
let storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || DEFAULT_PRODUCTS;
let sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || DEFAULT_SELL_REQUESTS;

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  renderAdminRequests();
  renderAdminProducts();
  updateMetrics();
  initAddProductForm();
  initEditModal();
});

/* ==========================================
   1. ADMIN TAB NAVIGATION
   ========================================== */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('bg-gold', 'text-primary', 'shadow-md');
        b.classList.add('bg-surface-low', 'text-white/70');
      });

      btn.classList.remove('bg-surface-low', 'text-white/70');
      btn.classList.add('bg-gold', 'text-primary', 'shadow-md');

      tabContents.forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById(`admin-tab-${targetTab}`);
      if (activeContent) activeContent.classList.remove('hidden');
    });
  });
}

/* ==========================================
   2. UPDATE METRICS COUNTERS
   ========================================== */
function updateMetrics() {
  const pendingCountEl = document.getElementById('metric-pending-count');
  const productsCountEl = document.getElementById('metric-products-count');

  sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || sellRequests;
  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;

  const pendingItems = sellRequests.filter(r => r.status === "Pending Approval");

  if (pendingCountEl) pendingCountEl.textContent = pendingItems.length;
  if (productsCountEl) productsCountEl.textContent = storeProducts.length;
}

/* ==========================================
   3. RENDER PENDING SELLING REQUESTS
   ========================================== */
function renderAdminRequests() {
  const container = document.getElementById('admin-requests-list');
  if (!container) return;

  sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || sellRequests;
  
  // Filter out any non-pending items (or items rejected) so ONLY active Pending items are rendered
  const pendingRequests = sellRequests.filter(r => r.status === "Pending Approval");

  container.innerHTML = '';

  if (pendingRequests.length === 0) {
    container.innerHTML = `
      <div class="bg-surface p-12 text-center border border-white/10 text-white/50 font-body">
        <span class="material-symbols-outlined text-4xl text-gold/40 mb-2 block">task_alt</span>
        No pending device selling requests at this time. All submissions have been processed!
      </div>
    `;
    updateMetrics();
    return;
  }

  pendingRequests.forEach((req) => {
    const card = document.createElement('div');
    card.className = "bg-surface border border-white/10 p-6 sm:p-8 flex flex-col gap-6 text-white shadow-lg transition-all duration-300";
    card.id = `req-card-${req.id}`;

    card.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div class="flex items-center gap-3">
            <h3 class="font-display text-2xl font-bold text-gold">${req.model}</h3>
            <span class="px-3 py-1 text-[11px] font-label font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              Pending Review
            </span>
          </div>
          <p class="font-label text-xs text-white/60 mt-2">Owner: <strong class="text-white">${req.ownerName}</strong> (${req.ownerPhone}) • Submitted: ${req.submittedAt}</p>
        </div>

        <div class="text-left md:text-right bg-black/40 p-3 border border-white/10">
          <span class="font-label text-[10px] text-white/50 block uppercase tracking-widest">User Expected Price</span>
          <span class="font-serif text-xl text-white font-bold">$${Number(req.expectedPrice).toLocaleString()}</span>
        </div>
      </div>

      <!-- Specs Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-label text-white/80 bg-black/60 p-4 border border-white/10">
        <div><span class="text-white/40 block">Condition:</span> <strong class="text-white">${req.condition}</strong></div>
        <div><span class="text-white/40 block">Battery Health:</span> <strong class="text-white">${req.batteryHealth}</strong></div>
        <div><span class="text-white/40 block">Storage:</span> <strong class="text-white">${req.storage}</strong></div>
        <div>
          <span class="text-white/40 block">WhatsApp Contact:</span> 
          <a href="https://wa.me/${req.ownerPhone.replace(/[^0-9]/g,'')}" target="_blank" class="text-green-400 font-bold hover:underline flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">chat</span> ${req.ownerPhone}
          </a>
        </div>
      </div>

      <p class="font-body text-sm text-white/80 italic bg-black/30 p-3 border-l-2 border-gold">"${req.description}"</p>

      <!-- Photos Preview -->
      <div>
        <span class="font-label text-[10px] text-white/50 block uppercase tracking-widest mb-2">Uploaded Device Photos:</span>
        <div class="flex items-center gap-4 overflow-x-auto py-1">
          ${req.images.map(img => `
            <a href="${img}" target="_blank" title="Click to inspect full photo">
              <img src="${img}" class="w-20 h-20 object-cover border border-white/30 hover:border-gold transition-all">
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Admin Profit & Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10 mt-2 bg-black/40 p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <label class="font-label text-xs text-gold font-bold uppercase tracking-wider">Set Store Retail Price (with Profit):</label>
          <div class="flex items-center gap-1">
            <span class="font-serif text-lg text-gold font-bold">$</span>
            <input type="number" id="profit-price-${req.id}" value="${Math.round(req.expectedPrice * 1.25)}" 
                   class="bg-black border border-gold/60 px-4 py-2 text-base text-white font-bold w-36 focus:outline-none focus:border-gold">
          </div>
        </div>

        <div class="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button onclick="approveSellRequest('${req.id}')" 
                  class="bg-gold text-primary hover:bg-white px-6 py-3 font-label text-xs uppercase font-bold tracking-widest shadow-md transition-all">
            Approve & Publish to Store
          </button>
          <button onclick="rejectSellRequest('${req.id}')" 
                  class="bg-red-950/80 hover:bg-red-800 text-white px-5 py-3 font-label text-xs uppercase font-bold tracking-widest border border-red-500/50 transition-colors">
            Reject Request
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  updateMetrics();
}

/* ==========================================
   FIX REJECTION: INSTANT REMOVAL FROM UI & STATE
   ========================================== */
function rejectSellRequest(requestId) {
  sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || sellRequests;

  // Completely filter out the rejected submission record from active sellRequests state
  sellRequests = sellRequests.filter(r => r.id !== requestId);
  localStorage.setItem('hunthub_sell_requests', JSON.stringify(sellRequests));

  // Animate card removal in UI if visible
  const card = document.getElementById(`req-card-${requestId}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      renderAdminRequests();
    }, 300);
  } else {
    renderAdminRequests();
  }

  showToast('Request Rejected', 'The selling submission has been completely removed from the review queue.');
}

// Approve User Selling Request & Sync to Public Store Catalog
function approveSellRequest(requestId) {
  sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || sellRequests;
  const req = sellRequests.find(r => r.id === requestId);
  if (!req) return;

  const profitInput = document.getElementById(`profit-price-${requestId}`);
  const finalPrice = profitInput ? Number(profitInput.value) : Math.round(req.expectedPrice * 1.25);

  // Remove from pending review queue
  sellRequests = sellRequests.filter(r => r.id !== requestId);
  localStorage.setItem('hunthub_sell_requests', JSON.stringify(sellRequests));

  // Add to Store Catalog in LocalStorage
  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;

  const newProduct = {
    id: `prod-approved-${Date.now()}`,
    name: req.model,
    tagline: `${req.condition} • ${req.storage}`,
    price: finalPrice,
    currency: "$",
    badge: "Certified Pre-Owned",
    image: req.images[0] || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-9plcxBicthMlu8B1Hyqp5OyGfBuD7Gk1gLatoV10LKpykOQDOjtsA8Y6_22PlaUN6IJkqX-CnvCF_DC9qmNHxkE1SZLS4ALl3uEpgwNmqfLi4YwiqtIOQEryJo-wd81uNLauUyfZK7Fm1neub2gPn1f2f5PjfbLkfixAQ3L_G7swKcCFR2lY6amEjJ4nOT3qNaO1taDtECwA4CuEf93ND8H8Yf_89yXpVMP8GEdwBVTGkSw_NVV9A",
    description: `${req.model} (${req.condition}, Battery Health: ${req.batteryHealth}). Owner Notes: ${req.description}`
  };

  storeProducts.unshift(newProduct);
  localStorage.setItem('hunthub_products', JSON.stringify(storeProducts));

  renderAdminRequests();
  renderAdminProducts();
  showToast('Approved & Published', `"${req.model}" approved at $${finalPrice.toLocaleString()} and published to the live store!`);
}

/* ==========================================
   4. MANAGE LIVE STORE CATALOG (EDIT & DELETE)
   ========================================== */
function renderAdminProducts() {
  const container = document.getElementById('admin-products-list');
  if (!container) return;

  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;
  container.innerHTML = '';

  storeProducts.forEach(prod => {
    const row = document.createElement('div');
    row.className = "bg-surface border border-white/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-sm hover:border-gold/40 transition-colors";
    row.innerHTML = `
      <div class="flex items-center gap-4">
        <img src="${prod.image}" class="w-16 h-16 object-cover border border-white/20 shrink-0">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-display font-semibold text-gold text-lg">${prod.name}</h4>
            <span class="px-2 py-0.5 text-[10px] font-label font-bold uppercase bg-white/10 text-white/80">${prod.badge || 'Store Item'}</span>
          </div>
          <p class="font-label text-xs text-white/60 mt-1">${prod.tagline || ''}</p>
          <p class="font-body text-xs text-white/50 line-clamp-1 max-w-xl">${prod.description || ''}</p>
        </div>
      </div>

      <div class="flex items-center gap-4 self-end sm:self-center">
        <span class="font-serif text-xl text-white font-bold">${prod.currency || '$'}${Number(prod.price).toLocaleString()}</span>
        
        <!-- EDIT BUTTON -->
        <button onclick="openEditModal('${prod.id}')" 
                class="bg-gold/20 hover:bg-gold text-gold hover:text-primary px-3.5 py-1.5 font-label text-xs font-bold uppercase tracking-wider border border-gold/40 transition-all flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">edit</span> EDIT
        </button>

        <!-- DELETE BUTTON -->
        <button onclick="deleteProduct('${prod.id}')" 
                class="bg-red-950/60 hover:bg-red-700 text-red-300 hover:text-white px-3.5 py-1.5 font-label text-xs font-bold uppercase tracking-wider border border-red-500/40 transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">delete</span> DELETE
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  updateMetrics();
}

/* ==========================================
   EDIT PRODUCT MODAL LOGIC
   ========================================== */
function initEditModal() {
  const modal = document.getElementById('admin-edit-modal');
  const closeBtn = document.getElementById('close-edit-modal');
  const cancelBtn = document.getElementById('cancel-edit-modal');
  const form = document.getElementById('admin-edit-product-form');
  const imageInput = document.getElementById('edit-prod-image');
  const previewImg = document.getElementById('edit-preview-img');

  if (closeBtn) closeBtn.onclick = closeEditModal;
  if (cancelBtn) cancelBtn.onclick = closeEditModal;

  if (imageInput && previewImg) {
    imageInput.addEventListener('input', () => {
      previewImg.src = imageInput.value;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-prod-id').value;
      const name = document.getElementById('edit-prod-name').value.trim();
      const price = Number(document.getElementById('edit-prod-price').value);
      const tagline = document.getElementById('edit-prod-tagline').value.trim();
      const badge = document.getElementById('edit-prod-badge').value;
      const image = document.getElementById('edit-prod-image').value.trim();
      const desc = document.getElementById('edit-prod-desc').value.trim();

      storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;

      const prodIndex = storeProducts.findIndex(p => p.id === id);
      if (prodIndex !== -1) {
        storeProducts[prodIndex] = {
          ...storeProducts[prodIndex],
          name: name,
          price: price,
          tagline: tagline,
          badge: badge,
          image: image,
          description: desc
        };

        localStorage.setItem('hunthub_products', JSON.stringify(storeProducts));
        renderAdminProducts();
        closeEditModal();
        showToast('Changes Saved', `"${name}" product details and price updated successfully!`);
      }
    });
  }
}

function openEditModal(productId) {
  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;
  const prod = storeProducts.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('edit-prod-id').value = prod.id;
  document.getElementById('edit-prod-name').value = prod.name;
  document.getElementById('edit-prod-price').value = prod.price;
  document.getElementById('edit-prod-tagline').value = prod.tagline || '';
  document.getElementById('edit-prod-badge').value = prod.badge || 'Exclusive';
  document.getElementById('edit-prod-image').value = prod.image || '';
  document.getElementById('edit-prod-desc').value = prod.description || '';

  const previewImg = document.getElementById('edit-preview-img');
  if (previewImg) previewImg.src = prod.image || '';

  const modal = document.getElementById('admin-edit-modal');
  if (modal) modal.classList.add('active');
}

function closeEditModal() {
  const modal = document.getElementById('admin-edit-modal');
  if (modal) modal.classList.remove('active');
}

function deleteProduct(productId) {
  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;
  const prod = storeProducts.find(p => p.id === productId);
  const name = prod ? prod.name : 'Item';

  storeProducts = storeProducts.filter(p => p.id !== productId);
  localStorage.setItem('hunthub_products', JSON.stringify(storeProducts));
  renderAdminProducts();
  showToast('Item Deleted', `"${name}" removed from store catalog.`);
}

function initAddProductForm() {
  const addProdForm = document.getElementById('admin-add-product-form');
  if (!addProdForm) return;

  addProdForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('admin-prod-name').value.trim();
    const price = document.getElementById('admin-prod-price').value.trim();
    const tagline = document.getElementById('admin-prod-tagline').value.trim();
    const badge = document.getElementById('admin-prod-badge').value;
    const imageUrl = document.getElementById('admin-prod-image').value.trim();
    const desc = document.getElementById('admin-prod-desc').value.trim();

    if (!name || !price) {
      showToast('Missing Info', 'Please enter Name and Retail Price.');
      return;
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      name: name,
      tagline: tagline || "Exclusive Edition",
      price: Number(price),
      currency: "$",
      badge: badge || "Exclusive",
      image: imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-9plcxBicthMlu8B1Hyqp5OyGfBuD7Gk1gLatoV10LKpykOQDOjtsA8Y6_22PlaUN6IJkqX-CnvCF_DC9qmNHxkE1SZLS4ALl3uEpgwNmqfLi4YwiqtIOQEryJo-wd81uNLauUyfZK7Fm1neub2gPn1f2f5PjfbLkfixAQ3L_G7swKcCFR2lY6amEjJ4nOT3qNaO1taDtECwA4CuEf93ND8H8Yf_89yXpVMP8GEdwBVTGkSw_NVV9A",
      description: desc || name
    };

    storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || storeProducts;
    storeProducts.unshift(newProd);
    localStorage.setItem('hunthub_products', JSON.stringify(storeProducts));
    
    renderAdminProducts();
    addProdForm.reset();
    showToast('Product Added', `"${name}" is now live on the public website!`);
  });
}

/* ==========================================
   5. TOAST NOTIFICATION HELPER
   ========================================== */
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
    <div class="font-body text-sm opacity-90">${message}</div>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

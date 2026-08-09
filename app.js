/**
 * HUNTHUB ft. Animesh - Digital Craftsmanship Interactive Application
 * Features: Header Branding ("HUNTHUB ft. Animesh"), Rupee Currency Formatting (₹),
 * Systematic Price Sorting (Lower price at top, higher price below),
 * Mobile Smartphone Camera Image Compression, Instant Real-Time Section Sync from Admin Control Panel, Auto Photo Changer Gallery.
 */

const WHATSAPP_NUMBER = "917086869464";

// Initial Catalog Store Items: Empty by default (Demo items removed)
const DEFAULT_PRODUCTS = [];

// App State
let storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || DEFAULT_PRODUCTS;
let sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || [];
let activeCategory = "all";

document.addEventListener('DOMContentLoaded', () => {
  cleanupDemoProducts();

  initLoadingScreen();
  loadSiteImages();
  renderStoreProducts();
  initScrollAnimations();
  initIconRippleEffects();
  initNavigationTracker();
  initCartAndSelections();
  initAutoPhotoGallery();
  initMobileMenu();
  initSellDeviceForm();

  // Instant real-time update when Admin Panel makes changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'hunthub_site_images') loadSiteImages();
    if (e.key === 'hunthub_products') {
      storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || [];
      renderStoreProducts();
    }
  });

  // Rapid 400ms interval polling for instant single-browser window sync
  setInterval(() => {
    const latestProds = JSON.parse(localStorage.getItem('hunthub_products')) || [];
    if (JSON.stringify(latestProds) !== JSON.stringify(storeProducts)) {
      storeProducts = latestProds;
      renderStoreProducts();
    }
  }, 400);
});

/* Mobile Image Compression Utility */
function compressAndResizeImage(file, maxDimension = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/* Purge legacy demo items if present */
function cleanupDemoProducts() {
  let stored = JSON.parse(localStorage.getItem('hunthub_products'));
  if (Array.isArray(stored) && stored.length > 0) {
    const demoIds = ["prod-1", "prod-2", "prod-3", "prod-4", "prod-5"];
    const demoNames = ["Obsidian Apex", "Aura Rose", "Silver Ghost", "Heritage Noir", "Lite Prestige"];
    
    const cleaned = stored.filter(p => !demoIds.includes(p.id) && !demoNames.includes(p.name));
    if (cleaned.length !== stored.length) {
      try {
        localStorage.setItem('hunthub_products', JSON.stringify(cleaned));
        storeProducts = cleaned;
      } catch (e) {
        console.error("Storage error cleanup:", e);
      }
    }
  }
}

/* Helper to normalize category strings for foolproof matching */
function normalizeCategoryString(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // Strips emojis, spaces, hyphens
}

/* ==========================================
   0. STARTING LOADING INTRO SCREEN
   ========================================== */
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (!loadingScreen) return;

  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.remove();
    }, 1000);
  }, 3200);
}

/* Load Global Site Custom Media from localStorage */
function loadSiteImages() {
  const siteImages = JSON.parse(localStorage.getItem('hunthub_site_images'));
  if (!siteImages) return;

  if (siteImages.logoUrl) {
    const logoContainer = document.getElementById('site-logo-img-container');
    if (logoContainer) {
      logoContainer.innerHTML = `<img src="${siteImages.logoUrl}" class="w-6 h-6 object-contain inline-block mr-1">`;
    }
  }

  if (siteImages.heroBgUrl) {
    const heroBg = document.getElementById('site-hero-bg-container');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${siteImages.heroBgUrl}')`;
      heroBg.style.opacity = '0.35';
    }
  }

  if (siteImages.sovereignImgUrl) {
    const sovereignImg = document.getElementById('site-sovereign-img');
    if (sovereignImg) sovereignImg.src = siteImages.sovereignImgUrl;
  }

  if (siteImages.heritageImgUrl) {
    const heritageImg = document.getElementById('site-heritage-img');
    if (heritageImg) heritageImg.src = siteImages.heritageImgUrl;
  }

  if (siteImages.opticsImgUrl) {
    const opticsImg = document.getElementById('site-optics-img');
    if (opticsImg) opticsImg.src = siteImages.opticsImgUrl;
  }

  if (siteImages.aegisImgUrl) {
    const aegisImg = document.getElementById('site-aegis-img');
    if (aegisImg) aegisImg.src = siteImages.aegisImgUrl;
  }
}

/* ==========================================
   1. RENDER CATALOG, INSTANT SECTION SYNC & PRICE SORTING
   ========================================== */
function renderStoreProducts() {
  const container = document.getElementById('products-grid-container');
  if (!container) return;

  storeProducts = JSON.parse(localStorage.getItem('hunthub_products')) || [];
  
  let filteredList = [...storeProducts];

  // 1. Apply Section Category Filter
  if (activeCategory !== "all") {
    const targetNorm = normalizeCategoryString(activeCategory);
    filteredList = filteredList.filter(p => {
      const bNorm = normalizeCategoryString(p.badge);
      const cNorm = normalizeCategoryString(p.category);
      return bNorm === targetNorm || cNorm === targetNorm;
    });
  }

  // 2. Systematic Price Sorting: Lower price at top, higher price below
  filteredList.sort((a, b) => Number(a.price) - Number(b.price));

  container.innerHTML = '';

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-10 sm:p-14 text-center border border-dashed border-primary/20 bg-surface-low">
        <span class="material-symbols-outlined text-4xl text-accent mb-2 block">inventory_2</span>
        <h3 class="font-display text-xl text-primary font-bold">No Items in ${activeCategory === 'all' ? 'Store' : '"' + activeCategory + '"'} Section</h3>
        <p class="font-body text-xs text-secondary mt-1">
          ${storeProducts.length === 0 ? 'No items uploaded yet. Upload phones from the Admin Panel to populate this section.' : 'No phones found matching the selected section tag.'}
        </p>
        <button onclick="applyCategoryFilter('all');" class="mt-4 px-5 py-2 text-xs font-label uppercase font-bold text-gold border border-gold hover:bg-gold hover:text-primary transition-colors">
          Show All Masterpieces
        </button>
      </div>
    `;
    return;
  }

  filteredList.forEach((prod, index) => {
    const isEven = index % 2 !== 0;
    const article = document.createElement('article');
    article.className = `group flex flex-col gap-4 sm:gap-5 scroll-reveal ${isEven ? 'md:mt-10' : ''}`;
    
    const displayBadge = prod.badge || prod.category || "Recent uploaded";
    const badgeNorm = normalizeCategoryString(displayBadge);

    let badgeClass = "border border-primary/20 bg-surface/80 text-primary";
    if (badgeNorm.includes("expensive")) badgeClass = "badge-tag-expensive";
    else if (badgeNorm.includes("recent")) badgeClass = "badge-tag-recent";
    else if (badgeNorm.includes("premium")) badgeClass = "badge-tag-premium";
    else if (badgeNorm.includes("mid")) badgeClass = "badge-tag-midrange";
    else if (badgeNorm.includes("low")) badgeClass = "badge-tag-lowrange";
    else if (badgeNorm.includes("urgent")) badgeClass = "badge-tag-urgentsale";

    article.innerHTML = `
      <div class="w-full aspect-[4/5] bg-surface-low overflow-hidden relative border border-accent/15 photo-clickable shadow-sm">
        <img class="w-full h-full object-cover object-center" 
             data-alt="${prod.description || prod.name}"
             src="${prod.image}"
             alt="${prod.name}"/>
        <div class="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
          <span class="badge-tag ${badgeClass}">${displayBadge}</span>
        </div>
        ${prod.brand ? `
          <div class="absolute top-3 sm:top-4 right-3 sm:right-4 bg-primary/90 text-gold font-label text-[10px] font-bold px-2.5 py-0.5 border border-gold/30 uppercase tracking-wider">
            ${prod.brand}
          </div>
        ` : ''}
      </div>
      <div class="flex flex-col gap-1.5 sm:gap-2 text-center items-center">
        <h3 class="font-display text-xl sm:text-2xl text-primary font-semibold">${prod.name}</h3>
        <p class="font-label text-[10px] sm:text-xs text-secondary tracking-widest uppercase">${prod.tagline || 'Custom Luxury Edition'} ${prod.ram ? `| ${prod.ram} RAM` : ''}</p>
        <p class="font-serif text-lg sm:text-xl text-accent font-bold">₹${Number(prod.price).toLocaleString('en-IN')}</p>
        
        <div class="flex items-center gap-3 mt-2">
          <button onclick="buyProductViaWhatsApp('${prod.name}', '₹${Number(prod.price).toLocaleString('en-IN')}')" 
                  class="btn-whatsapp px-5 py-2 font-label text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 btn-classic">
            <span class="material-symbols-outlined text-sm">chat</span> Buy via WhatsApp
          </button>
          <button onclick="openGalleryModal(${index})" 
                  class="font-label text-[11px] text-primary hover:text-accent transition-colors flex items-center gap-1 border-b border-primary/20 hover:border-accent pb-0.5">
            <span class="material-symbols-outlined text-sm">photo_library</span> Photos
          </button>
        </div>
      </div>
    `;
    container.appendChild(article);
  });

  if (typeof initAutoPhotoGallery === 'function') {
    initAutoPhotoGallery();
  }
}

function applyCategoryFilter(categoryName) {
  activeCategory = categoryName;

  document.querySelectorAll('#category-filter-tabs button').forEach(btn => {
    if (btn.getAttribute('data-category') === categoryName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderStoreProducts();
  
  if (categoryName !== 'all') {
    showToast('Section Active', `Displaying "${categoryName}" section (Sorted low to high price).`);
  }
}

/* ==========================================
   2. WHATSAPP PURCHASING REDIRECT (+91 7086869464)
   ========================================== */
function buyProductViaWhatsApp(productName, price, customNotes = "") {
  const message = `Hello HuntHub Concierge! 👋\n\nI am interested in purchasing:\n📌 Item: ${productName}\n💰 Price: ${price}\n${customNotes ? `📝 Notes: ${customNotes}\n` : ''}\nPlease guide me through the checkout & courier delivery process.`;
  
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
  
  showToast('Connecting to WhatsApp', `Redirecting to HuntHub Concierge (${WHATSAPP_NUMBER})...`);
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 800);
}

function buyCartViaWhatsApp() {
  const qtyDisplay = document.getElementById('qty-display');
  const totalDisplay = document.getElementById('total-display');
  const qty = qtyDisplay ? qtyDisplay.textContent : '1';
  const total = totalDisplay ? totalDisplay.textContent : '₹3,40,000.00';

  if (qty === '0') {
    showToast('Empty Selection', 'Please select at least 1 item before purchasing.');
    return;
  }

  const message = `Hello HuntHub Concierge! 🛒\n\nI want to complete my selection purchase:\n\n📱 Item: HuntHub Series X – Obsidian Edition\n🔢 Quantity: ${qty}\n💰 Total Amount: ${total}\n💎 Customization: 1TB SSD | 16GB RAM | 24k Gold Accents | Engraving: "J.H."\n\nPlease confirm availability and payment details.`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;

  showToast('WhatsApp Checkout', 'Opening official WhatsApp Concierge channel...');
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 800);
}

/* ==========================================
   3. USER PHONE SELLING FORM (Mobile Compressed Images)
   ========================================== */
let uploadedImageUrls = [];

function initSellDeviceForm() {
  const sellForm = document.getElementById('sell-device-form');
  const imageInput = document.getElementById('sell-images');
  const previewContainer = document.getElementById('sell-images-preview');

  if (imageInput && previewContainer) {
    imageInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      previewContainer.innerHTML = '';
      uploadedImageUrls = [];

      if (files.length === 0) {
        previewContainer.innerHTML = `<span class="text-xs text-secondary italic">Selected photos will preview here.</span>`;
        return;
      }

      for (const file of files) {
        try {
          const imgUrl = await compressAndResizeImage(file, 800, 0.75);
          uploadedImageUrls.push(imgUrl);

          const imgThumb = document.createElement('div');
          imgThumb.className = 'w-16 h-16 relative border border-accent/30 overflow-hidden shrink-0';
          imgThumb.innerHTML = `<img src="${imgUrl}" class="w-full h-full object-cover">`;
          previewContainer.appendChild(imgThumb);
        } catch (err) {
          console.error("Sell image compression error:", err);
        }
      }
    });
  }

  if (sellForm) {
    sellForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const brand = document.getElementById('sell-brand') ? document.getElementById('sell-brand').value.trim() : 'Generic';
      const model = document.getElementById('sell-model').value.trim();
      const expectedPrice = document.getElementById('sell-price').value.trim();
      const condition = document.getElementById('sell-condition').value;
      const batteryHealth = document.getElementById('sell-battery').value.trim();
      const storage = document.getElementById('sell-storage').value;
      const ownerName = document.getElementById('sell-name').value.trim();
      const ownerPhone = document.getElementById('sell-phone').value.trim();
      const description = document.getElementById('sell-desc').value.trim();

      if (!model || !expectedPrice || !ownerPhone) {
        showToast('Incomplete Form', 'Please enter Brand, Model Name, Expected Price, and Contact Phone Number.');
        return;
      }

      const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDT-9plcxBicthMlu8B1Hyqp5OyGfBuD7Gk1gLatoV10LKpykOQDOjtsA8Y6_22PlaUN6IJkqX-CnvCF_DC9qmNHxkE1SZLS4ALl3uEpgwNmqfLi4YwiqtIOQEryJo-wd81uNLauUyfZK7Fm1neub2gPn1f2f5PjfbLkfixAQ3L_G7swKcCFR2lY6amEjJ4nOT3qNaO1taDtECwA4CuEf93ND8H8Yf_89yXpVMP8GEdwBVTGkSw_NVV9A"
      ];

      const newRequest = {
        id: `req-${Date.now()}`,
        brand: brand || "Generic",
        model: `${brand ? brand + ' ' : ''}${model}`,
        expectedPrice: Number(expectedPrice),
        condition: condition,
        batteryHealth: batteryHealth ? `${batteryHealth}%` : "Not specified",
        storage: storage,
        ownerName: ownerName || "Anonymous Owner",
        ownerPhone: ownerPhone,
        description: description || "No additional notes provided.",
        images: finalImages,
        status: "Pending Approval",
        submittedAt: new Date().toLocaleString()
      };

      sellRequests = JSON.parse(localStorage.getItem('hunthub_sell_requests')) || [];
      sellRequests.unshift(newRequest);
      try {
        localStorage.setItem('hunthub_sell_requests', JSON.stringify(sellRequests));
      } catch (err) {
        console.error("Storage error on sell submit:", err);
      }

      sellForm.reset();
      if (previewContainer) {
        previewContainer.innerHTML = `<span class="text-xs text-secondary italic">Selected photos will preview here.</span>`;
      }
      uploadedImageUrls = [];

      showToast('Submission Successful', 'Your device request has been submitted to the Admin Panel for review!');
    });
  }
}

/* ==========================================
   4. SELECTIONS / CART DYNAMIC CALCULATIONS & CLEAR ALL
   ========================================== */
let cartState = {
  itemPrice: 340000,
  quantity: 1
};

function initCartAndSelections() {
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  const qtyDisplay = document.getElementById('qty-display');
  const subtotalDisplay = document.getElementById('subtotal-display');
  const totalDisplay = document.getElementById('total-display');
  const cartBadge = document.getElementById('cart-badge');
  const removeBtn = document.getElementById('remove-cart-item');
  const clearAllBtn = document.getElementById('clear-all-cart-btn');
  const cartArticle = document.getElementById('cart-item-article');
  const checkoutBtn = document.getElementById('checkout-btn');

  function updatePrices() {
    const totalAmount = cartState.itemPrice * cartState.quantity;
    const formattedTotal = `₹${totalAmount.toLocaleString('en-IN')}.00`;

    if (qtyDisplay) qtyDisplay.textContent = cartState.quantity;
    if (subtotalDisplay) subtotalDisplay.textContent = formattedTotal;
    if (totalDisplay) totalDisplay.textContent = formattedTotal;
    if (cartBadge) cartBadge.textContent = cartState.quantity;
  }

  function clearCartUI() {
    cartState.quantity = 0;
    if (qtyDisplay) qtyDisplay.textContent = '0';
    if (subtotalDisplay) subtotalDisplay.textContent = '₹0.00';
    if (totalDisplay) totalDisplay.textContent = '₹0.00';
    if (cartBadge) cartBadge.textContent = '0';

    if (cartArticle) {
      cartArticle.style.transition = 'all 0.5s ease';
      cartArticle.style.opacity = '0';
      cartArticle.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        cartArticle.innerHTML = `
          <div class="p-12 text-center border border-dashed border-primary/20 w-full">
            <span class="material-symbols-outlined text-4xl text-accent mb-2 block">remove_shopping_cart</span>
            <p class="font-serif text-xl text-primary font-bold">Your Selection is currently empty.</p>
            <p class="font-body text-xs text-secondary mt-1">Explore our Masterpieces catalog to add luxury devices.</p>
            <a href="#collections" class="inline-block mt-4 text-xs font-label text-gold border-b border-gold pb-1 hover:text-charcoal transition-colors uppercase tracking-widest font-bold">Explore Collections</a>
          </div>
        `;
        cartArticle.style.opacity = '1';
        cartArticle.style.transform = 'translateY(0)';
      }, 400);
    }
  }

  if (qtyMinusBtn) {
    qtyMinusBtn.addEventListener('click', () => {
      if (cartState.quantity > 1) {
        cartState.quantity--;
        updatePrices();
        showToast('Selection Updated', `Quantity reduced to ${cartState.quantity}`);
      }
    });
  }

  if (qtyPlusBtn) {
    qtyPlusBtn.addEventListener('click', () => {
      cartState.quantity++;
      updatePrices();
      showToast('Selection Updated', `Quantity increased to ${cartState.quantity}`);
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      clearCartUI();
      showToast('Item Removed', 'The item has been removed from your selection.');
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      clearCartUI();
      showToast('Selections Cleared', 'All saved items have been cleared from your cart.');
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      buyCartViaWhatsApp();
    });
  }
}

/* ==========================================
   5. AUTO PHOTO CHANGER & LIGHTBOX GALLERY MODAL
   ========================================== */
let galleryPhotos = [];
let currentPhotoIndex = 0;
let isAutoPlaying = true;
let autoPlayTimer = null;
let progressInterval = null;
const AUTO_PLAY_DELAY = 3500;

function initAutoPhotoGallery() {
  const imagesOnPage = document.querySelectorAll('img[data-alt], .photo-clickable img, article img');
  const photoMap = new Map();

  imagesOnPage.forEach((img) => {
    const src = img.src;
    if (src && !photoMap.has(src)) {
      const altText = img.getAttribute('data-alt') || img.alt || 'HuntHub Digital Craftsmanship Masterpiece';
      const parentContainer = img.closest('article, section, div');
      let title = 'HuntHub Masterpiece';
      if (parentContainer) {
        const heading = parentContainer.querySelector('h1, h2, h3, h4, h5');
        if (heading) title = heading.textContent.trim();
      }

      photoMap.set(src, {
        src: src,
        title: title,
        description: altText,
        index: photoMap.size
      });

      const clickableParent = img.closest('.photo-clickable') || img.parentElement;
      if (clickableParent) {
        clickableParent.classList.add('photo-clickable');
        clickableParent.setAttribute('title', 'Click to open Auto Photo Changer');
        clickableParent.onclick = (e) => {
          e.preventDefault();
          const targetIndex = photoMap.get(src).index;
          openGalleryModal(targetIndex);
        };
      }
    }
  });

  galleryPhotos = Array.from(photoMap.values());

  const modal = document.getElementById('gallery-modal');
  const closeBtn = document.getElementById('gallery-close');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const playPauseBtn = document.getElementById('gallery-playpause');
  const thumbnailsContainer = document.getElementById('gallery-thumbnails');

  if (!modal) return;

  if (thumbnailsContainer) {
    thumbnailsContainer.innerHTML = '';
    galleryPhotos.forEach((photo, idx) => {
      const thumb = document.createElement('button');
      thumb.className = `w-16 h-16 shrink-0 border-2 transition-all duration-300 overflow-hidden ${idx === 0 ? 'border-gold opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`;
      thumb.innerHTML = `<img src="${photo.src}" class="w-full h-full object-cover" alt="Thumbnail ${idx + 1}">`;
      thumb.addEventListener('click', () => {
        showPhotoAtIndex(idx);
        restartAutoPlay();
      });
      thumbnailsContainer.appendChild(thumb);
    });
  }

  if (closeBtn) closeBtn.onclick = closeGalleryModal;
  if (prevBtn) prevBtn.onclick = () => { showPrevPhoto(); restartAutoPlay(); };
  if (nextBtn) nextBtn.onclick = () => { showNextPhoto(); restartAutoPlay(); };
  if (playPauseBtn) playPauseBtn.onclick = toggleAutoPlay;

  document.onkeydown = (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeGalleryModal();
    if (e.key === 'ArrowLeft') { showPrevPhoto(); restartAutoPlay(); }
    if (e.key === 'ArrowRight') { showNextPhoto(); restartAutoPlay(); }
    if (e.key === ' ') { e.preventDefault(); toggleAutoPlay(); }
  };
}

function openGalleryModal(index = 0) {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  showPhotoAtIndex(index);
  isAutoPlaying = true;
  startAutoPlay();
}

function closeGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
  stopAutoPlay();
}

function showPhotoAtIndex(index) {
  if (galleryPhotos.length === 0) return;

  currentPhotoIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[currentPhotoIndex];

  const mainImg = document.getElementById('gallery-main-img');
  const titleEl = document.getElementById('gallery-title');
  const descEl = document.getElementById('gallery-desc');
  const counterEl = document.getElementById('gallery-counter');
  const thumbs = document.querySelectorAll('#gallery-thumbnails button');

  if (mainImg) {
    mainImg.style.opacity = '0';
    mainImg.style.transform = 'scale(0.96)';
    setTimeout(() => {
      mainImg.src = photo.src;
      mainImg.alt = photo.title;
      mainImg.style.opacity = '1';
      mainImg.style.transform = 'scale(1)';
    }, 200);
  }

  if (titleEl) titleEl.textContent = photo.title;
  if (descEl) descEl.textContent = photo.description;
  if (counterEl) counterEl.textContent = `PHOTO ${currentPhotoIndex + 1} OF ${galleryPhotos.length}`;

  thumbs.forEach((thumb, idx) => {
    if (idx === currentPhotoIndex) {
      thumb.className = 'w-16 h-16 shrink-0 border-2 border-gold opacity-100 scale-105 transition-all duration-300 overflow-hidden shadow-lg';
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      thumb.className = 'w-16 h-16 shrink-0 border-2 border-transparent opacity-50 hover:opacity-100 transition-all duration-300 overflow-hidden';
    }
  });
}

function showNextPhoto() {
  showPhotoAtIndex(currentPhotoIndex + 1);
}

function showPrevPhoto() {
  showPhotoAtIndex(currentPhotoIndex - 1);
}

function startAutoPlay() {
  stopAutoPlay();
  const playIcon = document.getElementById('gallery-play-icon');
  if (playIcon) playIcon.textContent = 'pause';

  let startTime = Date.now();
  const fillBar = document.getElementById('gallery-progress-fill');

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progressPercent = Math.min((elapsed / AUTO_PLAY_DELAY) * 100, 100);
    if (fillBar) fillBar.style.width = `${progressPercent}%`;

    if (elapsed >= AUTO_PLAY_DELAY) {
      startTime = Date.now();
      showNextPhoto();
    }
  }, 30);
}

function stopAutoPlay() {
  if (progressInterval) clearInterval(progressInterval);
  if (autoPlayTimer) clearTimeout(autoPlayTimer);
  progressInterval = null;
  autoPlayTimer = null;

  const fillBar = document.getElementById('gallery-progress-fill');
  const playIcon = document.getElementById('gallery-play-icon');

  if (fillBar) fillBar.style.width = '0%';
  if (playIcon) playIcon.textContent = 'play_arrow';
}

function toggleAutoPlay() {
  isAutoPlaying = !isAutoPlaying;
  if (isAutoPlaying) {
    startAutoPlay();
    showToast('Auto Change Enabled', 'Photos are auto-changing.');
  } else {
    stopAutoPlay();
    showToast('Auto Change Paused', 'Slideshow is paused.');
  }
}

function restartAutoPlay() {
  if (isAutoPlaying) {
    startAutoPlay();
  }
}

/* ==========================================
   6. SCROLL ANIMATIONS & INTERSECTION OBSERVER
   ========================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-zoom');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

/* ==========================================
   7. CLASSIC ICON & BUTTON CLICK ANIMATIONS
   ========================================== */
function initIconRippleEffects() {
  const clickables = document.querySelectorAll('.icon-btn, .btn-classic, .btn-gold-shimmer, [data-interactive="true"], button');

  clickables.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      const existingRipple = this.querySelector('.ripple-effect');
      if (existingRipple) {
        existingRipple.remove();
      }

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/* ==========================================
   8. NAVIGATION TRACKER
   ========================================== */
function initNavigationTracker() {
  const sections = document.querySelectorAll('section[id], main[id], header[id]');
  const navLinks = document.querySelectorAll('nav .nav-link');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active', 'border-b', 'border-primary');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================
   9. MOBILE MENU OVERLAY
   ========================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav-overlay');
  const closeMenuBtn = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('#mobile-nav-overlay a');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      mobileNav.classList.remove('hidden');
      mobileNav.classList.add('flex');
    });

    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
        mobileNav.classList.remove('flex');
      });
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
        mobileNav.classList.remove('flex');
      });
    });
  }
}

/* ==========================================
   10. TOAST NOTIFICATION HELPER
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
    <div class="font-body text-xs opacity-90">${message}</div>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

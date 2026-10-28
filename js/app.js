/**
 * ============================================================
 * APEX MOTO — Main Application Logic
 * ============================================================
 * Handles all interactivity: filtering, search, modals,
 * financing calculator, form handling, and animations.
 * ============================================================
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  const state = {
    filters: {
      brand: 'Todas',
      type: 'Todos',
      maxPrice: 50000,
      maxCC: 1500
    },
    cart: [],
    currentUser: null,
    currentModal: null,
    currentGalleryIndex: 0,
    searchOpen: false,
    mobileMenuOpen: false
  };

  // ── Backend API Configuration (PHP & MySQL) ────────────────
  const API_BASE = (function () {
    const pathname = window.location.pathname;
    if (pathname.includes('/TiendaDeMotos/')) {
      return '/TiendaDeMotos/api';
    }
    return './api';
  })();

  // ── Dynamic Motorcycle Inventory ───────────────────────────
  let currentMotorcycles = loadMotorcycles();

  function loadMotorcycles() {
    try {
      const stored = localStorage.getItem('apex_motorcycles');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fetchMotorcyclesFromDB();
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading motorcycles from localStorage:', e);
    }
    const initial = typeof MOTORCYCLES !== 'undefined' ? JSON.parse(JSON.stringify(MOTORCYCLES)) : [];
    saveMotorcycles(initial);
    fetchMotorcyclesFromDB();
    return initial;
  }

  async function fetchMotorcyclesFromDB() {
    try {
      const res = await fetch(`${API_BASE}/motorcycles.php`);
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        currentMotorcycles = json.data;
        saveMotorcycles(currentMotorcycles);
        renderCatalog();
        const badgeMotos = document.getElementById('badge-motos-count');
        if (badgeMotos) badgeMotos.textContent = currentMotorcycles.length;
        if (document.getElementById('admin-modal')?.classList.contains('active')) {
          renderAdminDashboard();
        }
      }
    } catch (e) {
      console.info('Operando en modo híbrido/local:', e.message);
    }
  }

  function saveMotorcycles(list) {
    try {
      localStorage.setItem('apex_motorcycles', JSON.stringify(list));
      const badgeMotos = document.getElementById('badge-motos-count');
      if (badgeMotos) badgeMotos.textContent = list.length;
    } catch (e) {
      console.warn('Error saving motorcycles to localStorage:', e);
    }
  }

  // ── DOM Ready ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initHeader();
    initHero();
    renderCatalog();
    initFilters();
    initSearch();
    initFinancingCalculator();
    initWorkshopForm();
    initContactForm();
    initTestimonials();
    initPartners();
    initScrollAnimations();
    initMobileMenu();
    initCart();
  });

  // ══════════════════════════════════════════════════════════
  //  HEADER
  // ══════════════════════════════════════════════════════════
  function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = scrollY;
    });

    // Cart counter
    updateCartCount();
  }

  function updateCartCount() {
    const counter = document.getElementById('cart-count');
    if (counter) {
      counter.textContent = state.cart.length;
      counter.style.display = state.cart.length > 0 ? 'flex' : 'none';
    }
  }

  // ══════════════════════════════════════════════════════════
  //  HERO
  // ══════════════════════════════════════════════════════════
  function initHero() {
    const featured = currentMotorcycles.find(m => m.featured) || currentMotorcycles[0];
    if (!featured) return;
    const heroImage = document.getElementById('hero-image');
    const heroSpecHP = document.getElementById('hero-spec-hp');
    const heroSpecCC = document.getElementById('hero-spec-cc');
    const heroSpecWeight = document.getElementById('hero-spec-weight');

    if (heroImage) heroImage.src = featured.image;
    if (heroImage) heroImage.alt = `${featured.brand} ${featured.model}`;
    if (heroSpecHP) heroSpecHP.textContent = `${featured.hp} HP`;
    if (heroSpecCC) heroSpecCC.textContent = `${featured.cc} cc`;
    if (heroSpecWeight) heroSpecWeight.textContent = `${featured.weight} kg`;
  }

  // ══════════════════════════════════════════════════════════
  //  CATALOG — Render & Filter
  // ══════════════════════════════════════════════════════════
  function renderCatalog() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const filtered = filterMotorcycles();

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🏍️</div>
          <h3>No se encontraron resultados</h3>
          <p>Intenta ajustar los filtros para ver más modelos.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map((moto, index) => `
      <article class="product-card reveal reveal-delay-${(index % 4) + 1}" data-id="${moto.id}">
        <div class="product-card-image">
          <img src="${moto.image}" alt="${moto.brand} ${moto.model}" loading="lazy">
          <div class="product-card-badges">
            <span class="badge ${moto.condition === 'Nuevo' ? 'badge-new' : 'badge-used'}">
              ${moto.condition}
            </span>
            ${moto.featured ? '<span class="badge badge-featured">★ Destacado</span>' : ''}
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-brand">${moto.brand}</div>
          <h3 class="product-card-model">${moto.model}</h3>
          <div class="product-card-specs">
            <div class="product-spec">
              <div class="value">${moto.cc}</div>
              <div class="label">CC</div>
            </div>
            <div class="product-spec">
              <div class="value">${moto.hp}</div>
              <div class="label">HP</div>
            </div>
            <div class="product-spec">
              <div class="value">${moto.year}</div>
              <div class="label">Año</div>
            </div>
          </div>
          <div class="product-card-footer">
            <div class="product-price">
              <span class="currency">USD </span>${formatPrice(moto.price)}
            </div>
            <div class="product-card-actions">
              <button class="btn btn-sm btn-outline" onclick="window.ApexMoto.openModal(${moto.id})" aria-label="Ver detalles de ${moto.model}">
                Detalles
              </button>
              <button class="btn btn-sm btn-primary" onclick="window.ApexMoto.addToCart(${moto.id})" aria-label="Añadir ${moto.model} al carrito">
                🛒 Añadir
              </button>
            </div>
          </div>
        </div>
      </article>
    `).join('');

    // Re-trigger scroll animations for new elements
    observeRevealElements();
  }

  function filterMotorcycles() {
    return currentMotorcycles.filter(moto => {
      const brandMatch = state.filters.brand === 'Todas' || moto.brand === state.filters.brand;
      const typeMatch = state.filters.type === 'Todos' || moto.type === state.filters.type;
      const priceMatch = moto.price <= state.filters.maxPrice;
      const ccMatch = moto.cc <= state.filters.maxCC;
      return brandMatch && typeMatch && priceMatch && ccMatch;
    });
  }

  // ══════════════════════════════════════════════════════════
  //  FILTERS
  // ══════════════════════════════════════════════════════════
  function initFilters() {
    // Brand chips
    document.querySelectorAll('[data-filter-brand]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-brand]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filters.brand = chip.dataset.filterBrand;
        renderCatalog();
      });
    });

    // Type chips
    document.querySelectorAll('[data-filter-type]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-filter-type]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.filters.type = chip.dataset.filterType;
        renderCatalog();
      });
    });

    // Price range
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    if (priceRange) {
      priceRange.addEventListener('input', (e) => {
        state.filters.maxPrice = parseInt(e.target.value);
        if (priceValue) priceValue.textContent = `$${formatPrice(state.filters.maxPrice)}`;
        renderCatalog();
      });
    }

    // CC range
    const ccRange = document.getElementById('cc-range');
    const ccValue = document.getElementById('cc-value');
    if (ccRange) {
      ccRange.addEventListener('input', (e) => {
        state.filters.maxCC = parseInt(e.target.value);
        if (ccValue) ccValue.textContent = `${state.filters.maxCC} cc`;
        renderCatalog();
      });
    }

    // Reset filters
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.filters = { brand: 'Todas', type: 'Todos', maxPrice: 50000, maxCC: 1500 };
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-filter-brand="Todas"]')?.classList.add('active');
        document.querySelector('[data-filter-type="Todos"]')?.classList.add('active');
        if (priceRange) priceRange.value = 50000;
        if (priceValue) priceValue.textContent = '$50,000';
        if (ccRange) ccRange.value = 1500;
        if (ccValue) ccValue.textContent = '1500 cc';
        renderCatalog();
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  SEARCH
  // ══════════════════════════════════════════════════════════
  function initSearch() {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const toggleBtn = document.getElementById('search-toggle');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => toggleSearch(true));
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) toggleSearch(false);
      });
    }

    if (input) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          results.innerHTML = '';
          results.style.display = 'none';
          return;
        }
        const matches = currentMotorcycles.filter(m =>
          m.model.toLowerCase().includes(query) ||
          m.brand.toLowerCase().includes(query) ||
          m.type.toLowerCase().includes(query)
        );
        if (matches.length > 0) {
          results.style.display = 'block';
          results.innerHTML = matches.map(m => `
            <div class="search-result-item" onclick="window.ApexMoto.openModal(${m.id}); window.ApexMoto.toggleSearch(false);">
              <img src="${m.image}" alt="${m.model}">
              <div class="search-result-info">
                <h4>${m.brand} ${m.model}</h4>
                <p>${m.type} · ${m.cc}cc · USD ${formatPrice(m.price)}</p>
              </div>
            </div>
          `).join('');
        } else {
          results.style.display = 'block';
          results.innerHTML = '<div class="search-result-item"><p style="color:var(--text-muted)">Sin resultados para "' + e.target.value + '"</p></div>';
        }
      });
    }

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleSearch(false);
        closeModal();
      }
    });
  }

  function toggleSearch(open) {
    const overlay = document.getElementById('search-overlay');
    const input = document.getElementById('search-input');
    state.searchOpen = open;
    if (overlay) overlay.classList.toggle('active', open);
    if (open && input) {
      setTimeout(() => input.focus(), 100);
    }
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // ══════════════════════════════════════════════════════════
  //  MODAL — Detail View
  // ══════════════════════════════════════════════════════════
  function openModal(motoId) {
    const moto = currentMotorcycles.find(m => m.id === motoId);
    if (!moto) return;

    state.currentModal = moto;
    state.currentGalleryIndex = 0;

    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('detail-modal');

    // Populate modal content
    const gallery = document.getElementById('modal-gallery-img');
    const dots = document.getElementById('modal-gallery-dots');
    const brand = document.getElementById('modal-brand');
    const model = document.getElementById('modal-model');
    const price = document.getElementById('modal-price');
    const desc = document.getElementById('modal-description');
    const specs = document.getElementById('modal-specs');
    const financing = document.getElementById('modal-financing-options');
    const badges = document.getElementById('modal-badges');

    if (gallery) gallery.src = moto.gallery[0];
    if (gallery) gallery.alt = `${moto.brand} ${moto.model}`;

    if (dots) {
      dots.innerHTML = moto.gallery.map((_, i) =>
        `<button class="gallery-dot ${i === 0 ? 'active' : ''}" onclick="window.ApexMoto.changeGallery(${i})" aria-label="Imagen ${i + 1}"></button>`
      ).join('');
    }

    if (brand) brand.textContent = moto.brand;
    if (model) model.textContent = moto.model;
    if (price) price.innerHTML = `<div class="amount">$${formatPrice(moto.price)}</div><div class="label">USD · ${moto.condition}</div>`;

    if (badges) {
      badges.innerHTML = `
        <span class="badge ${moto.condition === 'Nuevo' ? 'badge-new' : 'badge-used'}">${moto.condition}</span>
        <span class="badge badge-featured">${moto.year}</span>
      `;
    }

    if (desc) desc.textContent = moto.description;

    if (specs) {
      specs.innerHTML = `
        <tr><td>Motor</td><td>${moto.cc} cc ${moto.type === 'Deportiva' ? 'Inline-4' : moto.type === 'Custom' ? 'V-Twin' : 'Multi-cilíndrico'}</td></tr>
        <tr><td>Potencia</td><td>${moto.hp} HP</td></tr>
        <tr><td>Torque</td><td>${moto.torque}</td></tr>
        <tr><td>Peso</td><td>${moto.weight} kg</td></tr>
        <tr><td>Depósito</td><td>${moto.tank} litros</td></tr>
        <tr><td>Frenos</td><td>${moto.brakes}</td></tr>
        <tr><td>Color</td><td>${moto.color}</td></tr>
      `;
    }

    // Quick financing options
    if (financing) {
      const months = [12, 24, 36];
      financing.innerHTML = months.map(m => {
        const monthly = calculateMonthly(moto.price, 20, m);
        return `
          <div class="financing-option">
            <div class="months">${m} meses</div>
            <div class="amount">$${formatPrice(monthly)}</div>
          </div>
        `;
      }).join('');
    }

    // Show modal
    backdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('detail-modal');
    if (backdrop) backdrop.classList.remove('active');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    state.currentModal = null;
  }

  function changeGallery(index) {
    if (!state.currentModal) return;
    state.currentGalleryIndex = index;
    const img = document.getElementById('modal-gallery-img');
    if (img) {
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = state.currentModal.gallery[index];
        img.style.opacity = '1';
      }, 200);
    }
    document.querySelectorAll('.gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // ══════════════════════════════════════════════════════════
  //  FINANCING CALCULATOR
  // ══════════════════════════════════════════════════════════
  function initFinancingCalculator() {
    const priceInput = document.getElementById('fin-price');
    const downInput = document.getElementById('fin-down');
    const termSelect = document.getElementById('fin-term');
    const calcBtn = document.getElementById('fin-calculate');

    if (calcBtn) {
      calcBtn.addEventListener('click', updateFinancingResult);
    }

    // Also update on input changes
    [priceInput, downInput, termSelect].forEach(el => {
      if (el) el.addEventListener('input', updateFinancingResult);
    });

    // Initial calculation
    updateFinancingResult();
  }

  function updateFinancingResult() {
    const price = parseFloat(document.getElementById('fin-price')?.value) || 15000;
    const downPercent = parseFloat(document.getElementById('fin-down')?.value) || 20;
    const term = parseInt(document.getElementById('fin-term')?.value) || 24;

    const downPayment = price * (downPercent / 100);
    const financed = price - downPayment;
    const monthly = calculateMonthly(price, downPercent, term);
    const totalPaid = monthly * term + downPayment;
    const totalInterest = totalPaid - price;

    const resultAmount = document.getElementById('result-amount');
    const resultPeriod = document.getElementById('result-period');
    const resultDown = document.getElementById('result-down');
    const resultFinanced = document.getElementById('result-financed');
    const resultTotal = document.getElementById('result-total');
    const resultInterest = document.getElementById('result-interest');

    if (resultAmount) resultAmount.textContent = `$${formatPrice(monthly)}`;
    if (resultPeriod) resultPeriod.textContent = `por mes durante ${term} meses`;
    if (resultDown) resultDown.textContent = `$${formatPrice(downPayment)}`;
    if (resultFinanced) resultFinanced.textContent = `$${formatPrice(financed)}`;
    if (resultTotal) resultTotal.textContent = `$${formatPrice(totalPaid)}`;
    if (resultInterest) resultInterest.textContent = `$${formatPrice(totalInterest)}`;
  }

  function calculateMonthly(price, downPercent, months) {
    const rate = 0.089 / 12; // 8.9% annual interest rate
    const downPayment = price * (downPercent / 100);
    const principal = price - downPayment;
    if (principal <= 0) return 0;
    const monthly = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(monthly);
  }

  // ══════════════════════════════════════════════════════════
  //  SHOPPING CART & CHECKOUT
  // ══════════════════════════════════════════════════════════
  let selectedPaymentMethod = 'card';

  function initCart() {
    // Restore cart from localStorage if present
    try {
      const savedCart = localStorage.getItem('apex_cart');
      if (savedCart) {
        state.cart = JSON.parse(savedCart);
      }
    } catch (e) {
      console.warn('Could not load cart from localStorage:', e);
      state.cart = [];
    }

    // Attach click to header cart button
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        openCart();
      });
    }

    // Card input formatters (Stripe UX formatting)
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
      cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = val;
      });
    }

    const expInput = document.getElementById('card-exp');
    if (expInput) {
      expInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
          val = val.substring(0, 2) + '/' + val.substring(2);
        }
        e.target.value = val;
      });
    }

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeCheckout();
      }
    });

    renderCart();
  }

  function saveCart() {
    try {
      localStorage.setItem('apex_cart', JSON.stringify(state.cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }

  function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      renderCart();
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function getCartTotals() {
    const totalItems = state.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    return { totalItems, subtotal, grandTotal: subtotal };
  }

  function renderCart() {
    const drawerBody = document.getElementById('cart-drawer-body');
    const drawerFooter = document.getElementById('cart-drawer-footer');
    const drawerCount = document.getElementById('drawer-item-count');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    const { totalItems, subtotal, grandTotal } = getCartTotals();

    // Update counters
    updateCartCount();
    if (drawerCount) drawerCount.textContent = totalItems;
    if (subtotalEl) subtotalEl.textContent = `$${formatPrice(subtotal)} USD`;
    if (totalEl) totalEl.textContent = `$${formatPrice(grandTotal)} USD`;

    if (!drawerBody) return;

    if (state.cart.length === 0) {
      drawerBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🏍️</div>
          <h3>Tu garaje está vacío</h3>
          <p>Explora nuestro catálogo exclusivo y agrega la motocicleta de tus sueños.</p>
          <button class="btn btn-primary btn-sm" onclick="ApexMoto.closeCart(); window.location.hash = '#catalogo';" style="margin-top: 12px;">
            Explorar Catálogo
          </button>
        </div>
      `;
      if (drawerFooter) drawerFooter.style.display = 'none';
      return;
    }

    if (drawerFooter) drawerFooter.style.display = 'block';

    drawerBody.innerHTML = state.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.brand} ${item.model}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-brand">${item.brand}</div>
          <div class="cart-item-model">${item.model}</div>
          <div class="cart-item-meta">
            <span>${item.cc} cc</span>
            <span>•</span>
            <span>${item.hp} HP</span>
            <span>•</span>
            <span>${item.year}</span>
          </div>
          <div class="cart-qty">
            <button onclick="ApexMoto.updateCartQty(${item.id}, -1)" aria-label="Disminuir cantidad">−</button>
            <span class="qty-value">${item.qty || 1}</span>
            <button onclick="ApexMoto.updateCartQty(${item.id}, 1)" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <button class="cart-item-remove" onclick="ApexMoto.removeFromCart(${item.id})" aria-label="Eliminar ${item.model} del carrito">
            🗑️
          </button>
          <div class="cart-item-price">
            $${formatPrice(item.price * (item.qty || 1))}
          </div>
        </div>
      </div>
    `).join('');
  }

  function addToCart(motoId, shouldOpenDrawer = true) {
    const moto = currentMotorcycles.find(m => m.id === motoId);
    if (!moto) return;

    const existingIndex = state.cart.findIndex(item => item.id === motoId);
    if (existingIndex > -1) {
      state.cart[existingIndex].qty = (state.cart[existingIndex].qty || 1) + 1;
      showToast(`Se añadió otra unidad de ${moto.brand} ${moto.model}`);
    } else {
      state.cart.push({
        id: moto.id,
        brand: moto.brand,
        model: moto.model,
        price: moto.price,
        image: moto.image,
        cc: moto.cc,
        hp: moto.hp,
        year: moto.year,
        qty: 1
      });
      showToast(`¡${moto.brand} ${moto.model} añadida a tu carrito!`);
    }

    saveCart();
    renderCart();

    if (shouldOpenDrawer) {
      openCart();
    }
  }

  function addToCartFromModal() {
    if (state.currentModal) {
      addToCart(state.currentModal.id, true);
      closeModal();
    }
  }

  function removeFromCart(motoId) {
    const item = state.cart.find(m => m.id === motoId);
    state.cart = state.cart.filter(m => m.id !== motoId);
    saveCart();
    renderCart();
    if (item) {
      showToast(`${item.brand} ${item.model} eliminada del carrito`, 'info');
    }
  }

  function updateCartQty(motoId, delta) {
    const item = state.cart.find(m => m.id === motoId);
    if (!item) return;

    const newQty = (item.qty || 1) + delta;
    if (newQty <= 0) {
      removeFromCart(motoId);
    } else {
      item.qty = newQty;
      saveCart();
      renderCart();
    }
  }

  function clearCart() {
    if (state.cart.length === 0) return;
    state.cart = [];
    saveCart();
    renderCart();
    showToast('El carrito ha sido vaciado', 'info');
  }

  // Backward compatibility alias
  function addToQuote(motoId) {
    addToCart(motoId, true);
  }

  function requestQuoteFromModal() {
    addToCartFromModal();
  }

  async function requestTestDrive() {
    if (state.currentModal) {
      const moto = state.currentModal;
      try {
        await fetch(`${API_BASE}/test_drives.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: state.currentUser ? state.currentUser.name : 'Cliente Interesado',
            customer_email: state.currentUser ? state.currentUser.email : '',
            bike_model: moto.model,
            bike_brand: moto.brand
          })
        });
      } catch (err) {
        console.warn('API test drive log:', err);
      }
      showToast(`🏁 Solicitud de prueba de manejo para ${moto.brand} ${moto.model} guardada en la base de datos.`);
      closeModal();
    }
  }

  // ══════════════════════════════════════════════════════════
  //  CHECKOUT MODAL & PAYMENT GATEWAY SIMULATION
  // ══════════════════════════════════════════════════════════
  function openCheckout() {
    if (state.cart.length === 0) {
      showToast('Tu carrito está vacío. Agrega una motocicleta para continuar.', 'info');
      return;
    }

    closeCart();

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    const activeStep = document.getElementById('checkout-active-step');
    const successScreen = document.getElementById('checkout-success-screen');
    const summaryItems = document.getElementById('checkout-summary-items');
    const grandTotalEl = document.getElementById('checkout-grand-total-amount');

    // Reset view to Form (step 1 & 2)
    if (activeStep) activeStep.style.display = 'block';
    if (successScreen) successScreen.style.display = 'none';

    // Reset steps badge
    const step1 = document.getElementById('step-badge-1');
    const step2 = document.getElementById('step-badge-2');
    const step3 = document.getElementById('step-badge-3');
    if (step1) { step1.className = 'checkout-step active'; }
    if (step2) { step2.className = 'checkout-step'; }
    if (step3) { step3.className = 'checkout-step'; }

    // Render items summary
    const { grandTotal } = getCartTotals();
    if (summaryItems) {
      summaryItems.innerHTML = state.cart.map(item => `
        <div class="checkout-item">
          <span class="name">${item.brand} ${item.model} (×${item.qty || 1})</span>
          <span class="price">$${formatPrice(item.price * (item.qty || 1))} USD</span>
        </div>
      `).join('');
    }

    if (grandTotalEl) {
      grandTotalEl.textContent = `$${formatPrice(grandTotal)} USD`;
    }

    selectPaymentMethod('card');

    if (checkoutModal && checkoutBackdrop) {
      checkoutModal.classList.add('active');
      checkoutBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    if (checkoutModal && checkoutBackdrop) {
      checkoutModal.classList.remove('active');
      checkoutBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Toggle active styles on methods
    ['card', 'paypal', 'deposit'].forEach(m => {
      const el = document.getElementById(`method-${m}`);
      if (el) {
        if (m === method) el.classList.add('selected');
        else el.classList.remove('selected');
      }
    });

    // Toggle field visibility
    const cardFields = document.getElementById('card-payment-fields');
    const paypalFields = document.getElementById('paypal-payment-fields');
    const depositFields = document.getElementById('deposit-payment-fields');
    const submitBtn = document.getElementById('btn-submit-order');
    const { grandTotal } = getCartTotals();

    if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
    if (paypalFields) paypalFields.style.display = method === 'paypal' ? 'block' : 'none';
    if (depositFields) depositFields.style.display = method === 'deposit' ? 'block' : 'none';

    // Required attributes toggle for card inputs
    const cardNum = document.getElementById('card-number');
    const cardExp = document.getElementById('card-exp');
    const cardCvc = document.getElementById('card-cvc');
    const isCard = method === 'card';
    if (cardNum) cardNum.required = isCard;
    if (cardExp) cardExp.required = isCard;
    if (cardCvc) cardCvc.required = isCard;

    // Update CTA text
    if (submitBtn) {
      if (method === 'card') {
        submitBtn.innerHTML = `🔒 Pagar $${formatPrice(grandTotal)} USD con Stripe`;
      } else if (method === 'paypal') {
        submitBtn.innerHTML = `🅿️ Continuar con PayPal Express`;
      } else if (method === 'deposit') {
        submitBtn.innerHTML = `🏦 Confirmar Reserva con Seña ($1,000 USD)`;
      }
    }
  }

  async function processPayment(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-submit-order');
    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    const name = document.getElementById('checkout-name')?.value.trim();
    const email = document.getElementById('checkout-email')?.value.trim();
    const phone = document.getElementById('checkout-phone')?.value.trim();
    const delivery = document.getElementById('checkout-delivery')?.value || 'pickup';
    const { grandTotal } = getCartTotals();

    let finalOrderId = `APX-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: finalOrderId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          delivery_mode: delivery,
          payment_method: selectedPaymentMethod,
          items: state.cart.map(item => ({
            id: item.id,
            brand: item.brand,
            model: item.model,
            price: item.price,
            qty: item.qty || 1
          })),
          total_amount: grandTotal
        })
      });
      const data = await res.json();
      if (data && data.success && data.order_code) {
        finalOrderId = data.order_code;
      }
    } catch (err) {
      console.warn('Fallback a modo offline para orden:', err);
    }

    if (submitBtn) {
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }

    // Actualizar ID en pantalla de éxito
    const orderIdEl = document.getElementById('success-order-id');
    if (orderIdEl) {
      orderIdEl.textContent = finalOrderId;
    }

    // Actualizar indicador de pasos
    const step1 = document.getElementById('step-badge-1');
    const step2 = document.getElementById('step-badge-2');
    const step3 = document.getElementById('step-badge-3');
    if (step1) step1.className = 'checkout-step completed';
    if (step2) step2.className = 'checkout-step completed';
    if (step3) step3.className = 'checkout-step active completed';

    // Cambiar vista
    const activeStep = document.getElementById('checkout-active-step');
    const successScreen = document.getElementById('checkout-success-screen');
    if (activeStep) activeStep.style.display = 'none';
    if (successScreen) successScreen.style.display = 'block';

    // Vaciar carrito
    state.cart = [];
    saveCart();
    renderCart();

    showToast(`🎉 ¡Pago confirmado y orden ${finalOrderId} registrada en MySQL!`);
  }

  function printReceipt() {
    window.print();
  }

  // ══════════════════════════════════════════════════════════
  //  WORKSHOP FORM (Guardado en MySQL)
  // ══════════════════════════════════════════════════════════
  function initWorkshopForm() {
    const form = document.getElementById('workshop-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('ws-name')?.value.trim();
        const phone = document.getElementById('ws-phone')?.value.trim();
        const bike = document.getElementById('ws-bike')?.value.trim();
        const service = document.getElementById('ws-service')?.value;
        const notes = document.getElementById('ws-notes')?.value.trim();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Guardando cita...';
        }

        try {
          const res = await fetch(`${API_BASE}/workshop.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, bike, service, notes })
          });
          const result = await res.json();
          if (result && result.success) {
            showToast(`📅 ¡Cita para tu ${bike} agendada y guardada en MySQL!`);
            form.reset();
          } else {
            showToast(result.error || 'Error al agendar cita', 'info');
          }
        } catch (err) {
          showToast('¡Cita agendada exitosamente!');
          form.reset();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '✅ Agendar Cita';
          }
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  CONTACT FORM (Guardado en MySQL)
  // ══════════════════════════════════════════════════════════
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('ct-name')?.value.trim();
        const email = document.getElementById('ct-email')?.value.trim();
        const subject = document.getElementById('ct-subject')?.value;
        const message = document.getElementById('ct-message')?.value.trim();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Enviando...';
        }

        try {
          const res = await fetch(`${API_BASE}/contact.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
          });
          const result = await res.json();
          if (result && result.success) {
            showToast(`✉️ ¡Mensaje de ${name} guardado en la base de datos!`);
            form.reset();
          } else {
            showToast(result.error || 'Error al enviar mensaje', 'info');
          }
        } catch (err) {
          showToast('¡Mensaje enviado correctamente!');
          form.reset();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '🚀 Enviar Mensaje';
          }
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  TESTIMONIALS
  // ══════════════════════════════════════════════════════════
  function initTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    grid.innerHTML = TESTIMONIALS.map((t, i) => `
      <div class="testimonial-card reveal reveal-delay-${(i % 4) + 1}">
        <div class="testimonial-stars">
          ${'★'.repeat(t.rating).split('').map(() => '<span class="star">★</span>').join('')}
          ${'★'.repeat(5 - t.rating).split('').map(() => '<span class="star empty">★</span>').join('')}
        </div>
        <p class="testimonial-text">"${t.text}"</p>
        <div class="testimonial-author">
          <div class="author-avatar">${t.avatar}</div>
          <div class="author-info">
            <h4>${t.name}</h4>
            <p>${t.bike} · ${t.date}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  //  PARTNERS
  // ══════════════════════════════════════════════════════════
  function initPartners() {
    const container = document.getElementById('partners-grid');
    if (!container) return;

    container.innerHTML = PARTNER_BRANDS.map(b => `
      <div class="partner-item">
        <span class="partner-logo">${b.logo}</span>
        <span class="partner-name">${b.name}</span>
      </div>
    `).join('');
  }

  // ══════════════════════════════════════════════════════════
  //  MOBILE MENU
  // ══════════════════════════════════════════════════════════
  function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav-menu');

    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        state.mobileMenuOpen = !state.mobileMenuOpen;
        toggle.classList.toggle('active', state.mobileMenuOpen);
        nav.classList.toggle('active', state.mobileMenuOpen);
        document.body.style.overflow = state.mobileMenuOpen ? 'hidden' : '';
      });

      // Close on link click
      nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          state.mobileMenuOpen = false;
          toggle.classList.remove('active');
          nav.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // ══════════════════════════════════════════════════════════
  //  SCROLL ANIMATIONS (Intersection Observer)
  // ══════════════════════════════════════════════════════════
  let revealObserver;

  function initScrollAnimations() {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    observeRevealElements();
  }

  function observeRevealElements() {
    document.querySelectorAll('.reveal:not(.animate)').forEach(el => {
      if (revealObserver) revealObserver.observe(el);
    });
  }

  // ══════════════════════════════════════════════════════════
  //  TOAST NOTIFICATIONS
  // ══════════════════════════════════════════════════════════
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ══════════════════════════════════════════════════════════
  //  UTILITIES
  // ══════════════════════════════════════════════════════════
  function formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
        const top = target.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });

  // ══════════════════════════════════════════════════════════
  //  AUTHENTICATION & USER MANAGEMENT
  // ══════════════════════════════════════════════════════════
  const DEFAULT_USERS = [
    {
      id: 1,
      name: 'Admin Apex',
      email: 'admin@apexmoto.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'cliente@apexmoto.com',
      password: 'cliente123',
      role: 'user'
    }
  ];

  function loadUsers() {
    try {
      const stored = localStorage.getItem('apex_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading users from storage:', e);
    }
    localStorage.setItem('apex_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('apex_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Error saving users:', e);
    }
  }

  function initAuth() {
    // Load active session if any
    try {
      const session = localStorage.getItem('apex_current_user');
      if (session) {
        state.currentUser = JSON.parse(session);
      }
    } catch (e) {
      state.currentUser = null;
    }

    updateAuthUI();

    // Close user dropdown when clicking outside
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('user-menu-wrapper');
      const dropdown = document.getElementById('user-dropdown');
      if (wrapper && dropdown && !wrapper.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const authBtnText = document.getElementById('auth-btn-text');
    const authBtnIcon = document.getElementById('auth-btn-icon');
    const dropdown = document.getElementById('user-dropdown');
    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownRole = document.getElementById('dropdown-user-role');
    const adminMenuOption = document.getElementById('admin-menu-option');
    const adminNavLink = document.getElementById('admin-nav-link');

    if (!authBtn) return;

    if (state.currentUser) {
      const isAdmin = state.currentUser.role === 'admin';
      authBtn.classList.add('logged-in');
      authBtn.classList.toggle('is-admin', isAdmin);
      if (authBtnIcon) authBtnIcon.textContent = isAdmin ? '👑' : '👤';
      if (authBtnText) authBtnText.textContent = state.currentUser.name.split(' ')[0];

      if (dropdownName) dropdownName.textContent = state.currentUser.name;
      if (dropdownRole) {
        dropdownRole.textContent = isAdmin ? 'Administrador' : 'Cliente';
        dropdownRole.className = `user-role-badge ${isAdmin ? 'admin-role' : ''}`;
      }

      if (adminMenuOption) adminMenuOption.style.display = isAdmin ? 'block' : 'none';
      if (adminNavLink) adminNavLink.style.display = isAdmin ? 'inline-block' : 'none';
    } else {
      authBtn.classList.remove('logged-in', 'is-admin');
      if (authBtnIcon) authBtnIcon.textContent = '👤';
      if (authBtnText) authBtnText.textContent = 'Ingresar';

      if (dropdown) dropdown.classList.remove('active');
      if (adminMenuOption) adminMenuOption.style.display = 'none';
      if (adminNavLink) adminNavLink.style.display = 'none';
    }
  }

  function handleAuthBtnClick() {
    if (state.currentUser) {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown) dropdown.classList.toggle('active');
    } else {
      openAuthModal();
    }
  }

  function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    const backdrop = document.getElementById('auth-backdrop');
    if (modal && backdrop) {
      modal.classList.add('active');
      backdrop.classList.add('active');
      switchAuthTab('login');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    const backdrop = document.getElementById('auth-backdrop');
    if (modal && backdrop) {
      modal.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function switchAuthTab(tab) {
    const loginTabBtn = document.getElementById('tab-btn-login');
    const regTabBtn = document.getElementById('tab-btn-register');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (tab === 'login') {
      if (loginTabBtn) loginTabBtn.classList.add('active');
      if (regTabBtn) regTabBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (regForm) regForm.style.display = 'none';
    } else {
      if (regTabBtn) regTabBtn.classList.add('active');
      if (loginTabBtn) loginTabBtn.classList.remove('active');
      if (loginForm) loginForm.style.display = 'none';
      if (regForm) regForm.style.display = 'block';
    }
  }

  function fillDemoLogin(role) {
    switchAuthTab('login');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    if (role === 'admin') {
      if (emailInput) emailInput.value = 'admin@apexmoto.com';
      if (passInput) passInput.value = 'admin123';
      showToast('Credenciales de Administrador cargadas');
    } else {
      if (emailInput) emailInput.value = 'cliente@apexmoto.com';
      if (passInput) passInput.value = 'cliente123';
      showToast('Credenciales de Cliente cargadas');
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const pass = document.getElementById('login-password')?.value;

    const users = loadUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (foundUser) {
      state.currentUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };
      localStorage.setItem('apex_current_user', JSON.stringify(state.currentUser));
      updateAuthUI();
      closeAuthModal();

      if (foundUser.role === 'admin') {
        showToast(`👑 ¡Bienvenido, ${foundUser.name}! Acceso concedido al Panel CRUD de Motos.`);
      } else {
        showToast(`🏍️ ¡Bienvenido de nuevo, ${foundUser.name}!`);
      }
    } else {
      showToast('Correo o contraseña incorrectos. Usa los botones demo.', 'info');
    }
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    const role = document.getElementById('register-role')?.value || 'user';

    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('Ese correo ya está registrado. Por favor inicia sesión.', 'info');
      switchAuthTab('login');
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    saveUsers(users);

    // Auto login
    state.currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };
    localStorage.setItem('apex_current_user', JSON.stringify(state.currentUser));
    updateAuthUI();
    closeAuthModal();

    showToast(`🎉 ¡Cuenta creada con éxito! Bienvenido, ${newUser.name}.`);
  }

  function logout() {
    state.currentUser = null;
    localStorage.removeItem('apex_current_user');
    updateAuthUI();
    closeAdminPanel();
    closeMotoFormModal();
    showToast('Has cerrado sesión correctamente.', 'info');
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN DASHBOARD & MOTORCYCLE CRUD
  // ══════════════════════════════════════════════════════════
  function openAdminPanel() {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      showToast('🔒 Acceso denegado: Se requiere rol de Administrador. Inicia sesión con la cuenta Admin.', 'info');
      openAuthModal();
      fillDemoLogin('admin');
      return;
    }

    // Close user dropdown
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.remove('active');

    const modal = document.getElementById('admin-modal');
    const backdrop = document.getElementById('admin-backdrop');

    renderAdminDashboard();

    if (modal && backdrop) {
      modal.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAdminPanel() {
    const modal = document.getElementById('admin-modal');
    const backdrop = document.getElementById('admin-backdrop');
    if (modal && backdrop) {
      modal.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function renderAdminDashboard() {
    // Update stats
    const totalMotos = currentMotorcycles.length;
    const uniqueBrands = new Set(currentMotorcycles.map(m => m.brand)).size;
    const totalInventoryValue = currentMotorcycles.reduce((acc, m) => acc + (m.price || 0), 0);

    const statTotal = document.getElementById('admin-stat-total');
    const statBrands = document.getElementById('admin-stat-brands');
    const statValue = document.getElementById('admin-stat-value');

    if (statTotal) statTotal.textContent = totalMotos;
    if (statBrands) statBrands.textContent = uniqueBrands;
    if (statValue) statValue.textContent = `$${formatPrice(totalInventoryValue)} USD`;

    renderAdminTable();
  }

  function renderAdminTable(filterQuery = '') {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    let items = currentMotorcycles;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      items = items.filter(m =>
        m.model.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No se encontraron motocicletas coincidentes.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(moto => `
      <tr>
        <td>
          <div class="admin-moto-cell">
            <img src="${moto.image}" alt="${moto.model}" class="admin-moto-thumb" onerror="this.src='https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80'">
            <div>
              <div class="admin-moto-brand">${moto.brand}</div>
              <div class="admin-moto-title">${moto.model}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-new" style="background: rgba(255,255,255,0.06); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
            ${moto.type}
          </span>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-size: 0.8rem;">
            ${moto.cc} cc · ${moto.hp} HP · ${moto.year}
          </span>
        </td>
        <td class="admin-price-cell">
          $${formatPrice(moto.price)}
        </td>
        <td>
          <span class="badge ${moto.condition === 'Nuevo' ? 'badge-new' : 'badge-used'}">
            ${moto.condition}
          </span>
          ${moto.featured ? '<span class="badge badge-featured" style="margin-left: 4px;">★ Destacada</span>' : ''}
        </td>
        <td>
          <div class="admin-action-btns" style="justify-content: flex-end;">
            <button class="btn-icon-action edit" onclick="ApexMoto.openEditMotoModal(${moto.id})" title="Editar ${moto.model}">
              ✏️
            </button>
            <button class="btn-icon-action delete" onclick="ApexMoto.deleteMotorcycle(${moto.id})" title="Eliminar ${moto.model}">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function filterAdminTable() {
    const q = document.getElementById('admin-table-search')?.value || '';
    renderAdminTable(q);
  }

  function openAddMotoModal() {
    const form = document.getElementById('moto-crud-form');
    if (form) form.reset();

    const titleEl = document.getElementById('moto-form-title');
    const editIdInput = document.getElementById('moto-edit-id');
    const imageInput = document.getElementById('moto-image');
    const imagePreview = document.getElementById('moto-image-preview');

    if (titleEl) titleEl.innerHTML = '➕ Agregar Nueva Motocicleta';
    if (editIdInput) editIdInput.value = '';

    const defaultImg = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80';
    if (imageInput) imageInput.value = defaultImg;
    if (imagePreview) imagePreview.src = defaultImg;

    const modal = document.getElementById('moto-form-modal');
    const backdrop = document.getElementById('moto-form-backdrop');
    if (modal && backdrop) {
      modal.classList.add('active');
      backdrop.classList.add('active');
    }
  }

  function openEditMotoModal(motoId) {
    const moto = currentMotorcycles.find(m => m.id === motoId);
    if (!moto) return;

    const titleEl = document.getElementById('moto-form-title');
    const editIdInput = document.getElementById('moto-edit-id');

    if (titleEl) titleEl.innerHTML = `✏️ Editar: ${moto.brand} ${moto.model}`;
    if (editIdInput) editIdInput.value = moto.id;

    // Set fields
    document.getElementById('moto-brand').value = moto.brand;
    document.getElementById('moto-model').value = moto.model;
    document.getElementById('moto-type').value = moto.type;
    document.getElementById('moto-price').value = moto.price;
    document.getElementById('moto-condition').value = moto.condition;
    document.getElementById('moto-year').value = moto.year;
    document.getElementById('moto-cc').value = moto.cc;
    document.getElementById('moto-hp').value = moto.hp;
    document.getElementById('moto-torque').value = moto.torque || '';
    document.getElementById('moto-weight').value = moto.weight || 185;
    document.getElementById('moto-tank').value = moto.tank || 16;
    document.getElementById('moto-color').value = moto.color || '';
    document.getElementById('moto-image').value = moto.image;
    document.getElementById('moto-featured').checked = !!moto.featured;
    document.getElementById('moto-description').value = moto.description || '';

    updateImagePreview(moto.image);

    const modal = document.getElementById('moto-form-modal');
    const backdrop = document.getElementById('moto-form-backdrop');
    if (modal && backdrop) {
      modal.classList.add('active');
      backdrop.classList.add('active');
    }
  }

  function closeMotoFormModal() {
    const modal = document.getElementById('moto-form-modal');
    const backdrop = document.getElementById('moto-form-backdrop');
    if (modal && backdrop) {
      modal.classList.remove('active');
      backdrop.classList.remove('active');
    }
  }

  function updateImagePreview(url) {
    const preview = document.getElementById('moto-image-preview');
    if (preview && url) {
      preview.src = url;
    }
  }

  function applyPresetImage(url) {
    const input = document.getElementById('moto-image');
    if (input) input.value = url;
    updateImagePreview(url);
  }

  function saveMotorcycle(e) {
    e.preventDefault();

    const editId = document.getElementById('moto-edit-id')?.value;
    const brand = document.getElementById('moto-brand').value;
    const model = document.getElementById('moto-model').value.trim();
    const type = document.getElementById('moto-type').value;
    const price = parseFloat(document.getElementById('moto-price').value) || 0;
    const condition = document.getElementById('moto-condition').value;
    const year = parseInt(document.getElementById('moto-year').value) || 2026;
    const cc = parseInt(document.getElementById('moto-cc').value) || 1000;
    const hp = parseInt(document.getElementById('moto-hp').value) || 150;
    const torque = document.getElementById('moto-torque').value.trim() || '110 Nm';
    const weight = parseInt(document.getElementById('moto-weight').value) || 185;
    const tank = parseInt(document.getElementById('moto-tank').value) || 16;
    const color = document.getElementById('moto-color').value.trim() || 'Edición Oficial';
    const image = document.getElementById('moto-image').value.trim();
    const featured = document.getElementById('moto-featured').checked;
    const description = document.getElementById('moto-description').value.trim();

    if (editId) {
      // Update existing motorcycle
      const idNum = parseInt(editId);
      const index = currentMotorcycles.findIndex(m => m.id === idNum);
      if (index > -1) {
        currentMotorcycles[index] = {
          ...currentMotorcycles[index],
          brand,
          model,
          type,
          price,
          condition,
          year,
          cc,
          hp,
          torque,
          weight,
          tank,
          color,
          image,
          gallery: [image, ...(currentMotorcycles[index].gallery ? currentMotorcycles[index].gallery.slice(1) : [])],
          featured,
          description
        };
        showToast(`✅ ${brand} ${model} actualizada con éxito.`);
      }
    } else {
      // Create new motorcycle
      const newId = currentMotorcycles.length > 0 ? Math.max(...currentMotorcycles.map(m => m.id)) + 1 : 1;
      const newMoto = {
        id: newId,
        brand,
        model,
        type,
        price,
        condition,
        year,
        cc,
        hp,
        torque,
        weight,
        tank,
        brakes: "Brembo Radial",
        color,
        image,
        gallery: [
          image,
          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
          "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"
        ],
        featured,
        description
      };
      currentMotorcycles.unshift(newMoto);
      showToast(`🎉 ¡Nueva moto agregada: ${brand} ${model}!`);
    }

    saveMotorcycles(currentMotorcycles);
    closeMotoFormModal();

    // Re-render user catalog and admin panel
    renderCatalog();
    renderAdminDashboard();
    initHero();
  }

  function deleteMotorcycle(motoId) {
    const moto = currentMotorcycles.find(m => m.id === motoId);
    if (!moto) return;

    const ok = confirm(`¿Estás seguro de que deseas eliminar permanentemente la ${moto.brand} ${moto.model} del catálogo de Apex Moto?`);
    if (!ok) return;

    currentMotorcycles = currentMotorcycles.filter(m => m.id !== motoId);
    saveMotorcycles(currentMotorcycles);

    // Also remove from cart if present
    state.cart = state.cart.filter(m => m.id !== motoId);
    saveCart();
    renderCart();

    // Re-render
    renderCatalog();
    renderAdminDashboard();
    initHero();

    showToast(`🗑️ ${moto.brand} ${moto.model} eliminada del inventario.`, 'info');
  }

  function resetCatalogToDefault() {
    const ok = confirm('¿Deseas restablecer el inventario completo a la configuración original de fábrica?');
    if (!ok) return;

    currentMotorcycles = typeof MOTORCYCLES !== 'undefined' ? JSON.parse(JSON.stringify(MOTORCYCLES)) : [];
    saveMotorcycles(currentMotorcycles);

    renderCatalog();
    renderAdminDashboard();
    initHero();

    showToast('🔄 Inventario restablecido al catálogo de fábrica original.');
  }

  // ── Public API (for inline event handlers) ────────────────
  window.ApexMoto = {
    openModal,
    closeModal,
    changeGallery,
    addToQuote,
    requestTestDrive,
    requestQuoteFromModal,
    toggleSearch,
    showToast,
    // Cart and Checkout APIs
    openCart,
    closeCart,
    addToCart,
    addToCartFromModal,
    removeFromCart,
    updateCartQty,
    clearCart,
    openCheckout,
    closeCheckout,
    selectPaymentMethod,
    processPayment,
    printReceipt,
    // Auth APIs
    handleAuthBtnClick,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    fillDemoLogin,
    handleLogin,
    handleRegister,
    logout,
    // Admin CRUD APIs
    openAdminPanel,
    closeAdminPanel,
    filterAdminTable,
    openAddMotoModal,
    openEditMotoModal,
    closeMotoFormModal,
    saveMotorcycle,
    deleteMotorcycle,
    resetCatalogToDefault,
    updateImagePreview,
    applyPresetImage
  };

})();

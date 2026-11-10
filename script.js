// ===== Cart State =====
const cart = {}; // { "Item Name": { price: number, qty: number } }
const WHATSAPP_NUMBER = '916291216744';
const MIN_ORDER = 169;
const DELIVERY_CHARGE = 40;

// ===== DOM References =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCategories = document.querySelectorAll('.menu-category');
const cartFab = document.getElementById('cartFab');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartBody = document.getElementById('cartBody');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartDeliveryRow = document.getElementById('cartDeliveryRow');
const cartDelivery = document.getElementById('cartDelivery');
const cartTotal = document.getElementById('cartTotal');
const cartMinNote = document.getElementById('cartMinNote');
const orderBtn = document.getElementById('orderBtn');
const customerName = document.getElementById('customerName');
const customerAddress = document.getElementById('customerAddress');
const toastEl = document.getElementById('toast');

// Kitchen Status DOM Elements
const navStatusBadge = document.getElementById('navStatusBadge');
const navStatusText = document.getElementById('navStatusText');
const kitchenAlertBar = document.getElementById('kitchenAlertBar');
const alertBarIcon = document.getElementById('alertBarIcon');
const alertBarTitle = document.getElementById('alertBarTitle');
const alertBarMessage = document.getElementById('alertBarMessage');
const cartClosedNotice = document.getElementById('cartClosedNotice');
const cartClosedNoticeMsg = document.getElementById('cartClosedNoticeMsg');

let kitchenStatus = {
    isOpen: true,
    message: ''
};

// ===== Navbar Scroll =====
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    backToTop.classList.toggle('visible', window.scrollY > 500);
});

// ===== Hamburger =====
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ===== Back to Top =====
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Menu Filter =====
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        menuCategories.forEach(cat => {
            if (filter === 'all' || cat.dataset.category === filter) {
                cat.classList.remove('hidden');
                cat.style.animation = 'fadeIn 0.4s ease forwards';
            } else {
                cat.classList.add('hidden');
            }
        });
    });
});

// ===== Active Nav on Scroll =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
            });
        }
    });
});

// ===== Intersection Observer =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.combo-card, .menu-category, .thali-card, .contact-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});


// ============================================
//  CART SYSTEM
// ============================================

// ===== Quantity Controls (on menu items) =====
document.querySelectorAll('.qty-control').forEach(control => {
    const plusBtn = control.querySelector('.qty-plus');
    const minusBtn = control.querySelector('.qty-minus');
    const countEl = control.querySelector('.qty-count');
    const itemName = control.dataset.item;
    const itemPrice = parseInt(control.dataset.price);

    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!kitchenStatus.isOpen) {
            showToast('⚠️ Kitchen is currently closed for orders.');
            return;
        }
        addToCart(itemName, itemPrice);
        syncAllQtyDisplays(itemName);
        showToast(`Added "${itemName}"`);
    });

    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!kitchenStatus.isOpen) return;
        removeFromCart(itemName);
        syncAllQtyDisplays(itemName);
    });
});

function addToCart(name, price) {
    if (!cart[name]) {
        cart[name] = { price, qty: 0 };
    }
    cart[name].qty++;
    updateCartUI();
}

function removeFromCart(name) {
    if (cart[name] && cart[name].qty > 0) {
        cart[name].qty--;
        if (cart[name].qty === 0) delete cart[name];
    }
    updateCartUI();
}

function setCartQty(name, price, qty) {
    if (qty <= 0) {
        delete cart[name];
    } else {
        cart[name] = { price, qty };
    }
    syncAllQtyDisplays(name);
    updateCartUI();
}

// Sync ALL qty-control elements for the same item across the page
function syncAllQtyDisplays(itemName) {
    document.querySelectorAll('.qty-control').forEach(ctrl => {
        if (ctrl.dataset.item === itemName) {
            const countEl = ctrl.querySelector('.qty-count');
            const qty = cart[itemName] ? cart[itemName].qty : 0;
            if (countEl) countEl.textContent = qty;
            ctrl.classList.toggle('has-items', qty > 0);
        }
    });
}

function getCartItemCount() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function getCartSubtotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ===== Update Cart UI =====
function updateCartUI() {
    const count = getCartItemCount();
    const subtotal = getCartSubtotal();

    // Badge
    cartBadge.textContent = count;
    cartBadge.classList.toggle('visible', count > 0);
    cartFab.classList.toggle('has-items', count > 0);

    // Cart body
    if (count === 0) {
        cartEmpty.style.display = 'flex';
        cartItems.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartItems.style.display = 'block';
        renderCartItems();
    }

    // Summary
    cartSubtotal.textContent = `₹${subtotal}`;

    let delivery = 0;
    if (count > 0 && subtotal < MIN_ORDER) {
        delivery = DELIVERY_CHARGE;
        cartDeliveryRow.style.display = 'flex';
        cartMinNote.textContent = `Add ₹${MIN_ORDER - subtotal} more for free delivery`;
    } else {
        cartDeliveryRow.style.display = 'none';
        cartMinNote.textContent = count > 0 ? '✅ Free delivery!' : '';
    }

    const total = subtotal + delivery;
    cartTotal.textContent = `₹${total}`;

    // Order button state
    orderBtn.disabled = count === 0;
}

function renderCartItems() {
    cartItems.innerHTML = '';
    for (const [name, item] of Object.entries(cart)) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name" title="${name}">${name}</div>
                <div class="cart-item-unit">₹${item.price} each</div>
            </div>
            <div class="cart-item-qty">
                <button data-action="minus" aria-label="Decrease">−</button>
                <span>${item.qty}</span>
                <button data-action="plus" aria-label="Increase">+</button>
            </div>
            <div class="cart-item-total">₹${item.price * item.qty}</div>
            <button class="cart-item-remove" data-action="remove" aria-label="Remove item">✕</button>
        `;

        // Event listeners for cart item buttons
        div.querySelector('[data-action="minus"]').addEventListener('click', () => {
            removeFromCart(name);
            syncAllQtyDisplays(name);
        });
        div.querySelector('[data-action="plus"]').addEventListener('click', () => {
            addToCart(name, item.price);
            syncAllQtyDisplays(name);
        });
        div.querySelector('[data-action="remove"]').addEventListener('click', () => {
            delete cart[name];
            syncAllQtyDisplays(name);
            updateCartUI();
        });

        cartItems.appendChild(div);
    }
}

// ===== Cart Drawer Open/Close =====
function openCart() {
    if (!kitchenStatus.isOpen) {
        showToast('⚠️ Kitchen is currently closed for orders.');
        return;
    }
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

cartFab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Close drawer with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
});

// ===== WhatsApp Order =====
orderBtn.addEventListener('click', () => {
    const count = getCartItemCount();
    if (count === 0) {
        showToast('⚠️ Please add items to your cart first!');
        return;
    }

    const name = customerName.value.trim();
    const address = customerAddress.value.trim();

    // Build WhatsApp message
    const subtotal = getCartSubtotal();
    const delivery = subtotal < MIN_ORDER ? DELIVERY_CHARGE : 0;
    const total = subtotal + delivery;

    let msg = '';
    if (!kitchenStatus.isOpen) {
        msg += `⚠️ *[PRE-ORDER — KITCHEN CURRENTLY CLOSED]*\n`;
        if (kitchenStatus.message) {
            msg += `📢 _Note: ${kitchenStatus.message}_\n`;
        }
        msg += `\n`;
    }

    msg += `🍜 *New Order — বং Chingzz Home Kitchen*\n\n`;
    msg += `👤 *Name:* ${name || 'Customer'}\n`;
    msg += `📍 *Address:* ${address || 'Will provide in chat'}\n\n`;
    msg += `📋 *Order Details:*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;

    let itemNum = 1;
    for (const [itemName, item] of Object.entries(cart)) {
        const lineTotal = item.price * item.qty;
        msg += `${itemNum}. ${itemName}\n`;
        msg += `   ${item.qty} × ₹${item.price} = *₹${lineTotal}*\n`;
        itemNum++;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `💰 *Subtotal:* ₹${subtotal}\n`;

    if (delivery > 0) {
        msg += `🛵 *Delivery:* ₹${delivery}\n`;
    } else {
        msg += `🛵 *Delivery:* FREE ✅\n`;
    }

    msg += `\n🧾 *Total: ₹${total}*\n\n`;
    msg += `Thank you! 🙏`;

    // Encode WhatsApp URL
    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encoded}`;

    // Reliable opening mechanism for mobile & desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Mobile browsers block window.open as popup; location.href directly opens WhatsApp app
        window.location.href = whatsappUrl;
    } else {
        // Desktop: anchor tag with target="_blank"
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showToast('🎉 Opening WhatsApp...');
});

// Remove error class on input
customerName.addEventListener('input', () => customerName.classList.remove('error'));
customerAddress.addEventListener('input', () => customerAddress.classList.remove('error'));

// ===== Toast =====
let toastTimeout;
function showToast(message) {
    clearTimeout(toastTimeout);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2000);
}

// ===== Init =====
updateCartUI();
fetchKitchenStatus();

// ===== Kitchen Status Sync (Upstash Redis) =====
async function fetchKitchenStatus() {
    try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();

        kitchenStatus.isOpen = Boolean(data.isOpen);
        kitchenStatus.message = (data.message || '').trim();

        updateKitchenStatusUI();
    } catch (err) {
        console.warn('Could not fetch live kitchen status:', err);
    }
}

function updateKitchenStatusUI() {
    // 0. Toggle body class for instant UI hide/show of cart & add buttons
    if (!kitchenStatus.isOpen) {
        document.body.classList.add('kitchen-is-closed');
        closeCart();
    } else {
        document.body.classList.remove('kitchen-is-closed');
    }

    // 1. Navbar badge
    if (navStatusBadge && navStatusText) {
        if (kitchenStatus.isOpen) {
            navStatusBadge.className = 'status-pill status-open';
            navStatusText.textContent = 'Open';
            navStatusBadge.title = 'Kitchen is Open for Orders';
        } else {
            navStatusBadge.className = 'status-pill status-closed';
            navStatusText.textContent = 'Closed';
            navStatusBadge.title = 'Kitchen is Currently Closed';
        }
    }

    // 2. Alert Banner under Navbar
    if (kitchenAlertBar) {
        if (!kitchenStatus.isOpen) {
            kitchenAlertBar.style.display = 'block';
            kitchenAlertBar.className = 'kitchen-alert-bar closed';
            if (alertBarIcon) alertBarIcon.textContent = '🔴';
            if (alertBarTitle) alertBarTitle.textContent = 'Kitchen Currently Closed:';
            if (alertBarMessage) {
                alertBarMessage.textContent = kitchenStatus.message || 'We are not accepting immediate orders right now. Feel free to browse our menu!';
            }
        } else if (kitchenStatus.message) {
            kitchenAlertBar.style.display = 'block';
            kitchenAlertBar.className = 'kitchen-alert-bar open-notice';
            if (alertBarIcon) alertBarIcon.textContent = '📢';
            if (alertBarTitle) alertBarTitle.textContent = 'Kitchen Notice:';
            if (alertBarMessage) alertBarMessage.textContent = kitchenStatus.message;
        } else {
            kitchenAlertBar.style.display = 'none';
        }
    }

    // 3. Cart Drawer notice and button
    if (cartClosedNotice) {
        if (!kitchenStatus.isOpen) {
            cartClosedNotice.style.display = 'flex';
            if (cartClosedNoticeMsg) {
                cartClosedNoticeMsg.textContent = kitchenStatus.message || 'We are closed right now. You can still send a pre-order via WhatsApp!';
            }
        } else {
            cartClosedNotice.style.display = 'none';
        }
    }

    if (orderBtn) {
        if (!kitchenStatus.isOpen) {
            orderBtn.classList.add('is-closed');
            orderBtn.innerHTML = '<span class="cart-order-icon">💬</span> Pre-order via WhatsApp (Closed)';
        } else {
            orderBtn.classList.remove('is-closed');
            orderBtn.innerHTML = '<span class="cart-order-icon">💬</span> Order via WhatsApp';
        }
    }
}

// Poll every 60 seconds and on tab focus
setInterval(fetchKitchenStatus, 60000);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) fetchKitchenStatus();
});

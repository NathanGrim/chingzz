// ===== Cart State =====
const cart = {}; // { "Item Name": { price: number, qty: number } }
const WHATSAPP_NUMBER = '917003220189';
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
        addToCart(itemName, itemPrice);
        syncAllQtyDisplays(itemName);
        showToast(`Added "${itemName}"`);
    });

    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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
    document.querySelectorAll(`.qty-control[data-item="${CSS.escape(itemName)}"]`).forEach(ctrl => {
        const countEl = ctrl.querySelector('.qty-count');
        const qty = cart[itemName] ? cart[itemName].qty : 0;
        countEl.textContent = qty;
        ctrl.classList.toggle('has-items', qty > 0);
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
    const name = customerName.value.trim();
    const address = customerAddress.value.trim();
    let hasError = false;

    // Validate
    customerName.classList.remove('error');
    customerAddress.classList.remove('error');

    if (!name) {
        customerName.classList.add('error');
        customerName.focus();
        hasError = true;
    }
    if (!address) {
        customerAddress.classList.add('error');
        if (!hasError) customerAddress.focus();
        hasError = true;
    }
    if (hasError) return;

    if (getCartItemCount() === 0) return;

    // Build WhatsApp message
    const subtotal = getCartSubtotal();
    const delivery = subtotal < MIN_ORDER ? DELIVERY_CHARGE : 0;
    const total = subtotal + delivery;

    let msg = `🍜 *New Order — বং Chingzz Home Kitchen*\n\n`;
    msg += `👤 *Name:* ${name}\n`;
    msg += `📍 *Address:* ${address}\n\n`;
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

    // Encode and open WhatsApp
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;

    window.open(url, '_blank');

    // Show success toast
    showToast('🎉 Order sent to WhatsApp!');
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

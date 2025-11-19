// Simple SPA navigation and auth handling + e-commerce cart
const base = (location.protocol === 'file:' || location.origin === 'null') ? 'http://localhost:8080' : '';

// products are loaded from the backend
let products = [];

async function fetchProducts() {
  try {
    const resp = await fetch(base + '/api/products');
    if (!resp.ok) throw new Error('Failed to fetch products');
    products = await resp.json();
    renderProducts();
    if (location.hash.replace('#','')==='cart') renderCart();
  } catch (err) {
    console.error('Product fetch error', err);
    // fallback: if fetching fails, keep products empty so UI shows empty state
  }
}

function formatPrice(p) { return '₹' + (p/100).toFixed(2); }

function getCart() { try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch(e) { return []; } }
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() { const cart = getCart(); const count = cart.reduce((s,i)=>s+i.qty,0); const el = document.getElementById('cartCount'); if(el) el.textContent = count; }

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty; else cart.push({ id: productId, qty });
  saveCart(cart);
}

function changeQty(productId, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i=>i.id===productId);
  if (idx === -1) return;
  if (qty <= 0) cart.splice(idx,1); else cart[idx].qty = qty;
  saveCart(cart);
}

function removeFromCart(productId) { const cart = getCart().filter(i=>i.id!==productId); saveCart(cart); renderCart(); }

function clearCart() { localStorage.removeItem('cart'); updateCartCount(); }

function renderProducts() {
  const grid = document.getElementById('productsGrid'); if(!grid) return;
  grid.innerHTML = '';
  const container = document.createElement('div'); container.className = 'products-grid';
  products.forEach(p=>{
    const card = document.createElement('div'); card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <div class="product-title">${p.title}</div>
      <div class="product-price">${formatPrice(p.price)}</div>
      <div class="product-actions">
        <button class="addBtn">Add to cart</button>
        <button class="secondary" data-id="${p.id}">View</button>
      </div>
    `;
    card.querySelector('.addBtn').addEventListener('click', ()=>{ addToCart(p.id,1); renderCart(); });
    card.querySelector('button.secondary').addEventListener('click', ()=>{ alert(`${p.title}\n\n${p.description}\n\nPrice: ${formatPrice(p.price)}`); });
    container.appendChild(card);
  });
  grid.appendChild(container);
}

function renderCart() {
  const content = document.getElementById('cartContent'); if(!content) return;
  const cart = getCart();
  if (cart.length === 0) { content.innerHTML = '<p>Your cart is empty.</p>'; document.getElementById('cartActions').innerHTML = ''; updateCartCount(); return; }
  content.innerHTML = '';
  let subtotal = 0;
  cart.forEach(item=>{
    const p = products.find(x=>x.id===item.id);
    if(!p) return;
    const row = document.createElement('div'); row.className = 'cart-item';
    const img = document.createElement('img'); img.src = p.image; img.alt = p.title;
    const info = document.createElement('div'); info.style.flex='1'; info.innerHTML = `<div style="font-weight:700">${p.title}</div><div class="muted">${p.description}</div>`;
    const qtyEl = document.createElement('input'); qtyEl.type='number'; qtyEl.value=item.qty; qtyEl.min=0; qtyEl.className='qty-input'; qtyEl.addEventListener('change', ()=>{ changeQty(p.id, parseInt(qtyEl.value||0)); renderCart(); });
    const price = document.createElement('div'); price.style.width='120px'; price.style.textAlign='right'; price.innerText = formatPrice(p.price * item.qty);
    const remove = document.createElement('button'); remove.className='secondary'; remove.innerText='Remove'; remove.addEventListener('click', ()=>{ removeFromCart(p.id); });
    row.appendChild(img); row.appendChild(info); row.appendChild(qtyEl); row.appendChild(price); row.appendChild(remove);
    content.appendChild(row);
    subtotal += p.price * item.qty;
  });
  const actions = document.getElementById('cartActions');
  actions.innerHTML = `<div class="total-row"><strong>Subtotal</strong><strong>${formatPrice(subtotal)}</strong></div><div style="margin-top:12px"><button id="checkoutBtn">Proceed to Checkout</button> <button class="secondary" id="clearCart">Clear Cart</button></div>`;
  document.getElementById('checkoutBtn').addEventListener('click', ()=>{ location.hash='checkout'; });
  document.getElementById('clearCart').addEventListener('click', ()=>{ if(confirm('Clear cart?')){ clearCart(); renderCart(); } });
  updateCartCount();
}

function renderCheckout() {
  const actions = document.getElementById('cartActions');
  const content = document.getElementById('cartContent');
  const cart = getCart();
  if(!content || !actions) return;
  if(cart.length===0) { content.innerHTML = '<p>Your cart is empty.</p>'; actions.innerHTML=''; return; }
  // simple checkout form (demo)
  content.innerHTML = `<div class="page"><h3>Checkout</h3><div class="form"><label>Full name</label><input id="chkName" placeholder="Full name" /><label>Address</label><input id="chkAddress" placeholder="Delivery address" /><label>Phone</label><input id="chkPhone" placeholder="Phone" /></div></div>`;
  actions.innerHTML = `<div style="margin-top:12px"><button id="completeOrder">Place Order</button></div>`;
  document.getElementById('completeOrder').addEventListener('click', async ()=>{
    const name = document.getElementById('chkName').value.trim();
    const address = document.getElementById('chkAddress').value.trim();
    const phone = document.getElementById('chkPhone').value.trim();
    if(!name || !address) { alert('Please enter name and address'); return; }
    // prepare order payload
    const payload = { username: (getCurrentUser() ? getCurrentUser().username : null), fullName: name, address, phone, items: cart.map(i=>({ productId: i.id, qty: i.qty })) };
    try {
      const resp = await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) { const txt = await resp.text(); alert('Order failed: ' + txt); return; }
      const data = await resp.json();
      clearCart(); alert('Order placed. Order id: ' + (data.id || 'n/a'));
      location.hash='home';
    } catch (err) {
      alert('Order error: ' + err);
    }
  });
}

function showSection(id) {
  document.querySelectorAll('.page').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = '';
  // update active nav
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
}

function onHashChange() {
  const hash = location.hash.replace('#', '') || 'home';
  if (hash === 'profile' && !getCurrentUser()) {
    // redirect to login if not authenticated
    location.hash = 'login';
    return;
  }
  showSection(hash);
  renderProfileIfNeeded();
}

function setUserUI(user) {
  const navProfile = document.getElementById('navProfile');
  const userGreeting = document.getElementById('userGreeting');
  const logoutBtn = document.getElementById('logoutBtn');
  if (user) {
    navProfile.style.display = '';
    userGreeting.textContent = `Hello, ${user.username}`;
    logoutBtn.style.display = '';
  } else {
    navProfile.style.display = 'none';
    userGreeting.textContent = '';
    logoutBtn.style.display = 'none';
  }
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e){ return null }
}

function saveCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  setUserUI(user);
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
  setUserUI(null);
}

function renderProfileIfNeeded() {
  const user = getCurrentUser();
  const profileContent = document.getElementById('profileContent');
  if (!profileContent) return;
  if (user) {
    profileContent.innerHTML = `<p><strong>Username:</strong> ${user.username}</p><p><strong>Full name:</strong> ${user.fullName || '-'} </p><p><strong>ID:</strong> ${user.id}</p>`;
  } else {
    profileContent.innerHTML = '<p>No user signed in.</p>';
  }
}

async function register() {
  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const resEl = document.getElementById('regResult');
  if (!username || !password) { resEl.textContent = 'Username and password are required.'; return; }
  resEl.textContent = 'Registering...';
  try {
    const resp = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username, password })
    });
    const data = await resp.json();
    resEl.textContent = data.message || JSON.stringify(data);
    if (resp.ok) {
      // optionally auto-redirect to login
      setTimeout(()=>{ location.hash = 'login'; }, 900);
    }
  } catch (err) {
    resEl.textContent = 'Error: ' + err;
  }
}

async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const resEl = document.getElementById('loginResult');
  if (!username || !password) { resEl.textContent = 'Username and password are required.'; return; }
  resEl.textContent = 'Logging in...';
  try {
    const resp = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await resp.json();
    if (resp.status === 200 && data.user) {
      saveCurrentUser(data.user);
      resEl.textContent = data.message || 'Login successful';
      setTimeout(()=>{ location.hash = 'profile'; }, 600);
    } else {
      resEl.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    resEl.textContent = 'Error: ' + err;
  }
}

// wire UI
document.addEventListener('DOMContentLoaded', ()=>{
  // navigation links
  document.querySelectorAll('[data-route]').forEach(a=> a.addEventListener('click', (e)=>{ /* let hash change handle it */ }));
  // buttons
  const regBtn = document.getElementById('regBtn'); if (regBtn) regBtn.addEventListener('click', register);
  const loginBtn = document.getElementById('loginBtn'); if (loginBtn) loginBtn.addEventListener('click', login);
  const logoutBtn = document.getElementById('logoutBtn'); if (logoutBtn) logoutBtn.addEventListener('click', ()=>{ clearCurrentUser(); location.hash='home'; });
  // initial user UI
  setUserUI(getCurrentUser());
  // products & cart initial render
  fetchProducts();
  updateCartCount();
  // if landing on cart/checkout, render appropriately
  if (location.hash.replace('#','')==='cart') renderCart();
  if (location.hash.replace('#','')==='checkout') renderCheckout();
  // route handling
  window.addEventListener('hashchange', onHashChange);
  onHashChange();
});

// expose for debugging
window.app = { register, login, showSection, getCurrentUser, addToCart, getCart, renderCart };


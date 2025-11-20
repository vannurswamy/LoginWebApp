// Simple SPA navigation and auth handling + e-commerce cart
const base = (location.protocol === 'file:' || location.origin === 'null') ? 'http://localhost:8080' : '';

// products are loaded from the backend
let products = [];
// simple SVG placeholder (lightweight, avoids adding image files)
const placeholderImage = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial,Helvetica,sans-serif" font-size="24">Image not available</text>
  </svg>
`);

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
      <img src="${p.image || placeholderImage}" alt="${p.title}" />
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

async function renderCheckout() {
  const grid = document.getElementById('checkoutGrid');
  const cart = getCart();
  try {
    // ensure we have product data to render item details
    if (products.length === 0) {
      await fetchProducts();
    }
    console.log('renderCheckout called', { cartLength: cart.length, productsLength: products.length });
    if(!grid) { console.warn('checkoutGrid element not found'); return; }
    if(cart.length===0) { grid.innerHTML = '<p>Your cart is empty.</p>'; return; }

  // build left column: address + items
  let itemsHtml = '';
  let subtotal = 0;
  cart.forEach(i=>{
    const p = products.find(x=>x.id===i.id);
    if(!p) return;
    subtotal += p.price * i.qty;
    itemsHtml += `<div class="checkout-item"><img src="${p.image || placeholderImage}" alt="${p.title}" /><div><div style="font-weight:700">${p.title}</div><div class="muted">Qty: ${i.qty} · ${formatPrice(p.price)}</div></div><div style="margin-left:auto">${formatPrice(p.price * i.qty)}</div></div>`;
  });

  grid.innerHTML = `
    <div class="checkout-left">
      <div class="card">
        <h3>Delivery details</h3>
        <div class="form"><label>Full name</label><input id="chkName" placeholder="Full name" />
        <label>Address</label><input id="chkAddress" placeholder="Delivery address" />
        <label>Phone</label><input id="chkPhone" placeholder="Phone" /></div>
      </div>
      <div class="card" style="margin-top:12px">
        <h3>Order items</h3>
        ${itemsHtml}
      </div>
    </div>
    <aside class="checkout-right card">
      <h3>Payment</h3>
      <div><strong>Subtotal</strong><div class="muted">${formatPrice(subtotal)}</div></div>
      <div style="margin-top:12px">
        <label><input type="radio" name="pay" value="card" checked /> Credit / Debit Card</label><br/>
        <label><input type="radio" name="pay" value="upi" /> UPI</label><br/>
        <label><input type="radio" name="pay" value="phonepe" /> PhonePe (UPI)</label><br/>
        <label><input type="radio" name="pay" value="netbanking" /> Netbanking</label><br/>
        <label><input type="radio" name="pay" value="cod" /> Cash on Delivery</label>
      </div>
      <div id="paymentForm" style="margin-top:12px"></div>
      <div style="margin-top:14px;display:flex;gap:8px;justify-content:space-between;align-items:center"><button id="payNow">Pay Now</button><button class="secondary" id="editCart">Edit Cart</button></div>
      <div id="paymentResult" class="result" style="margin-top:12px"></div>
    </aside>
  `;

  // ensure the grid is visible (in case CSS/display toggles hide it)
  grid.style.display = '';

  // payment form switching
  grid.querySelectorAll('input[name="pay"]').forEach(r=> r.addEventListener('change', renderPaymentForm));
  document.getElementById('editCart').addEventListener('click', ()=>{ location.hash='cart'; });
  renderPaymentForm();

  async function onPay() {
    const name = document.getElementById('chkName').value.trim();
    const address = document.getElementById('chkAddress').value.trim();
    const phone = document.getElementById('chkPhone').value.trim();
    const method = (document.querySelector('input[name="pay"]:checked') || {}).value || 'card';
    if(!name || !address) { alert('Please enter name and address'); return; }
    // For UPI (PhonePe) we'll obtain a UPI deep-link from the server and open it.
    const payload = { username: (getCurrentUser() ? getCurrentUser().username : null), fullName: name, address, phone, paymentMethod: method, items: cart.map(i=>({ productId: i.id, qty: i.qty })) };
    try {
      if (method === 'upi') {
        const amount = (subtotal/100).toFixed(2); // frontend uses cents; adjust if your backend sends rupees instead
        const orderId = 'upi-' + Date.now();
        const resp = await fetch(base + '/api/payments/upi/link', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ amount, orderId, name }) });
        const data = await resp.json();
        if (data.upiLink) {
          // Open the deep-link. On mobile this should offer PhonePe among UPI apps.
          document.getElementById('paymentResult').textContent = 'Opening UPI app... complete payment and then click Confirm Payment below.';
          window.location.href = data.upiLink;
          // Show a confirm button so user can tell the app they completed the payment.
          const confirmBox = document.createElement('div');
          confirmBox.style.marginTop = '12px';
          confirmBox.innerHTML = `<button id="confirmUpi" style="margin-right:8px">I have paid (Confirm)</button> <button class="secondary" id="cancelUpi">Cancel</button>`;
          document.getElementById('paymentResult').appendChild(confirmBox);
          document.getElementById('confirmUpi').addEventListener('click', async ()=>{
            document.getElementById('paymentResult').textContent = 'Verifying payment...';
            const v = await fetch(base + '/api/payments/upi/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderId }) });
            const vr = await v.json();
            if (vr.status === 'SUCCESS') {
              clearCart();
              document.getElementById('paymentResult').textContent = 'Payment confirmed. Order id: ' + (vr.orderId || orderId);
              setTimeout(()=>{ location.hash='home'; }, 1400);
            } else {
              document.getElementById('paymentResult').textContent = 'Payment not confirmed: ' + (vr.message || 'unknown');
            }
          });
          document.getElementById('cancelUpi').addEventListener('click', ()=>{ document.getElementById('paymentResult').textContent = 'Payment cancelled.'; });
          return;
        } else {
          document.getElementById('paymentResult').textContent = 'Failed to create UPI link';
          return;
        }
      }

      if (method === 'phonepe') {
        const amount = (subtotal/100).toFixed(2);
        const orderId = 'pp-' + Date.now();
        const resp = await fetch(base + '/api/payments/phonepe/create-order', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ amount, orderId, name }) });
        const data = await resp.json();
        const paymentUrl = data.paymentUrl || data.paymentUrl;
        if (paymentUrl) {
          document.getElementById('paymentResult').textContent = 'Opening PhonePe... complete payment and then click Confirm Payment below.';
          window.location.href = paymentUrl;
          const confirmBox = document.createElement('div');
          confirmBox.style.marginTop = '12px';
          confirmBox.innerHTML = `<button id="confirmPhonePe" style="margin-right:8px">I have paid (Confirm)</button> <button class="secondary" id="cancelPhonePe">Cancel</button>`;
          document.getElementById('paymentResult').appendChild(confirmBox);
          document.getElementById('confirmPhonePe').addEventListener('click', async ()=>{
            document.getElementById('paymentResult').textContent = 'Verifying payment with server...';
            const v = await fetch(base + '/api/payments/phonepe/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ orderId: data.orderId || orderId }) });
            const vr = await v.json();
            if (vr.status === 'SUCCESS') {
              clearCart();
              document.getElementById('paymentResult').textContent = 'Payment confirmed. Order id: ' + (vr.orderId || orderId);
              setTimeout(()=>{ location.hash='home'; }, 1400);
            } else {
              document.getElementById('paymentResult').textContent = 'Payment not confirmed: ' + (vr.message || 'unknown');
            }
          });
          document.getElementById('cancelPhonePe').addEventListener('click', ()=>{ document.getElementById('paymentResult').textContent = 'Payment cancelled.'; });
          return;
        } else {
          document.getElementById('paymentResult').textContent = 'Failed to create PhonePe payment URL';
          return;
        }
      }

      // Non-UPI flows: send order to backend (server should integrate real gateway)
      const resp2 = await fetch(base + '/api/orders', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
      if (!resp2.ok) { const txt = await resp2.text(); document.getElementById('paymentResult').textContent = 'Order failed: ' + txt; return; }
      const data2 = await resp2.json();
      clearCart();
      document.getElementById('paymentResult').textContent = 'Payment & order successful. Order id: ' + (data2.id || 'n/a');
      grid.innerHTML = `<div class="card"><h3>Thank you</h3><p>Your order has been placed successfully.</p><p><strong>Order id:</strong> ${data2.id || 'n/a'}</p><p><button id="backHome">Continue Shopping</button></p></div>`;
      document.getElementById('backHome').addEventListener('click', ()=>{ location.hash='home'; });
    } catch (err) {
      document.getElementById('paymentResult').textContent = 'Order error: ' + err;
    }
  }

  document.getElementById('payNow').addEventListener('click', onPay);
  // defensive: catch errors that might occur in onPay and show them
  window.addEventListener('error', (ev) => {
    const pr = document.getElementById('paymentResult');
    if (pr) pr.textContent = 'An error occurred: ' + ev.message;
    console.error('Unhandled error', ev.error || ev.message);
  });

  function renderPaymentForm() {
    const sel = (document.querySelector('input[name="pay"]:checked') || {}).value;
    const pf = document.getElementById('paymentForm');
    if (!pf) return;
    if (sel === 'card') {
      pf.innerHTML = `<label>Card number</label><input id="cardNumber" placeholder="xxxx-xxxx-xxxx-xxxx" />
        <label>Name on card</label><input id="cardName" />
        <label>Expiry / CVV</label><input id="cardExp" placeholder="MM/YY - CVV" />`;
    } else if (sel === 'upi') {
      pf.innerHTML = `<label>UPI ID</label><input id="upiId" placeholder="yourid@upi" />
        <div class="muted" style="margin-top:8px">A simulated UPI flow will be used for this demo.</div>`;
    } else if (sel === 'phonepe') {
      pf.innerHTML = `<div class="muted">You will be redirected to PhonePe to complete payment. Use the Confirm button after completing payment on your phone.</div>`;
    } else if (sel === 'netbanking') {
      pf.innerHTML = `<label>Bank</label><select id="bankSel"><option>HDFC</option><option>SBI</option><option>ICICI</option></select>`;
    } else if (sel === 'cod') {
      pf.innerHTML = `<div class="muted">You will pay at delivery. No upfront payment required.</div>`;
    }
  }
  } catch (e) {
    console.error('renderCheckout error', e);
    if (grid) grid.innerHTML = '<div class="card"><p>Error rendering checkout. See console for details.</p></div>';
  }
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
  // render page-specific dynamic content
  if (hash === 'products') renderProducts();
  if (hash === 'cart') renderCart();
  if (hash === 'checkout') renderCheckout();
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


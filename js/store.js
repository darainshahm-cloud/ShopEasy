// Global memory arrays
let productsList = [];
let cart = JSON.parse(localStorage.getItem('shopeasy_cart')) || [];

// Save cart helper for localStorage persistence
const saveCart = () => {
  localStorage.setItem('shopeasy_cart', JSON.stringify(cart));
};

// 1. Show every product in the list as a card in the product grid
const displayProducts = (list) => {
  const container = document.getElementById('product-grid');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p>No products found matching your criteria.</p>';
    return;
  }

  list.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-meta">
          <span>Category: ${product.category}</span>
          <span>⭐ ${product.rating}</span>
        </div>
        <div class="product-price">$${product.price}</div>
        <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
};

// 2. Return products whose name contains the text, ignoring capital letters
const searchProducts = (list, text) => {
  return list.filter((item) => item.name.toLowerCase().includes(text.toLowerCase()));
};

// 3. Return products of that category. If category is "all", return full list
const filterByCategory = (list, category) => {
  if (category === 'all' || !category) return list;
  return list.filter((item) => item.category === category);
};

// 4. Return a sorted COPY of the list by price: "low" or "high"
const sortProducts = (list, order) => {
  const copy = [...list];
  if (order === 'low') return copy.sort((a, b) => a.price - b.price);
  if (order === 'high') return copy.sort((a, b) => b.price - a.price);
  return copy;
};

// 5. Return product with specified id or string "Product not found"
const getProductById = (list, id) => {
  return list.find((item) => item.id === Number(id)) || "Product not found";
};

// 6. Add product to cart or increase quantity if already present
const addToCart = (id) => {
  const product = getProductById(productsList, id);
  if (typeof product === 'string') return;

  const existingItem = cart.find((item) => item.id === Number(id));
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart = [...cart, { ...product, quantity: 1 }];
  }
  saveCart();
};

// 7. Return a new cart without that product
const removeFromCart = (id) => {
  cart = cart.filter((item) => item.id !== Number(id));
  saveCart();
  return cart;
};

// 8. Add change (+1 or -1) to quantity. Remove item if quantity becomes 0
const updateQuantity = (id, change) => {
  cart = cart.map((item) => {
    if (item.id === Number(id)) {
      return { ...item, quantity: item.quantity + change };
    }
    return item;
  }).filter((item) => item.quantity > 0);

  saveCart();
};

// 9. Return total price x quantity for all cart items
const getCartTotal = (cartData) => {
  return cartData.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

// 10. Add any number of prices and subtract discount percent
const calculateBill = (discount, ...prices) => {
  const total = prices.reduce((acc, curr) => acc + curr, 0);
  return total - (total * (discount / 100));
};

// 11. Check form fields, show red message under wrong fields, return true or false
const validateCheckout = () => {
  let isValid = true;
  document.querySelectorAll('.error-msg').forEach((el) => (el.innerText = ''));

  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const city = document.getElementById('city');
  const address = document.getElementById('address');

  if (!fullName || fullName.value.trim().length < 3) {
    document.getElementById('err-fullName').innerText = 'Full Name must be at least 3 characters.';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.value)) {
    document.getElementById('err-email').innerText = 'Enter a valid email address.';
    isValid = false;
  }

  const phoneRegex = /^\d{10,11}$/;
  if (!phone || !phoneRegex.test(phone.value.trim())) {
    document.getElementById('err-phone').innerText = 'Phone must be 10-11 numbers.';
    isValid = false;
  }

  if (!city || city.value === '') {
    document.getElementById('err-city').innerText = 'Please select a city.';
    isValid = false;
  }

  if (!address || address.value.trim().length < 10) {
    document.getElementById('err-address').innerText = 'Address must be at least 10 characters.';
    isValid = false;
  }

  return isValid;
};
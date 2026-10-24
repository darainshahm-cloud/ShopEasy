$(document).ready(function () {
  // Bonus: Dark/Light Mode Toggle Implementation
  if (localStorage.getItem('shopeasy_theme') === 'dark') {
    $('body').attr('data-theme', 'dark');
    $('#theme-toggle').text('☀️ Light Mode');
  }

  $('#theme-toggle').on('click', function () {
    if ($('body').attr('data-theme') === 'dark') {
      $('body').removeAttr('data-theme');
      localStorage.setItem('shopeasy_theme', 'light');
      $(this).text('🌙 Dark Mode');
    } else {
      $('body').attr('data-theme', 'dark');
      localStorage.setItem('shopeasy_theme', 'dark');
      $(this).text('☀️ Light Mode');
    }
  });

  // Requirement D.1: Load JSON data using $.getJSON
  if ($('#product-grid').length > 0) {
    $('#product-grid').html('<p>Loading products...</p>');

    $.getJSON('products.json')
      .done(function (data) {
        productsList = data;
        renderProductsUI();
      })
      .fail(function () {
        $('#product-grid').html('<p style="color:red;">Error: Failed to load product catalogue.</p>');
      });
  }

  // Helper function to handle filter, search, sort pipeline
  function renderProductsUI() {
    let result = productsList;
    const searchText = $('#search-input').val() || '';
    const category = $('#category-filter').val() || 'all';
    const sortOrder = $('#sort-filter').val() || 'default';

    result = searchProducts(result, searchText);
    result = filterByCategory(result, category);
    result = sortProducts(result, sortOrder);

    displayProducts(result);

    // Requirement D.2: jQuery Effect (fadeIn animation on product cards)
    $('.product-card').hide().fadeIn(400);
  }

  // Requirement C.2: Unified Event listeners for search and filters
  $('#search-input').on('keyup input', renderProductsUI);
  $('#category-filter, #sort-filter').on('change', renderProductsUI);

  // Requirement C.2 & D.3: Event Delegation for dynamic buttons & Chaining
  $(document).on('click', '.add-to-cart-btn', function () {
    const id = $(this).data('id');
    addToCart(id);
    
    // Requirement D.3: Chaining $.text().fadeIn().delay().fadeOut()
    $('#notification')
      .text('Item added to cart!')
      .stop(true, true)
      .fadeIn(300)
      .delay(1000)
      .fadeOut(300);
  });

  // Requirement D.2: Interactive FAQ Accordion with slideToggle
  $('.faq-title').on('click', function () {
    $(this).next('.faq-content').slideToggle(300);
  });

  // Cart Page Rendering & Operations
  function renderCartPage() {
    const $tbody = $('#cart-tbody');
    if ($tbody.length === 0) return;

    $tbody.empty();
    if (cart.length === 0) {
      $tbody.html('<tr><td colspan="5" style="text-align:center;">Your cart is empty.</td></tr>');
      $('#cart-total').text('0.00');
      return;
    }

    cart.forEach(function (item) {
      const row = `
        <tr>
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
            <span style="margin: 0 8px; font-weight:bold;">${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </td>
          <td>$${(item.price * item.quantity).toFixed(2)}</td>
          <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
        </tr>
      `;
      $tbody.append(row);
    });

    const grandTotal = getCartTotal(cart);
    $('#cart-total').text(grandTotal.toFixed(2));
  }

  if ($('#cart-tbody').length > 0) {
    renderCartPage();
  }

  // Event Delegation on Cart Table
  $('#cart-tbody').on('click', '.qty-btn', function () {
    const id = $(this).data('id');
    const action = $(this).data('action');
    updateQuantity(id, action === 'increase' ? 1 : -1);
    renderCartPage();
  });

  $('#cart-tbody').on('click', '.remove-btn', function () {
    const id = $(this).data('id');
    removeFromCart(id);
    renderCartPage();
  });

  // Requirement C.11: Form Checkout Handler
  $('#checkout-form').on('submit', function (e) {
    e.preventDefault();
    if (validateCheckout()) {
      alert('Order placed successfully! Thank you for shopping with ShopEasy.');
      cart = [];
      saveCart();
      renderCartPage();
      this.reset();
    }
  });
});
const API_BASE_URL = 'http://localhost:5000'; // Adjust if your backend runs on a different port
let cart = [];
let isLoggedIn = false;
let currentUser = null;

async function checkAuthentication() {
    try {
        const response = await fetch(`${API_BASE_URL}/check-auth`);
        if (response.ok) {
            const data = await response.json();
            isLoggedIn = true;
            currentUser = data.user;
            updateAuthUI();
        } else {
            isLoggedIn = false;
            currentUser = null;
            updateAuthUI();
        }
    } catch (error) {
        console.error("Authentication check failed:", error);
        isLoggedIn = false;
        currentUser = null;
        updateAuthUI();
    }
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.length;
}

async function addToCart(button) {
    if (!isLoggedIn) {
        alert("Please login to add items to your cart.");
        return;
    }

    const productDiv = button.closest('.product');
    const name = productDiv.dataset.name;
    const price = parseFloat(productDiv.dataset.price);
    const image = productDiv.dataset.image;

    const item = { name: name, price: price, image: image, quantity: 1 };
    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === name);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity++;
    } else {
        cart.push(item);
    }

    updateCartCount();
    updateCartPage();
    console.log(cart);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    updateCartPage();
}

function updateCartPage() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartEmptyMessage = document.getElementById('cart-empty-message');

    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartEmptyMessage.style.display = 'block';
    } else {
        cartEmptyMessage.style.display = 'none';

        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Price: Rs. ${item.price}</p>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="remove-button">Remove</button>
            `;
            cartItemsDiv.appendChild(itemDiv);
            total += item.price * item.quantity;
        });
    }

    cartTotalSpan.innerText = total;
}

function searchProduct() {
    let input = document.getElementById('search').value.toLowerCase();
    let products = document.getElementsByClassName('product');
    let container = document.querySelector('.container');
    let pageContent = document.querySelector('.page-content');
    let homePage = document.getElementById('home-page');

    let found = false;
    showPage('home');

    for (let i = 0; i < products.length; i++) {
        let title = products[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
        if (title.includes(input)) {
            products[i].style.display = 'block';
            found = true;
        } else {
            products[i].style.display = 'none';
        }
    }

    container.style.display = found ? 'flex' : 'none';
    pageContent.innerText = found ? '' : 'No products found';
}

function showPage(page) {
    if (!isLoggedIn && page !== 'login' && page !== 'signup') {
        alert("Please login to access this page.");
        page = 'login'; // Redirect to login page
    }

    let homePage = document.getElementById('home-page');
    let contactPage = document.getElementById('contact-page');
    let aboutPage = document.getElementById('about-page');
    let cartPage = document.getElementById('cart-page');
    let loginPage = document.getElementById('login-page');
    let signupPage = document.getElementById('signup-page');
    let paymentPage = document.getElementById('payment-page');
    let pageContent = document.querySelector('.page-content');

    homePage.style.display = 'none';
    contactPage.style.display = 'none';
    aboutPage.style.display = 'none';
    cartPage.style.display = 'none';
    loginPage.style.display = 'none';
    signupPage.style.display = 'none';
    paymentPage.style.display = 'none';
    pageContent.innerText = '';

    if (page === 'home') {
        homePage.style.display = 'flex';
          // Show products on the home page
        let products = document.getElementsByClassName('product');
        for (let i = 0; i < products.length; i++) {
        products[i].style.display = 'block';
        }

    } else if (page === 'contact') {
        contactPage.style.display = 'block';
    } else if (page === 'about') {
        aboutPage.style.display = 'block';
    } else if (page === 'cart') {
        cartPage.style.display = 'block';
        updateCartPage();
        const payNowButton = document.getElementById('pay-now-button');
        payNowButton.addEventListener('click', showPaymentPage);

    } else if (page === 'login') {
        loginPage.style.display = 'block';
    } else if (page === 'signup') {
        signupPage.style.display = 'block';
    }
     else if (page === 'payment') {
        paymentPage.style.display = 'block';
    }
}

function showPaymentPage() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add items to checkout.");
        return;
    }
    console.log('showPaymentPage called');
    showPage('payment');
}



// User Authentication
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginError.classList.add('hidden');
            loginSuccess(data.user);
        } else {
            loginError.classList.remove('hidden');
            loginError.innerText = data.message || "Login failed";
        }
    } catch (error) {
        console.error("Login error:", error);
        loginError.classList.remove('hidden');
        loginError.innerText = "Login failed. Please try again.";
    }
});

document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const signupError = document.getElementById('signup-error');

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            signupError.classList.add('hidden');
            signupSuccess();
        } else {
            signupError.classList.remove('hidden');
            signupError.innerText = data.message || "Signup failed";
        }
    } catch (error) {
        console.error("Signup error:", error);
        signupError.classList.remove('hidden');
        signupError.innerText = "Signup failed. Please try again.";
    }
});

function loginSuccess(user) {
    isLoggedIn = true;
    currentUser = user;
    updateAuthUI();
    showPage('home');
}

function signupSuccess() {
    alert("Signup successful! Please login.");
    showPage('login');
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST'
        });

        if (response.ok) {
            isLoggedIn = false;
            currentUser = null;
            updateAuthUI();
            cart = [];
            updateCartCount();
            updateCartPage();
            showPage('home');
        } else {
            console.error("Logout failed:", response.status);
            alert("Logout failed. Please try again.");
        }
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
}

function updateAuthUI() {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const logoutLink = document.getElementById('logout-link');
    const userGreeting = document.getElementById('user-greeting');

    if (isLoggedIn) {
        loginLink.classList.add('hidden');
        signupLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');
        userGreeting.classList.remove('hidden');
        userGreeting.innerText = `Welcome, ${currentUser.email}!`;

    } else {
        loginLink.classList.remove('hidden');
        signupLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
        userGreeting.classList.add('hidden');
        userGreeting.innerText = '';
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    await checkAuthentication(); // First, check authentication
    showPage('login');  // Show login page first
    updateCartCount();
});
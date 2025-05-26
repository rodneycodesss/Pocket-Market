// ============== Database & State ==============
const state = {
  users: JSON.parse(localStorage.getItem('mockUsers')) || [],
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,
  products: JSON.parse(localStorage.getItem('products')) || [
    {
      id: 1,
      name: "Used iPhone Cover",
      price: "KSh 300",
      location: "Nairobi",
      image: "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=300",
      owner: null
    },
    {
      id: 2,
      name: "Homemade Mandazi",
      price: "KSh 50/ea",
      location: "Kibera",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300",
      owner: null
    },
    {
      id: 3,
      name: "Math Tutoring",
      price: "KSh 500/hr",
      location: "Online",
      image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300",
      owner: null
    }
  ],
  platforms: {
    facebookMarketplace: {
      name: "Facebook Marketplace",
      goodFor: ["physical"],
      audience: ["local", "city"],
      budget: ["none", "small"],
      tips: [
        "📌 Post clear photos with measurements",
        "📌 Share listings in local Facebook groups"
      ],
      reach: "🌍 Reach: ~1,000 people in your city"
    },
    jiji: {
      name: "Jiji",
      goodFor: ["physical", "snacks"],
      audience: ["city"],
      budget: ["none", "small"],
      tips: [
        "📌 Refresh your ad every 2 days",
        "📌 Price items 10% higher for bargaining"
      ],
      reach: "🌍 Reach: ~500 active buyers daily"
    },
    tiktok: {
      name: "TikTok",
      goodFor: ["digital", "skill"],
      audience: ["online"],
      budget: ["none", "small", "flexible"],
      tips: [
        "📌 Use trending sounds & hashtags",
        "📌 Post short demos of your service"
      ],
      reach: "🌍 Reach: Potential virality (1K+ views)"
    },
    whatsapp: {
      name: "WhatsApp Groups",
      goodFor: ["physical", "snacks"],
      audience: ["local"],
      budget: ["none"],
      tips: [
        "📌 Join 5+ 'Buy/Sell Nairobi' groups",
        "📌 Post in the evening (7-9pm)"
      ],
      reach: "🌍 Reach: ~200-500 per group"
    }
  }
};

// ============== Core Functions ==============
function saveToStorage() {
  localStorage.setItem('mockUsers', JSON.stringify(state.users));
  localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
  localStorage.setItem('products', JSON.stringify(state.products));
}

function signUp(email, password) {
  if (state.users.some(u => u.email === email)) {
    return { success: false, error: "Email already exists" };
  }
  
  state.users.push({ 
    email, 
    password, 
    products: [],
    createdAt: new Date().toISOString()
  });
  saveToStorage();
  return { success: true };
}

function login(email, password) {
  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, error: "Invalid credentials" };
  
  state.currentUser = { email };
  saveToStorage();
  return { success: true };
}

function logout() {
  state.currentUser = null;
  saveToStorage();
}

function addProduct(product) {
  const newProduct = {
    ...product,
    id: Date.now(),
    owner: state.currentUser.email,
    date: new Date().toISOString()
  };
  
  state.products.unshift(newProduct);
  
  // Add to user's products
  const user = state.users.find(u => u.email === state.currentUser.email);
  if (user) {
    user.products.push(newProduct.id);
  }
  
  saveToStorage();
  return newProduct;
}

function deleteProduct(productId) {
  state.products = state.products.filter(p => p.id !== productId);
  
  // Remove from user's products
  const user = state.users.find(u => u.email === state.currentUser?.email);
  if (user) {
    user.products = user.products.filter(id => id !== productId);
  }
  
  saveToStorage();
}

function getRecommendations(productType, target, budget) {
  return Object.values(state.platforms).filter(platform => 
    platform.goodFor.includes(productType) &&
    platform.audience.includes(target) &&
    platform.budget.includes(budget)
  ).slice(0, 3);
}

// ============== UI Functions ==============
function updateAuthUI() {
  const { currentUser } = state;
  
  // Auth buttons
  document.getElementById('signupBtn').classList.toggle('hidden', !!currentUser);
  document.getElementById('loginBtn').classList.toggle('hidden', !!currentUser);
  document.getElementById('logoutBtn').classList.toggle('hidden', !currentUser);
  
  // Dashboard
  document.getElementById('sellerDashboard').classList.toggle('hidden', !currentUser);
  
  if (currentUser) {
    document.getElementById('userEmail').textContent = currentUser.email;
    renderUserProducts();
  }
}

function renderProducts() {
  const container = document.getElementById('products');
  // If user is not logged in, show local featured products
  if (!state.currentUser) {
    renderLocalFeaturedProducts();
    return;
  }
  // If user is logged in, show their products
  container.innerHTML = state.products.map(product => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg">${product.name}</h3>
        <p class="text-green-600 font-medium">${product.price}</p>
        <p class="text-gray-500 text-sm">${product.location}</p>
        ${product.owner === state.currentUser?.email ? `
          <button onclick="handleDeleteProduct(${product.id})" 
                  class="mt-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition">
            Delete
          </button>
        ` : `
          <button class="mt-2 bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition">
            Buy Now
          </button>
        `}
      </div>
    </div>
  `).join('');
}

function renderUserProducts() {
  if (!state.currentUser) return;
  
  const user = state.users.find(u => u.email === state.currentUser.email);
  if (!user) return;
  
  const userProducts = state.products.filter(p => p.owner === state.currentUser.email);
  const container = document.getElementById('userProductsList');
  
  container.innerHTML = userProducts.length > 0 
    ? userProducts.map(product => `
        <div class="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h4 class="font-bold">${product.name}</h4>
            <p class="text-sm text-gray-500">${new Date(product.date).toLocaleDateString()}</p>
          </div>
          <button onclick="handleDeleteProduct(${product.id})" 
                  class="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      `).join('')
    : `<p class="text-gray-500">You haven't listed any products yet</p>`;
}

function showRecommendationResults(results) {
  const container = document.getElementById('results');
  
  container.innerHTML = results.length > 0
    ? `<h3 class="font-bold text-lg mb-4">Recommended Platforms</h3>
       ${results.map(platform => `
         <div class="mb-6 p-4 bg-blue-50 rounded-lg">
           <h4 class="font-bold text-blue-800">${platform.name}</h4>
           <ul class="mt-2 space-y-1">
             ${platform.tips.map(tip => `<li class="flex items-start">
               <span class="mr-2">•</span> ${tip}
             </li>`).join('')}
           </ul>
           <p class="mt-2 text-sm">${platform.reach}</p>
         </div>
       `).join('')}`
    : `<p class="text-red-500">No platforms match your criteria. Try different options.</p>`;
}

// Render hand-crafted, youth-focused local products in the Featured Listings section
function renderLocalFeaturedProducts() {
  const productsContainer = document.getElementById('products');
  if (!productsContainer) return;

  const localProducts = [
    {
      title: "Beaded Maasai Bracelets",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      description: "Handmade colorful bracelets by Nairobi youth. Perfect for casual wear and gifts.",
      price: 250
    },
    {
      title: "Custom Phone Covers",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      description: "Trendy, hand-painted phone covers made by campus students.",
      price: 400
    },
    {
      title: "Handmade Ankara Tote Bags",
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
      description: "Eco-friendly Ankara tote bags crafted by young artisans. Stylish and practical for everyday use.",
      price: 350
    },
    {
      title: "Personalized Keyholders",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
      description: "Unique wooden keyholders, hand-carved and painted by young artisans.",
      price: 200
    },
    {
      title: "Graphic Design Posters",
      image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
      description: "Custom digital posters for events, designed by student creatives.",
      price: 350
    },
    {
      title: "Crochet Bucket Hats",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      description: "Trendy crochet hats, handmade by youth groups in Kisumu.",
      price: 500
    }
  ];

  productsContainer.innerHTML = localProducts.map(product => `
    <div class="bg-white rounded-xl shadow-md p-6 flex flex-col">
      <img src="${product.image}" alt="${product.title}" class="h-40 object-cover mb-4 mx-auto rounded-lg">
      <h3 class="font-bold text-lg mb-2">${product.title}</h3>
      <p class="text-gray-600 mb-2">${product.description}</p>
      <div class="mt-auto flex items-center justify-between">
        <span class="text-primary font-bold text-xl">KSh ${product.price.toLocaleString()}</span>
        <a href="#" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition text-sm">View</a>
      </div>
    </div>
  `).join('');
}

// ============== Event Handlers ==============
function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if (password !== confirm) {
    document.getElementById('authError').textContent = "Passwords don't match";
    return;
  }
  
  const result = signUp(email, password);
  if (result.success) {
    document.getElementById('authModal').classList.add('hidden');
    alert('Account created! Please log in.');
    document.getElementById('authError').textContent = '';
    document.getElementById('signupForm').reset();
  } else {
    document.getElementById('authError').textContent = result.error;
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const result = login(email, password);
  if (result.success) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('authError').textContent = '';
    document.getElementById('loginForm').reset();
    updateAuthUI();
  } else {
    document.getElementById('authError').textContent = result.error;
  }
}

function handleLogout() {
  logout();
  updateAuthUI();
}

function handleAddProduct() {
  const name = prompt("Product name:");
  if (!name) return;
  
  const price = prompt("Price (e.g. KSh 300):");
  const location = prompt("Location:");
  
  const newProduct = addProduct({
    name,
    price: price || "Negotiable",
    location: location || "Nairobi",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" // Default image
  });
  
  renderProducts();
  renderUserProducts();
}

function handleDeleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    deleteProduct(productId);
    renderProducts();
    renderUserProducts();
  }
}

function handleRecommendationSubmit(e) {
  e.preventDefault();
  const productType = document.getElementById('productType').value;
  const targetBuyer = document.getElementById('targetBuyer').value;
  const budget = document.getElementById('budget').value;
  
  if (!productType || !targetBuyer || !budget) {
    alert("Please fill all fields");
    return;
  }
  
  const results = getRecommendations(productType, targetBuyer, budget);
  showRecommendationResults(results);
}

// ============== Initialize ==============
function init() {
  // Event listeners
  document.getElementById('signupForm').addEventListener('submit', handleSignup);
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('addProductBtn').addEventListener('click', handleAddProduct);
  document.getElementById('recommendationForm').addEventListener('submit', handleRecommendationSubmit);
  
  // Modal controls
  document.querySelectorAll('[data-toggle-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('authModal').classList.toggle('hidden');
    });
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('authModal').classList.add('hidden');
  });
  
  // Password reset toggle
  document.getElementById('resetPassword').addEventListener('click', () => {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('resetPasswordForm').style.display = 'block';
  });
  
  document.getElementById('backToLogin').addEventListener('click', () => {
    document.getElementById('authForms').style.display = 'block';
    document.getElementById('resetPasswordForm').style.display = 'none';
  });
  
  // Make functions available globally
  window.handleDeleteProduct = handleDeleteProduct;
  
  // Initial render
  renderProducts();
  updateAuthUI();
}

// Start the app
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('recommendationForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form values
      const productType = document.getElementById('productType').value;
      const targetBuyer = document.getElementById('targetBuyer').value;
      const budget = document.getElementById('budget').value;

      // Simple demo recommendations
      let recommendations = [];
      if (productType === "physical" && targetBuyer === "local") {
        recommendations.push("Try WhatsApp groups and Jiji for local buyers.");
      } else if (productType === "digital" && targetBuyer === "online") {
        recommendations.push("Try Instagram and Facebook for digital services.");
      } else if (productType === "snacks") {
        recommendations.push("Use WhatsApp status and local Facebook groups.");
      } else if (productType && targetBuyer && budget) {
        recommendations.push("Try a mix of Jiji, Facebook, and WhatsApp depending on your product.");
      } else {
        recommendations.push("Please fill all fields for a recommendation.");
      }

      // Show results
      document.getElementById('results').innerHTML =
        recommendations.map(r => `<div class="p-4 bg-green-50 rounded mb-2">${r}</div>`).join('');
    });
  }
});
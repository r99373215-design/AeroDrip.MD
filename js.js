const cartButton = document.querySelector(".cart-button");
const cart = document.querySelector("#cart");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const payButton = document.querySelector("#pay-button");
const orderButtons = document.querySelectorAll(".comanda");
const closeCart = document.querySelector(".close-cart");
const backToCart = document.querySelector("#back-to-cart");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutMessage = document.querySelector("#checkout-message");
const clientName = document.querySelector("#client-name");
const clientPhone = document.querySelector("#client-phone");
const clientEmail = document.querySelector("#client-email");
const clientContact = document.querySelector("#client-contact");
const clientAddress = document.querySelector("#client-address");
const clientCity = document.querySelector("#client-city");
const clientNotes = document.querySelector("#client-notes");
const shopEmail = "r99373215@gmail.com";
const formSubmitEndpoint = `https://formsubmit.co/ajax/${shopEmail}`;

const productsInCart = [];

function moveTo(id) {
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

function getProduct(button) {
  const product = button.closest(".product");
  const name = product.querySelector(".descr").innerText.trim();
  const priceText = product.querySelector(".price").innerText;
  const price = Number(priceText.replace(/\D/g, ""));

  return {
    name,
    price,
  };
}

function updateCart() {
  const total = productsInCart.reduce((sum, product) => sum + product.price, 0);

  cartCount.innerText = productsInCart.length;
  cartTotal.innerText = `${total} MDL`;

  if (productsInCart.length === 0) {
    cartItems.innerText = "Cosul este gol.";
    return;
  }

  cartItems.innerHTML = productsInCart
    .map((product) => `
      <div class="cart-item">
        <span>${product.name}</span>
        <span>${product.price} MDL</span>
      </div>
    `)
    .join("");
}

cartButton.addEventListener("click", () => {
  cart.classList.toggle("open");
});

closeCart.addEventListener("click", () => {
  cart.classList.remove("open");
  cart.classList.remove("checkout-open");
});

backToCart.addEventListener("click", () => {
  cart.classList.remove("checkout-open");
});

orderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    productsInCart.push(getProduct(button));
    updateCart();
    cart.classList.add("open");
  });
});

payButton.addEventListener("click", () => {
  const total = productsInCart.reduce((sum, product) => sum + product.price, 0);

  if (total === 0) {
    alert("Cosul este gol.");
    return;
  }

  checkoutMessage.innerText = "";
  checkoutMessage.className = "checkout-message";
  cart.classList.add("checkout-open");
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (window.location.protocol === "file:") {
    window.location.href = "http://localhost:5500/html.html";
    return;
  }

  const total = productsInCart.reduce((sum, product) => sum + product.price, 0);
  const orderNumber = `AD-${Date.now().toString().slice(-6)}`;
  const itemsText = productsInCart
    .map((product) => `- ${product.name}: ${product.price} MDL`)
    .join("\n");

  const order = {
    orderNumber,
    items: [...productsInCart],
    total,
    client: {
      name: clientName.value,
      phone: clientPhone.value,
      email: clientEmail.value,
      contact: clientContact.value,
      address: clientAddress.value,
      city: clientCity.value,
      notes: clientNotes.value,
    },
    payment: {
      status: "waiting for manual transfer",
      details: "Payment details will be sent by AeroDrip.MD.",
    },
    createdAt: new Date().toISOString(),
  };

  const savedOrders = JSON.parse(localStorage.getItem("aerodripOrders") || "[]");
  savedOrders.push(order);
  localStorage.setItem("aerodripOrders", JSON.stringify(savedOrders));

  const emailData = {
    _subject: `Comanda ${orderNumber} - AeroDrip.MD`,
    _template: "table",
    _captcha: "false",
    orderNumber,
    produse: itemsText,
    total: `${total} MDL`,
    nume: clientName.value,
    telefon: clientPhone.value,
    email: clientEmail.value,
    contact: clientContact.value || "-",
    adresa: clientAddress.value,
    oras: clientCity.value,
    detalii: clientNotes.value || "-",
    plata: "Clientul asteapta detaliile pentru transfer. Trimite-i datele de plata doar prin mesaj privat.",
  };

  checkoutMessage.innerText = "Se trimite comanda...";
  checkoutMessage.className = "checkout-message";

  try {
    const response = await fetch(formSubmitEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error("Order email failed");
    }

    checkoutMessage.innerText = `Comanda ${orderNumber} a fost trimisa. Te contactam rapid cu detaliile de plata.`;
    checkoutMessage.className = "checkout-message success";
    checkoutForm.reset();
    productsInCart.length = 0;
    updateCart();
  } catch (error) {
    checkoutMessage.innerText = "Nu am putut trimite automat. Te rugam sa ne scrii pe Instagram/Viber cu produsul dorit.";
    checkoutMessage.className = "checkout-message error";
  }
});

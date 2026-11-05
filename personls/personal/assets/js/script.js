const STORAGE_KEY = "invoicegen_invoices";
const CURRENT_INVOICE_KEY = "invoicegen_current";

const elements = {
  invoiceNumber: document.getElementById("invoice-number"),
  invoiceDate: document.getElementById("invoice-date"),
  clientName: document.getElementById("client-name"),
  clientEmail: document.getElementById("client-email"),
  taxRate: document.getElementById("tax-rate"),
  discount: document.getElementById("discount"),
  itemsBody: document.getElementById("items-body"),
  addItemBtn: document.getElementById("add-item-btn"),
  subtotalEl: document.getElementById("subtotal"),
  taxEl: document.getElementById("tax-amount"),
  discountEl: document.getElementById("discount-amount"),
  grandTotalEl: document.getElementById("grand-total"),
  saveBtn: document.getElementById("save-invoice-btn"),
  printBtn: document.getElementById("print-invoice-btn"),
  clearBtn: document.getElementById("clear-invoice-btn"),
  previewCard: document.getElementById("invoice-preview"),
  closePreview: document.getElementById("close-preview"),
  previewInvoiceNumber: document.getElementById("preview-invoice-number"),
  previewInvoiceDate: document.getElementById("preview-invoice-date"),
  previewClientName: document.getElementById("preview-client-name"),
  previewClientEmail: document.getElementById("preview-client-email"),
  previewItemsBody: document.getElementById("preview-items-body"),
  previewSubtotal: document.getElementById("preview-subtotal"),
  previewTax: document.getElementById("preview-tax"),
  previewDiscount: document.getElementById("preview-discount"),
  previewGrandTotal: document.getElementById("preview-grand-total"),
  navLinks: document.querySelectorAll(".nav-link"),
  sections: document.querySelectorAll(".section"),
  mobileMenuBtn: document.getElementById("mobile-menu-btn"),
  navLinksContainer: document.getElementById("nav-links"),
  themeToggle: document.getElementById("theme-toggle"),
  contactForm: document.getElementById("contact-form"),
  contactSubmitBtn: document.getElementById("contact-submit-btn"),
  contactStatus: document.getElementById("contact-status"),
  dashboardBody: document.getElementById("dashboard-body"),
  dashboardSearch: document.getElementById("dashboard-search"),
  dashboardTableWrapper: document.getElementById("dashboard-table-wrapper"),
  dashboardEmpty: document.getElementById("dashboard-empty"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalTitle: document.getElementById("modal-title"),
  modalMessage: document.getElementById("modal-message"),
  modalConfirm: document.getElementById("modal-confirm"),
  modalCancel: document.getElementById("modal-cancel"),
  exportAllBtn: document.getElementById("export-all-btn"),
};

let state = {
  invoices: [],
  currentInvoice: {
    number: "PKV-" + String(Math.floor(1000 + Math.random() * 9000)),
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientEmail: "",
    taxRate: 0,
    discount: 0,
    items: [],
  },
  confirmCallback: null,
};

function init() {
  loadFromStorage();
  renderCurrentInvoice();
  renderDashboard();

  elements.invoiceNumber.addEventListener("input", (e) => {
    state.currentInvoice.number = e.target.value;
    updatePreview();
    saveCurrentToStorage();
  });

  elements.invoiceDate.addEventListener("input", (e) => {
    state.currentInvoice.date = e.target.value;
    updatePreview();
    saveCurrentToStorage();
  });

  elements.clientName.addEventListener("input", (e) => {
    state.currentInvoice.clientName = e.target.value;
    updatePreview();
    saveCurrentToStorage();
  });

  elements.clientEmail.addEventListener("input", (e) => {
    state.currentInvoice.clientEmail = e.target.value;
    updatePreview();
    saveCurrentToStorage();
  });

  elements.taxRate.addEventListener("input", (e) => {
    state.currentInvoice.taxRate = parseFloat(e.target.value) || 0;
    calculateTotals();
    updatePreview();
    saveCurrentToStorage();
  });

  elements.discount.addEventListener("input", (e) => {
    state.currentInvoice.discount = parseFloat(e.target.value) || 0;
    calculateTotals();
    updatePreview();
    saveCurrentToStorage();
  });

  elements.addItemBtn.addEventListener("click", addItem);
  elements.saveBtn.addEventListener("click", saveInvoice);
  elements.printBtn.addEventListener("click", printInvoice);
  elements.clearBtn.addEventListener("click", () => {
    showModal("Clear Invoice", "Are you sure you want to clear all items and details?", () => {
      clearInvoice();
    });
  });
  elements.closePreview.addEventListener("click", () => {
    elements.previewCard.style.display = "none";
  });

  elements.mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = e.target.getAttribute("href").slice(1);
      switchSection(section);
      elements.navLinksContainer.classList.remove("open");
    });
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.contactForm.addEventListener("submit", handleContactSubmit);
  elements.dashboardSearch.addEventListener("input", renderDashboard);
  elements.exportAllBtn.addEventListener("click", exportAllInvoices);

  elements.modalCancel.addEventListener("click", closeModal);
  elements.modalOverlay.addEventListener("click", (e) => {
    if (e.target === elements.modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  applyTheme();
  window.addEventListener("beforeunload", saveCurrentToStorage);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.invoices = JSON.parse(raw);
    const currentRaw = localStorage.getItem(CURRENT_INVOICE_KEY);
    if (currentRaw) state.currentInvoice = JSON.parse(currentRaw);
    const theme = localStorage.getItem("invoicegen_theme");
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  } catch (err) {
    console.error("Failed to load from storage:", err);
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.invoices));
  } catch (err) {
    console.error("Failed to save invoices:", err);
  }
}

function saveCurrentToStorage() {
  try {
    localStorage.setItem(CURRENT_INVOICE_KEY, JSON.stringify(state.currentInvoice));
  } catch (err) {
    console.error("Failed to save current invoice:", err);
  }
}

function addItem() {
  state.currentInvoice.items.push({
    id: Date.now(),
    description: "",
    quantity: 1,
    rate: 0,
  });
  renderItems();
  calculateTotals();
  updatePreview();
  saveCurrentToStorage();
}

function removeItem(id) {
  state.currentInvoice.items = state.currentInvoice.items.filter((item) => item.id !== id);
  renderItems();
  calculateTotals();
  updatePreview();
  saveCurrentToStorage();
}

function updateItemField(id, field, value) {
  const item = state.currentInvoice.items.find((i) => i.id === id);
  if (!item) return;
  item[field] = field === "quantity" || field === "rate" ? parseFloat(value) || 0 : value;
  calculateTotals();
  updatePreview();
  saveCurrentToStorage();
}

function renderItems() {
  elements.itemsBody.innerHTML = "";
  state.currentInvoice.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <input type="text" class="item-description" value="${escapeHtml(item.description)}" placeholder="Description" />
      </td>
      <td>
        <input type="number" class="item-quantity" value="${item.quantity}" min="0" step="1" />
      </td>
      <td>
        <input type="number" class="item-rate" value="${item.rate}" min="0" step="0.01" />
      </td>
      <td class="text-right item-amount">${formatCurrency(calculateItemAmount(item))}</td>
      <td class="actions-col">
        <button class="btn-remove-item" aria-label="Remove item" data-id="${item.id}">×</button>
      </td>
    `;
    row.querySelector(".item-description").addEventListener("input", (e) => updateItemField(item.id, "description", e.target.value));
    row.querySelector(".item-quantity").addEventListener("input", (e) => {
      updateItemField(item.id, "quantity", e.target.value);
      row.querySelector(".item-amount").textContent = formatCurrency(calculateItemAmount(item));
    });
    row.querySelector(".item-rate").addEventListener("input", (e) => {
      updateItemField(item.id, "rate", e.target.value);
      row.querySelector(".item-amount").textContent = formatCurrency(calculateItemAmount(item));
    });
    row.querySelector(".btn-remove-item").addEventListener("click", () => removeItem(item.id));
    elements.itemsBody.appendChild(row);
  });
}

function calculateItemAmount(item) {
  return (item.quantity || 0) * (item.rate || 0);
}

function calculateTotals() {
  const subtotal = state.currentInvoice.items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const tax = subtotal * (state.currentInvoice.taxRate / 100);
  const discount = state.currentInvoice.discount || 0;
  const grandTotal = subtotal + tax - discount;

  elements.subtotalEl.textContent = formatCurrency(subtotal);
  elements.taxEl.textContent = formatCurrency(tax);
  elements.discountEl.textContent = "-" + formatCurrency(discount);
  elements.grandTotalEl.textContent = formatCurrency(grandTotal);

  state.currentInvoice.subtotal = subtotal;
  state.currentInvoice.tax = tax;
  state.currentInvoice.grandTotal = grandTotal;
}

function formatCurrency(value) {
  return "Rs " + new Intl.NumberFormat("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function updatePreview() {
  elements.previewInvoiceNumber.textContent = state.currentInvoice.number || "PKV-0001";
  elements.previewInvoiceDate.textContent = state.currentInvoice.date || "";
  elements.previewClientName.textContent = state.currentInvoice.clientName || "Client Name";
  elements.previewClientEmail.textContent = state.currentInvoice.clientEmail || "client@example.com";

  elements.previewItemsBody.innerHTML = "";
  state.currentInvoice.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(item.description || "-")}</td>
      <td class="text-right">${item.quantity || 0}</td>
      <td class="text-right">${formatCurrency(item.rate || 0)}</td>
      <td class="text-right">${formatCurrency(calculateItemAmount(item))}</td>
    `;
    elements.previewItemsBody.appendChild(row);
  });

  elements.previewSubtotal.textContent = formatCurrency(state.currentInvoice.subtotal || 0);
  elements.previewTax.textContent = formatCurrency(state.currentInvoice.tax || 0);
  elements.previewDiscount.textContent = "-" + formatCurrency(state.currentInvoice.discount || 0);
  elements.previewGrandTotal.textContent = formatCurrency(state.currentInvoice.grandTotal || 0);
}

function renderCurrentInvoice() {
  elements.invoiceNumber.value = state.currentInvoice.number;
  elements.invoiceDate.value = state.currentInvoice.date;
  elements.clientName.value = state.currentInvoice.clientName;
  elements.clientEmail.value = state.currentInvoice.clientEmail;
  elements.taxRate.value = state.currentInvoice.taxRate;
  elements.discount.value = state.currentInvoice.discount;
  renderItems();
  calculateTotals();
  updatePreview();
}

function clearInvoice() {
  state.currentInvoice = {
    number: "PKV-" + String(Math.floor(1000 + Math.random() * 9000)),
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientEmail: "",
    taxRate: 0,
    discount: 0,
    items: [],
  };
  renderCurrentInvoice();
  elements.previewCard.style.display = "none";
}

function saveInvoice() {
  if (!state.currentInvoice.clientName.trim()) {
    showModal("Error", "Please enter a client name before saving.");
    return;
  }
  if (state.currentInvoice.items.length === 0) {
    showModal("Error", "Please add at least one item before saving.");
    return;
  }

  const invoice = {
    ...state.currentInvoice,
    id: Date.now(),
    savedAt: new Date().toISOString(),
  };

  state.invoices.unshift(invoice);
  saveToStorage();
  renderDashboard();
  showModal("Saved", "Invoice saved successfully!");
}

function printInvoice() {
  if (state.currentInvoice.items.length === 0) {
    showModal("Error", "No items to print. Add items first.");
    return;
  }
  elements.previewCard.style.display = "block";
  window.print();
}

function renderDashboard() {
  const search = elements.dashboardSearch.value.toLowerCase();
  const filtered = state.invoices.filter((inv) =>
    (inv.number || "").toLowerCase().includes(search) ||
    (inv.clientName || "").toLowerCase().includes(search)
  );

  elements.dashboardBody.innerHTML = "";
  if (filtered.length === 0) {
    elements.dashboardBody.innerHTML = `<tr><td colspan="5" class="empty-state">No invoices found.</td></tr>`;
    return;
  }

  filtered.forEach((inv) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${escapeHtml(inv.number)}</strong></td>
      <td>${escapeHtml(inv.clientName)}</td>
      <td>${new Date(inv.date).toLocaleDateString()}</td>
      <td class="text-right">${formatCurrency(inv.grandTotal || 0)}</td>
      <td class="actions-col">
        <button class="btn btn-icon btn-sm view-invoice" data-id="${inv.id}" title="View">👁️</button>
        <button class="btn btn-icon btn-sm delete-invoice" data-id="${inv.id}" title="Delete">🗑️</button>
      </tr>
    `;
    row.querySelector(".view-invoice").addEventListener("click", () => loadInvoiceForEditing(inv.id));
    row.querySelector(".delete-invoice").addEventListener("click", () => {
      showModal("Delete Invoice", "Are you sure you want to delete this invoice?", () => {
        deleteInvoice(inv.id);
      });
    });
    elements.dashboardBody.appendChild(row);
  });
}

function loadInvoiceForEditing(id) {
  const inv = state.invoices.find((i) => i.id === id);
  if (!inv) return;
  state.currentInvoice = { ...inv, items: [...inv.items] };
  delete state.currentInvoice.id;
  delete state.currentInvoice.savedAt;
  renderCurrentInvoice();
  switchSection("generator");
}

function deleteInvoice(id) {
  state.invoices = state.invoices.filter((i) => i.id !== id);
  saveToStorage();
  renderDashboard();
  showModal("Deleted", "Invoice deleted successfully.");
}

function exportAllInvoices() {
  if (state.invoices.length === 0) {
    showModal("Error", "No invoices to export.");
    return;
  }
  const data = JSON.stringify(state.invoices, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices_export.json";
  a.click();
  URL.revokeObjectURL(url);
  showModal("Exported", "All invoices exported to invoices_export.json");
}

function switchSection(sectionId) {
  elements.sections.forEach((sec) => sec.classList.remove("active-section"));
  elements.navLinks.forEach((link) => link.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active-section");
  const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
  if (activeLink) activeLink.classList.add("active");
}

function toggleMobileMenu() {
  if (window.innerWidth > 768) {
    switchSection("generator");
    return;
  }
  const isOpen = elements.navLinksContainer.classList.contains("open");
  if (isOpen) {
    elements.navLinksContainer.classList.remove("open");
    elements.mobileMenuBtn.setAttribute("aria-expanded", "false");
  } else {
    elements.navLinksContainer.classList.add("open");
    elements.mobileMenuBtn.setAttribute("aria-expanded", "true");
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("invoicegen_theme", newTheme);
}

function applyTheme() {
  const theme = localStorage.getItem("invoicegen_theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
}

function showModal(title, message, onConfirm) {
  elements.modalTitle.textContent = title;
  elements.modalMessage.textContent = message;
  elements.modalOverlay.classList.add("open");
  elements.confirmCallback = onConfirm;
  elements.modalConfirm.onclick = () => {
    if (onConfirm) onConfirm();
    closeModal();
  };
}

function closeModal() {
  elements.modalOverlay.classList.remove("open");
  elements.confirmCallback = null;
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const message = document.getElementById("contact-message").value.trim();

  if (!name || !email || !message) {
    showModal("Error", "Please fill in all fields.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showModal("Invalid Email", "Please enter a valid email address.");
    return;
  }

  const disposableDomains = [
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
    "tempmail.com",
    "fakeinbox.com",
    "trashmail.com",
    "yopmail.com",
    "temp-mail.org",
  ];
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (disposableDomains.includes(emailDomain)) {
    showModal("Invalid Email", "Please use a real email address, not a temporary one.");
    return;
  }

  const formData = new FormData(e.target);
  elements.contactSubmitBtn.disabled = true;
  elements.contactSubmitBtn.textContent = "Sending...";
  elements.contactStatus.textContent = "";

  fetch(e.target.action, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        elements.contactStatus.textContent = "Message sent successfully!";
        elements.contactStatus.style.color = "var(--color-success)";
        elements.contactForm.reset();
        showModal("Message Sent", "Thank you " + name + "! Your message has been received.");
      } else {
        throw new Error("Failed to send message");
      }
    })
    .catch((error) => {
      elements.contactStatus.textContent = "Failed to send message. Please try again.";
      elements.contactStatus.style.color = "var(--color-error)";
    })
    .finally(() => {
      elements.contactSubmitBtn.disabled = false;
      elements.contactSubmitBtn.textContent = "Send Message";
    });
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzlOa4LiXwAyp2-anJnJyowu92Bsb4KLsjTFGpummhc9X_b87JJQBwbj2VlfNft9h0p/exec";

let stockSesi1 = 30;
let stockSesi2 = 30;
let isAllSoldOut = false;

const pageLanding = document.getElementById('page-landing');
const pageForm = document.getElementById('page-form');
const btnToForm = document.getElementById('btn-to-form');

const displaySesi1 = document.getElementById('stock-sesi1');
const displaySesi2 = document.getElementById('stock-sesi2');
const cardSesi1 = document.getElementById('card-sesi1');
const cardSesi2 = document.getElementById('card-sesi2');

const ticketForm = document.getElementById('ticket-form');
const sessionSelect = document.getElementById('session');
const qtySelect = document.getElementById('qty');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

document.addEventListener('DOMContentLoaded', fetchAllStock);

// Mengambil stok Sesi 1 dan Sesi 2
function fetchAllStock() {
  fetch(`${GOOGLE_SCRIPT_URL}?session=Sesi%201`)
    .then(r => r.json())
    .then(data1 => {
      stockSesi1 = data1.stock;
      return fetch(`${GOOGLE_SCRIPT_URL}?session=Sesi%202`);
    })
    .then(r => r.json())
    .then(data2 => {
      stockSesi2 = data2.stock;

      // Cek stok seluruh sesi
      if (stockSesi1 <= 0 && stockSesi2 <= 0) {
        isAllSoldOut = true;
        btnToForm.textContent = "TIKET HABIS!";
        btnToForm.classList.add('sold-out');
      } else {
        isAllSoldOut = false;
        btnToForm.textContent = "BELI TIKET";
        btnToForm.classList.remove('sold-out');
      }

      updateStockDisplayUI();
    })
    .catch(err => console.error("Error fetching stock:", err));
}

// Update Tampilan Stok Sesi 1 & Sesi 2 Berdampingan
function updateStockDisplayUI() {
  // Sesi 1
  if (stockSesi1 <= 0) {
    displaySesi1.textContent = "HABIS";
    cardSesi1.classList.add('sold-out-card');
  } else {
    displaySesi1.textContent = stockSesi1;
    cardSesi1.classList.remove('sold-out-card');
  }

  // Sesi 2
  if (stockSesi2 <= 0) {
    displaySesi2.textContent = "HABIS";
    cardSesi2.classList.add('sold-out-card');
  } else {
    displaySesi2.textContent = stockSesi2;
    cardSesi2.classList.remove('sold-out-card');
  }

  // Validasi sesi yang dipilih di dropdown
  const selectedSession = sessionSelect.value;
  const activeStock = (selectedSession === "Sesi 1") ? stockSesi1 : stockSesi2;

  if (activeStock <= 0) {
    submitBtn.disabled = true;
    submitBtn.textContent = `Tiket ${selectedSession} Habis`;
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "BELI TIKET SEKARANG";
  }
}

btnToForm.addEventListener('click', () => {
  if (isAllSoldOut) {
    alert("Maaf banget, tiket untuk semua sesi sudah HABIS TERJUAL! 🙏");
    return;
  }

  pageLanding.classList.remove('active');
  pageForm.classList.add('active');
  updateStockDisplayUI();
});

sessionSelect.addEventListener('change', updateStockDisplayUI);

ticketForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const selectedSession = sessionSelect.value;
  const activeStock = (selectedSession === "Sesi 1") ? stockSesi1 : stockSesi2;
  const requestedQty = parseInt(qtySelect.value);

  if (requestedQty > activeStock) {
    showMessage(`Gagal! Sisa tiket ${selectedSession} hanya ${activeStock}.`, 'error');
    return;
  }

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    discord: document.getElementById('discord').value,
    session: selectedSession,
    qty: requestedQty
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Mengirim Data...";

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(formData)
  })
  .then(() => {
    showMessage(`Berhasil! ${requestedQty} tiket ${formData.session} dipesan.`, 'success');
    ticketForm.reset();
    setTimeout(fetchAllStock, 1500);
  })
  .catch(error => {
    console.error('Error:', error);
    showMessage('Terjadi kesalahan saat mengirim data.', 'error');
    fetchAllStock();
  });
});

function showMessage(msg, type) {
  statusMessage.textContent = msg;
  statusMessage.className = `message ${type}`;
}

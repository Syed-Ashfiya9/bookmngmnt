// app.js
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// 1. Firebase config (REPLACE with your config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const booksColRef = collection(db, "books");

// DOM elements
const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");
const emptyMessage = document.getElementById("emptyMessage");

// Modal elements
const modal = document.getElementById("detailsModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalPrice = document.getElementById("modalPrice");

// 3. Handle Add Book form submit
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!title || !author || isNaN(price) || !imageUrl) {
    alert("Please fill all fields correctly.");
    return;
  }

  try {
    await addDoc(booksColRef, {
      title,
      author,
      price,
      coverImageURL: imageUrl,
    });

    // Clear the form
    bookForm.reset();
  } catch (error) {
    console.error("Error adding book:", error);
    alert("Failed to add book. Check console for details.");
  }
});

// 4. Realtime listener for books collection
onSnapshot(booksColRef, (snapshot) => {
  const books = [];
  snapshot.forEach((docSnap) => {
    books.push({ id: docSnap.id, ...docSnap.data() });
  });

  renderBooks(books);
});

// 5. Render books in the UI (cards, 3 per row via CSS grid)
function renderBooks(books) {
  booksContainer.innerHTML = "";

  if (!books.length) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = book.coverImageURL;
    img.alt = book.title;

    const titleEl = document.createElement("div");
    titleEl.className = "card-title";
    titleEl.textContent = book.title;

    const authorEl = document.createElement("div");
    authorEl.className = "card-author";
    authorEl.textContent = By: ${book.author};

    const priceEl = document.createElement("div");
    priceEl.className = "card-price";
    priceEl.textContent = Price: ₹${book.price};

    const actions = document.createElement("div");
    actions.className = "card-actions";

    // Update Author button
    const updateBtn = document.createElement("button");
    updateBtn.className = "btn small update";
    updateBtn.textContent = "Update Author";
    updateBtn.addEventListener("click", () => handleUpdateAuthor(book));

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn small delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDelete(book.id));

    // View Details button
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn small view";
    viewBtn.textContent = "View Details";
    viewBtn.addEventListener("click", () => openModal(book));

    actions.appendChild(updateBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(viewBtn);

    card.appendChild(img);
    card.appendChild(titleEl);
    card.appendChild(authorEl);
    card.appendChild(priceEl);
    card.appendChild(actions);

    booksContainer.appendChild(card);
  });
}

// 6. Update Author handler
async function handleUpdateAuthor(book) {
  const newAuthor = prompt("Enter new author name:", book.author);
  if (newAuthor === null) return; // user cancelled
  const trimmed = newAuthor.trim();
  if (!trimmed) {
    alert("Author name cannot be empty.");
    return;
  }

  try {
    const docRef = doc(db, "books", book.id);
    await updateDoc(docRef, { author: trimmed });
  } catch (error) {
    console.error("Error updating author:", error);
    alert("Failed to update author.");
  }
}

// 7. Delete handler
async function handleDelete(id) {
  const confirmDelete = confirm("Are you sure you want to delete this book?");
  if (!confirmDelete) return;

  try {
    const docRef = doc(db, "books", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting book:", error);
    alert("Failed to delete book.");
  }
}

// 8. Modal logic for View Details
function openModal(book) {
  modalImage.src = book.coverImageURL;
  modalTitle.textContent = book.title;
  modalAuthor.textContent = By: ${book.author};
  modalPrice.textContent = Price: ₹${book.price};
  modal.style.display = "flex";
}

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
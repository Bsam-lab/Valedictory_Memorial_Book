import { db, auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
// Get form and memory list
const spotlightCard = document.getElementById("spotlightCard");
const gallery = document.getElementById("gallery");
const form = document.getElementById("memoryForm");
const memoryList = document.getElementById("memoryList");
const search = document.getElementById("search");
const pdfBtn = document.getElementById("pdfBtn");
const memoryCount = document.getElementById("memoryCount");
const totalStudents = document.getElementById("totalStudents");
const totalMemories = document.getElementById("totalMemories");
const totalLikes = document.getElementById("totalLikes");
// Authentication elements
const authSection = document.getElementById("authSection");
const email = document.getElementById("email");
const password = document.getElementById("password");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
// Load saved memories
let memories = [];
// =========================
// TOAST NOTIFICATION
// =========================

function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.className = "";

    toast.classList.add(type);

    toast.style.display = "block";

    setTimeout(function(){

        toast.style.display = "none";

    },3000);

}

// Track which memory is being edited
let editIndex = -1;
async function loadMemories() {

    memories = [];

    const querySnapshot = await getDocs(collection(db, "memories"));

    querySnapshot.forEach((document) => {

        memories.push({
            id: document.id,
            ...document.data()
        });

    });

    displayMemories();

}
// Display all memories
function displayMemories() {

memoryList.innerHTML = "";
gallery.innerHTML = "";
// Dashboard statistics

totalStudents.textContent = memories.length;

totalMemories.textContent = memories.length;

const likes = memories.filter(memory => memory.liked).length;

totalLikes.textContent = likes;
memoryCount.textContent = `📚 Total Memories: ${memories.length}`;

// Get what the user typed
const searchText = search.value.toLowerCase();

// Keep only matching students
const filteredMemories = memories.filter(function(memory){

    return memory.name.toLowerCase().includes(searchText);

});

// Display only the matching students
filteredMemories.forEach(function(memory){

    const index = memories.indexOf(memory);

    const card = document.createElement("div");

        card.className = "memory-card";

        card.innerHTML = `
            <img src="${memory.photo}" class="student-photo">

            <h2>${memory.name}</h2>

            <h4>${memory.studentClass}</h4>

            <p>👑 ${memory.position}</p>

            <div class="quote-box">
                "${memory.quote}"
            </div>

            <p class="ambition">
                🚀 ${memory.ambition}
            </p>

            <div class="button-group">

                <button class="like-btn" onclick="likeMemory(${index})">
                    ${memory.liked ? "❤️ Liked" : "🤍 Like"}
                </button>

                ${
                    auth.currentUser &&
                    memory.owner === auth.currentUser.uid
                    ? `
                        <button class="edit-btn" onclick="editMemory(${index})">
                            ✏ Edit
                        </button>

                        <button class="delete-btn" onclick="deleteMemory(${index})">
                            🗑 Delete
                        </button>
                    `
                    : ""
                }

            </div>
        `;

        memoryList.appendChild(card);
        const photo = document.createElement("img");

    photo.src = memory.photo;

    photo.className = "gallery-photo";

    gallery.appendChild(photo);

        });
        // =====================
// STUDENT SPOTLIGHT
// =====================

if (memories.length > 0) {

    const student = memories[0];

    spotlightCard.innerHTML = `

        <img src="${student.photo}">

        <h2>${student.name}</h2>

        <h3>👑 ${student.position}</h3>

        <p>"${student.quote}"</p>

    `;

} else {

    spotlightCard.innerHTML = "<p>No student selected yet.</p>";

}

}

// Show saved memories when page loads
//loadMemories();
// Save a memory (new or edited)
async function saveMemory(photo) {

   const newMemory = {
    name: document.getElementById("name").value,
    studentClass: document.getElementById("studentClass").value,
    position: document.getElementById("position").value,
    quote: document.getElementById("quote").value,
    ambition: document.getElementById("ambition").value,
    photo: photo,

    owner: auth.currentUser.uid,
    ownerEmail: auth.currentUser.email,

    liked: editIndex === -1 ? false : memories[editIndex].liked
    };

 if (editIndex === -1) {

    // New memory
    await addDoc(collection(db, "memories"), newMemory);

} else {

    // Update existing memory
    await updateDoc(
        doc(db, "memories", memories[editIndex].id),
        newMemory
    );

    editIndex = -1;

    document.querySelector("button[type='submit']").textContent = "Save My Memory";
}

 await loadMemories();

    form.reset();
    showToast("🎉 Memory saved successfully!", "success");
}

// Handle form submission
form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const file = document.getElementById("photo").files[0];

    // New photo selected
    if (file) {

        const reader = new FileReader();

        reader.onload = async function () {
            await saveMemory(reader.result);
        };

        reader.readAsDataURL(file);

    } else {

        // No new photo selected

        if (editIndex === -1) {
            showToast("Please select a photo.", "error");
            return;
        }

        await saveMemory(memories[editIndex].photo);
    }

});

// Delete memory
async function deleteMemory(index) {

    if (confirm("Delete this memory?")) {

        await deleteDoc(doc(db, "memories", memories[index].id));
        showToast("🗑 Memory deleted successfully!", "success");

        loadMemories();

    }

}
window.deleteMemory = deleteMemory;
// Edit memory
function editMemory(index) {

    const memory = memories[index];

    document.getElementById("name").value = memory.name;
    document.getElementById("studentClass").value = memory.studentClass;
    document.getElementById("position").value = memory.position;
    document.getElementById("quote").value = memory.quote;
    document.getElementById("ambition").value = memory.ambition;

    editIndex = index;

    document.querySelector("button[type='submit']").textContent = "Update Memory";
}
window.editMemory = editMemory;
// Like / Unlike
// Like / Unlike
async function likeMemory(index) {

    const currentMemory = memories[index];

    await updateDoc(
        doc(db, "memories", currentMemory.id),
        {
            liked: !currentMemory.liked
        }
    );

    await loadMemories();

}

// Make function available to HTML
window.likeMemory = likeMemory;

pdfBtn.addEventListener("click", function () {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF("p", "mm", "a4");

    memories.forEach((memory, index) => {

        // Create a new page after the first student
        if (index > 0) {
            doc.addPage();
        }

        // Blue border
        doc.setDrawColor(0, 102, 204);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        // ===== SCHOOL LOGO =====
        const logo = new Image();
        logo.src = "images/PHS.jpg";

        doc.addImage(logo, "JPEG", 85, 15, 40, 40);

        // ===== TITLE =====
        doc.setFontSize(20);
        doc.text("PHS VALEDICTORY MEMORY BOOK", 25, 65);

        doc.setFontSize(13);
        doc.text("CLASS OF 2026", 72, 75);

        // ===== STUDENT PHOTO =====
        if (memory.photo) {

            const imageType =
                memory.photo.indexOf("image/png") !== -1
                    ? "PNG"
                    : "JPEG";

            doc.addImage(memory.photo, imageType, 75, 90, 60, 60);

        }

        // Start writing details below the photo
        let y = 170;
                // ===== NAME =====
        doc.setFontSize(16);
        doc.text(`Name: ${memory.name}`, 20, y);

        y += 12;

        // ===== CLASS =====
        doc.text(`Class: ${memory.studentClass}`, 20, y);

        y += 12;

        // ===== POSITION =====
        doc.text(`Position: ${memory.position}`, 20, y);

        y += 18;

        // ===== FAVORITE QUOTE =====
        doc.setFontSize(14);
        doc.text("Favorite Quote", 20, y);

        y += 8;

        doc.setFontSize(12);

        const quote = doc.splitTextToSize(memory.quote, 170);
        doc.text(quote, 20, y);

        y += quote.length * 7 + 10;

        // ===== FUTURE AMBITION =====
        doc.setFontSize(14);
        doc.text("Future Ambition", 20, y);

        y += 8;

        doc.setFontSize(12);

        const ambition = doc.splitTextToSize(memory.ambition, 170);
        doc.text(ambition, 20, y);

    });

    doc.save("PHS_Valedictory_Memory_Book.pdf");

});
// ===========================
// DARK MODE
// ===========================

const themeBtn = document.getElementById("themeBtn");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀ Light Mode";

}

// Toggle theme
themeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.textContent = "☀ Light Mode";

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.textContent = "🌙 Dark Mode";

    }

});
// =========================
// COVER PAGE
// =========================

const enterBtn = document.getElementById("enterBtn");
const coverPage = document.getElementById("coverPage");
const mainContent = document.getElementById("mainContent");


// When Enter button is clicked
enterBtn.addEventListener("click", function () {

    coverPage.style.display = "none";
    mainContent.style.display = "block";

});
// =========================
// SIGN UP
// =========================

signupBtn.addEventListener("click", async function () {

    signupBtn.disabled = true;
    signupBtn.textContent = "⏳ Creating...";

    try {

        await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        signupBtn.textContent = "✅ Account Created!";

        showToast("✅ Account created successfully!", "success");

        email.value = "";
        password.value = "";

    } catch (error) {

        signupBtn.disabled = false;
        signupBtn.textContent = "📝 Create Account";

        if (error.code === "auth/email-already-in-use") {

            showToast("❌ Email already registered.", "error");

        } else if (error.code === "auth/weak-password") {

            showToast("❌ Password must be at least 6 characters.", "error")

        } else if (error.code === "auth/invalid-email") {

            showToast(error.message, "error");

        } else {

            showToast(error.message, "error");

        }

    }

});
// =========================
// LOGIN
// =========================

loginBtn.addEventListener("click", async function () {

    loginBtn.disabled = true;
    loginBtn.textContent = "⏳ Logging in...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        loginBtn.textContent = "✅ Welcome!";

        email.value = "";
        password.value = "";

    } catch (error) {

        loginBtn.disabled = false;
        loginBtn.textContent = "🔑 Login";

        if (error.code === "auth/invalid-credential") {

            showToast("❌ Incorrect email or password.", "error");


        } else if (error.code === "auth/user-not-found") {

           showToast("❌ Email not registered.", "error");

        } else if (error.code === "auth/wrong-password") {

            showToast("❌ Incorrect password.", "error");

        } else if (error.code === "auth/invalid-email") {

            showToast("❌ Invalid email address.", "error");

        } else {

            showToast(error.message, "error");

        }

    }

});
// =========================
// AUTH STATE
// =========================

onAuthStateChanged(auth, function (user) {

    if (user) {

        // User is logged in
        authSection.style.display = "none";
        document.getElementById("userEmail").textContent =
        "👤 " + user.email;
        coverPage.style.display = "flex";
        logoutBtn.style.display = "inline-block";
        loadMemories();

    } else {

        // User is NOT logged in
        authSection.style.display = "block";
        coverPage.style.display = "none";
        mainContent.style.display = "none";
        logoutBtn.style.display = "none";

    }

});
// =========================
// LOGOUT
// =========================

logoutBtn.addEventListener("click", async function () {

    try {

        await signOut(auth);

        alert("Logged out successfully!");

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});
window.onload = function () {

    showToast("👋 Logged out successfully!", "success");
};
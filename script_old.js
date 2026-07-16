// Get the form
const form = document.getElementById("memoryForm");

// Get where memory cards will appear
const memoryList = document.getElementById("memoryList");

// Get saved memories or create an empty array
let memories = JSON.parse(localStorage.getItem("memories")) || [];
let editIndex = -1;
// Function to display all memories
function displayMemories(){

    memoryList.innerHTML = "";

    memories.forEach(function(memory, index){

        const card = document.createElement("div");

        card.classList.add("memory-card");

        card.innerHTML = `
            <img src="${memory.photo}" class="student-photo">

            <h2>${memory.name}</h2>

            <h4>${memory.studentClass}</h4>

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

            <button class="edit-btn" onclick="editMemory(${index})">
            ✏ Edit
            </button>

            <button class="delete-btn" onclick="deleteMemory(${index})">
            🗑 Delete
            </button>

            </div>
        `;

        memoryList.appendChild(card);

    });

}

// Show saved memories immediately
displayMemories();

// Save new memory
form.addEventListener("submit", function(e){

    e.preventDefault();
const file = document.getElementById("photo").files[0];

// If a new photo is selected
if(file){

    const reader = new FileReader();

    reader.onload = function(){

        saveMemory(reader.result);

    };

    reader.readAsDataURL(file);

    }else{

    // No new photo selected

    let photo = "";

    if(editIndex !== -1){

        photo = memories[editIndex].photo;

    }

    saveMemory(photo);

}

});
function deleteMemory(index){

    if(confirm("Are you sure you want to delete this memory?")){

        memories.splice(index,1);

        localStorage.setItem("memories", JSON.stringify(memories));

        displayMemories();

    }

}
function likeMemory(index){

    memories[index].liked = !memories[index].liked;

    localStorage.setItem("memories", JSON.stringify(memories));

    displayMemories();

}
function editMemory(index){

    const memory = memories[index];

    document.getElementById("name").value = memory.name;
    document.getElementById("studentClass").value = memory.studentClass;
    document.getElementById("quote").value = memory.quote;
    document.getElementById("ambition").value = memory.ambition;

    editIndex = index;

    document.querySelector("button[type='submit']").textContent = "Update Memory";

}
function saveMemory(photo){

    const newMemory = {

        name: document.getElementById("name").value,

        studentClass: document.getElementById("studentClass").value,

        quote: document.getElementById("quote").value,

        ambition: document.getElementById("ambition").value,

        photo: photo,

        liked: editIndex === -1 ? false : memories[editIndex].liked

    };

    if(editIndex === -1){

        memories.push(newMemory);

    }else{

        memories[editIndex] = newMemory;

        editIndex = -1;

        document.querySelector("button[type='submit']").textContent = "Save My Memory";

    }

    localStorage.setItem("memories", JSON.stringify(memories));

    displayMemories();

    form.reset();

}
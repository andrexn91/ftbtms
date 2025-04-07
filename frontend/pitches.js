function goToHome() {
    window.location.href = "index.html";
}

window.onload = () => {
    //const user = localStorage.getItem('username');
    const user = sessionStorage.getItem('username');
    if (user) showContent();
};

function showContent() {
    /*
    const username = localStorage.getItem('username');
    const photo = localStorage.getItem('photo');
    */
    const username = sessionStorage.getItem('username');
    const photo = sessionStorage.getItem('photo');
    // Toggle dropdown menu on photo click
    const userPhoto = document.getElementById('user-photo');
    const dropdownMenu = document.getElementById('dropdown-menu');

    //userPhoto.style.backgroundImage = 'url(' + photo + ')';

    userPhoto.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });


    // Optional: Hide dropdown when clicked outside
    document.addEventListener('click', function(event) {
        if (!userPhoto.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
}


// Function to simulate going to the profile page
function goToProfile() {
    alert('Andando alla pagina del profilo...');
    // Usa window.location per redirigere alla pagina del profilo
    // window.location.href = '/profilo';
}

// Function to simulate logout
function logout() {
    // Rimuove i dati utente dal localStorage
    //localStorage.clear();
    sessionStorage.clear();

    // Reindirizza alla pagina di login
    window.location.href = "login.html";
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
    
    // Gestiamo il click sui bottoni di chiusura
    const closeButtons = document.querySelectorAll('.close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);  // Associa la funzione al click sul bottone di chiusura
    });

    await fetchPitches();

});

async function fetchPitches() {
    let pitches;
    // Fetch di tutti i campi
    
    try {
        const pitchesData_fetched = await fetch('http://localhost:3000/pitches');
        const pitchesData = await pitchesData_fetched.json();

        pitches = pitchesData;

    } catch (error) {
        console.error('Errore durante il fetch dei dati dei campi:', error);
    }
    
    populateTable("table-pitch", pitches);
}

function populateTable(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = "";

    data.forEach(pitch => {
        const row = document.createElement("tr");
        for (const key in pitch) {
            const elem = document.getElementById(key);
            if (elem) {
                const cell = document.createElement("td");
                cell.textContent = pitch[key];
                row.appendChild(cell);
            }
        }

        // Aggiungi bottone "Dettagli"
        const actionsCell = document.createElement("td");
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "Dettagli";
        detailsButton.onclick = () => showPitchDetails(pitch.id);
        actionsCell.appendChild(detailsButton);

        row.appendChild(actionsCell);

        tableBody.appendChild(row);
        
    });
}

async function newPitch() {
    // Mostra il modale
    const modal = document.getElementById("newPitchModal");
    modal.style.display = "block";
}

document.getElementById('newPitchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    const newPitchData = {
        name:               formData.get('name'),
        address:            formData.get('address'),
        total_cost:         formData.get('total_cost')
    };
    
    console.log(newPitchData);

    const success = await createNewPitch(newPitchData);

    if (success) {
        alert("Campo creato con successo!");
    } else {
        alert("Errore nella creazione della campo. Riprova.");
    }
});



async function createNewPitch(data) {
    try {
        const response = await fetch('http://localhost:3000/pitches/new-pitch', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name:               data.name,
                address:            data.address,
                total_cost:         data.total_cost
            })
        });

        const result = await response.json();
        
        //alert('Campo creato con successo!!');

        return result.success; // Deve restituire `true` se l'aggiornamento va a buon fine
    } catch (error) {
        console.error("Errore nell'insert:", error);
        return false;
    }
}




async function showPitchDetails(pitchId) {
    try {
        const response = await fetch(`http://localhost:3000/pitches/${pitchId}`);
        const pitchDetails = await response.json();

        const detailsDiv = document.getElementById("pitchDetails");
        detailsDiv.innerHTML = `
            <p><strong>Nome:</strong> ${pitchDetails.name}</p>
            <p><strong>Indirizzo:</strong> ${pitchDetails.address}</p>
            <p><strong>Costo (€):</strong> ${pitchDetails.total_cost}</p>
        `;

        // Mostra il modale
        const modal = document.getElementById("pitchModal");
        modal.style.display = "block";

    } catch (error) {
        console.error("Errore nel recupero dei dettagli del campo:", error);
    }
}


function closeModal(event) {
    const modal = event.target.closest('.modal'); // Trova il modale che ha chiamato la funzione
    if (modal) {
        modal.style.display = 'none'; // Nasconde il modale
    }
}

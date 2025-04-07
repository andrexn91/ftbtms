window.onload = () => {
    const user = localStorage.getItem('username');
    if (user) showContent();
};

function goToHome() {
    window.location.href = "index.html";
}


function showContent() {
    const username = localStorage.getItem('username');
    const photo = localStorage.getItem('photo');
    
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
    localStorage.clear();
    //localStorage.removeItem("username");
    //localStorage.removeItem("token"); // Se usi un token di autenticazione DA APPROFONDIRE

    // Reindirizza alla pagina di login
    window.location.href = "login.html";
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            tabContents.forEach(content => content.style.display = "none");
            activateTab(tabId);
        });
    });
    
    activateTab("assoc");

    // Gestiamo il click sui bottoni di chiusura
    const closeButtons = document.querySelectorAll('.close-modal');

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);  // Associa la funzione al click sul bottone di chiusura
    });

});

async function activateTab(tabId) {
    switch (tabId) {
        case 'assoc':
            await fetchUsersToBeAssociated();
            break;
        case 'manageUsers':
            await fetchUsers();
            break;
        default:
            break;
    }


    document.getElementById(tabId).style.display = "block";
}

async function fetchUsersToBeAssociated() {
    let users;

    // Fetch di tutti gli users da associare
    try {
        const usersData_fetched = await fetch('http://localhost:3000/users/new-users');
        const usersData = await usersData_fetched.json();

        console.log(usersData);
        
        users = usersData;
        
    } catch (error) {
        console.error('Errore durante il fetch dei dati dei nuovi users:', error);
    }

    //console.log(users);
    

    populateTableAssoc("table-assoc", users);
        
}

function populateTableAssoc(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = "";

    data.forEach(user => {
        const row = document.createElement("tr");
        
        const cellUser = document.createElement("td");
        cellUser.value = user.id;
        cellUser.textContent = user.username;
        row.appendChild(cellUser);
        
        const cellPlayer = document.createElement("td");
        const selectPlayer = document.createElement("select");
        selectPlayer.name = "player";
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Seleziona";
        selectPlayer.appendChild(option);

        fetch('http://localhost:3000/users/to-associate')
            .then(response => response.json())
            .then(players => {
                players.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player.id;
                    option.textContent = player.name;
                    selectPlayer.appendChild(option);
                });
            });

        cellPlayer.appendChild(selectPlayer);
        row.appendChild(cellPlayer);

        const cellConfirm = document.createElement("td");
        const btnConfirm = document.createElement("button");
        btnConfirm.innerText = "✔️";
        btnConfirm.addEventListener("click", async function () {
            const selectElement = btnConfirm.closest('tr').querySelector('select');
            const idUser = cellUser.value;
            const idPlayer = selectElement.value;
            if (idUser && idPlayer) {
                const success = await createNewAssoc(idUser, idPlayer);

                if (success) {
                    alert('User associato con successo!');
                    await fetchUsersToBeAssociated();
                }
                else {
                    alert("Errore nell'associazione dell'user. Riprova.");
                }
            }
            else
            alert("Nessun giocatore da abbinare selezionato!");
        });
        cellConfirm.appendChild(btnConfirm);
        row.appendChild(cellConfirm);

        tableBody.appendChild(row);
        
    });
}


async function createNewAssoc(idUser, idPlayer) {
    try {
        const response = await fetch('http://localhost:3000/users/new-assoc', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                idUser:     idUser,
                idPlayer:   idPlayer
            })
        });

        const result = await response.json();

        return result.success; // Deve restituire `true` se l'aggiornamento va a buon fine

    } catch (error) {
        console.error("Errore nell'update:", error);
        return false;
    }
    
}


async function fetchUsers() {
    let users;
    
    // Fetch di tutti gli users
    try {
        const usersData_fetched = await fetch('http://localhost:3000/users');
        const usersData = await usersData_fetched.json();

        console.log(usersData);
        
        users = usersData;
        
    } catch (error) {
        console.error('Errore durante il fetch dei dati dei nuovi users:', error);
    }

    populateTableManageUsers("table-manageUsers", users);
}

function populateTableManageUsers(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = "";

    data.forEach(user => {
        const row = document.createElement("tr");
        
        //User
        row.appendChild(createTableManageUsersCell(user.username));

        //Player
        row.appendChild(createTableManageUsersCell(user.name));

        //Tipo
        row.appendChild(createTableManageUsersCell(user.role));

        //Email
        row.appendChild(createTableManageUsersCell(user.email));

        // Aggiungi bottone "Dettagli"
        const actionsCell = document.createElement("td");
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "Dettagli";
        detailsButton.onclick = () => showUserDetails(user.id);
        actionsCell.appendChild(detailsButton);

        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

function createTableManageUsersCell(textContent) {
    const cell = document.createElement("td");
    cell.textContent = textContent;
    return cell;
}

async function showUserDetails(userId) { //VALUTARE SE SIA MEGLIO PASSARE TUTTO L'USER O SOLO L'ID PER POI FETCHARE L'USER SINGOLO
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`);
        const userDetails = await response.json();
        console.log(userDetails);

        const detailsDiv = document.getElementById("userDetails");

        const detailsFields = detailsDiv.querySelectorAll("p");
        
        //Object.keys(userDetails).forEach(key => {
            detailsFields.forEach(field => {
                const idField = field.id.split("-")[0];
                field.innerHTML = userDetails[idField];
            });
        //});
        
        //const user = document.createElement("")

        // Memorizza l'id dell'user per le modifiche - FORSE NON SERVE
        detailsDiv.dataset.userId = userId;

        // Mostra il modale
        const modal = document.getElementById("userModal");
        modal.style.display = "block";

    } catch (error) {
        console.error("Errore nel recupero dei dettagli dell'user:", error);
    }


}

function closeModal(event) {
    //const modal = document.getElementById("matchModal");
    //modal.style.display = "none";
    const modal = event.target.closest('.modal'); // Trova il modale che ha chiamato la funzione
    if (modal) {
        modal.style.display = 'none'; // Nasconde il modale
    }
}
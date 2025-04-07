function goToHome() {
    window.location.href = "index.html";
}

window.onload = () => {
    const user = localStorage.getItem('username');
    if (user) showContent();
};

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
    
    
    await fetchPlayers();

    activateTab("info");

});

function activateTab(tabId) {
    document.getElementById(tabId).style.display = "block";
}

async function fetchPlayers() {
    let users = [];
    // Fetch di tutti i giocatori
    
    try {
        const playersData_fetched = await fetch('http://localhost:3000/players');
        const playersData = await playersData_fetched.json();

        console.log(playersData);

        playersData.playersInfo.forEach(player => {
            const roles = playersData.playersRoles.filter(role => role['id_player'] === player['id']);
            roles.map(role => {
                delete role.id_player;
                return role;
            });
            const skills = playersData.playersSkills.filter(skill => skill['id_player'] === player['id']);
            skills.map(skill => {
                delete skill.id_player;
                return skill;
            });

            users.push({
                info:   player,
                roles:  roles,
                skills: skills
            });
        });

        
        
        /*
        playersData.forEach(row => {
            let player = users.find( user => user['id'] === row['id'] );
            if (!player) {
                users.push({
                    id: row.id,
                    name: row.name,
                    ruolo_1: row.ruolo_1,
                    ruolo_2: row.ruolo_2,
                    ruolo_3: row.ruolo_3,
                    ruolo_4: row.ruolo_4,
                    ruolo_5: row.ruolo_5,
                    skills: []//{FIS: [], TEC: [], TAT: [], CAR: [], POR: []}
                });
                player = users.find( user => user['id'] === row['id'] );
            }
            const skill = {id_category: row.id_category, name: row.category, value: row.value, macro_category: row.macro_category};

            player.skills.push(skill);

        });
        */
        
    } catch (error) {
        console.error('Errore durante il fetch dei dati dei giocatori:', error);
    }

    console.log(users);
    

    populateTable("table-info", users, 'info');
    populateTable("table-ruoli", users, 'roles');
    populateTable("table-fisiche", users, 'skills', 'FIS');
    populateTable("table-tecniche", users, 'skills', 'TEC');
    populateTable("table-tattiche", users, 'skills', 'TAT');
    populateTable("table-caratteriali", users, 'skills', 'CAR');
    populateTable("table-portiere", users, 'skills', 'POR');
        
}

function populateTable(tableId, data, section, columns = null) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = "";
    data.forEach(player => {
        const row = document.createElement("tr");
        //const cell = document.createElement("td");
        //cell.textContent = player.name;
        //row.appendChild(cell);
        const playerName = player.info.name;

        let cellName;// = document.createElement("td");

        let playerData;
        switch (section) {
            case 'info':
                playerData = Array(player[section]);
                break;
            case 'roles':
                playerData = player[section];

                cellName = document.createElement("td");
                cellName.textContent = playerName;
                row.appendChild(cellName);
                
                break;
            case 'skills':
                playerData = player[section].filter(skill => skill['macro_category'] === columns);

                cellName = document.createElement("td");
                cellName.textContent = playerName;
                row.appendChild(cellName);

                break;
            default:
                break;
        }

        
        
        playerData.forEach(col => {
            
            //const cell = document.createElement("td");
                let input_type;
                switch (section) {
                    case 'info':
                        input_type = "text";
                        break;
                    case 'roles':
                        input_type = "text";
                        break;
                    case 'skills':
                        input_type = "number";
                        break;
                    default:
                        break;
                }
            
                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                if (section === 'info') {

                    // NOME
                    const cellName = document.createElement("td");
                    const inputName = document.createElement("input");
                    inputName.type = input_type;
                    inputName.value = col.name;
                    //input.dataset.column = col.name; // Aggiunge un riferimento alla colonna
                    inputName.dataset.originalValue = inputName.value; // Salva il valore originale per ripristino
                    
                    inputName.addEventListener("change", async (event) => {
                        const newValue = event.target.value;
                        const oldValue = event.target.dataset.originalValue;
                        
                        if (newValue !== oldValue) {
                            const confirmChange = confirm(`Sei sicuro di modificare il valore da "${oldValue}" a "${newValue}"?`);

                            if (confirmChange) {
                                // 🔥 Chiamata API per aggiornare il database
                                const success = await updatePlayer(player.info.id, section, "name", newValue);

                                if (success) {
                                    event.target.dataset.originalValue = newValue; // Aggiorna il valore originale
                                    col.name = newValue; // Aggiorna il dato nell'oggetto
                                } else {
                                    alert("Errore nell'aggiornamento. Riprova.");
                                    event.target.value = oldValue; // Ripristina il valore originale
                                }
                            } else {
                                event.target.value = oldValue; // Ripristina il valore originale
                            }
                        }
                    });

                    cellName.appendChild(inputName);
                    row.appendChild(cellName);

                    // EMAIL
                    const cellEmail = document.createElement("td");
                    const inputEmail = document.createElement("input");
                    inputEmail.type = input_type;
                    inputEmail.value = col.email;
                    //input.dataset.column = col.name; // Aggiunge un riferimento alla colonna
                    inputEmail.dataset.originalValue = inputEmail.value; // Salva il valore originale per ripristino
                    
                    inputEmail.addEventListener("change", async (event) => {
                        const newValue = event.target.value;
                        const oldValue = event.target.dataset.originalValue;
                        
                        if (newValue !== oldValue) {
                            const confirmChange = confirm(`Sei sicuro di modificare il valore da "${oldValue}" a "${newValue}"?`);

                            if (confirmChange) {
                                // 🔥 Chiamata API per aggiornare il database
                                const success = await updatePlayer(player.info.id, section, "email", newValue);

                                if (success) {
                                    event.target.dataset.originalValue = newValue; // Aggiorna il valore originale
                                    col.email = newValue; // Aggiorna il dato nell'oggetto
                                } else {
                                    alert("Errore nell'aggiornamento. Riprova.");
                                    event.target.value = oldValue; // Ripristina il valore originale
                                }
                            } else {
                                event.target.value = oldValue; // Ripristina il valore originale
                            }
                        }
                    });

                    cellEmail.appendChild(inputEmail);
                    row.appendChild(cellEmail);

                    // ACCESS LEVEL
                    const cellAL = document.createElement("td");
                    const inputAL = document.createElement("input");
                    inputAL.type = input_type;
                    inputAL.value = col.accesslevel;
                    //input.dataset.column = col.name; // Aggiunge un riferimento alla colonna
                    inputAL.dataset.originalValue = inputAL.value; // Salva il valore originale per ripristino
                    
                    inputAL.addEventListener("change", async (event) => {
                        const newValue = event.target.value;
                        const oldValue = event.target.dataset.originalValue;
                        
                        if (newValue !== oldValue) {
                            const confirmChange = confirm(`Sei sicuro di modificare il valore da "${oldValue}" a "${newValue}"?`);

                            if (confirmChange) {
                                // 🔥 Chiamata API per aggiornare il database
                                const success = await updatePlayer(player.info.id, section, "role", newValue); //role è inteso come l'access level

                                if (success) {
                                    event.target.dataset.originalValue = newValue; // Aggiorna il valore originale
                                    col.accesslevel = newValue; // Aggiorna il dato nell'oggetto
                                } else {
                                    alert("Errore nell'aggiornamento. Riprova.");
                                    event.target.value = oldValue; // Ripristina il valore originale
                                }
                            } else {
                                event.target.value = oldValue; // Ripristina il valore originale
                            }
                        }
                    });

                    cellAL.appendChild(inputAL);
                    row.appendChild(cellAL);

                }
                else if (section === 'roles') {

                    const cell = document.createElement("td");

                    const input = document.createElement("input");
                    

                    input.type = input_type;

                    input.value = col.role || "-";
                    //input.dataset.column = col.name; // Aggiunge un riferimento alla colonna
                    input.dataset.originalValue = input.value; // Salva il valore originale per ripristino
                    
                    input.addEventListener("change", async (event) => {
                        const newValue = event.target.value;
                        const oldValue = event.target.dataset.originalValue;
                        
                        if (newValue !== oldValue) {
                            const confirmChange = confirm(`Sei sicuro di modificare il valore da "${oldValue}" a "${newValue}"?`);

                            if (confirmChange) {
                                // 🔥 Chiamata API per aggiornare il database
                                const success = await updatePlayer(player.info.id, section, col.pos, newValue);

                                if (success) {
                                    event.target.dataset.originalValue = newValue; // Aggiorna il valore originale
                                    col.role = newValue; // Aggiorna il dato nell'oggetto
                                    //player[section][columns][col.key] = newValue; // Aggiorna il dato nell'oggetto
                                } else {
                                    alert("Errore nell'aggiornamento. Riprova.");
                                    event.target.value = oldValue; // Ripristina il valore originale
                                }
                            } else {
                                event.target.value = oldValue; // Ripristina il valore originale
                            }
                        }
                    });
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    
                    cell.appendChild(input);
                    row.appendChild(cell);
                }
                else {
                    const cell = document.createElement("td");

                    const input = document.createElement("input");
                    //cell.textContent = player[col] || "-";

                    input.type = input_type;

                    input.value = col.value || "-";
                    input.dataset.column = col.category; // Aggiunge un riferimento alla colonna
                    input.dataset.originalValue = input.value; // Salva il valore originale per ripristino
                    
                    input.addEventListener("change", async (event) => {
                        const newValue = event.target.value;
                        const oldValue = event.target.dataset.originalValue;
                        
                        if (newValue !== oldValue) {
                            const confirmChange = confirm(`Sei sicuro di modificare il valore da "${oldValue}" a "${newValue}"?`);

                            if (confirmChange) {
                                // 🔥 Chiamata API per aggiornare il database
                                const success = await updatePlayer(player.info.id, section, col.id_category, newValue);

                                if (success) {
                                    event.target.dataset.originalValue = newValue; // Aggiorna il valore originale
                                    col.value = newValue; // Aggiorna il dato nell'oggetto
                                    //player[section][columns][col.key] = newValue; // Aggiorna il dato nell'oggetto
                                } else {
                                    alert("Errore nell'aggiornamento. Riprova.");
                                    event.target.value = oldValue; // Ripristina il valore originale
                                }
                            } else {
                                event.target.value = oldValue; // Ripristina il valore originale
                            }
                        }
                    });
                    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    
                    cell.appendChild(input);
                    row.appendChild(cell);
                }
        });
        tableBody.appendChild(row);
    });

    addSortingFunctionality(tableId);
}


function addSortingFunctionality(tableId) {
    const table = document.querySelector(`#${tableId}`);
    //document.querySelectorAll("th").forEach(header => {
    table.querySelectorAll("th").forEach(header => {
        header.addEventListener("click", () => {
            //console.log("Prima del clic: " + header.getAttribute("data-order"));
            const dataColumn = header.getAttribute("data-column");
            const column = Number(dataColumn.substring(3));//header.getAttribute("data-column");
            const order = header.getAttribute("data-order") === "desc" ? "asc" : "desc";
            //console.log("Dopo il clic: " + order);
            /*
            let tableId;
            switch (dataColumn.substring(0,3)) {
                case "FIS":
                    tableId = "table-fisiche";
                    break;
                case "TEC":
                    tableId = "table-tecniche";
                    break;
                case "TAT":
                    tableId = "table-tattiche";
                    break;
                case "CAR":
                    tableId = "table-caratteriali";
                    break;
                case "POR":
                    tableId = "table-portiere";
                    break;
                default:
                    tableId = "table-ruoli";
                    break;
            }
            */
            sortTable(tableId, column, order);

            // Aggiorna le icone di ordinamento
            updateSortIcons(table, column, order);

            header.setAttribute("data-order", order);
        });
    });
}

function sortTable(tableId, column, order) {
    //console.log(tableId);
    //const table = document.getElementById("playersTableBody");
    const table = document.querySelector(`#${tableId} tbody`);
    const rows = Array.from(table.querySelectorAll("tr"));
    
    ///////////////////////////////////////////////////////////////////////////
    /*
    const isNumeric = (value) => !isNaN(value) && value.trim() !== '';
  
    // Controlliamo se la colonna è numerica o testuale
    const sortFunction = isNumeric(rows[0].cells[column].innerText)
        ? (rowA, rowB) => parseFloat(rowA.cells[columnIndex].innerText) - parseFloat(rowB.cells[columnIndex].innerText)
        : (rowA, rowB) => rowA.cells[columnIndex].innerText.localeCompare(rowB.cells[columnIndex].innerText);
  


    // Ordiniamo le righe
    rows.sort((rowA, rowB) => {
        const comparison = sortFunction(rowA, rowB);
        return sortDirection[columnIndex] ? comparison : -comparison;
    });

    // Aggiungiamo le righe ordinate alla tabella
    rows.forEach(row => table.appendChild(row));
    ///////////////////////////////////////////////////////////////////////////
    */
    //const cells = rows[0].cells;

    
    
    rows.sort((a, b) => {
        const aValue = a.cells[column].querySelector('input').value.trim();
        const bValue = b.cells[column].querySelector('input').value.trim();
        return order === "asc"
            ? aValue.localeCompare(bValue, undefined, { numeric: true })
            : bValue.localeCompare(aValue, undefined, { numeric: true });
    });
    
    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));

    
}

function updateSortIcons(table, header, order) {
    table.querySelectorAll("th").forEach((th, index) => {
        let span = th.querySelector("span");
        if (index === header) {
            span.innerHTML = order === "asc" ? "▲" : "▼"; // Freccia su o giù
        } else {
            span.innerHTML = ""; // Resetta le altre colonne
        }
    });
}


async function updatePlayer(idPlayer, section, idCategory, newValue) {
    
    try {
        const response = await fetch('http://localhost:3000/players/update-player', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_player: idPlayer,
                id_category: idCategory,
                value: newValue
            })
        });

        const result = await response.json();
        //console.log("response = " + response);
        //console.log("result = " + result);
        /*
        if (!response.ok) {
            throw new Error(result.error || 'Errore nell’aggiornamento');
        }
        */
        //console.log('Utente aggiornato:', result.utente);
        alert('Utente aggiornato con successo!');

        return result.success; // Deve restituire `true` se l'aggiornamento va a buon fine
    } catch (error) {
        console.error("Errore nell'update:", error);
        return false;
    }
}




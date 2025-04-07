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

    await fetchMatches();

});

async function fetchMatches() {
    let matches;
    // Fetch di tutti i match
    
    try {
        const matchesData_fetched = await fetch('http://localhost:3000/matches');
        const matchesData = await matchesData_fetched.json();

        matches = matchesData;

    } catch (error) {
        console.error('Errore durante il fetch dei dati dei match:', error);
    }
    
    populateTable("table-match", matches);
}

function populateTable(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = "";

    data.forEach(match => {
        const row = document.createElement("tr");
        const columns = ["date", "time", "location", "pl_mov_avail", "pl_gk_avail"];
        columns.forEach(col => {
            const elem = document.getElementById(col);
            if (elem) {
                const cell = document.createElement("td");
                let cellContent;
                if (col === 'date') {
                    const date = new Date(match[col]);
                    cellContent = new Intl.DateTimeFormat("it-IT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }).format(date);
                }
                else if (col === 'time') {
                    const time = match[col];
                    let [hours, minutes] = time.split(":");  // Divide la stringa in ore e minuti
                    cellContent = `${hours}:${minutes}`;  // Ricompone senza i secondi
                }
                else {
                    cellContent = match[col];
                }
                cell.textContent = cellContent;
                row.appendChild(cell);
            }
        });
        /*
        for (const key in match) {
            const elem = document.getElementById(key);
            if (elem) {
                const cell = document.createElement("td");
                let cellContent;
                if (key === 'date') {
                    const date = new Date(match[key]);
                    cellContent = new Intl.DateTimeFormat("it-IT", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }).format(date);
                }
                else if (key === 'time') {
                    const time = match[key];
                    let [ore, minuti] = time.split(":");  // Divide la stringa in ore e minuti
                    cellContent = `${ore}:${minuti}`;  // Ricompone senza i secondi
                }
                else {
                    cellContent = match[key];
                }
                cell.textContent = cellContent;
                row.appendChild(cell);
            }
        }
        */
        // Aggiungi bottone "Dettagli"
        const actionsCell = document.createElement("td");
        const detailsButton = document.createElement("button");
        detailsButton.textContent = "Dettagli";
        detailsButton.onclick = () => showMatchDetails(match.id);
        actionsCell.appendChild(detailsButton);

        row.appendChild(actionsCell);

        tableBody.appendChild(row);
        
    });
}

async function newMatch() {
    try {
        // Avvia due richieste al database in parallelo per i campi e i cassieri
        const [response1, response2] = await Promise.all([
            fetch('http://localhost:3000/pitches'),
            fetch('http://localhost:3000/users/get-satispay-cashiers')
        ]);
        
        // Controlla se entrambe le risposte sono ok
        if (!response1.ok || !response2.ok) throw new Error("Errore nel recupero dati");

        const pitches = await response1.json();
        const cashiers = await response2.json();


        //Campo
        const pitchSelect = document.getElementById('pitch-select');

        const optionPitch = document.createElement('option');
        optionPitch.value = "";
        optionPitch.textContent = "Seleziona";
        pitchSelect.appendChild(optionPitch);

        pitches.forEach(pitch => {
            const optionPitch = document.createElement('option');
            optionPitch.value = pitch.id;
            optionPitch.textContent = pitch.name;

            pitchSelect.appendChild(optionPitch);
        });
            


        //Cassiere
        const cashierSelect = document.getElementById('cashier-select');

        const optionCashier = document.createElement('option');
        optionCashier.value = "";
        optionCashier.textContent = "Seleziona";
        cashierSelect.appendChild(optionCashier);

        cashiers.forEach(cashier => {
            const optionCashier = document.createElement('option');
            optionCashier.value = cashier.id;
            optionCashier.textContent = cashier.name;

            cashierSelect.appendChild(optionCashier);
        });
            


        // Mostra il modale
        const modal = document.getElementById("newMatchModal");
        modal.style.display = "block";

    } catch (error) {
        console.error("Errore nel recupero dei dettagli dei campi e/o dei cassieri:", error);
    }
}

document.getElementById('newMatchForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    const newMatchData = {
        date:               formData.get('data'),
        time:               formData.get('orario'),
        pitchId:            formData.get('campo'),
        cashierId:          formData.get('cassiere'),
        numberOfPlayers:    formData.get('giocatori')
    };

    const success = await createNewMatch(newMatchData);

    if (success) {
        alert("Partita creata con successo!");
    } else {
        alert("Errore nella creazione della partita. Riprova.");
    }
});



async function createNewMatch(data) {
    try {
        const response = await fetch('http://localhost:3000/matches/new-match', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date:               data.date,
                time:               data.time,
                pitchId:            data.pitchId,
                cashierId:          data.cashierId,
                numberOfPlayers:    data.numberOfPlayers
            })
        });

        const result = await response.json();

        /*
        if (result.success) {
            console.log("Operazione completata con successo:", result.message);
        } else {
            console.error("Errore:", result.error);
        }
        */

        return result.success; // Deve restituire `true` se l'aggiornamento va a buon fine
    } catch (error) {
        console.error("Errore nella richiesta:", error);
        return false;
    }
}




async function showMatchDetails(matchId) {
    try {
        const response = await fetch(`http://localhost:3000/matches/${matchId}`);
        const matchDetails = await response.json();

        const detailsDiv = document.getElementById("matchDetails");
        
        //DA SISTEMARE IL FORMATO DI DATA E ORA
        detailsDiv.innerHTML = `
            <p><strong>Data:</strong> ${matchDetails.date}</p>
            <p><strong>Ora:</strong> ${matchDetails.time}</p>
            <p><strong>Campo:</strong> ${matchDetails.location}</p>
            <p><strong>Indirizzo:</strong> ${matchDetails.address}</p>
            <p><strong>Costo campo:</strong> ${matchDetails.total_cost} €</p>
            <p><strong>Giocatori disp.:</strong> ${matchDetails.pl_mov_avail}</p>
            <p><strong>Portieri disp.:</strong> ${matchDetails.pl_gk_avail}</p>
        `;

        //Tasto pagamento diretto con Satispay
        const payWithSatispayButton = document.createElement('button');
        payWithSatispayButton.id = 'payWithSatispayButton';
        payWithSatispayButton.textContent = "Paga con Satispay";
        payWithSatispayButton.onclick = () => window.open(matchDetails.payment_link, "_blank");
        detailsDiv.appendChild(payWithSatispayButton);

        //Tasto di copia negli appunti link Satispay
        const copySatispayLinkButton = document.createElement('button');
        copySatispayLinkButton.id = 'copySatispayLinkButton';
        copySatispayLinkButton.textContent = "Copia link Satispay"
        copySatispayLinkButton.onclick = () => {
            navigator.clipboard.writeText(matchDetails.payment_link)
                .then(function() {
                    alert("Link Satispay copiato negli appunti");
                })
                .catch(function(err) {
                    alert("Errore nel copiare negli appunti: " + err);
                });
        }
        detailsDiv.appendChild(copySatispayLinkButton);

        //Tasto di collegamento con la sezione pagamenti
        const paymentsLinkButton = document.createElement('button');
        paymentsLinkButton.id = 'paymentsLinkButton';
        paymentsLinkButton.textContent = "Pagamenti"
        paymentsLinkButton.onclick = () => showPaymentsDetails(matchId);
        detailsDiv.appendChild(paymentsLinkButton);

        // Memorizza l'id del match per la prenotazione
        detailsDiv.dataset.matchId = matchId;

        const bookForOthersButton = document.getElementById('bookForOthersButton');

        bookForOthersButton.addEventListener('click', async () => {
            const otherPlayersList = document.getElementById('otherPlayersList');
            otherPlayersList.style.display = "block";
            
            const tableBody = document.querySelector('#table-otherPlayers tbody');
            tableBody.innerHTML = "";

            try {
                // Avvia due richieste al database in parallelo
                const [response1, response2] = await Promise.all([
                    fetch('http://localhost:3000/players/names'),
                    fetch(`http://localhost:3000/bookings/${matchId}`)
                ]);
                
                // Controlla se entrambe le risposte sono ok
                if (!response1.ok || !response2.ok) throw new Error("Errore nel recupero dati");

                const players = await response1.json();
                const bookings = await response2.json();
                //const bookingsIds = Array.from(bookings).map(bookings => bookings.id_player);

                players.forEach(player => {
                    const row = document.createElement('tr');
                    const cellName = document.createElement('td');
                    cellName.textContent = player.name;
                    row.appendChild(cellName);

                    const cellBooking = document.createElement('td');

                    const radioButtonContainer = document.createElement('div');
                    //radioButtonContainer.id = "radioButtonContainer";
                    radioButtonContainer.classList.add("radioButtonContainer");

                    createRadioButton(radioButtonContainer, "rbBookingNull", "", player.id, "🚫");
                    createRadioButton(radioButtonContainer, "rbBookingPl", "pl_mov", player.id, "🏃🏻");
                    createRadioButton(radioButtonContainer, "rbBookingGk", "pl_gk", player.id, "🧤");

                    const playerBooked = bookings.filter(booking => booking.id_player === player.id);
                    
                    if (playerBooked[0]) {
                        if (playerBooked[0].booked_as === 'pl_mov')
                            radioButtonContainer.querySelector("#rbBookingPl").checked = true;
                        else if (playerBooked[0].booked_as === 'pl_gk')
                            radioButtonContainer.querySelector("#rbBookingGk").checked = true;
                        else
                            radioButtonContainer.querySelector("#rbBookingNull").checked = true;
                    }
                    else {
                        radioButtonContainer.querySelector("#rbBookingNull").checked = true;
                    }
                    
                    const btnBookingConfirm = document.createElement('button');
                    btnBookingConfirm.innerText = "✔️";
                    btnBookingConfirm.addEventListener('click', (event) => {
                        const radioGroupName = `radio-player-${player.id}`;
                        const selected = radioButtonContainer.querySelector(`input[name=${radioGroupName}]:checked`);
                        bookMatch(matchId, player.id, selected.value, event);
                    });
                    radioButtonContainer.appendChild(btnBookingConfirm);

                    cellBooking.appendChild(radioButtonContainer);
                    
                    row.appendChild(cellBooking);

                    tableBody.appendChild(row);
                });

            } catch (error) {
                console.error("Errore nel recupero dei nomi e delle prenotazioni:", error);
            }
            
        });

        const simulateTeamsButton = document.getElementById('simulateTeamsButton');
        //GESTIRE LA VISIBILITY DEL BUTTON ABILITANDOLA SOLO SE LA PARTITA è COMPLETA
        simulateTeamsButton.addEventListener('click', async () => {
            try {
                // Avvia due richieste al database in parallelo
                const [response1, response2] = await Promise.all([
                    fetch(`http://localhost:3000/matches/${matchId}`),
                    fetch(`http://localhost:3000/bookings/${matchId}`)
                ]);
                
                // Controlla se entrambe le risposte sono ok
                if (!response1.ok || !response2.ok) throw new Error("Errore nel recupero dati");

                const match = await response1.json();
                const bookings = await response2.json();
                
                bookings.map(booking => {
                    delete booking.id;
                    delete booking.id_match;
                    return booking;
                });
                
                sessionStorage.setItem('numberOfPlayers', match.players);
                sessionStorage.setItem('bookings', JSON.stringify(bookings));
                window.location.href = "selection.html";

            } catch (error) {
                console.error("Errore nel recupero dei dettagli del match:", error);
            }
            
        });

        // Mostra il modale
        const modal = document.getElementById("matchModal");
        modal.style.display = "block";

    } catch (error) {
        console.error("Errore nel recupero dei dettagli del match:", error);
    }
}

//createRadioButton("rbBookingNull", player.id, "🚫");
function createRadioButton(container, idRadioButton, value, idPlayer, labelText) {
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.id = idRadioButton;
    radioButton.value = value;
    radioButton.name = `radio-player-${idPlayer}`;
    const labelRb = document.createElement("label");
    labelRb.htmlFor = idRadioButton;
    labelRb.innerText = labelText;

    container.appendChild(radioButton);
    container.appendChild(labelRb);
}


function closeModal(event) {
    //const modal = document.getElementById("matchModal");
    //modal.style.display = "none";
    const modal = event.target.closest('.modal'); // Trova il modale che ha chiamato la funzione
    if (modal) {
        modal.style.display = 'none'; // Nasconde il modale
    }
}


async function bookMatch(matchId, playerId, role, event) {
    //Verifica se è già presente una prenotazione
    let isPresent;
    let booking;
    try {
        const params = new URLSearchParams({
            matchId :   matchId,
            playerId:   playerId
        });

        const response = await fetch(`http://localhost:3000/bookings/check-booking?${params.toString()}`);

        const data = await response.json();
        //data.isPresent = true se esiste una prenotazione
        //data.isPresent = false se NON esiste una prenotazione
        isPresent = data.isPresent;
        booking = data.booking;
        //console.log(booking);
    } catch (error) {
        console.error("Errore durante il check della prenotazione:", error);
    }

    if (role === "") { //Eliminare la prenotazione
        //Se NON è presente una prenotazione --> Avvisa l'utente che non può cancellare una prenotazione che non esiste
        if (!isPresent) {
            alert("Attenzione! Non esiste nessuna prenotazione da cancellare.")
        }

        //Se è presente una prenotazione --> Elimina la prenotazione esistente
        else {
            let deleted = false; //Variabile di controllo per autorizzare il delete nella tabella payments solo se il delete nella tabella bookings ha avuto successo
            try {
                const response = await fetch('http://localhost:3000/bookings/delete-booking', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        matchId:    matchId,
                        playerId:   playerId, 
                        bookedAs:   booking.booked_as
                    })
                });

                const data = await response.json();
                deleted = data.success;
                alert(data.message);

            } catch (error) {
                console.error("Errore durante la cancellazione della prenotazione:", error);
            }

            if (deleted) {
                //Elimina l'user dalla tabella payments
                try {
                    const response = await fetch('http://localhost:3000/payments/delete-payment', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            matchId:    matchId,
                            playerId:   playerId,
                        })
                    });

                    const data = await response.json();

                } catch (error) {
                    console.error("Errore durante la cancellazione dell'user dai pagamenti:", error);
                }
            }

        }
    }
    else { //Creare o modificare la prenotazione

        //Se NON è presente una prenotazione --> Crea una nuova prenotazione
        if(!isPresent) {
            
            let booked = false; //Variabile di controllo per autorizzare l'insert nella tabella payments solo se l'insert nella tabella bookings ha avuto successo
            
            try {
                const response = await fetch('http://localhost:3000/bookings/new-booking', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        matchId:    matchId,
                        playerId:   playerId, 
                        bookedAs:   role
                    })
                });

                const data = await response.json();
                booked = data.success;
                alert(data.message);

            } catch (error) {
                console.error("Errore durante la prenotazione:", error);
            }

            if (booked) {
                //Inserisci l'user nella tabella payments
                try {
                    const response = await fetch('http://localhost:3000/payments/new-payment', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            matchId:    matchId,
                            playerId:   playerId,
                        })
                    });

                    const data = await response.json();

                } catch (error) {
                    console.error("Errore durante l'inserimento nei pagamenti:", error);
                }
            }
        }

        //Se è presente una prenotazione --> Modifica la prenotazione esistente (Può essere solo un passaggio da pl_mov a pl_gk o viceversa dato che la gestione dell'annullamento avviene sopra)
        //NB: non è necessario operare sulla tabella payments in quanto il record era già presente da new-booking --> new-payment qui sopra 
        else {
            
            try {
                const response = await fetch('http://localhost:3000/bookings/update-booking', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        matchId:    matchId,
                        playerId:   playerId, 
                        bookedAs:   role
                    })
                });

                const data = await response.json();
                alert(data.message);

            } catch (error) {
                console.error("Errore durante la prenotazione:", error);
            }
            
        }
        
    }
    
}

async function showPaymentsDetails(matchId) {
    
    const tableBody = document.querySelector('#table-payments tbody');
    tableBody.innerHTML = "";
    
    try {
        const response = await fetch(`http://localhost:3000/payments/${matchId}`);
        const payments = await response.json();

        //const detailsDiv = document.getElementById("paymentsDetails");
        payments.forEach(payment => {
            const row = document.createElement('tr');
            const cellName = document.createElement('td');
            cellName.textContent = payment.name;
            row.appendChild(cellName);

            const cellPayment = document.createElement('td');

            const radioButtonContainer = document.createElement('div');
            //radioButtonContainer.id = "radioButtonContainerPayment";
            radioButtonContainer.classList.add("radioButtonContainer");

            createRadioButton(radioButtonContainer, "rbPaymentNull", "", payment.id_player, "🚫 Non pagato");
            createRadioButton(radioButtonContainer, "rbPaymentCash", "cash", payment.id_player, "💶 Contanti");
            createRadioButton(radioButtonContainer, "rbPaymentSatispay", "satispay", payment.id_player, "📱 Satispay");
            
            
            if (payment.paid_with === 'cash')
                radioButtonContainer.querySelector("#rbPaymentCash").checked = true;
            else if (payment.paid_with === 'satispay')
                radioButtonContainer.querySelector("#rbPaymentSatispay").checked = true;
            else
                radioButtonContainer.querySelector("#rbPaymentNull").checked = true;
            
            
            
            const btnPaymentConfirm = document.createElement('button');
            btnPaymentConfirm.innerText = "✔️";
            btnPaymentConfirm.addEventListener('click', (event) => {
                const radioGroupName = `radio-player-${payment.id_player}`;
                const selected = radioButtonContainer.querySelector(`input[name=${radioGroupName}]:checked`);
                if (selected.value !== payment.paid_with)
                updatePayment(matchId, payment.id_player, selected.value, event);
            });
            radioButtonContainer.appendChild(btnPaymentConfirm);

            cellPayment.appendChild(radioButtonContainer);
            
            row.appendChild(cellPayment);

            tableBody.appendChild(row);
        });


        // Mostra il modale
        const modal = document.getElementById("paymentsModal");
        modal.style.display = "block";

    } catch (error) {
        console.error("Errore nel recupero dei dettagli dei pagamenti:", error);
    }
    
}


async function updatePayment(matchId, playerId, paidWith, event) {
    paidWith = paidWith === "" ? null : paidWith;

    try {
        const response = await fetch('http://localhost:3000/payments/update-payment', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                matchId:    matchId,
                playerId:   playerId, 
                paidWith:   paidWith
            })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Errore durante l'aggiornamento del pagamento:", error);
    }
}
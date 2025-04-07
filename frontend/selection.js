
//let numberOfPlayers;
//let selectedPlayers;
const playerCount = document.getElementById('player-count');

document.addEventListener('DOMContentLoaded', async () => {
    //const playerSelectionDiv = document.getElementById('player-selection');
    const numberOfPlayers = JSON.parse(sessionStorage.getItem('numberOfPlayers'));
    const bookings = JSON.parse(sessionStorage.getItem('bookings'));

    //const user = localStorage.getItem('username');
    const user = sessionStorage.getItem('username');
    
    if (user) showContent();

    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'none';
    

    if (numberOfPlayers && bookings) {
        playerCount.value = String(numberOfPlayers);
        await createDropdownElements(numberOfPlayers);
        selectGoalkeepers(bookings);
        selectDropdownElements(bookings);
    }
    
});


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

function goToHome() {
    window.location.href = "index.html";
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

async function createDropdownElements(numberOfPlayers) {
    
    const playerSelectionArea = document.getElementById('player-selection-area');
    const tableBody = document.querySelector('#table-selection tbody');
    tableBody.innerHTML = "";
    //playerSelectionArea.innerHTML = '';
    
    let names;
    try {
        const response = await fetch('http://localhost:3000/players/names');
        const namesFetched = await response.json();
        names = namesFetched;
        
    } catch (error) {
        console.error("Errore:", error);
    }

    for (let i = 0; i < numberOfPlayers; i++) {
        const row = document.createElement("tr");
        
        //Team
        const cellTeam = document.createElement("td");

        const selectTeam = document.createElement('select');
        selectTeam.name = `playerTeam-${i}`;
        //select.classList.add('player-select');

        const optionNull = document.createElement('option');
        optionNull.value = "";
        optionNull.textContent = "Seleziona";
        selectTeam.appendChild(optionNull);
        const optionA = document.createElement('option');
        optionA.value = "A";
        optionA.textContent = "A";
        selectTeam.appendChild(optionA);
        const optionB = document.createElement('option');
        optionB.value = "B";
        optionB.textContent = "B";
        selectTeam.appendChild(optionB);

        cellTeam.appendChild(selectTeam);
        row.appendChild(cellTeam);



        //Portiere
        const cellKeeper = document.createElement("td");
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = `goalkeeper-${i}`;
        checkbox.classList.add('goalkeeper-checkbox');
        
        cellKeeper.appendChild(checkbox);
        row.appendChild(cellKeeper);
        



        //Nome
        const cellName = document.createElement("td");

        const select = document.createElement('select');
        select.name = `player-${i}`;
        select.classList.add('player-select');

        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Seleziona";
        select.appendChild(option);

        names.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            select.appendChild(option);
        });
        
        cellName.appendChild(select);
        row.appendChild(cellName);
        


        //Condizione
        const cellCondition = document.createElement("td");
        
        const input = document.createElement("input");
        input.name = `playerCondition-${i}`;
        input.type = "number";
        input.value = 100;
        input.classList.add('player-condition');

        cellCondition.appendChild(input);
        row.appendChild(cellCondition);
        
        
        
        
        
        

        tableBody.appendChild(row);

        /*
        const playerContainer = document.createElement('div');
        playerContainer.classList.add('player-container');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = `goalkeeper-${i}`;
        checkbox.classList.add('goalkeeper-checkbox');

        const checkboxLabel = document.createElement('label');
        checkboxLabel.textContent = 'Pt ';
        checkboxLabel.appendChild(checkbox);

        playerContainer.appendChild(checkboxLabel);

        const select = document.createElement('select');
        select.name = `player-${i}`;
        select.classList.add('player-select');

        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Seleziona";
        select.appendChild(option);

        fetch('http://localhost:3000/players')
            .then(response => response.json())
            .then(players => {
                players.playersInfo.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player.id;
                    option.textContent = player.name;
                    select.appendChild(option);
                });
            });

        
        playerContainer.appendChild(select);

        playerSelectionArea.appendChild(playerContainer);
        */
    }
}

function selectDropdownElements(bookedPlayers) {
    const playerIds = Array.from(bookedPlayers).map(bookedPlayers => bookedPlayers.id_player);
    const numberOfPlayers = parseInt(playerCount.value);
    for (let i = 0; i < numberOfPlayers; i++) {
        const select = document.getElementsByName(`player-${i}`);
        
        if (!select[0]) return;
        
        for (let option of select[0].options) {
            if (parseInt(option.value) === playerIds[i]) {
                option.selected = true;
                break;
            }
        }
    }
}

function selectGoalkeepers(bookedPlayers) {
    const playerBookings = Array.from(bookedPlayers).map(bookedPlayers => bookedPlayers.booked_as);
    const numberOfPlayers = parseInt(playerCount.value);
    for (let i = 0; i < numberOfPlayers; i++) {
        const checkbox = document.getElementsByName(`goalkeeper-${i}`);
        
        if (!checkbox[0]) return;
        
        checkbox[0].checked = playerBookings[i] === 'pl_gk';   
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

playerCount.addEventListener('change', async () => {

    sessionStorage.removeItem('numberOfPlayers');
    sessionStorage.removeItem('bookings');
    const numberOfPlayers = parseInt(playerCount.value);
    await createDropdownElements(numberOfPlayers);
    
});


document.getElementById('selection-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const numberOfPlayers = parseInt(playerCount.value);
    let selectedPlayers = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        selectedPlayers.push({
            playerId: formData.get(`player-${i}`),
            isGoalkeeper: formData.has(`goalkeeper-${i}`),
            teamSelected: formData.get(`playerTeam-${i}`),
            playerCondition: formData.get(`playerCondition-${i}`)
            
        });
    }
    console.log(selectedPlayers);
    GeneraTeams(numberOfPlayers, selectedPlayers);
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const rolesAvailable = 5;
//let numberOfPlayers;
let rolesEnabled;
let preliminaryLevel;
let randomNumber;

let rolesDictionary;
let rolesQuantity;
let rolesCounters;

let rolesDictionaryLength;
//let rolesCounterForCombs;
let subcategoriesDictionaryTitles;
let categoriesDictionary;
let categoriesDictionaryTitles;
let categoriesDictionaryLength;

let counterCharacteristicsForEachCategory;

let players = [];
let participants;

let numberOfCombinations;
let numberOfRolesForCombinations;
//let combinations = [];

let validCombinations = [];
let numberOfValidCombinations;

let validCombinations_F1 = [];
let validCombinations_F2 = [];
let validCombinations_F3 = [];

let matrixSupportScore = [];

/////////////////////////////////////////////////////////////
//let myInterval;
//const progressBar = document.querySelector('progress');
//const progressLabel = document.querySelector('.progressCaption');

//const mainSection = document.querySelector('main');
//const scriptButton = document.querySelector('#scriptButton');

//const whitePlayers = document.querySelectorAll('.white > .player');
//const blackPlayers = document.querySelectorAll('.black > .player');




/////////////////////////////////////////////////////////////

class CategoriesDictionary {
    constructor(categories) {
        this.categories = categories;
    }

    getTitles() {
        let titles = [];
        this.categories.forEach(cat => {
            titles.push(cat.name);
        });
        return titles;
    }

    getShortTitles() {
        let shortTitles = [];
        const titles = this.getTitles();
        titles.forEach(title => {
            shortTitles.push(title.substr(0, 3));
        });
        return shortTitles;
    }

    getCompleteDictionary() {
        let dictionary = {};
        this.categories.forEach(cat => {
            dictionary[cat.name] = cat.subcategories;
        });
        return dictionary;
    }

    getCounterSubcategoriesForEachCategory() {
        let counter = [];
        this.categories.forEach(cat => {
            counter.push(cat.subcategories.length);
        });
        return counter;
    }
}

class Category {
    constructor(name, subcategories) {
        this.name = name;
        this.subcategories = subcategories;
    }
}

class RolesDictionary {
    constructor(numberOfPlayers) {
        this.rolesList = ['Pt', 'Dc', 'Ts', 'Td', 'Cc', 'Es', 'Ed', 'At'];
        this.setRolesQuantity(numberOfPlayers);
        this.initializeRolesCounters();
    }
    
    setRolesQuantity(numberOfPlayers) {
        let rolesQuantity = {};
        this.rolesList.forEach(role => rolesQuantity[role] = 2);

        //Particular cases
        switch (numberOfPlayers) {
            case 22:
                rolesQuantity['At'] += 2;
            case 20:
                rolesQuantity['Dc'] += 2;
            case 18:
                rolesQuantity['Cc'] += 2;
                break;
            case 16:
                break;
            case 10:
                rolesQuantity['Ts'] -= 2;
                rolesQuantity['Td'] -= 2;
                rolesQuantity['Cc'] += 2;
            case 12:
                rolesQuantity['Cc'] -= 2;
            case 14:
                rolesQuantity['At'] -= 2;
                break;
            default:
                break;
        }
        this.rolesQuantity = rolesQuantity;
    }

    initializeRolesCounters() {
        let rolesCounters = {};
        this.rolesList.forEach(role => rolesCounters[role] = 0);
        this.rolesCounters = rolesCounters;
    }

}

class Role {
    constructor(name, abbreviation) {
        this.name = name;
        this.abbreviation = abbreviation;
    }
}

class Skill {
    constructor(name, value, category) {
        this.name = name;
        this.value = value;
        this.category = category;
    }
}

class Player {
    constructor(name, roles, skills) {
        this.name = name;
        this.roles = roles;
        this.skills = skills;
                
        this.setCondition(100);
        this.setLock(false);
        this.setGoalkeeper(false);
        this.calculateNumberOfRoles();
    }

    setCondition(condition) {
        this.condition = condition;
    }

    setLock(isLocked) {
        this.isLocked = isLocked;
    }

    setGoalkeeper(isGoalkeeper) {
        this.isGoalkeeper = isGoalkeeper;
        if (this.isGoalkeeper === true)
        this.calculateNumberOfRoles();
    }

    calculateNumberOfRoles() {
        if (this.isGoalkeeper === true) {
            this.numberOfRoles = 1;
            this.roles = ['Pt'];
        }
        else
        this.numberOfRoles = this.roles.includes('Pt') ? this.roles.length - 1 : this.roles.length;
    }

    getSkillsTotal() {
        let total = 0;
        this.skills.forEach(skill => {
            total += skill.value;
        });
        return total;
    }

    getSkillsTotalForCategory(category) {
        let total = 0;
        this.skills.forEach(skill => {
            if(skill.category === category)
            total += skill.value;
        });
        return total;
    }
}

class Participants {
    constructor(players) {
        this.players = players;
    }

    getNumberOfCombinations(numberOfPlayers) {
        // Numero di combinazioni per dividere 16 persone in 2 gruppi da 8
        let totalCombinations = Combinazioni(numberOfPlayers, numberOfPlayers / 2);

        // Dividere per 2 per evitare di contare le divisioni uguali
        let uniqueCombinations = totalCombinations / 2;

        return uniqueCombinations;
    }

    getNumberOfRolesForCombinations() {
        let numberOfRolesForCombinations = 1;
        this.players.forEach(player => {
            numberOfRolesForCombinations *= player.numberOfRoles;
        });
        return numberOfRolesForCombinations;
    }

    //NON HA CHIAMATE, VALUTARE DI ELIMINARE IL METODO
    getValidCombinations(matrixOfCombinations, numberOfPlayers) {
        const frequency = (arr, item) => {
            return arr.filter(x => x === item).length;
        };

        let validCombinations = [];

        matrixOfCombinations.forEach(combination => {
            let isValid = true;
            let roles = [];
            for (let i = 0; i < numberOfPlayers; i++) {
                const role = this.players[i].roles[combination[i] - 1];
                roles.push(role);
                //Controllo se con il ruolo appena aggiunto ho superato il limite previsto dallo schema, nel caso interrompo il ciclo for
                if (frequency(roles, role) > rolesDictionary.rolesQuantity[role]) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                let combination = [];
                for (let i = 0; i < numberOfPlayers; i++) {
                    combination.push([this.players[i].name, roles[i]]);
                }
                validCombinations.push(combination);
            }
        });


        return validCombinations; // = [[['Alessandro', 'Cc'], ['Andrea', 'Ed'], ['Andrea O.', 'Td'], ...], [['Alessandro', 'Cc'], ['Andrea', 'Ed'], ['Andrea O.', 'Ts'], ...], [['Alessandro', 'Cc'], ['Andrea', 'Es'], ['Andrea O.', 'Td'], ...], ...]
    }

}

class Team {
    constructor(players) {
        this.players = players;
    }

    getGoalKeeper() {
        let goalKeeper;
        this.players.forEach(player => {
            if (player.isGoalkeeper)
            goalKeeper = player;
        });
        return goalKeeper
    }

    getOrderedPlayersNames() {
        //let keeper = this.getGoalKeeper();
        //console.log(keeper);
        let playersNames = [this.getGoalKeeper().name];
        this.players.forEach(player => {
            if (!player.isGoalkeeper)
            playersNames.push(player.name);
        });
        return playersNames;
    }

    calculateTotalScores() {
        let totalScores = {};
        this.players.forEach(player => {
            player.skills.forEach(skill => {
                if ((!player.isGoalkeeper && skill.category !== 'POR') || (player.isGoalkeeper && skill.category === 'POR')) {
                    if (totalScores[skill.name])
                    totalScores[skill.name] += skill.value;
                    else
                    totalScores[skill.name] = skill.value;
                }
            });
        });

        this.totalScores = totalScores;
    }
}

class Formations {
    constructor(team1, team2) {
        this.teams = [team1, team2];
    }

    isValid() {
        let response = [];
        
        this.teams.forEach(team => {
            rolesDictionary.initializeRolesCounters();
            let assegnazioni = rolesDictionary.rolesCounters;

            // Funzione ricorsiva di backtracking
            function provaAssegnazione(index) {
                if (index === team.players.length) {
                    // Se tutti i giocatori sono stati processati, verifica se i ruoli sono coperti correttamente
                    return assegnazioni.Pt === 1 &&
                        assegnazioni.Dc === 1 &&
                        assegnazioni.Ts === 1 &&
                        assegnazioni.Td === 1 &&
                        assegnazioni.Cc === 1 &&
                        assegnazioni.Es === 1 &&
                        assegnazioni.Ed === 1 &&
                        assegnazioni.At === 1;
                }

                const player = team.players[index];

                // Prova ogni ruolo che il giocatore può ricoprire
                for (let role of player.roles) {
                    if (/*role === "Cc" && assegnazioni.Cc < 2 || role !== "Cc" && */assegnazioni[role] < 1) {
                        // Se il ruolo è "Cc", deve essere coperto da 2 giocatori, altrimenti da 1
                        assegnazioni[role]++;
                        
                        // Prova l'assegnazione successiva
                        if (provaAssegnazione(index + 1)) {
                            return true;
                        }

                        // Se non è valida, annulla l'assegnazione e prova un'altra
                        assegnazioni[role]--;
                    }
                }

                return false;
            }

            // Inizia con il primo giocatore
            response.push(provaAssegnazione(0));
        });
        rolesDictionary.initializeRolesCounters();
        return response[0] && response[1];
    }

    getTotalScores() {
        this.teams.forEach(team => {
            team.calculateTotalScores();
        });

    }

    getDeltaScores() {
        let deltaScores = {};
        Object.keys(subcategoriesDictionaryTitles).forEach(category => {
            subcategoriesDictionaryTitles[category].forEach(subCat => {
                deltaScores[subCat] = this.teams[0].totalScores[subCat] - this.teams[1].totalScores[subCat];
            });
        });
        this.deltaScores = deltaScores;
    }

    firstFilter() {
        let deltaSumAllScores = 0;
        Object.keys(subcategoriesDictionaryTitles).forEach(category => {
            let deltaSumCharScores = 0;
            subcategoriesDictionaryTitles[category].forEach(subCat => {
                deltaSumCharScores += this.deltaScores[subCat];
            });
            deltaSumAllScores += deltaSumCharScores;
        });
        this.firstDeltaSumAllScores = deltaSumAllScores;
    }

    secondFilter() {
        let deltaSumAllScores = 0;
        Object.keys(subcategoriesDictionaryTitles).forEach(category => {
            let deltaSumCharScores = 0;
            subcategoriesDictionaryTitles[category].forEach(subCat => {
                deltaSumCharScores += this.deltaScores[subCat];
            });
            deltaSumAllScores += Math.abs(deltaSumCharScores);
        });
        this.secondDeltaSumAllScores = deltaSumAllScores;
    }

    thirdFilter() {
        let maxDeltaScore = 0;
        Object.keys(subcategoriesDictionaryTitles).forEach(category => {
            subcategoriesDictionaryTitles[category].forEach(subCat => {
                if (Math.abs(this.deltaScores[subCat]) > maxDeltaScore)
                maxDeltaScore = Math.abs(this.deltaScores[subCat]);
            });
        });
        this.maxDeltaScore = maxDeltaScore;
    }
}



async function GeneraTeams(numberOfPlayers, selectedPlayers) {
    
    //FillProgressBar(0);
    //Esegue le operazioni preliminari come lo svuotamento del foglio e la creazione dei dizionari dei ruoli e delle categorie
    if (!PreliminaryOperations(numberOfPlayers)) return;
    
    //FillProgressBar(10);
    //Controlla se sono stati inseriti tutti i giocatori e se non ci sono dei doppioni
    //if (!CheckParticipants()) return;

    //FillProgressBar(20);

    //Controlla se ci sono 2 portieri e se non sono vincolati alla stessa squadra
    //if (!CheckGoalkeepers()) return;

    //FillProgressBar(30);

    //Controlla se ci sono delle condizioni fisiche al di sotto del 100% e, nel caso, fa apparire un messaggio di riepilogo
    //if (!CheckPlayersConditions()) return;

    //FillProgressBar(40);

    UpdateScriptLog("Raccolgo le informazioni sui giocatori...");

    //Create players
    await CreatePlayers(numberOfPlayers, selectedPlayers);

    //FillProgressBar(50);

    UpdateScriptLog((rolesEnabled === true ? "Combinando i ruoli di tutti i giocatori e applicando il livello " + preliminaryLevel : "Non considerando i ruoli di ciascun giocatore") + ", risultano " + numberOfRolesForCombinations.toLocaleString('it-IT') + " soluzioni possibili.");

    if (!FindCombinations(numberOfPlayers)) return;

    //FillProgressBar(70);

    if (!GetDeltaScores()) return;

    //FillProgressBar(90);

    FiltersApplication();

    //FillProgressBar(100);

    ShowResult(numberOfPlayers);

}

function UpdateScriptLog(log) {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString();  // Usa la localizzazione del browser

    const logTableBody = document.querySelector('#table-log tbody');
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.textContent = formattedDate + ':   ' + log;
    row.appendChild(cell);
    logTableBody.appendChild(row);
}

function ShowResult(numberOfPlayers) {

    const resultArea = document.getElementById('result-area');
    resultArea.style.display = resultArea.style.display === 'block' ? 'none' : 'block';
    
    const tableBody = document.querySelector('#table-result tbody');
    tableBody.innerHTML = "";
    
    let whiteTeam = validCombinations_F3[0].teams[0].getOrderedPlayersNames();
    let blackTeam = validCombinations_F3[0].teams[1].getOrderedPlayersNames();
    
    for (let i = 0; i < numberOfPlayers / 2; i++) {
        const row = document.createElement("tr");
        
        //Bianchi
        const cellWhite = document.createElement("td");
        cellWhite.textContent = i === 0 ? '🧤 ' + whiteTeam[i] : whiteTeam[i];
        row.appendChild(cellWhite);
        
        //Neri
        const cellBlack = document.createElement("td");
        cellBlack.textContent = i === 0 ? blackTeam[i] + ' 🧤' : blackTeam[i];
        row.appendChild(cellBlack);

        //whitePlayers[i].innerText = i === 0 ? '🧤 ' + whiteTeam[i] : whiteTeam[i];
        //blackPlayers[i].innerText = i === 0 ? blackTeam[i] + ' 🧤' : blackTeam[i];
        tableBody.appendChild(row);
    }
    

}

function FillProgressBar(percentage) {
    //percentage += 2;
    progressBar.value = percentage;
    progressLabel.innerText = `${percentage}%`;

    /*
    if (percentage >= 0 && percentage < 33)
    programPhase.innerText = 'Programmazione del micro BGM111 in corso (BGM111_v0100.hex)';
    if (progress >= 33 && progress < 66)
    programPhase.innerText = 'Programmazione del micro 2012 in corso (msp2012_v0200.hex)';
    if (progress >= 66 && progress < 99)
    programPhase.innerText = 'Programmazione del micro LG232 in corso (AK.v01.06.hex)';
    */
    //if (percentage >= 100) {
        //clearInterval(myInterval);
        //showResult();
    //}
}

function PreliminaryOperations(numberOfPlayers) {

    //Raccolgo il numero di giocatori
    //numberOfPlayers = 16; //MODIFICARE
  
    //Raccolgo la preferenza di abilitazione ruoli
    rolesEnabled = true; //MODIFICARE
  
    //Imposto il preliminaryLevel uguale al massimo di ruoli consentiti per ciascun giocatore
    preliminaryLevel = rolesAvailable;

    //Creo il numero random tra 1 e 2 per scegliere poi casualmente la disposizione dei giocatori nei neri o nei bianchi
    randomNumber = Math.floor(Math.random() * 2) + 1;
    
    //Svuoto la progressBar
    //MODIFICARE

    //Svuoto/avvio il log
    //UpdateScriptLog("Script log:");

    //Avvio la progress bar
    //UpdateProgressBar(0);
    
    UpdateScriptLog("Avvio script per partita a " + numberOfPlayers + " giocatori con preferenza sui ruoli " + (rolesEnabled === true ? "ABILITATA." : "DISABILITATA."));

    //Creo il dizionario dei ruoli basato sul numero di giocatori
    if (!CreateRolesDictionary(numberOfPlayers)) return false;
    //console.log(rolesDictionary);
    
    let msg = "";
    Object.keys(rolesDictionary.rolesQuantity).forEach(key => {
      msg += key + " (" + rolesDictionary.rolesQuantity[key] + "), ";
    });
    msg = msg.slice(0, msg.length - 2);
    
  
    UpdateScriptLog("Schema previsto: " + (rolesEnabled === true ? msg : "N/A"));
  
    //Creo il dizionario delle categorie e delle sotto categorie
    if (!CreateCategoriesDictionary()) return false;


    //VALUTARE DI RACCOGLIERE TUTTO IN UNA FZ APPOSTA
    //------------------------------------------------------
    //Raccolgo i pesi delle varie caratteristiche
    /*
    let pesiCaratt = rngPesiCaratteristiche.getValues();
    var pesi = {};
    Object.values(pesiCaratt).forEach(caratt => { 
      pesi[caratt[0]] = caratt[1];
    });
    Object.keys(categoriesDictionary).forEach(key => {
      weightsChar[key] = pesi[categoriesDictionary[key]];
    });
    */
    //-------------------------------------------------------
  
    //Inizializzo gli scoresOverall delle due squadre
    //teamWhite = {scoresOverall : []};
    //teamBlack = {scoresOverall : []};
  
    return true;
}


function CreateCategoriesDictionary() {
    //VALUTARE DI SPOSTARE QUESTA PARTE ALL'INTERNO DEL CONSTRUCTOR DELLA CLASSE CategoriesDictionary
    const fis = new Category('FISICHE', ['agilità', 'elevazione', 'forza', 'resistenza', 'velocità']);
    const tec = new Category('TECNICHE', ['controllo', 'dribbling', 'tiro', 'piede forte', 'piede debole']);
    const tat = new Category('TATTICHE', ['posizionamento', 'marcamento', 'smarcamento', 'visione di gioco']);
    const car = new Category('CARATTERIALI', ['autorità', 'concentrazione', 'motivazione', 'spirito di sacrificio']);
    const por = new Category('PORTIERE', ['riflessi', 'uscite', 'comunicazione', 'lanci lunghi']);
    
    const categories = new CategoriesDictionary([fis, tec, tat, car, por]);
    
    categoriesDictionary = categories.getShortTitles();//['FIS', 'TEC', 'TAT', 'CAR', 'POR'];
    categoriesDictionaryTitles = categories.getTitles();//['FISICHE', 'TECNICHE', 'TATTICHE', 'CARATTERIALI', 'PORTIERE'];
    categoriesDictionaryLength = categoriesDictionary.length;
    subcategoriesDictionaryTitles = categories.getCompleteDictionary(); //ATTENZIONE! Le categorie sono disordinate essendo un dictionary
    
    /*
    subcategoriesDictionaryTitles = {
        'FISICHE': ['Agilità', 'Elevazione', 'Forza', 'Resistenza', 'Velocità'],
        'TECNICHE': ['Controllo', 'Dribbling', 'Tiro', 'Piede forte', 'Piede debole'],
        'TATTICHE': ['Posizionamento', 'Marcamento', 'Smarcamento', 'Visione di gioco'],
        'CARATTERIALI': ['Autorità', 'Concentrazione', 'Motivazione', 'Spirito di sacrificio'],
        'PORTIERE': ['Riflessi', 'Uscite', 'Comunicazione', 'Lanci lunghi']
    };
    */

    //Trova il numero di caratteristiche per ogni categoria
    //FindNumberOfCharacteristicsForEachCategory(); //DEPRECATA CON UNA FUNZIONE DELLA CLASSE CategoriesDictionary
    counterCharacteristicsForEachCategory = categories.getCounterSubcategoriesForEachCategory();
    //console.log(counterCharacteristicsForEachCategory);

    return true;
}


function CreateRolesDictionary(numberOfPlayers) {
    //VALUTARE DI TRASFERIRE TUTTO IN UNA CLASSE COME STATO FATTO PER CATEGORIESDICTIONARY
    rolesDictionary = new RolesDictionary(numberOfPlayers);
    /*
    switch (numberOfPlayers) {
        case 22:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Cc", 6: "Es", 7: "Ed", 8: "At"};
          rolesQuantity = {"Pt": 2, "Dc": 4, "Ts": 2, "Td": 2, "Cc": 4, "Es": 2, "Ed": 2, "At": 4};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Cc": 0, "Es": 0, "Ed": 0, "At": 0};
          break;
        case 20:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Cc", 6: "Es", 7: "Ed", 8: "At"};
          rolesQuantity = {"Pt": 2, "Dc": 4, "Ts": 2, "Td": 2, "Cc": 4, "Es": 2, "Ed": 2, "At": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Cc": 0, "Es": 0, "Ed": 0, "At": 0};
          break;
        case 18:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Cc", 6: "Es", 7: "Ed", 8: "At"};
          rolesQuantity = {"Pt": 2, "Dc": 2, "Ts": 2, "Td": 2, "Cc": 4, "Es": 2, "Ed": 2, "At": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Cc": 0, "Es": 0, "Ed": 0, "At": 0};
          break;
        case 16:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Cc", 6: "Es", 7: "Ed", 8: "At"};
          rolesQuantity = {"Pt": 2, "Dc": 2, "Ts": 2, "Td": 2, "Cc": 2, "Es": 2, "Ed": 2, "At": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Cc": 0, "Es": 0, "Ed": 0, "At": 0};
          break;
        case 14:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Cc", 6: "Es", 7: "Ed"};
          rolesQuantity = {"Pt": 2, "Dc": 2, "Ts": 2, "Td": 2, "Cc": 2, "Es": 2, "Ed": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Cc": 0, "Es": 0, "Ed": 0};
          break;
        case 12:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Ts", 4: "Td", 5: "Es", 6: "Ed"};
          rolesQuantity = {"Pt": 2, "Dc": 2, "Ts": 2, "Td": 2, "Es": 2, "Ed": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Ts": 0, "Td": 0, "Es": 0, "Ed": 0};
          break;
        case 10:
          rolesDictionary = {1: "Pt", 2: "Dc", 3: "Cc", 4: "Es", 5: "Ed"};
          rolesQuantity = {"Pt": 2, "Dc": 2, "Cc": 2, "Es": 2, "Ed": 2};
          rolesCounters = {"Pt": 0, "Dc": 0, "Cc": 0, "Es": 0, "Ed": 0};
          break;
        default:
          return false;
    }

    rolesDictionaryLength = Object.keys(rolesDictionary).length;
  
    //rolesCounterForCombs = JSON.parse(JSON.stringify(rolesCounters));
    */
    return true;

}

async function CreatePlayers(numberOfPlayers, selectedPlayers) {
    const tempPlayers = [];

    numberOfRolesForCombinations = 1;
    const selectedPlayerIds = Array.from(selectedPlayers).map(selectedPlayers => selectedPlayers.playerId);

    
    
    try {
        // Fetch sequenziale dei dati
        for (const playerId of selectedPlayerIds) {

            const playerData_fetched = await fetch(`http://localhost:3000/players/${playerId}`);
            const playerData = await playerData_fetched.json();


            console.log(playerData);

            playerData.playerInfo.forEach(player => {
                const roles = playerData.playerRoles.filter(role => role['id_player'] === player['id']);
                roles.map(role => {
                    delete role.id_player;
                    return role;
                });
                const skills = playerData.playerSkills.filter(skill => skill['id_player'] === player['id']);
                skills.map(skill => {
                    delete skill.id_player;
                    return skill;
                });

                const plRoles = [];
                roles.forEach(roleObj => {
                    if (roleObj.role !== "-")
                    plRoles[parseInt(roleObj.pos) - 1] = roleObj.role;
                });


                const plSkills = [];
                skills.forEach(skillObj => {
                    plSkills.push([skillObj.category, skillObj.value, skillObj.macro_category]);
                });


                const plr = selectedPlayers.find(p => p.playerId === playerId);


                tempPlayers.push({
                    name:   player.name,
                    roles:  plRoles,
                    skills: plSkills,
                    isGoalkeeper: plr.isGoalkeeper
                });

            });
        }
    } catch (error) {
        console.error('Errore durante il fetch dei dati dei giocatori:', error);
        //resultsContainer.innerHTML = 'Errore durante il caricamento dei dati.';
    }

    
    console.log(tempPlayers);
    
    /////////////////////////////////////////////////////////////

    for (let i = 0; i < numberOfPlayers; i++) {
        const name = tempPlayers[i].name;
        const roles = tempPlayers[i].roles;
        let skills = [];
        tempPlayers[i].skills.forEach(skill => {
            skills.push(new Skill(skill[0], skill[1], skill[2]));
        });
        let player = new Player(name, roles, skills);
        
        //Goalkeeper
        if (tempPlayers[i].isGoalkeeper)
        player.setGoalkeeper(true);

        players.push(player);

    }
    console.log(players);

    participants = new Participants(players);
    console.log(participants);
    numberOfCombinations = participants.getNumberOfCombinations(numberOfPlayers);
    numberOfRolesForCombinations = participants.getNumberOfRolesForCombinations();
    console.log(numberOfCombinations);
    console.log(numberOfRolesForCombinations);
    /////////////////////////////////////////////////////////////
    //if (rolesEnabled === false)
    //numberOfRolesForCombinations = Combinazioni(numberOfPlayers - 2, (numberOfPlayers - 2) / 2) / 2; //I portieri non contano perchè sono sempre in squadre opposte
    
    //validCombinationsIndexes = participants.getValidCombinationsIndexes();
    
    

    //return true;
}


// Funzione per calcolare il fattoriale di un numero
function Fattoriale(n) {
    if (n === 0 || n === 1) {
      return 1;
    }
    return n * Fattoriale(n - 1);
}

// Funzione per calcolare la combinazione C(n, k)
function Combinazioni(n, k) {
    return Fattoriale(n) / (Fattoriale(k) * Fattoriale(n - k));
}


function FindCombinations(numberOfPlayers) {

    //let i = 0;
    const combinations = CreateCombinations(numberOfPlayers); //[{team1, team2}, {team1, team2}, ...]
    console.log("combinations = " + combinations.length);
    console.log(combinations);
    
    combinations.forEach(combination => {
        //if (i===1873)
        //console.log(combination);
        if (combination.isValid() === true)
        validCombinations.push(combination);
        
        //i++;
    });

    //console.log(validCombinations);
    
    
    
    //console.log(matrixOfCombinations);

    //if (CheckCombination(currentCombination)) //RIVEDERE
    //validCombinations = participants.getValidCombinations(matrixOfCombinations, numberOfPlayers); //VALUTARE IL CAMBIO NOME DELLA VARIABILE E DELLA CHIAMATA
    //console.log(validCombinations.length);
    //console.log(validCombinations);
    numberOfValidCombinations = validCombinations.length;
    //console.log("numberOfValidCombinations = " + numberOfValidCombinations);

    if (numberOfValidCombinations > 0)
    return true;
    else {
        //GESTIRE IL CASO IN CUI NON VENGANO TROVATE COMBINAZIONI VALIDE
        
        var msg = "Nessuna soluzione valida trovata! Rivedere i ruoli disponibili.\nIl conteggio per i partecipanti selezionati risulta:\n";
        for (var key in rolesCounters) {
            var value = rolesCounters[key];
            msg += key + ": " + value + "\n";
        }
        alert(msg);
        UpdateScriptLog("Script terminato.");
        
      return false;
    }
    
}

function CreateCombinations(numberOfPlayers) {
    let combinations = [];
    

    let binary = (num, places) => Number(num).toString(2).padStart(places, '0');
    
    for (let i = 0; i < 2**(numberOfPlayers - 1); i++) {
      let bin = binary(i, numberOfPlayers);
      if (BinarySum(bin) === numberOfPlayers / 2) {
        let team1 = [];
        let team2 = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            if (Number(bin[i]) === 0)
            team1.push(players[i]);
            else
            team2.push(players[i]);
        }
        combinations.push(new Formations(new Team(team1), new Team(team2)));
        //if (bin === '0010110011100011' || bin === '1101001100011100')
        //console.log(combinations.length - 1);
      }
      //console.log(bin);
      /*
      if (CheckBin(bin) == true) {
        let arrayOfPlayers = [];
        //let k = 1;
        for (let pos = 1; pos <= bin.length; pos++) {
          const bit = bin[pos - 1];
          if (bit != 0) {
            arrayOfPlayers.push(pos); //ATTENZIONE L'INDICE DI arrayOfPlayers è DECREMENTATO DI 1
            //k++;
          }
        }
        
        matrixSupportScore.push(arrayOfPlayers);
        //j++;
      }
      */
    }
    //console.log(combinations);
    return combinations;




    /*
    matrixOfCombinations.push(new Array(numberOfPlayers).fill(1));
    
    for (let n = 1; n < numberOfRolesForCombinations; n++) {
    
        matrixOfCombinations[n] = matrixOfCombinations[n-1].slice();
        
        for (let i = numberOfPlayers - 1; i >= 0; i--) {
            if (matrixOfCombinations[n][i] < players[i].numberOfRoles) { 
                matrixOfCombinations[n][i] += 1;
                if (i != numberOfPlayers - 1) {
                    for (let j = i + 1; j <= numberOfPlayers - 1; j++)
                    matrixOfCombinations[n][j] = 1;
                }
                break;
            }
        }
    }

    return matrixOfCombinations;
    */
  }

  function GetDeltaScores() {
    //let msg2 = "Ognuna di queste " + numberOfValidCombinations.toLocaleString('it-IT') + " soluzioni genera un numero di combinazioni pari a 2 ^ (rd - 1) * \u03A0(qrd - 1), dove rd = ruoli disponibili (es. 8), qrd = quantità ammessa per quel ruolo (es. 2). In totale verranno quindi valutate ";
      
    //let progr = 1;
    //Object.values(rolesQuantity).forEach(qty => { progr *= qty - 1; });

    //const totalCombinations = numberOfValidCombinations * (2**(rolesQuantity.length - 1)) * progr;

    //CreateMatrixSupportScore(); //Creo la matrice di supporto per gli score che è unica e posso applicarla ad ogni combinazione
    //La matrixSupportScore è una matrice da 128 elementi (se numberOfPlayers = 16) organizzata in questo modo: [1, 3, 5, 7, 9, 11, 13, 15], [1, 3, 5, 7, 9, 11, 13, 16], [1, 3, 5, 7, 9, 11, 14, 15], ... [1, 4, 6, 8, 10, 12, 14, 16]. Ogni elemento contiene 8 interi (se numberOfPlayers = 16) che corrispondono ai giocatori da prelevare per effettuare la simulazione. Sempre a 2 a 2 (es. l'ultimo elemento potrà essere soltanto 15 o 16, il penultimo soltanto 13 o 14 e così via...) ATTENZIONE! La situazione è leggermente diversa per quelle formazioni che hanno più di 2 giocatori per ruolo (es. partite a 18, 20 o 22).
    //console.log(matrixSupportScore);

    //validCombinations = [[['Alessandro', 'Cc'], ['Andrea', 'Ed'], ['Andrea O.', 'Td'], ...], [['Alessandro', 'Cc'], ['Andrea', 'Ed'], ['Andrea O.', 'Ts'], ...], [['Alessandro', 'Cc'], ['Andrea', 'Es'], ['Andrea O.', 'Td'], ...], ...]
    
    validCombinations.forEach(combination => {
        combination.getTotalScores();
        combination.getDeltaScores();
        
    });
    //console.log(validCombinations);
    
    return true;
  }


  /*
  function SortPlayers(combination) {
    const progressivePosition = (role) => {
        return arr.reduce((acc, curr, index) => {
            return index <= role ? acc + curr : acc;
        }, 0);
    }

    let sortedCombination = [];
    combination.forEach(nameRole => {
        const role = nameRole[1];
        //let pos = progressivePosition(role)
        //if (sortedCombination[])
        //sortedCombination[] = nameRole;
    });
  }
  */



  function CreateMatrixSupportScore() {
    let binary = (num, places) => Number(num).toString(2).padStart(places, '0');
    
    //let j = 0;
    for (let i = 0; i <= 2**(numberOfPlayers - 1) - 1; i++) {
      let bin = binary(i, numberOfPlayers);
      
      if (CheckBin(bin) == true) {
        let arrayOfPlayers = [];
        //let k = 1;
        for (let pos = 1; pos <= bin.length; pos++) {
          const bit = bin[pos - 1];
          if (bit != 0) {
            arrayOfPlayers.push(pos); //ATTENZIONE L'INDICE DI arrayOfPlayers è DECREMENTATO DI 1
            //k++;
          }
        }
        
        matrixSupportScore.push(arrayOfPlayers);
        //j++;
      }
    }
  }


  function CheckBin(bin) {
    let checked = true;
      
    let counter = 0;
  
    Object.keys(rolesDictionary.rolesQuantity).forEach(role => {
      const binPartial = bin.substr(counter, rolesDictionary.rolesQuantity[role]);
      if (BinarySum(binPartial) != rolesQuantity[role] / 2)
      checked = false;
  
      counter += rolesQuantity[role];
    });
    
    return checked;
  }


  function BinarySum (binNumber) {
    let sum = 0;
    for (let bit of binNumber) {
      sum += Number(bit);
    }
    return sum;
  }


  function FiltersApplication() {

    FirstFilterApplication();
    
    SecondFilterApplication();

    ThirdFilterApplication();
    
  }

  function FirstFilterApplication() {
    validCombinations.forEach(combination => {
        combination.firstFilter();
    });

    const minAfterFirstFilter = FindMinAfterFirstFilter();
    //console.log(minAfterFirstFilter);
    //Trova gli indici corrispondenti ai moduli delle somme più basse delle deltaScores
    //AlgebricalFilterOfSumOfAllDeltaScores(i); //FILTRO 1: sum1 = mod(A+B+...)
    

    validCombinations.forEach(combination => {
        if (Math.abs(combination.firstDeltaSumAllScores) === minAfterFirstFilter)
        validCombinations_F1.push(combination);
    });
    //console.log(validCombinations_F1);
  }
  
  function FindMinAfterFirstFilter() {
    //Inizializzo il min al min della prima combinazione
    let min = Math.abs(validCombinations[0].firstDeltaSumAllScores);
    
    if (min === 0)
    return min;
    
    validCombinations.forEach(combination => {

        if (Math.abs(combination.firstDeltaSumAllScores) < min)
        min = Math.abs(combination.firstDeltaSumAllScores);
        
        if (min === 0)
        return min;
    });
    return min;
  }


  function SecondFilterApplication() {
    validCombinations_F1.forEach(combination => {
        combination.secondFilter();
    });

    const minAfterSecondFilter = FindMinAfterSecondFilter();
    //console.log(minAfterSecondFilter);

    validCombinations_F1.forEach(combination => {
        if (combination.secondDeltaSumAllScores === minAfterSecondFilter)
        validCombinations_F2.push(combination);
    });
    //console.log(validCombinations_F2);
  }

  function FindMinAfterSecondFilter() {
    //Inizializzo il min al min della prima combinazione
    let min = validCombinations_F1[0].secondDeltaSumAllScores;
    
    if (min === 0)
    return min;
    
    validCombinations_F1.forEach(combination => {

        if (combination.secondDeltaSumAllScores < min)
        min = combination.secondDeltaSumAllScores;
        
        if (min === 0)
        return min;
    });
    return min;
  }


  function ThirdFilterApplication() {
    validCombinations_F2.forEach(combination => {
        combination.thirdFilter();
    });

    const minAfterThirdFilter = FindMinAfterThirdFilter();
    //console.log(minAfterThirdFilter);

    validCombinations_F2.forEach(combination => {
        if (combination.maxDeltaScore === minAfterThirdFilter)
        validCombinations_F3.push(combination);
    });
    console.log(validCombinations_F3);
  }

  function FindMinAfterThirdFilter() {
    //Inizializzo il min al min della prima combinazione
    let min = validCombinations_F2[0].maxDeltaScore;
    
    if (min === 0)
    return min;
    
    validCombinations_F2.forEach(combination => {

        if (combination.maxDeltaScore < min)
        min = combination.maxDeltaScore;
        
        if (min === 0)
        return min;
    });
    return min;
  }

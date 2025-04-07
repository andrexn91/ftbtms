const rolesAvailable = 5;
let numberOfPlayers;
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
let myInterval;
const progressBar = document.querySelector('progress');
const progressLabel = document.querySelector('.progressCaption');

const mainSection = document.querySelector('main');
const scriptButton = document.querySelector('#scriptButton');

const whitePlayers = document.querySelectorAll('.white > .player');
const blackPlayers = document.querySelectorAll('.black > .player');




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

    getValidCombinations(matrixOfCombinations) {
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



function GeneraTeams() {
    mainSection.className = 'preparation';
    FillProgressBar(0);
    //Esegue le operazioni preliminari come lo svuotamento del foglio e la creazione dei dizionari dei ruoli e delle categorie
    if (!PreliminaryOperations()) return;
    
    FillProgressBar(10);
    //Controlla se sono stati inseriti tutti i giocatori e se non ci sono dei doppioni
    //if (!CheckParticipants()) return;

    FillProgressBar(20);

    //Controlla se ci sono 2 portieri e se non sono vincolati alla stessa squadra
    //if (!CheckGoalkeepers()) return;

    FillProgressBar(30);

    //Controlla se ci sono delle condizioni fisiche al di sotto del 100% e, nel caso, fa apparire un messaggio di riepilogo
    //if (!CheckPlayersConditions()) return;

    FillProgressBar(40);

    //UpdateScriptLog("Raccolgo le informazioni sui giocatori...");

    //Create players
    if (!CreatePlayers()) return;

    FillProgressBar(50);

    //UpdateScriptLog((rolesEnabled === true ? "Combinando i ruoli di tutti i giocatori e applicando il livello " + preliminaryLevel : "Non considerando i ruoli di ciascun giocatore") + ", risultano " + numberOfRolesForCombinations.toLocaleString('it-IT') + " soluzioni possibili.");

    if (!FindCombinations()) return;

    FillProgressBar(70);

    if (!GetDeltaScores()) return;

    FillProgressBar(90);

    FiltersApplication();

    FillProgressBar(100);

    ShowResult();

}

function ShowResult() {
    mainSection.className = 'result';

    
    let whiteTeam = validCombinations_F3[0].teams[0].getOrderedPlayersNames();
    let blackTeam = validCombinations_F3[0].teams[1].getOrderedPlayersNames();
    
    for (let i = 0; i < numberOfPlayers / 2; i++) {
        whitePlayers[i].innerText = i === 0 ? '🧤 ' + whiteTeam[i] : whiteTeam[i];
        blackPlayers[i].innerText = i === 0 ? blackTeam[i] + ' 🧤' : blackTeam[i];
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

function PreliminaryOperations() {

    //Raccolgo il numero di giocatori
    numberOfPlayers = 16; //MODIFICARE
  
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
    
    //UpdateScriptLog("Avvio script per partita a " + numberOfPlayers + " giocatori con preferenza sui ruoli " + (rolesEnabled === true ? "ABILITATA." : "DISABILITATA."));

    //Creo il dizionario dei ruoli basato sul numero di giocatori
    if (!CreateRolesDictionary()) return false;
    //console.log(rolesDictionary);
    /*
    let msg = "";
    Object.keys(rolesQuantity).forEach(key => {
      msg += key + " (" + rolesQuantity[key] + "), ";
    });
    msg = msg.slice(0, msg.length - 2);
    */
  
    //UpdateScriptLog("Schema previsto: " + (rolesEnabled === true ? msg : "N/A"));
  
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
    const fis = new Category('FISICHE', ['Agilità', 'Elevazione', 'Forza', 'Resistenza', 'Velocità']);
    const tec = new Category('TECNICHE', ['Controllo', 'Dribbling', 'Tiro', 'Piede forte', 'Piede debole']);
    const tat = new Category('TATTICHE', ['Posizionamento', 'Marcamento', 'Smarcamento', 'Visione di gioco']);
    const car = new Category('CARATTERIALI', ['Autorità', 'Concentrazione', 'Motivazione', 'Spirito di sacrificio']);
    const por = new Category('PORTIERE', ['Riflessi', 'Uscite', 'Comunicazione', 'Lanci lunghi']);
    
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


function CreateRolesDictionary() {
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

function CreatePlayers() {
    numberOfRolesForCombinations = 1;

    const tempPlayers = [
        //[0]
        {name: 'Alessandro', 
        roles: ['Cc', 'Es', 'Ed', 'Dc'],
        skills: [
            ['Agilità', 82, 'FIS'], ['Elevazione', 81, 'FIS'], ['Forza', 78, 'FIS'], ['Resistenza', 80, 'FIS'], ['Velocità', 80, 'FIS'], 
            ['Controllo', 80, 'TEC'], ['Dribbling', 78, 'TEC'], ['Tiro', 80, 'TEC'], ['Piede forte', 80, 'TEC'], ['Piede debole', 70, 'TEC'],
            ['Posizionamento', 80, 'TAT'], ['Marcamento', 75, 'TAT'], ['Smarcamento', 75, 'TAT'], ['Visione di gioco', 80, 'TAT'],
            ['Autorità', 75, 'CAR'], ['Concentrazione', 75, 'CAR'], ['Motivazione', 75, 'CAR'], ['Spirito di sacrificio', 75, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[1]
        {name: 'Andrea', 
        roles: ['Ed', 'Es', 'At', 'Cc'],
        skills: [
            ['Agilità', 84, 'FIS'], ['Elevazione', 84, 'FIS'], ['Forza', 82, 'FIS'], ['Resistenza', 82, 'FIS'], ['Velocità', 85, 'FIS'], 
            ['Controllo', 69, 'TEC'], ['Dribbling', 74, 'TEC'], ['Tiro', 75, 'TEC'], ['Piede forte', 75, 'TEC'], ['Piede debole', 62, 'TEC'],
            ['Posizionamento', 74, 'TAT'], ['Marcamento', 77, 'TAT'], ['Smarcamento', 78, 'TAT'], ['Visione di gioco', 79, 'TAT'],
            ['Autorità', 75, 'CAR'], ['Concentrazione', 75, 'CAR'], ['Motivazione', 77, 'CAR'], ['Spirito di sacrificio', 75, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[2]
        {name: 'Andrea O.', 
        roles: ['Td', 'Ts'],
        skills: [
            ['Agilità', 67, 'FIS'], ['Elevazione', 69, 'FIS'], ['Forza', 73, 'FIS'], ['Resistenza', 70, 'FIS'], ['Velocità', 68, 'FIS'], 
            ['Controllo', 63, 'TEC'], ['Dribbling', 60, 'TEC'], ['Tiro', 60, 'TEC'], ['Piede forte', 64, 'TEC'], ['Piede debole', 53, 'TEC'],
            ['Posizionamento', 63, 'TAT'], ['Marcamento', 69, 'TAT'], ['Smarcamento', 70, 'TAT'], ['Visione di gioco', 60, 'TAT'],
            ['Autorità', 60, 'CAR'], ['Concentrazione', 64, 'CAR'], ['Motivazione', 68, 'CAR'], ['Spirito di sacrificio', 71, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[3]
        {name: 'Beppe D.', 
        roles: ['Ed', 'Es', 'At', 'Cc'],
        skills: [
            ['Agilità', 68, 'FIS'], ['Elevazione', 70, 'FIS'], ['Forza', 74, 'FIS'], ['Resistenza', 73, 'FIS'], ['Velocità', 72, 'FIS'], 
            ['Controllo', 67, 'TEC'], ['Dribbling', 65, 'TEC'], ['Tiro', 68, 'TEC'], ['Piede forte', 68, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 64, 'TAT'], ['Marcamento', 66, 'TAT'], ['Smarcamento', 64, 'TAT'], ['Visione di gioco', 60, 'TAT'],
            ['Autorità', 70, 'CAR'], ['Concentrazione', 65, 'CAR'], ['Motivazione', 62, 'CAR'], ['Spirito di sacrificio', 69, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[4]
        {name: 'Christian', 
        roles: ['Ed', 'Es', 'Td', 'Ts'],
        skills: [
            ['Agilità', 86, 'FIS'], ['Elevazione', 70, 'FIS'], ['Forza', 82, 'FIS'], ['Resistenza', 85, 'FIS'], ['Velocità', 90, 'FIS'], 
            ['Controllo', 82, 'TEC'], ['Dribbling', 82, 'TEC'], ['Tiro', 78, 'TEC'], ['Piede forte', 78, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 75, 'TAT'], ['Marcamento', 76, 'TAT'], ['Smarcamento', 80, 'TAT'], ['Visione di gioco', 75, 'TAT'],
            ['Autorità', 72, 'CAR'], ['Concentrazione', 79, 'CAR'], ['Motivazione', 78, 'CAR'], ['Spirito di sacrificio', 79, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[5]
        {name: 'Cosimo', 
        roles: ['Ts', 'Td', 'Es'],
        skills: [
            ['Agilità', 72, 'FIS'], ['Elevazione', 71, 'FIS'], ['Forza', 75, 'FIS'], ['Resistenza', 76, 'FIS'], ['Velocità', 73, 'FIS'], 
            ['Controllo', 62, 'TEC'], ['Dribbling', 58, 'TEC'], ['Tiro', 62, 'TEC'], ['Piede forte', 62, 'TEC'], ['Piede debole', 55, 'TEC'],
            ['Posizionamento', 65, 'TAT'], ['Marcamento', 74, 'TAT'], ['Smarcamento', 70, 'TAT'], ['Visione di gioco', 55, 'TAT'],
            ['Autorità', 55, 'CAR'], ['Concentrazione', 62, 'CAR'], ['Motivazione', 72, 'CAR'], ['Spirito di sacrificio', 75, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[6]
        {name: 'Cristian C.', 
        roles: ['Dc', 'Td', 'Ts', 'Ed', 'Es'],
        skills: [
            ['Agilità', 84, 'FIS'], ['Elevazione', 79, 'FIS'], ['Forza', 82, 'FIS'], ['Resistenza', 80, 'FIS'], ['Velocità', 84, 'FIS'], 
            ['Controllo', 75, 'TEC'], ['Dribbling', 75, 'TEC'], ['Tiro', 75, 'TEC'], ['Piede forte', 75, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 70, 'TAT'], ['Marcamento', 77, 'TAT'], ['Smarcamento', 75, 'TAT'], ['Visione di gioco', 75, 'TAT'],
            ['Autorità', 70, 'CAR'], ['Concentrazione', 80, 'CAR'], ['Motivazione', 70, 'CAR'], ['Spirito di sacrificio', 75, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[7]
        {name: 'Donato', 
        roles: ['Ts', 'Td'],
        skills: [
            ['Agilità', 56, 'FIS'], ['Elevazione', 60, 'FIS'], ['Forza', 65, 'FIS'], ['Resistenza', 65, 'FIS'], ['Velocità', 60, 'FIS'], 
            ['Controllo', 60, 'TEC'], ['Dribbling', 56, 'TEC'], ['Tiro', 65, 'TEC'], ['Piede forte', 66, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 66, 'TAT'], ['Marcamento', 66, 'TAT'], ['Smarcamento', 70, 'TAT'], ['Visione di gioco', 70, 'TAT'],
            ['Autorità', 65, 'CAR'], ['Concentrazione', 70, 'CAR'], ['Motivazione', 65, 'CAR'], ['Spirito di sacrificio', 70, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[8]
        {name: 'Ernesto', 
        roles: ['At', 'Ed', 'Es', 'Cc'],
        skills: [
            ['Agilità', 80, 'FIS'], ['Elevazione', 75, 'FIS'], ['Forza', 79, 'FIS'], ['Resistenza', 77, 'FIS'], ['Velocità', 79, 'FIS'], 
            ['Controllo', 81, 'TEC'], ['Dribbling', 80, 'TEC'], ['Tiro', 79, 'TEC'], ['Piede forte', 80, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 77, 'TAT'], ['Marcamento', 70, 'TAT'], ['Smarcamento', 77, 'TAT'], ['Visione di gioco', 77, 'TAT'],
            ['Autorità', 70, 'CAR'], ['Concentrazione', 75, 'CAR'], ['Motivazione', 75, 'CAR'], ['Spirito di sacrificio', 76, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[9]
        {name: 'Giampiero', 
        roles: ['Cc'],
        skills: [
            ['Agilità', 81, 'FIS'], ['Elevazione', 81, 'FIS'], ['Forza', 81, 'FIS'], ['Resistenza', 80, 'FIS'], ['Velocità', 80, 'FIS'], 
            ['Controllo', 83, 'TEC'], ['Dribbling', 82, 'TEC'], ['Tiro', 85, 'TEC'], ['Piede forte', 85, 'TEC'], ['Piede debole', 70, 'TEC'],
            ['Posizionamento', 83, 'TAT'], ['Marcamento', 75, 'TAT'], ['Smarcamento', 82, 'TAT'], ['Visione di gioco', 83, 'TAT'],
            ['Autorità', 75, 'CAR'], ['Concentrazione', 80, 'CAR'], ['Motivazione', 75, 'CAR'], ['Spirito di sacrificio', 75, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[10]
        {name: 'Loris (Giampy)', 
        roles: ['Td'],
        skills: [
            ['Agilità', 67, 'FIS'], ['Elevazione', 69, 'FIS'], ['Forza', 73, 'FIS'], ['Resistenza', 70, 'FIS'], ['Velocità', 70, 'FIS'], 
            ['Controllo', 65, 'TEC'], ['Dribbling', 65, 'TEC'], ['Tiro', 65, 'TEC'], ['Piede forte', 70, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 65, 'TAT'], ['Marcamento', 69, 'TAT'], ['Smarcamento', 70, 'TAT'], ['Visione di gioco', 62, 'TAT'],
            ['Autorità', 60, 'CAR'], ['Concentrazione', 64, 'CAR'], ['Motivazione', 68, 'CAR'], ['Spirito di sacrificio', 71, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[11]
        {name: 'Marco Bol.', 
        roles: ['Es', 'Cc', 'At'],
        skills: [
            ['Agilità', 77, 'FIS'], ['Elevazione', 76, 'FIS'], ['Forza', 77, 'FIS'], ['Resistenza', 77, 'FIS'], ['Velocità', 76, 'FIS'], 
            ['Controllo', 75, 'TEC'], ['Dribbling', 76, 'TEC'], ['Tiro', 78, 'TEC'], ['Piede forte', 77, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 75, 'TAT'], ['Marcamento', 71, 'TAT'], ['Smarcamento', 75, 'TAT'], ['Visione di gioco', 75, 'TAT'],
            ['Autorità', 72, 'CAR'], ['Concentrazione', 72, 'CAR'], ['Motivazione', 72, 'CAR'], ['Spirito di sacrificio', 72, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[12]
        {name: 'Maurizio', 
        roles: ['Pt', 'Dc'],
        skills: [
            ['Agilità', 0, 'FIS'], ['Elevazione', 0, 'FIS'], ['Forza', 0, 'FIS'], ['Resistenza', 0, 'FIS'], ['Velocità', 0, 'FIS'], 
            ['Controllo', 0, 'TEC'], ['Dribbling', 0, 'TEC'], ['Tiro', 0, 'TEC'], ['Piede forte', 0, 'TEC'], ['Piede debole', 0, 'TEC'],
            ['Posizionamento', 0, 'TAT'], ['Marcamento', 0, 'TAT'], ['Smarcamento', 0, 'TAT'], ['Visione di gioco', 0, 'TAT'],
            ['Autorità', 0, 'CAR'], ['Concentrazione', 0, 'CAR'], ['Motivazione', 0, 'CAR'], ['Spirito di sacrificio', 0, 'CAR'],
            ['Riflessi', 84, 'POR'], ['Uscite', 80, 'POR'], ['Comunicazione', 80, 'POR'], ['Lanci lunghi', 79, 'POR']
        
        ]},
        //[13]
        {name: 'Mauro', 
        roles: ['Ts', 'Td', 'Dc'],
        skills: [
            ['Agilità', 67, 'FIS'], ['Elevazione', 70, 'FIS'], ['Forza', 72, 'FIS'], ['Resistenza', 70, 'FIS'], ['Velocità', 70, 'FIS'], 
            ['Controllo', 67, 'TEC'], ['Dribbling', 69, 'TEC'], ['Tiro', 74, 'TEC'], ['Piede forte', 70, 'TEC'], ['Piede debole', 70, 'TEC'],
            ['Posizionamento', 74, 'TAT'], ['Marcamento', 70, 'TAT'], ['Smarcamento', 72, 'TAT'], ['Visione di gioco', 68, 'TAT'],
            ['Autorità', 65, 'CAR'], ['Concentrazione', 70, 'CAR'], ['Motivazione', 75, 'CAR'], ['Spirito di sacrificio', 70, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[14]
        {name: 'Michele M.', 
        roles: ['Td', 'Ed', 'Dc'],
        skills: [
            ['Agilità', 78, 'FIS'], ['Elevazione', 76, 'FIS'], ['Forza', 80, 'FIS'], ['Resistenza', 80, 'FIS'], ['Velocità', 77, 'FIS'], 
            ['Controllo', 73, 'TEC'], ['Dribbling', 73, 'TEC'], ['Tiro', 71, 'TEC'], ['Piede forte', 72, 'TEC'], ['Piede debole', 62, 'TEC'],
            ['Posizionamento', 71, 'TAT'], ['Marcamento', 76, 'TAT'], ['Smarcamento', 76, 'TAT'], ['Visione di gioco', 71, 'TAT'],
            ['Autorità', 74, 'CAR'], ['Concentrazione', 75, 'CAR'], ['Motivazione', 75, 'CAR'], ['Spirito di sacrificio', 77, 'CAR'],
            ['Riflessi', 0, 'POR'], ['Uscite', 0, 'POR'], ['Comunicazione', 0, 'POR'], ['Lanci lunghi', 0, 'POR']
        
        ]},
        //[15]
        {name: 'Michele P.', 
        roles: ['Td', 'Ts'],
        skills: [
            ['Agilità', 72, 'FIS'], ['Elevazione', 72, 'FIS'], ['Forza', 72, 'FIS'], ['Resistenza', 69, 'FIS'], ['Velocità', 73, 'FIS'], 
            ['Controllo', 67, 'TEC'], ['Dribbling', 66, 'TEC'], ['Tiro', 68, 'TEC'], ['Piede forte', 69, 'TEC'], ['Piede debole', 60, 'TEC'],
            ['Posizionamento', 69, 'TAT'], ['Marcamento', 67, 'TAT'], ['Smarcamento', 71, 'TAT'], ['Visione di gioco', 69, 'TAT'],
            ['Autorità', 68, 'CAR'], ['Concentrazione', 69, 'CAR'], ['Motivazione', 72, 'CAR'], ['Spirito di sacrificio', 69, 'CAR'],
            ['Riflessi', 75, 'POR'], ['Uscite', 72, 'POR'], ['Comunicazione', 65, 'POR'], ['Lanci lunghi', 70, 'POR']
        
        ]}
    ];
    
    /*
    let skills = [];
    
    skills.push(new Skill('Agilità', 82, 'FIS'));
    skills.push(new Skill('Tiro', 75, 'TEC'));
    skills.push(new Skill('Marcamento', 76, 'TAT'));
    skills.push(new Skill('Motivazione', 75, 'CAR'));

    let a = new Player('Andrea', ['Ed', 'At'], skills);
    

    console.log(a.getSkillsTotal());
    console.log(a.getSkillsTotalForCategory('TAT'));
    */

    for (let i = 0; i < numberOfPlayers; i++) {
        const name = tempPlayers[i].name;
        const roles = tempPlayers[i].roles;
        let skills = [];
        tempPlayers[i].skills.forEach(skill => {
            skills.push(new Skill(skill[0], skill[1], skill[2]));
        });
        let player = new Player(name, roles, skills);
        
        //Goalkeeper
        if (name === 'Maurizio' || name === 'Michele P.')
        player.setGoalkeeper(true);

        players.push(player);

    }

    participants = new Participants(players);
    numberOfCombinations = participants.getNumberOfCombinations(numberOfPlayers);
    numberOfRolesForCombinations = participants.getNumberOfRolesForCombinations();

    //if (rolesEnabled === false)
    //numberOfRolesForCombinations = Combinazioni(numberOfPlayers - 2, (numberOfPlayers - 2) / 2) / 2; //I portieri non contano perchè sono sempre in squadre opposte
    
    //validCombinationsIndexes = participants.getValidCombinationsIndexes();
    
    

    return true;
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


function FindCombinations() {

    //let i = 0;
    const combinations = CreateCombinations(); //[{team1, team2}, {team1, team2}, ...]
    //console.log("combinations = " + combinations.length);
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
    //validCombinations = participants.getValidCombinations(matrixOfCombinations); //VALUTARE IL CAMBIO NOME DELLA VARIABILE E DELLA CHIAMATA
    //console.log(validCombinations.length);
    //console.log(validCombinations);
    numberOfValidCombinations = validCombinations.length;
    //console.log("numberOfValidCombinations = " + numberOfValidCombinations);

    if (numberOfValidCombinations > 0)
    return true;
    else {
        //GESTIRE IL CASO IN CUI NON VENGANO TROVATE COMBINAZIONI VALIDE
        /*
        var msg = "Nessuna soluzione valida trovata! Rivedere i ruoli disponibili.\nIl conteggio per i partecipanti selezionati risulta:\n";
        for (var key in rolesCounters) {
            var value = rolesCounters[key];
            msg += key + ": " + value + "\n";
        }
        SpreadsheetApp.getUi().alert(msg);
        UpdateScriptLog("Script terminato.");
        */
      return false;
    }
    
}

function CreateCombinations() {
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
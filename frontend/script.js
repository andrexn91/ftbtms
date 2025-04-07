document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('dati-lista');
    
    try {
        const response = await fetch('http://localhost:3000/bookings');
        const dati = await response.json();

        dati.forEach(item => {
            const li = document.createElement('li');
            li.textContent = JSON.stringify(item);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error('Errore nel recupero dei dati:', err);
    }

    try {
        const response = await fetch('http://localhost:3000/matches');
        const dati = await response.json();

        dati.forEach(item => {
            const li = document.createElement('li');
            li.textContent = JSON.stringify(item);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error('Errore nel recupero dei dati:', err);
    }

    try {
        const response = await fetch('http://localhost:3000/players');
        const dati = await response.json();

        dati.forEach(item => {
            const li = document.createElement('li');
            li.textContent = JSON.stringify(item);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error('Errore nel recupero dei dati:', err);
    }


    


});

//Caricamento pagina

window.onload = () => {
    //const user = localStorage.getItem('username');
    const user = sessionStorage.getItem('username');
    if (user) showContent();
};


function goToHome() {
    window.location.href = "index.html";
}

/*
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            //alert('Login riuscito!');
            localStorage.setItem('userID', result.user.id);
            localStorage.setItem('username', result.user.username);
            localStorage.setItem('photo', result.user.photo);
            showContent();
        } else {
            alert('Credenziali non valide');
        }
    } catch (error) {
        console.error('Errore durante il login:', error);
    }
});
*/

async function checkAdminForVisualization() {
    
    //const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:3000/auth/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const user = await res.json();
        return user.type === "admin" ? 'block' : 'none';
    } catch (err) {
        console.error(err);
        //localStorage.removeItem("token"); // Se il token è scaduto, lo rimuoviamo
        //localStorage.clear();
        sessionStorage.removeItem("token"); // Se il token è scaduto, lo rimuoviamo
        sessionStorage.clear();
        return 'none';
    }
}

function showContent() {
    //document.getElementById('login-container').style.display = 'none';
    //const username = localStorage.getItem('username');
    //const linked = localStorage.getItem('linked');
    const username = sessionStorage.getItem('username');
    const linked = sessionStorage.getItem('linked');
    //const photo = localStorage.getItem('photo');
    const bannerHome = document.querySelector('.banner-home');
    const messageAssoc = document.getElementById('message-association');

    
    document.getElementById('welcome-message').innerText = `Benvenuto ${username}!`;
    document.getElementById('content').style.display = 'block';

    
    // Toggle dropdown menu on photo click
    const userPhoto = document.getElementById('user-photo');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const adminLink = document.getElementById('admin-link');

    //userPhoto.style.backgroundImage = 'url(' + photo + ')';


    userPhoto.addEventListener('click', async function() {
        adminLink.style.display = await checkAdminForVisualization();
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });


    // Optional: Hide dropdown when clicked outside
    document.addEventListener('click', function(event) {
        if (!userPhoto.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    messageAssoc.style.display = linked === 'true' ? 'none' : 'block';
    bannerHome.style.display = linked === 'true' ? 'block' : 'none';
    
}







// Function to simulate going to the profile page
function goToProfile() {
    alert('Andando alla pagina del profilo...');
    // Usa window.location per redirigere alla pagina del profilo
    // window.location.href = '/profilo';
}

function goToAdminArea() {
    window.location.href = "admin.html";
}

// Function to simulate logout
function logout() {
    // Rimuove i dati utente dal localStorage
    //localStorage.clear();
    sessionStorage.clear();

    // Reindirizza alla pagina di login
    window.location.href = "login.html";
}



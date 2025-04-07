//CHIAMATE SICURE: da incollare su tutti fetch che richiedono la verifica di un token per sicurezza
/* 
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/api/matches', {
    headers: {
        'Authorization': token
    }
});
*/

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}


// Funzione di login
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    console.log(data);
    if (data.token) {
        /*
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('linked', data.linked);
        */
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('linked', data.linked);
        //alert('Login effettuato!');
        window.location.href = 'index.html'; // Vai alla home
    } else {
        alert(data.error);
    }
}

// Funzione di registrazione
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) showLogin();
}
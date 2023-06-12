window.isAuthenticated = false;
window.identity = {};
let loginBtn = document.getElementById("googleSignInButton");
let planOrder = document.getElementById("planOrder");
let sendOrder = document.getElementById("sendOrder");

window.onload = function () {
  google.accounts.id.initialize({
    client_id: "12439243694-e7sdb14hefrbgge7vc74g6cv4r59a3hd.apps.googleusercontent.com",
    callback: onSignIn,
  });
  if (sessionStorage.getItem('userName')) {
    window.isAuthenticated = true;
    loginBtn.textContent = "Hi " + sessionStorage.getItem('userName') + "!";
  }
};

loginBtn.addEventListener('click', () => {
  if (window.isAuthenticated) {

    fetch('/orders', {
      headers: {
        'Authorization': sessionStorage.getItem('idToken'),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Unauthorized');
        }
      })
      .then((html) => {
        document.open();
        document.write(html);
        document.close();
      })
      .catch((error) => {
        console.error('Error fetching orders page:', error.message);
      });
  } else {
    googleSignIn();
  }
});

function googleSignIn() {
  if (!window.isAuthenticated) {
    google.accounts.id.prompt();
  }
}

function onSignIn(response) {
  window.identity = parseJwt(response.credential);
  sendIdTokenToBackend(response.credential);
}

function sendIdTokenToBackend(idToken) {
  const backendApiUrl = 'https://convivio-phi.vercel.app/auth/google';
  //const backendApiUrl = 'http://localhost:5500/auth/google';
  fetch(backendApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token: idToken }),
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      console.error('Error authenticating user on the backend');
    }
  })
  .then(data => {
    window.isAuthenticated = true;
    sessionStorage.setItem('userName', window.identity.given_name);
    sessionStorage.setItem('email', window.identity.email);
    sessionStorage.setItem('idToken', idToken);
    sessionStorage.setItem('isAdmin', data.isAdmin);
    loginBtn.textContent = "Hi " + window.identity.given_name + "!";
    console.log('User successfully authenticated on the backend');
  })
  .catch(error => {
    console.error('Error sending ID token to backend:', error);
  });
}

planOrder.addEventListener('click', () => {
  if (window.isAuthenticated) {
    fetch('/orderform', {
      headers: {
        'Authorization': sessionStorage.getItem('idToken'),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Unauthorized');
        }
      })
      .then((html) => {
        document.open();
        document.write(html);
        document.close();
      })
      .catch((error) => {
        console.error('Error fetching form page:', error.message);
      });
  } else {
    document.getElementById('loginWarning').innerHTML = 'You need to login first to continue!';
    document.getElementById('loginWarning').classList.add('warning');
    document.getElementById('loginWarning').style.display = 'block';
    setTimeout(function() {
      document.getElementById('loginWarning').style.display = 'none';
    }, 10000);
  }
});

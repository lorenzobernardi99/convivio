window.isAuthenticated = false;
window.identity = {};
let loginBtn = document.getElementById("googleSignInButton");

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
  const backendApiUrl = 'http://localhost:5500/auth/google';

  fetch(backendApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id_token: idToken }),
  })
    .then(response => {
      if (response.ok) {
        window.isAuthenticated = true;
        sessionStorage.setItem('userName', window.identity.given_name);
        sessionStorage.setItem('idToken', idToken);
        loginBtn.textContent = "Hi " + window.identity.given_name + "!";
        console.log('User successfully authenticated on the backend');
      } else {
        console.error('Error authenticating user on the backend');
      }
    })
    .catch(error => {
      console.error('Error sending ID token to backend:', error);
    });
}
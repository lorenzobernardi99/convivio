document.addEventListener("DOMContentLoaded", function() {
  login();
});

function login() {
  // To replace this with real authentication
  const isAuthenticated = true;

  if (isAuthenticated) {
    // Set a cookie to indicate that the user is logged in
    const sessionTimeout = 1; //hours
    const loginDuration = new Date();
    loginDuration.setTime(loginDuration.getTime() + (sessionTimeout * 60 * 60 * 1000));
    document.cookie = "UserSession=Valid; " + loginDuration.toUTCString() + "; path=/";
  } else {
    // Something
  }
}

function isLoggedIn() {
  return document.cookie.indexOf("UserSession=Valid") !== -1;
}

const loginButton = document.querySelector('.login-btn');
loginButton.addEventListener('click', () => {
  if (isLoggedIn()) {
    window.location.href = 'orders/orders.html';
  } else {
    window.location.href = 'login.html';
  }
});
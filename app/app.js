const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const db = require("./db");
require("dotenv").config();
require("./passportConfig")(passport);

const app = express();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

db.connect();


//<em>// Redirect the user to the Google signin page</em> 
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
//<em>// Retrieve user data using the access token received</em> 
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.redirect("/profile/");
  }
);
//<em>// profile route after successful sign in</em> 
app.get("/profile", (req, res) => {
  console.log(req);
  res.send("Welcome");
});


app.get(
      "/profile",
      passport.authenticate("jwt", { session: false }),
      (req, res, next) => {
        res.send("Welcome");
      }
);


app.get(
      "/auth/google/callback",
      passport.authenticate("google", { session: false }),
      (req, res) => {
        jwt.sign(
          { user: req.user },
          "secretKey",
          { expiresIn: "1h" },
          (err, token) => {
            if (err) {
              return res.json({
                token: null,
              });
            }
            res.json({
              token,
            });
          }
        );
      }
);

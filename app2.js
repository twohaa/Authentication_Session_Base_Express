// passport with google oauth-20

require("dotenv").config();
require("./config/database");
require("./config/passport1");
const express = require("express");
const cors = require("cors");
const ejs = require("ejs");
const User = require("./models/user.model2");

const app = express();
app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    // cookie: { secure: true },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//base url
app.get("/", (req, res) => {
  res.render("index");
});

//login : get
const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  next();
};
app.get("/login", checkLoggedIn, (req, res) => {
  res.render("login");
});
// login: google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/profile",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

//profile route
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("profile", { username: req.user.username });
});

//logout route
app.get("/logout", (req, res) => {
  try {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//route not found error
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found...",
  });
});
//handaling server error
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Something broke...",
  });
});

module.exports = app;

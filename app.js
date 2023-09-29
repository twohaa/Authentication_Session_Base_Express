// passport with local strategy 

require("dotenv").config();
require("./config/database");
require("./config/passport");
const express = require("express");
const cors = require("cors");
const ejs = require("ejs");

const app = express();
app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const User = require("./models/user.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

//register : get
app.get("/register", (req, res) => {
  res.render("register");
});
//register : post
app.post("/register", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });
    if (user) return res.status(400).send("User already exist...");

    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
      const newUser = new User({
        username: req.body.username,
        password: hash,
      });
      await newUser.save();
      res.status(201).redirect("/login");
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
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
// login: post
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/profile",
  })
);

//profile route
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
app.get("/profile", checkAuthenticated, (req, res) => {
  res.render("profile");
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

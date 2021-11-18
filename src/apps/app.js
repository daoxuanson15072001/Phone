const express = require("express");
const app = express();
const config = require("config");
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Config View Engine
app.set("views", config.get("app").views_folder);
app.set("view engine", config.get("app").view_engine);

// Config Static Folder
app.use("/static", express.static(config.get("app").static_folder));

// Config Get Form Data
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// Config Session
app.set('trust proxy', 1) // trust first proxy
const sessionDriver = session({
  secret: config.get("app").session_key,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: config.get("app").session_secure }
});
app.use(sessionDriver);

// Cart
app.use(require("../apps/middlewares/cart"));

// Share
app.use(require("../apps/middlewares/share"));

// Using Router
app.use(require("../routers/web"));

app.session = sessionDriver;
module.exports = app;
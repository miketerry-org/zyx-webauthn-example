const path = require("path");
const express = require("express");
const { engine: hbsEngine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const {
  handleRegistrationOptions,
  handleRegistrationVerification,
} = require("./utils");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.engine(
  ".hbs",
  hbsEngine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "change_this_phrase"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// Session to views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("home", { message: "Welcome to the WebAuthn demo app" });
});

app.get("/register", (req, res) => {
  console.log("➡️ GET /register");
  res.render("register");
});

app.post("/register/options", handleRegistrationOptions);
app.post("/register", handleRegistrationVerification);

// Auth placeholders
app.get("/authenticate", (req, res) => {
  res.send("GET /authenticate — authentication initiation (placeholder)");
});
app.post("/authenticate", (req, res) => {
  res.send(
    "POST /authenticate — process authentication response (placeholder)"
  );
});

// 404
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).send("Something went wrong");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

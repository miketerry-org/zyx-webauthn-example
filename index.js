// index.js

const path = require("path");
const express = require("express");
const { engine: hbsEngine } = require("express-handlebars");
const cookieSession = require("cookie-session");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Configure Handlebars to use `.hbs` extension
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

// 2. Serve static files from `public/`
app.use(express.static(path.join(__dirname, "public")));

// 3. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie-based session configuration
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "change_this_phrase"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// 5. Expose session to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// 6. Route stubs for WebAuthn workflows
app.get("/", (req, res) => {
  res.render("home", { message: "Welcome to the WebAuthn demo app" });
});

app.get("/webauthn/register", (req, res) => {
  res.send("GET /webauthn/register — registration initiation (placeholder)");
});

app.post("/webauthn/register", (req, res) => {
  res.send(
    "POST /webauthn/register — process registration response (placeholder)"
  );
});

app.get("/webauthn/authenticate", (req, res) => {
  res.send(
    "GET /webauthn/authenticate — authentication initiation (placeholder)"
  );
});

app.post("/webauthn/authenticate", (req, res) => {
  res.send(
    "POST /webauthn/authenticate — process authentication response (placeholder)"
  );
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

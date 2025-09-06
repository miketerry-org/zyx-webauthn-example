// utils.js

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} = require("@simplewebauthn/server");

const { getUser, saveUser, saveAuthCredential } = require("./userStore");

const PORT = process.env.PORT || 3000;

/**
 * Handles generation of registration options for the browser.
 * Expects `req.body.username`.
 */
async function handleRegistrationOptions(req, res) {
  console.log("📩 handleRegistrationOptions");

  const { username } = req.body;
  console.log("➡️ username from client:", username);

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  let user = await getUser(username);
  if (!user) {
    const userId = Buffer.from(username).toString("base64url");
    user = {
      id: userId,
      username,
      credentials: [],
    };
    await saveUser(user);
    console.log("👤 New user saved:", user);
  }

  const userIDBuffer = Buffer.from(user.id, "base64url");

  const options = await generateRegistrationOptions({
    rpName: "Passkeys Auth",
    rpID: req.hostname,
    userID: userIDBuffer,
    userName: user.username,
    userDisplayName: "", // Optional
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: user.credentials.map(cred => ({
      id: Buffer.from(cred.credentialID, "base64url"),
      type: "public-key",
      transports: cred.transports || ["usb", "ble", "nfc"],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    extensions: {
      credProps: true,
    },
  });

  console.log("✅ Generated registration options:", options);

  // Save challenge + username to session
  req.session.challenge = options.challenge;
  req.session.username = username;

  return res.json(options);
}

/**
 * Handles verification of registration credential from the browser.
 * Expects credential response in `req.body`.
 */
async function handleRegistrationVerification(req, res) {
  console.log("📩 handleRegistrationVerification");

  const credential = req.body;
  console.log(
    "⬅️ Credential from client:",
    JSON.stringify(credential, null, 2)
  );

  const expectedChallenge = req.session.challenge;
  const username = req.session.username;

  if (!expectedChallenge || !username) {
    return res.status(400).json({ error: "Invalid session state" });
  }

  const user = await getUser(username);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: `http://${req.hostname}:${PORT}`, // Change to HTTPS in prod!
      expectedRPID: req.hostname,
      requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;

    console.log("✅ Verification result:", verification);

    if (!verified || !registrationInfo) {
      return res
        .status(400)
        .json({ verified: false, error: "Verification failed" });
    }

    const {
      credential: {
        publicKey: credentialPublicKey,
        id: credentialID,
        counter,
        transports,
      },
      credentialDeviceType: deviceType,
      credentialBackedUp: backedUp,
    } = registrationInfo;

    await saveAuthCredential(username, {
      credentialID: credentialID.toString("base64url"),
      credentialPublicKey,
      counter,
      transports,
      deviceType,
      backedUp,
    });

    // Clean up session
    delete req.session.challenge;
    delete req.session.username;

    return res.json({ verified: true });
  } catch (err) {
    console.error("❌ Registration verification error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Registration failed" });
  }
}

module.exports = {
  handleRegistrationOptions,
  handleRegistrationVerification,
};

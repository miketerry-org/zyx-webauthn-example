// userStore.js

/**
 * In-memory user store for WebAuthn demonstration.
 * Stores users keyed by username, with credentials in Base64URL-encoded formats.
 */

// Global in-memory user data store; will migrate to a real DB in the future.
const users = {};

/**
 * Retrieves a user by username.
 * @param {string} username
 * @returns {object | undefined}
 */
async function getUser(username) {
  return users[username];
}

/**
 * Saves a new user.
 * @param {object} user - Must include user.username, id, credentials (array).
 */
async function saveUser(user) {
  if (!user || typeof user.username !== "string") {
    throw new Error("Invalid user object: missing username");
  }
  if (users[user.username]) {
    throw new Error(`User "${user.username}" already exists`);
  }
  users[user.username] = {
    id: user.id,
    username: user.username,
    credentials: Array.isArray(user.credentials) ? user.credentials : [],
  };
}

/**
 * Adds a new credential to the user's credential list.
 * @param {string} username
 * @param {object} credential - Should contain fields like:
 *   credentialID (Base64URL string),
 *   credentialPublicKey,
 *   counter,
 *   [optional metadata fields: transports, deviceType, backedUp]
 */
async function saveAuthCredential(username, credential) {
  const user = users[username];
  if (!user) {
    throw new Error(`User "${username}" not found`);
  }
  if (!credential || typeof credential.credentialID !== "string") {
    throw new Error("Invalid credential: missing credentialID");
  }
  // Prevent duplicates
  const exists = user.credentials.some(
    c => c.credentialID === credential.credentialID
  );
  if (exists) {
    throw new Error("Credential already registered for this user");
  }
  user.credentials.push({
    credentialID: credential.credentialID,
    credentialPublicKey: credential.credentialPublicKey,
    counter: credential.counter ?? 0,
    transports: credential.transports || [],
    deviceType: credential.deviceType || undefined,
    backedUp: credential.backedUp || false,
  });
}

/**
 * Updates an existing credential's counter and usage timestamp.
 * @param {string} username
 * @param {string} credentialID - Base64URL-encoded credential ID
 * @param {number} newCounter
 */
async function updateCredentialCounter(username, credentialID, newCounter) {
  const user = users[username];
  if (!user) {
    throw new Error(`User "${username}" not found`);
  }
  const cred = user.credentials.find(c => c.credentialID === credentialID);
  if (!cred) {
    throw new Error("Credential not found for this user");
  }
  cred.counter = newCounter;
}

module.exports = {
  getUser,
  saveUser,
  saveAuthCredential,
  updateCredentialCounter,
};

// userStore.js

/**
 * In-memory user store for WebAuthn demonstration.
 * Stores users keyed by username, with credentials in Base64URL-encoded formats.
 */

const users = {};

/**
 * Retrieves a user by username.
 * @param {string} username
 * @returns {object | undefined}
 */
function getUser(username) {
  return users[username];
}

/**
 * Saves a new user.
 * @param {object} user - Must include user.username, id, credentials (array).
 */
function saveUser(user) {
  users[user.username] = {
    ...user,
    credentials: Array.isArray(user.credentials) ? [...user.credentials] : [],
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
function saveAuthCredential(username, credential) {
  const user = getUser(username);
  if (!user) return;

  user.credentials = [
    ...user.credentials,
    { ...credential, createdAt: new Date().toISOString(), lastUsedAt: null },
  ];
}

/**
 * Updates an existing credential's counter and usage timestamp.
 * @param {string} username
 * @param {string} credentialID - Base64URL-encoded credential ID
 * @param {number} newCounter
 */
function updateCredentialCounter(username, credentialID, newCounter) {
  const user = getUser(username);
  if (!user) return;

  user.credentials = user.credentials.map(cred =>
    cred.credentialID === credentialID
      ? { ...cred, counter: newCounter, lastUsedAt: new Date().toISOString() }
      : cred
  );
}

module.exports = {
  getUser,
  saveUser,
  saveAuthCredential,
  updateCredentialCounter,
};

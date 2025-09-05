// public/webauthn.js

console.log("webAuthN.js is loaded");

/**
 * This client script expects SimpleWebAuthnBrowser to be globally available,
 * via the UMD bundle injected with a <script> tag.
 */

const { startRegistration, startAuthentication } = SimpleWebAuthnBrowser;

/**
 * Initiates the WebAuthn registration process.
 *
 * @param {string} username
 * @returns {Promise<object>}
 */
export async function register(username) {
  const resp = await fetch("/generate-registration-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch registration options (${resp.status})`);
  }

  const options = await resp.json();
  const attResp = await startRegistration({ optionsJSON: options });

  const verifyResp = await fetch("/verify-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...attResp, username }),
  });

  if (!verifyResp.ok) {
    throw new Error(`Registration verification failed (${verifyResp.status})`);
  }

  return verifyResp.json();
}

/**
 * Initiates the WebAuthn authentication process.
 *
 * @param {string} username
 * @returns {Promise<object>}
 */
export async function login(username) {
  const resp = await fetch("/generate-authentication-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch authentication options (${resp.status})`);
  }

  const options = await resp.json();
  const asseResp = await startAuthentication({ optionsJSON: options });

  const verifyResp = await fetch("/verify-authentication", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...asseResp, username }),
  });

  if (!verifyResp.ok) {
    throw new Error(
      `Authentication verification failed (${verifyResp.status})`
    );
  }

  return verifyResp.json();
}

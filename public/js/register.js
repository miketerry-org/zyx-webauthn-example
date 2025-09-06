// public/js/register.js

const { startRegistration } = SimpleWebAuthnBrowser;

document.getElementById("btnRegister").addEventListener("click", async () => {
  const successElem = document.getElementById("success");
  const errorElem = document.getElementById("error");
  successElem.textContent = "";
  errorElem.textContent = "";

  const username = document.getElementById("username").value.trim();
  if (!username) {
    errorElem.textContent = "Please enter a username.";
    return;
  }

  try {
    // Step 1: Request registration options from server
    const optionsResp = await fetch("/register/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!optionsResp.ok) {
      const errorText = await optionsResp.text();
      throw new Error(`Failed to get registration options: ${errorText}`);
    }

    const options = await optionsResp.json();
    console.log("✅ Received registration options:", options);

    // Step 2: Start registration
    const attestationResponse = await startRegistration(options);
    console.log("✅ Client attestation response:", attestationResponse);

    // Step 3: Send response to server
    const verificationResp = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attestationResponse), // ✅ FIXED: removed .toJSON()
    });

    const verificationJSON = await verificationResp.json();
    console.log("✅ Server verification response:", verificationJSON);

    if (verificationJSON.verified) {
      successElem.textContent = "✅ Registration successful!";
    } else {
      errorElem.innerHTML = `❌ Registration failed: <pre>${JSON.stringify(
        verificationJSON,
        null,
        2
      )}</pre>`;
    }
  } catch (err) {
    console.error("❌ Registration error:", err);
    errorElem.textContent = `Error: ${err.message || err}`;
  }
});

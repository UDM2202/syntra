const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");

const walletPath = `${process.env.USERPROFILE}\\.twak\\wallet.json`;
const wallet = JSON.parse(fs.readFileSync(walletPath, "utf8"));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter TWAK wallet password: ", (password) => {
  try {
    const key = crypto.pbkdf2Sync(
      password,
      Buffer.from(wallet.salt, "hex"),
      600000,
      32,
      "sha256"
    );

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(wallet.iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(wallet.authTag, "hex"));

    let decrypted = decipher.update(
      Buffer.from(wallet.encryptedMnemonic, "hex"),
      undefined,
      "utf8"
    );

    decrypted += decipher.final("utf8");

    console.log("\nMNEMONIC / SEED PHRASE:");
    console.log(decrypted);
  } catch (err) {
    console.error("\nFailed to decrypt.");
    console.error("Possible reasons: wrong password, different PBKDF2 rounds, or different digest.");
  }

  rl.close();
});
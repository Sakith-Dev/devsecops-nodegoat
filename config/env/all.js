// config/env/all.js - Hardened Configuration
const port = process.env.PORT || 4000;
let db = process.env.MONGODB_URI || "mongodb://mongo:27017/nodegoat";

// Retrieve secrets dynamically from environment variables
const cookieSecret = process.env.SESSION_SECRET || "session_cookie_secret_key_here";
const cryptoKey = process.env.CRYPTO_KEY || "a_secure_key_for_crypto_here";

module.exports = {
    port,
    db,
    cookieSecret,
    cryptoKey,
    cryptoAlgo: "aes256",
    hostName: "localhost",
    environmentalScripts: []
};

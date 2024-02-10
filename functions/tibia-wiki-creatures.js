

var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    {
      "type": process.env.PROCESS,
      "project_id": process.env.PROJECT_ID,
      "private_key_id": process.env.PRIVATE_KEY_ID,
      "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      "client_email": process.env.CLIENT_EMAIL,
      "client_id": process.env.CLIENT_ID,
      "auth_uri": process.env.AUTH_URI,
      "token_uri": process.env.TOKEN_URI,
      "auth_provider_x509_cert_url": process.env.AUTH_CERT_PROVIDER,
      "client_x509_cert_url": process.env.CLIENT_CERT_URL,
      "universe_domain": process.env.UNIVERSE_DOMAIN,
    }
  ),
  databaseURL: "https://tibiatoptrumps-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function getCreatures() {
  try {
    const creaturesRef = db.collection('creatures');
    const snapshot = await creaturesRef.get();
    const creatures = [];
    snapshot.forEach(doc => {
      creatures.push(doc.data());
    });
    console.log(creatures);
    return creatures;
  } catch (error) {
    console.error("Error fetching creatures:", error);
    throw error; // Propagate the error
  }
}

const handler = async (event, context) => {
  try {
    const data = await getCreatures();
    // console.log("Data returned from top trumps", data);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: {
        error: error,
      }
    }
  }
};

module.exports = { handler };

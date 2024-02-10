

var admin = require("firebase-admin");

var serviceAccount = require("./firebase/tibiatoptrumps-firebase-adminsdk-rn9hj-055d43aae0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handler };

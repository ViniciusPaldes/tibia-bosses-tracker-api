// Import the required modules
const axios = require("axios");
const cheerio = require("cheerio");

const otherBosses = (name) => {
  switch (name) {
    case "Elvira Hammerthrust":
    case "Robby the Reckless":
    case "Jesse the Wicked":
    case "Mornenion":
    case "Oodok Witchmaster":
    case "Arthom The Hunter":
    case "Groam":
      return true;
    default:
      return false;
  }
};

async function getBossList() {
  try {
    const url =
      "https://guildstats.eu/bosses?world=Venebra&monsterName=&bossType=3&rook=0";

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const bossList = [];

    $("#myTable tbody tr").each((index, element) => {
      const name = $(element).find("td:nth-child(2)").text().trim();
      const killedYesterday = parseInt(
        $(element).find("td:nth-child(4)").text().trim()
      );
      const lastSeen = $(element).find("td:nth-child(8)").text().trim();
      const chanceText = $(element).find("td:nth-child(11)").text().trim();
      const expectedIn = $(element).find("td:nth-child(12)").text().trim();
      let chance = chanceText;

      // Handle 'No' and '1Low' cases
      if (chanceText === "0No") {
        chance = "0";
      } else if (chanceText === "1Low") {
        chance = "0.01";
      } else {
        if (chanceText !== "-1") {
          chance = chanceText.replace("%", "0");
          chance = chance / 100;
        }
      }

      // Exclude bosses with chance -1 from the list
      if (chanceText !== "-1" || otherBosses(name)) {
        bossList.push({
          name,
          killedYesterday,
          lastSeen,
          chance,
          expectedIn: expectedIn || "0",
        });
      }
    });

    return bossList;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

const handler = async (event, context) => {
  try {
    const bossList = await getBossList();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(bossList),
    };
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handler };

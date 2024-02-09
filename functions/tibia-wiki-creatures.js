// Import the required modules
const axios = require("axios");
const cheerio = require("cheerio");

function getDifficultyNumber(difficultyString) {
  switch (difficultyString) {
    case "Inofensiva":
      return 0;
    case "Trivial":
      return 1;
    case "Fácil":
      return 2;
    case "Mediana":
      return 3;
    case "Difícil":
      return 4;
    case "Desafiador":
      return 5;
    default:
      return -1;
  }
}

async function fetchTibiaWikiCreaturesData(url) {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      },
    });
    const $ = cheerio.load(data);

    const URL_PREFIX = "https://www.tibiawiki.com.br";

    // The array to hold our creatures data
    const creatures = [];

    // Find each table by ID and loop through its rows
    $("table#tabelaDPL")
      .first()
      .each((_, table) => {
        // Loop through each row of the table
        $("tr", table).each((_, tr) => {
          const tds = $("td", tr).filter(
            (index, td) => index < $("td", tr).length - 1
          );
          if (tds.length > 0) {
            // Ensure there are columns to process
            const creature = {
              name: $(tds[0]).text().trim(),
              image: `${URL_PREFIX}${$(tds[1]).find("img").attr("src") || ""}`,
              hp: parseInt($(tds[2]).text().trim(), 10),
              xp: parseInt($(tds[3]).text().trim(), 10),
              charms: parseInt($(tds[4]).text().trim(), 10),
              difficultyString: $(tds[5]).find("img").attr("title"),
              difficulty: getDifficultyNumber(
                $(tds[5]).find("img").attr("title")
              ),
            };
            creatures.push(creature);
          }
        });
      });

    // Log or return the JSON data
    // console.log(JSON.stringify(creatures, null, 2));
    return creatures;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function getTopTrumps() {
  const urls = [
    { url: "https://www.tibiawiki.com.br/wiki/Anf%C3%ADbios" },
    { url: "https://www.tibiawiki.com.br/wiki/Aqu%C3%A1ticos" },
    { url: "https://www.tibiawiki.com.br/wiki/Aves" },
    { url: "https://www.tibiawiki.com.br/wiki/Constructos" },
    { url: "https://www.tibiawiki.com.br/wiki/Criaturas_M%C3%A1gicas" },
    { url: "https://www.tibiawiki.com.br/wiki/Dem%C3%B4nios" },
    { url: "https://www.tibiawiki.com.br/wiki/Drag%C3%B5es" },
    { url: "https://www.tibiawiki.com.br/wiki/Elementais" },
    { url: "https://www.tibiawiki.com.br/wiki/Extra_Dimensionais" },
    { url: "https://www.tibiawiki.com.br/wiki/Fadas" },
    { url: "https://www.tibiawiki.com.br/wiki/Gigantes" },
    { url: "https://www.tibiawiki.com.br/wiki/Humanos" },
    { url: "https://www.tibiawiki.com.br/wiki/Human%C3%B3ides" },
    { url: "https://www.tibiawiki.com.br/wiki/Licantropos" },
    { url: "https://www.tibiawiki.com.br/wiki/Mam%C3%ADferos" },
    { url: "https://www.tibiawiki.com.br/wiki/Mortos-Vivos" },
    { url: "https://www.tibiawiki.com.br/wiki/Plantas_(Criatura)" },
    { url: "https://www.tibiawiki.com.br/wiki/R%C3%A9pteis" },
    { url: "https://www.tibiawiki.com.br/wiki/Slimes" },
    { url: "https://www.tibiawiki.com.br/wiki/Vermes" },
  ];

  try {
    const promises = urls.map((item) => fetchTibiaWikiCreaturesData(item.url));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error("Error fetching creature data:", error);
  }
}

const handler = async (event, context) => {
  try {
    const data = await getTopTrumps();
    console.log("Data returned from top trumps", data);
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

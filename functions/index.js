// Import the required modules
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const { default: puppeteer } = require("puppeteer");

// Create an instance of the Express application
const app = express();
const port = process.env.PORT || 3000; // Choose any port number you prefer

const cleanText = (text) => {
  return text
    .replace(/\n/g, "")
    .replace(/days? ago/g, "")
    .trim();
};

const getKilledYesterday = async () => {
  try {
    const url = "https://www.tibia-statistic.com/bosshunter/details/venebra";
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const figcaptions = $("figcaption");
    return figcaptions
      .map((index, element) => {
        return { name: cleanText($(element).text()) };
      })
      .get();
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};

const getBossListKillStatistic = async () => {
  try {
    const url = "https://www.tibia-statistic.com/bosshunter/details/venebra";
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const bossList = [];
    let isSecondTable = false;

    // Replace 'table-hover' with the actual class name of the table
    $(
      "table.table-hover.table-dark.table-sm.table-bordered.table-striped.rounded tbody tr"
    ).each((index, element) => {
      const tds = $(element).find("td");
      const name = cleanText($(tds[1]).text());
      const lastSeen = cleanText($(tds[2]).text());

      // Check if the current row (element) has four columns, which means it's the second table
      if (tds.length === 4) {
        isSecondTable = true;
      }

      // Process the data differently based on whether it's the first table or second table
      if (isSecondTable) {
        bossList.push({ name, lastSeen, chance: "No chance" });
      } else {
        const chance = cleanText($(tds[3]).text());
        bossList.push({ name, chance, lastSeen });
      }
    });

    console.log(bossList);
    return bossList;
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
};

async function getGuildStatsBossList() {
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
      if (chanceText !== "-1") {
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

async function getGuildStatsGraph(boss) {
  try {
    const encodedBossName = boss.split(" ").join("%20");
    const url = `https://guildstats.eu/bosses?world=Venebra&monsterName=${encodedBossName}`;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle0' }); // Replace with your URL

    const html = await page.content(); // This will get the entire page HTML


    const $ = cheerio.load(html);
    
    const data = [];
    $('div[aria-label="A tabular representation of the data in the chart."] table tbody tr').each((index, element) => {
      const tds = $(element).find('td');
      const daysAfter = parseInt($(tds[0]).text(), 10);
      const chance = parseFloat($(tds[1]).text());
      data.push({ daysAfter, chance });
    });

    return data;

  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function getDuplicatedBosses(url) {
  try {
    const url = "https://www.tibiabosses.com/stats/?world=Venebra&mode=3";

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const bosses = [
      {
        name: "White Pale",
        cities: ["Edron", "Darashia", "Liberty Bay"],
        count: 3,
      },
      {
        name: "Rotworm Queen",
        cities: ["Darashia", "Ab'dendriel", "Edron", "Liberty Bay"],
        count: 4,
      },
    ];

    const result = [];

    bosses.forEach((boss) => {
      const bossDiv = $(`img[alt="${boss.name}"]`).parent();
      const cityDivs = bossDiv.nextAll().slice(0, boss.count);

      cityDivs.each((index, el) => {
        const city = boss.cities[index];
        const lastSeen = $(el).text().trim();
        const chanceDiv = $(el).next();
        // Get the chance value based on the color
        let chanceText = chanceDiv.css("color");
        let chances = 0;

        if (chanceText === "green") {
          chances = 1;
        } else if (chanceText === "blue") {
          chances = 0.01;
        } else {
          chances = 0;
        }

        result.push({
          name: boss.name,
          city: city,
          lastSeen: lastSeen,
          chance: chances,
        });
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
}

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
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const URL_PREFIX = "https://www.tibiawiki.com.br";

    // The array to hold our creatures data
    const creatures = [];

    // Find each table by ID and loop through its rows
    $('table#tabelaDPL').first().each((_, table) => {
      // Loop through each row of the table
      $("tr", table).each((_, tr) => {
        const tds = $("td", tr).filter((index, td) => index < $("td", tr).length - 1);
        if (tds.length > 0) {
          // Ensure there are columns to process
          const creature = {
            name: $(tds[0]).text().trim(),
            image: `${URL_PREFIX}${$(tds[1]).find("img").attr("src") || ""}`,
            hp: parseInt($(tds[2]).text().trim(), 10),
            xp: parseInt($(tds[3]).text().trim(), 10),
            charms: parseInt($(tds[4]).text().trim(), 10),
            difficultyString: $(tds[5]).find("img").attr("title"),
            difficulty: getDifficultyNumber($(tds[5]).find("img").attr("title")),
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
  ]

  try {
    const promises = urls.map(item => fetchTibiaWikiCreaturesData(item.url));
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error("Error fetching creature data:", error);
  }
}

app.get("/tibia-statistics", async (req, res) => {
  try {
    const bossList = await getBossListKillStatistic();
    res.json(bossList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/killed-yesterday", async (req, res) => {
  try {
    const killedYesterday = await getKilledYesterday();
    res.json(killedYesterday);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/guild-stats", async (req, res) => {
  try {
    const bossList = await getGuildStatsBossList();
    res.json(bossList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/guild-stats/:boss", async (req, res) => {
  try {
    const boss = req.params.boss;
    const data = await getGuildStatsGraph(boss);
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/top-trumps", async (req, res) => {
  try {
    const data = await getTopTrumps();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/duplicated-bosses", async (req, res) => {
  try {
    const bossList = await getDuplicatedBosses();
    res.json(bossList);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the serverless function
exports.handler = async (event, context) => {
  return app;
};

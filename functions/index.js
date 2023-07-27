// Import the required modules
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

// Create an instance of the Express application
const app = express();
const port = process.env.PORT || 3000; // Choose any port number you prefer

const cleanText = (text) => {
  return text.replace(/\n/g, '').replace(/days? ago/g, '').trim();
};

const getKilledYesterday = async () => {
  try {
    const url = 'https://www.tibia-statistic.com/bosshunter/details/venebra';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const figcaptions = $('figcaption');
    return figcaptions.map((index, element) => {
      return { 'name': cleanText($(element).text()) };
    }).get();
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

    
const getBossList = async () => {
  try {
    const url = 'https://www.tibia-statistic.com/bosshunter/details/venebra';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const bossList = [];
    let isSecondTable = false;

    // Replace 'table-hover' with the actual class name of the table
    $('table.table-hover.table-dark.table-sm.table-bordered.table-striped.rounded tbody tr').each((index, element) => {
      const tds = $(element).find('td');
      const name = cleanText($(tds[1]).text());
      const lastSeen = cleanText($(tds[2]).text());

      // Check if the current row (element) has four columns, which means it's the second table
      if (tds.length === 4) {
        isSecondTable = true;
      }

      // Process the data differently based on whether it's the first table or second table
      if (isSecondTable) {
        bossList.push({ name, lastSeen, chance: 'No chance' });
      } else {
        const chance = cleanText($(tds[3]).text());
        bossList.push({ name, chance, lastSeen });
      }
    });

    console.log(bossList);
    return bossList;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

async function getGuildStatsBossList() {
  try {
    const url = 'https://guildstats.eu/bosses?world=Venebra&monsterName=&bossType=3&rook=0';

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const bossList = [];

    $('#myTable tbody tr').each((index, element) => {
      const name = $(element).find('td:nth-child(2)').text().trim();
      const killedYesterday = parseInt($(element).find('td:nth-child(4)').text().trim());
      const lastSeen = $(element).find('td:nth-child(8)').text().trim();
      const chanceText = $(element).find('td:nth-child(11)').text().trim();
      const expectedIn = $(element).find('td:nth-child(12)').text().trim();
      let chance = chanceText;

      // Handle 'No' and '1Low' cases
      if (chanceText === '0No') {
        chance = '0';
      } else if (chanceText === '1Low') {
        chance = '0.01';
      } else {
        if (chanceText !== '-1') {
          chance = chanceText.replace('%', '0')
          chance = chance / 100
        }
      }

      // Exclude bosses with chance -1 from the list
      if (chanceText !== '-1') {
        bossList.push({ name, killedYesterday, lastSeen, chance, expectedIn: expectedIn || '0' });
      }
    });

    return bossList;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}


app.get('/tibia-statistics', async (req, res) => {
  try {
    const bossList = await getBossList();
    res.json(bossList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/killed-yesterday', async (req, res) => {
  try {
    const killedYesterday = await getKilledYesterday();
    res.json(killedYesterday);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/guild-stats', async (req, res) => {
  try {
    const bossList = await getGuildStatsBossList();
    res.json(bossList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
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


app.get('/tibia-statistics', async (req, res) => {
  try {
    const bossList = await getBossList();
    console.log("bossList", bossList)
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





// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the serverless function
exports.handler = async (event, context) => {
  return app;
};
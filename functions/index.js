// Import the required modules
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Create an instance of the Express application
const app = express();
const port = process.env.PORT || 3000; // Choose any port number you prefer

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

const cleanText = (text) => {
  return text.replace(/\n/g, '').replace(/days? ago/g, '').trim();
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



app.get('/sima-check-crawler', (req, res) => {
  const targetWorld = 'Venebra';

  (async () => {
    // Launch a headless Chrome browser
    console.log("Pre browser")
    const browser = await puppeteer.launch();
    console.log("Post browser")

    // Create a new page
    const page = await browser.newPage();

    // Navigate to the filter page
    await page.goto('https://www.simacheck.com/filter.html');

    // Select the Venebra option in the dropdown
    await page.select('select[name="world"]', targetWorld);

    // Click the Enviar button to submit the form
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]'),
    ]);

    // Wait for the desired page to load
    await page.waitForSelector('section.sessao_dois');

    // Extract the HTML content
    const htmlContent = await page.content();

    res.send(htmlContent)
    // Close the browser
    await browser.close();
  });
});

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



// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the serverless function
exports.handler = async (event, context) => {
  return app;
};
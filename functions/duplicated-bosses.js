
// Import the required modules
const axios = require('axios');
const cheerio = require('cheerio');

async function getDuplicatedBosses(url) {
    try {
      const url = 'https://www.tibiabosses.com/stats/?world=Venebra&mode=3';
  
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
  
      const bosses = [
        { name: 'White Pale', cities: ['Edron', 'Darashia', 'Liberty Bay'], count: 3 },
        { name: 'Rotworm Queen', cities: ["Darashia", "Ab'dendriel", "Edron", "Liberty Bay"], count: 4 },
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
          let chanceText = chanceDiv.css('color');
          let chances = 0;
  
          if (chanceText === 'green') {
            chances = 1;
          } else if (chanceText === 'blue') {
            chances = 0.01;
          } else {
            chances = 0;
          }
  
          result.push({ name: boss.name, city: city, lastSeen: lastSeen, chance: chances });
  
        });
      });
  
      return result;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return [];
    }
  }

const handler = async (event, context) => {
    try {
        const bossList = await getDuplicatedBosses();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(bossList),
        };
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

};

module.exports = { handler };

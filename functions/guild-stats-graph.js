
// Import the required modules
const cheerio = require('cheerio');
const { default: puppeteer } = require("puppeteer");

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


const handler = async (event, context) => {
    try {
        const {boss} = context.params
        const graphData = await getGuildStatsGraph(boss);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(graphData),
        };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }

};

module.exports = { handler };

// Import the required modules
const cheerio = require("cheerio");
const chromium = require('chrome-aws-lambda');

async function getGuildStatsGraph(boss) {
  try {
    // console.log("1 - Started : ", new Date())
    const url = `https://guildstats.eu/bosses?world=Venebra&monsterName=${boss}`;

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // console.log("2 - Browser : ", new Date())

    const page = await browser.newPage();
    // console.log("3 - Page : ", new Date())

    await page.goto(url, { waitUntil: "networkidle2" });
    // console.log("4 - GoTo : ", new Date())
    
    const html = await page.content();
    // console.log("5 - HTML : ", new Date())

    const $ = cheerio.load(html);
    // console.log("6 - Load : ", new Date())

    const data = [];
    $(
      'div[aria-label="A tabular representation of the data in the chart."] table tbody tr'
    ).each((index, element) => {
      // console.log("6.1 - Each : ", new Date());
      const tds = $(element).find("td");
      const daysAfter = parseInt($(tds[0]).text(), 10);
      const chance = parseFloat($(tds[1]).text());
      if (data.some(item => item.daysAfter === daysAfter)) {
        return;
      }
      data.push({ daysAfter, chance });
    });
    // console.log("7 - Data : ", new Date())
    data.sort((a, b) => a.daysAfter - b.daysAfter);

    // console.log("8 - Sorted : ", new Date())
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

const handler = async (event, context) => {
  try {
    const boss = event.pathParameters.boss;
    const graphData = await getGuildStatsGraph(boss);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(graphData),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify(error),
    };
  }
};

module.exports = { handler };

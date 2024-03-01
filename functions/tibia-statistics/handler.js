
// Import the required modules
const axios = require('axios');
const cheerio = require('cheerio');

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

const handler = async (event, context) => {
    try {
        const bossList = await getBossList();
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

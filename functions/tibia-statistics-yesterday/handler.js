
// Import the required modules
const axios = require('axios');
const cheerio = require('cheerio');

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

const handler = async (event, context) => {
    try {
        const killedYesterday = await getKilledYesterday();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(killedYesterday),
        };
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

};

module.exports = { handler };

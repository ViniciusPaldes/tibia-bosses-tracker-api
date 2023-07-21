const handler = async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Tibia statistics" }),
    };
  };
  
  module.exports = { handler };
  
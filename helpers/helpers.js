const fs = require("fs");
const axios = require("axios");

// Function to load the saved token symbol-to-ID mapping from the file
const loadTokenList = () => {
    try {
        const data = fs.readFileSync("tokenSymbolToId.json", "utf8");
        return JSON.parse(data); // Return the parsed JSON data
    } catch (error) {
        console.error("Error loading token list from file:", error);
        return {};
    }
};

// Fetch the price of a token using its CoinGecko ID
const fetchTokenPrice = async (tokenId) => {
    try {
        if(tokenId === 'd1755fa5-760f-4fd2-a002-3c33b181380d')
        {
            const url = 'https://api.geckoterminal.com/api/v2/simple/networks/ronin/token_price/0x03affae7e23fd11c85d0c90cc40510994d49e175';
            const response = await fetch(url);
            const jsonResponse = await response.json();
           // Access the token price
            const tokenPrices = jsonResponse.data.attributes.token_prices;
            const tokenAddress = '0x03affae7e23fd11c85d0c90cc40510994d49e175'; // Replace with your token address
            const tokenPrice = tokenPrices[tokenAddress];
            return tokenPrice;
        }
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
                params: {
                    ids: tokenId, // The CoinGecko ID
                    vs_currencies: "usd", // Prices in USD
                },
            },
        );
        return response.data[tokenId]?.usd; // Return the price if available
    } catch (error) {
        console.error("Error fetching token price:", error);
        return null;
    }
};

// Function to clean lists (resources, structures)
function cleanList(input) {
    return input
        .split(",")
        .map(item => item.trim().toLowerCase())
        .join(", ");
}

// Function to validate resources or structures (letters, commas, and spaces)
function validateResourcesOrStructures(input) {
    const regex = /^[a-zA-Z\s,]+$/;
    return regex.test(input);
}

function isNumeric(str) {
    return /^[0-9]+$/.test(str);
}

function isLand(str) {
    const validLandTypes = ["homestead", "settlement", "city", "village"];
    return validLandTypes.includes(str.toLowerCase());
}
function isValidYesNo(str) {
    if (typeof str !== 'string') return false;

    const validValues = ["yes", "sí", "si", "y", "no", "n"];
    return validValues.includes(str.toLowerCase());
}

function isYes(str) {
    if (typeof str !== 'string') return false;

    const yesValues = ["yes", "sí", "si", "y"];
    return yesValues.includes(str.toLowerCase());
}

module.exports = {loadTokenList, fetchTokenPrice, cleanList, validateResourcesOrStructures, isNumeric, isLand, isValidYesNo, isYes };
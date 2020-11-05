require('dotenv').config();
const axios = require("axios");

async function getReceipt(ticketId) {
    try {
		let monerisResponse = await axios.post(
			"https://gateway.moneris.com/chkt/request/request.php",
			{
				store_id: process.env.STORE_ID,
				api_token: process.env.API_TOKEN,
                checkout_id: process.env.CHECKOUT_ID,
                ticket: ticketId,
				environment: process.env.MONERIS_ENV,
				action: "receipt"
			}
		);

        return monerisResponse.data;
	} catch (error) {
		console.log(error);
	}
}

module.exports.getReceipt = getReceipt;
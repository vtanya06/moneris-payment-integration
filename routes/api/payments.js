require('dotenv').config()
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/verify", async function(req, res) {
	console.log(req.body);
	console.log(process.env.GOOGLE_RECAPTCHA_SECRET_KEY);
	try {
		let googleResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${req.body.token}`, {})

		console.log(googleResponse.data);

		if (googleResponse.data.score > 0.5) {
			res.json({"successful" : "true"})
		} else {
			res.json({"successful" : "false"})
		}
	} catch (error) {
		console.log("Error in verifying recaptcha", error);
		res.json({"successful" : "false"})
	}
})

router.post("/initialize", async function (req, res) {

	console.log("form submitted", req.body);

	let {insurance_company, email, account_number, policy_holder, memo, amount, invoice_number, phone_number} = req.body;

	try {
		let monerisResponse = await axios.post(
			"https://gateway.moneris.com/chkt/request/request.php",
			{
				store_id: process.env.STORE_ID,
				api_token: process.env.API_TOKEN,
				checkout_id: process.env.CHECKOUT_ID,
				txn_total: parseFloat(amount).toFixed(2),
				environment: process.env.MONERIS_ENV,
				action: "preload",
				order_no: `${Date.now()}-${invoice_number}`,
				cust_id: account_number,
				language: 'en',
				cart: {
					items: [
						{
							product_code: insurance_company,
							description: memo,
							unit_cost: parseFloat(amount).toFixed(2),
							quantity: '1'
						}
					]
				},
				contact_details: {
					first_name: policy_holder,
					last_name: '',
					email: email,
					phone: phone_number
				}
			}
		);

		console.log("Moneris Response", monerisResponse.data)

		if (monerisResponse.data.response.success) {
			res.redirect(`/checkout/${monerisResponse.data.response.ticket}`);
		} else {
			res.redirect("/");
		}
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;

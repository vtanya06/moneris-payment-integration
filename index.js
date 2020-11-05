const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const logger = require("./middleware/logger");
const { getReceipt } = require("./controllers/payments");

const app = express();

// Init middleware
app.use(logger);

// Handlebars Middleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Homepage Route
app.get("/", (req, res) => res.render("index"));

app.get("/payments/central-agency", (req, res) => {
	res.render("info", {
		agency: "Central Agencies Ltd.",
		customer_email: req.query.customer_email || "",
		phone_number: req.query.phone_number || "",
		invoice_number: req.query.invoice_number || "",
		account_number: req.query.account_number || "",
		policyholder_name: req.query.policyholder_name || "",
		memo: req.query.memo || "",
		total_amount: req.query.total_amount || "",
	});
});

app.get("/payments/broker-canada", (req, res) =>
	res.render("info", {
		agency: "Broker Canada",
		customer_email: req.query.customer_email || "",
		phone_number: req.query.phone_number || "",
		account_number: req.query.account_number || "",
		invoice_number: req.query.invoice_number || "",
		policyholder_name: req.query.policyholder_name || "",
		memo: req.query.memo || "",
		total_amount: req.query.total_amount || "",
	})
);

app.get("/checkout/:id", (req, res) =>
	res.render("checkout", {
		ticketId: req.params.id,
	})
);

app.get("/receipt/:id", async function (req, res) {
	try {
		let receiptInfo = await getReceipt(req.params.id);

		let targetRequest = receiptInfo.response.request;
		let targetReceipt = receiptInfo.response.receipt;

		let transaction_result = targetReceipt.result === "a" ? true : false;

		res.render("receipt", {
			transaction_result: transaction_result,
			policyholder_name: targetRequest.cust_info.first_name,
			customer_email: targetRequest.cust_info.email,
			total_amount: targetRequest.txn_total,
			account_number: targetRequest.cust_id,
			order_no: targetReceipt.cc.order_no,
			invoice_number: targetReceipt.cc.order_no.split("-")[1],
			phone_number: targetRequest.cust_info.phone,
			reference_no: targetReceipt.cc.reference_no,
			insurance_company: targetRequest.cart.items[0].product_code,
			memo: targetRequest.cart.items[0].description,
		});
	} catch (error) {
		console.log("Error in getting receipt", error);
	}
});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Members API Routes
app.use("/api/payments", require("./routes/api/payments"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

$(document).ready(function () {
	let path = window.location.pathname;
	let splitPath = path.split("/");
	if (splitPath[1] === "checkout") {
		let ticket = path.split("/")[2];

		console.log(ticket);

		var myCheckout = new monerisCheckout();
		myCheckout.setMode("prod");
		myCheckout.setCheckoutDiv("monerisCheckout");
		myCheckout.startCheckout(ticket.toString());
		myCheckout.setCallback("error_event", onError);
		myCheckout.setCallback("page_loaded", onPageLoad);
		myCheckout.setCallback("cancel_transaction", function (e) {
			onCancelTransaction(e, myCheckout);
		});
		myCheckout.setCallback("payment_receipt", onPaymentReceipt);
		myCheckout.setCallback("payment_complete", onPaymentComplete);
	}
});

function tryAgain({
	insurance_company,
	customer_email,
	invoice_number,
	phone_number,
	account_number,
	policyholder_name,
	memo,
	total_amount,
}) {
	let iUrl =
		insurance_company === "Broker Canada"
			? "broker-canada"
			: "central-agency";
	let query =
		"?customer_email=" +
		customer_email +
		"&account_number=" +
		account_number +
		"&phone_number=" +
		phone_number +
		"&invoice_number=" +
		invoice_number +
		"&policyholder_name=" +
		policyholder_name +
		"&memo=" +
		memo +
		"&total_amount=" +
		total_amount;

	window.location.replace("/payments/" + iUrl + query);

	return false;
}

function onError(e) {
	console.log("Error Happened");
}

function onPageLoad(e) {
	console.log("Page Loaded");
}

function onCancelTransaction(e, myCheckout) {
	console.log("Transaction Cancelled");
	let event = JSON.parse(e);
	myCheckout.closeCheckout(event.ticket);
	window.location.replace("/");
}

function onPaymentReceipt(e) {
	console.log("Payment Receipt");
}

function onPaymentComplete(e) {
	console.log("Payment Complete");

	let event = JSON.parse(e);
	window.location.replace("/receipt/" + event.ticket);
}

'use strict';

const AWS = require('aws-sdk');
const orderMetadataManager = require('./orderMetadataManager');
const orderId = "035867d5d1";

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;


module.exports.hacerPedido = (event, context, callback) => {
console.log('HacerPedido fue llamada');

const body = JSON.parse(event.body);

const order = {
	orderId: orderId,
	name: body.name,
  address: body.address,
	pizzas: body.pizzas,
	timestamp: Date.now()
	/*address: body.address,*/
};

const params = {
	MessageBody: JSON.stringify(order),
	QueueUrl: QUEUE_URL
};

sqs.sendMessage(params, function(err, data) {
	if (err) {
		sendResponse(500, err, callback);
	} else {
		const message = {
			order: order,
			messageId: data.MessageId
		};
		sendResponse(200, message, callback);
	}
});
};

module.exports.prepararPedido = (event, context, callback) => {
	console.log('Preparar pedido fue llamada');

	const order = JSON.parse(event.Records[0].body);

	orderMetadataManager
		.saveCompletedOrder(order)
		.then(data => {
			callback();
		})
		.catch(error => {
			callback(error);
		});
};

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}

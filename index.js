const recastai = require('recastai');
const request = require('request');
const recastAIRequestToken = "efa320826368b2c3b53bc418beed2f4a"; 
const httpProxy = "http://localhost:5001/";
const locale = 'en';
const client = new recastai.request(recastAIRequestToken, locale);

const stdin = process.openStdin();
console.log("Hi! How can I help you?");
try {
	stdin.addListener("data", onStdinInput.bind(this));
} catch(e) {
	console.log();
}

function onStdinInput(inputText) {
	if (!inputText) {
		return;
	}
	client.analyseText(inputText.toString())
	.then(onRecastAIReply.bind(this))
	.catch(() => {
		console.log("");
	})
}

function onRecastAIReply(aiResponse) {
	const intent = aiResponse.intent();
	console.log(JSON.stringify(aiResponse));

	if (!intent) {
		console.log("I did not get your intent...please retry");
		return;
	}

	switch(intent.slug) {
		case "discover-movies":
			const payload = prepareMovieRequest(aiResponse);
			var options = {
				uri: httpProxy + intent.slug + '/',
				method: 'POST',
				json: payload
			  };
			request.post(options, (err, httpResponse, body) => {
				if (err) {
					return console.error('request failed:', err);
				}
				console.log(JSON.stringify(body));
			});
		break;
		case "greetings":
			console.log("Hi! what type of movie would you like to watch?")
		break;
		case "goodbye":
			console.log("Hope to see you again");
			process.exit(0);
		break;
	}
}

function prepareMovieRequest(aiResponse) {
	const nationality = aiResponse.entities.nationality ? aiResponse.entities.nationality[0].short : "";
	const genre = aiResponse.entities.genre ? aiResponse.entities.genre[0].value : "";
	const person = aiResponse.entities.person ? aiResponse.entities.person[0].fullname : "";

	const movieRequest = {
		"genre" : genre,
		"title": "",
		"language": nationality,
		"director": person,
		"actor": person
	}
	return movieRequest;
}
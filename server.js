"use strict";

const http = require("http");
const url = require("url");
const querystring = require("querystring");
const path = require("path");
const fs = require("fs");

function hash(name, score) {
    let h = 0;
    for (let i = 0; i < name.length; i++)
	h = ((h<<4)^(h>>4)^name.charCodeAt(i)) % 32771;
    return h^score;
}

function update_scores(new_score) {
    new_score.score = parseInt(new_score.score);
    let h = hash(new_score.name, new_score.score);
    if (h === parseInt(new_score.hash)) {
	let high_scores = JSON.parse(fs.readFileSync("scores.json"));
	if (new_score.score > high_scores[high_scores.length-1].score) {
	    for (var i = high_scores.length-2; i >= 0; i--) {
		if (new_score.score <= high_scores[i].score) {
		    high_scores[i+1].name = new_score.name;
		    high_scores[i+1].score = new_score.score;
		    break;
		}
		else {
		    high_scores[i+1].name = high_scores[i].name;
		    high_scores[i+1].score = high_scores[i].score;
		}
	    }
	    if (i == -1) {
		high_scores[0].name = new_score.name;
		high_scores[0].score = new_score.score;
	    }
	    fs.writeFileSync("scores.json", JSON.stringify(high_scores));
	}
    }
    else
	console.log("cheater detected: " + new_score.name);
}

function serve(directory, port) {
    let server = new http.Server();
    server.listen(port);
    console.log("Listening on port", port);

    server.on("request", (request, response) => {
	let parsed_url = url.parse(request.url);

	let filename = parsed_url.pathname;
  if (filename === "" || filename === "/")
      filename = "/snake.html";
	if (filename === "/scores.json")
	    update_scores(querystring.parse(parsed_url.query));

	filename = path.resolve(directory, filename.substring(1)
				.replace(/\.\.\//g, ""));

	let type;
	switch(path.extname(filename)) {
	case ".html":
	    type = "text/html";
	    break;
	case ".js":
	    type = "text/javascript";
	    break;
	case ".css":
	    type = "text/css";
	    break;
	case ".ico":
	    type = "image/ico";
	    break;
	case ".json":
	    type = "application/json";
	    break;
	default:
	    console.log("unknown file type: " + filename);
	    type = "application/octet-stream";
	    break;
	}
	let stream = fs.createReadStream(filename);
	stream.once("readable", () => {
	    response.setHeader("Content-Type", type);
	    response.writeHead(200);
	    stream.pipe(response);
	});

	stream.on("error", (err) => {
	    response.setHeader("Content-Type", "text/plain; charset=UTF-8");
	    response.writeHead(404);
	    response.end(err.message);
	});
    });
}

serve(process.cwd(), parseInt(process.argv[2]) || 80);

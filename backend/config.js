const fs = require("fs");

const load = () =>
{
	let contents = fs.readFileSync("./config.json", "utf8");
	let json;

	try
	{
		json = JSON.parse(contents);
	} catch (e)
	{
		console.log("There was an error in your config.json");
		throw e;
	}

	return json;
}

module.exports = load();
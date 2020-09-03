const fs = require("fs");
const CONFIG_PATH = "./config.json";

const load = () =>
{
	if (fs.existsSync(CONFIG_PATH))
	{
		let contents = fs.readFileSync(CONFIG_PATH, "utf8");
		let config;

		try
		{
			config = JSON.parse(contents);
		} catch (e)
		{
			console.log("There was an error in your config.json");
			throw e;
		}

		return config;

	} else
	{
		throw new Error(`Config file was not found in path '${CONFIG_PATH}'. Please create it by running 'node setup.js'.`);
	}
}

module.exports = load();
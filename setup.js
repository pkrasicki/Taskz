const crypto = require("crypto");
const fs = require("fs");
const CONFIG_PATH = "./config.json";
const CRYPTO_BYTES = 32;
const SALT_SIZE = 12;

const config =
{
	database:
	{
		host: "",
		user: "",
		password: "",
		dbName: "",
		port: 3306,
		charset: "utf8mb4"
	},

	redis:
	{
		host: "localhost",
		port: 6379
	},

	security:
	{
		sessionSecret: crypto.randomBytes(CRYPTO_BYTES).toString("hex"),
		saltSize: SALT_SIZE
	}
};

if (fs.existsSync(CONFIG_PATH))
{
	console.log(`Config file already exists! Please remove ${CONFIG_PATH} and run the setup script again.`);
} else
{
	try
	{
		let jsonString = JSON.stringify(config, null, 4);
		fs.writeFileSync(CONFIG_PATH, jsonString, "utf8");
		console.log("Setup complete!");

	} catch (e)
	{
		throw e;
	}
}
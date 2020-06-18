const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const config = require("./backend/config");
const redis = require("redis");
const RedisStore = require("connect-redis")(session);
const db = require("./backend/db/db");
const PORT = process.env.PORT || 4000;
require("./backend/auth/passport-strategy")(passport);

let redisClient = redis.createClient();
app.use(express.json());

app.use(session({
	store: new RedisStore({client: redisClient}),
	secret: config.security.sessionSecret,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./backend/routes/index"));
app.use("/users", require("./backend/routes/users"));

app.use(express.static("./dist"));
app.use((req, res) =>
{
	res.sendFile(__dirname + '/dist/index.html');
});

app.listen(PORT, () =>
{
	console.log(`listening on ${PORT}`);
	db.connect()
		.then(db.createTables())
		.catch(err => console.log("Error connecting to the database", err));
});
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = (passport) =>
{
	passport.use(
		new LocalStrategy({usernameField: "name"}, (name, password, done) =>
		{
			let errorMessage = "Wrong username or password";

			User.getByName(name)
				.then(user =>
				{
					if(user == null)
						return done(null, false, errorMessage);

					bcrypt.compare(password, user.Password, (err, isMatch) =>
					{
						if (err)
							throw err;

						if (isMatch)
							return done(null, user);
						else
							return done(null, false, errorMessage);
					});
				})
				.catch(err => console.log(err));
		})
	);

	passport.serializeUser((user, done) =>
	{
		done(null, user);
	});

	passport.deserializeUser((user, done) =>
	{
		User.findId(user.UserId)
			.then(foundId =>
			{
				if (foundId == -1)
					done(null, false);
				else
					done(null, user);
			});
	});
};
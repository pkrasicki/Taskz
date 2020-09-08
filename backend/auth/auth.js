const ErrorResponse = require("../models/error-response");

module.exports =
{
	requireAuthentication: (req, res, next) =>
	{
		if (req.isAuthenticated())
		{
			res.cookie("isAuthenticated", true);
			return next();
		}

		res.cookie("isAuthenticated", false);
		res.status(401);
		res.json(new ErrorResponse("not authenticated", {authenticated: false}));
	}
};
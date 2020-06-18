const ErrorResponse = require("../models/error-response");

module.exports =
{
	requireAuthentication: (req, res, next) =>
	{
		if (req.isAuthenticated())
			return next();

		res.json(new ErrorResponse("not authenticated", {authenticated: false}));
	}
};
module.exports =
class ErrorResponse
{
	constructor(message, data=null)
	{
		this.message = message;
		if (data != null)
			this.data = data;

		let res = {error: true, success: false, message: this.message};
		if (this.data != null)
			res.data = this.data;

		return res;
	}
};
module.exports =
class SuccessResponse
{
	constructor(data=null)
	{
		if (data != null)
			this.data = data;

		let res = {error: false, success: true};
		if (this.data != null)
			res.data = this.data;

		return res;
	}
};
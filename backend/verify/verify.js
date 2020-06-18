module.exports =
{
	MAX_BOARD_NAME_LENGTH: 32,
	MAX_TASK_LIST_NAME_LENGTH: 32,
	MAX_TASK_CONTENT_LENGTH: 500,
	MAX_COMMENT_LENGTH: 500,
	MAX_USERNAME_LENGTH: 32,
	MAX_PASSWORD_LENGTH: 50,

	validBoardTitle(title)
	{
		title = `${title}`;
		return title.substring(0, this.MAX_BOARD_NAME_LENGTH);
	},

	validListTitle(title)
	{
		title = `${title}`;
		return title.substring(0, this.MAX_TASK_LIST_NAME_LENGTH);
	},

	validTaskContent(content)
	{
		content = `${content}`;
		return content.substring(0, this.MAX_TASK_CONTENT_LENGTH);
	}
};
const db = require("../db/db");

module.exports =
class User
{
	constructor(name, id=null)
	{
		this.name = name;
		if (id != null)
			this.id = id;
	}

	// returns user id or -1 if not found
	static async findId(id)
	{
		let res = await db.findUserId(id);

		if (res.length == 0)
			return -1;
		else
			return res[0].UserId;
	}

	// returns username or null if not found
	static async findName(name)
	{
		let res = await db.findUsername(name);

		if (res.length == 0)
			return null;
		else
			return res[0].Name;
	}

	// returns a user or null if not found
	static async getByName(name)
	{
		let res = await db.getUserByName(name);

		if (res.length == 0)
			return null;
		else
			return res[0];
	}

	static async usernameExists(name)
	{
		let userName = await User.findName(name);

		if (userName == null)
			return false;
		else
			return true;
	}

	// returns user id
	async create(passwordHash)
	{
		let doesNameExist = await User.usernameExists(this.name);

		if (!doesNameExist)
		{
			let userId = (await db.createUser(this.name, passwordHash)).insertId;
			this.id = userId;
			this.createDefaultBoard(userId);
			return userId;

		} else
		{
			return -1;
		}
	}

	// gives user permission to use a board
	async grantBoardAccess(boardId)
	{
		await db.grantBoardAccess(this.id, boardId);
	}

	// returns board id or -1 if doesn't exist
	async findBoardId(username, boardName)
	{
		let res = await db.findBoardId(username, boardName);
		if (res.length != 0)
			return res[0].BoardId;
		else
			return -1;
	}

	// returns an object with board id and uuid
	async createBoard(name, type=0, color=null, createEmpty=false)
	{
		if (type > 1)
			type = 1;

		// check if board with this name for this user already exists
		const id = await this.findBoardId(this.name, name);
		if (id != -1)
			return {id: -1, uuid: ""};

		const board = await db.createBoard(this.id, name, type, color);
		const boardId = board.insertId;
		this.grantBoardAccess(boardId);

		if (!createEmpty)
		{
			this.createTaskList(boardId, "To do", 1);
			this.createTaskList(boardId, "In progress", 2);
			this.createTaskList(boardId, "Done", 3);
		}

		return {id: boardId, uuid: board.uuid};
	}

	async deleteBoard(uuid)
	{
		let res = await db.deleteBoard(uuid);
		return res.affectedRows;
	}

	async createDefaultBoard()
	{
		let board = await this.createBoard("Introduction", 0, null, true);
		this.createTaskList(board.id, "To do", 1).then(res =>
		{
			this.createTask(res.insertId, "This is a task", 1);
			this.createTask(res.insertId, "Click on a task to edit it", 2);
			this.createTask(res.insertId, 'You can create a new task list by pressing "New List" button in top right corner', 3);
		});

		this.createTaskList(board.id, "In progress", 2).then(res =>
		{
			this.createTask(res.insertId, "Learn about Taskz", 1);
		});

		this.createTaskList(board.id, "Done", 3);
	}

	// returns db response with uuid
	async createTaskList(boardId, name, order, tasks=null)
	{
		await db.moveTaskListsRight(boardId, order);
		let res = await db.createTaskList(boardId, name, order);
		let promises = [];
		if (tasks != null)
		{
			tasks.forEach((task) =>
				promises.push(this.createTask(res.insertId, task.content, task.order, task.dueDate))
			);
		}

		await Promise.all(promises);
		return res;
	}

	async updateTaskList(uuid, name, order)
	{
		let taskList = await User.getTaskList(uuid);
		if (taskList == null)
			return 0;

		if (taskList.order != order)
			await db.moveTaskListsRight(taskList.boardId, order);

		return (await db.updateTaskList(uuid, name, order)).changedRows;
	}

	async deleteTaskList(uuid)
	{
		let res = await db.deleteTaskList(uuid);
		return res.affectedRows;
	}

	async findTaskListId(uuid)
	{
		let res = await db.findTaskListId(uuid);
		if (res.length > 0)
			return res[0].TaskListId;
		else
			return -1;
	}

	// returns task id
	async createTask(taskListId, content, order, dueDate=null)
	{
		await db.moveTasksDown(taskListId, order);
		let res = await db.createTask(taskListId, content, order, dueDate);
		return res.insertId;
	}

	// returns db response with uuid
	async createTaskUuid(taskListUuid, content, order, dueDate=null)
	{
		let taskListId = await this.findTaskListId(taskListUuid);
		await db.moveTasksDown(taskListId, order);
		let res = await db.createTask(taskListId, content, order, dueDate);
		return res;
	}

	async updateTask(uuid, content, order, dueDate=null)
	{
		let task = await User.getTask(uuid);
		if (task == null)
			return 0;

		if (task.order != order)
			await db.moveTasksDown(task.taskListId, order);

		return (await db.updateTask(uuid, content, order, dueDate)).changedRows;
	}

	async deleteTask(id)
	{
		let res = await db.deleteTask(id);
		return res.affectedRows;
	}

	// checks if user can access a board
	async hasAccess(boardId)
	{
		let res = await db.hasAccess(this.id, boardId);

		if (res.length == 0)
			return false;
		else
			return true;
	}

	async isOwner(boardUuid)
	{
		let res = await db.isOwner(this.id, boardUuid);

		if (res.length == 0)
			return false;
		else
			return true;
	}

	async getOwnedBoards()
	{
		let boards = await db.getOwnedBoards(this.id);
		return boards;
	}

	async getBoards()
	{
		let boards = await db.getBoards(this.id);
		return boards;
	}

	async getTaskLists(boardId)
	{
		let taskLists = await db.getTaskLists(boardId);
		return taskLists;
	}

	static async getTaskList(uuid)
	{
		let res = await db.getTaskList(uuid);
		if (res.length > 0)
			return res[0];
		else
			return null;
	}

	static async getTasks(taskListUuid)
	{
		let tasks = await db.getTasksByListUuid(taskListUuid);
		return tasks;
	}

	static async getTask(uuid)
	{
		let res = await db.getTask(uuid);
		if (res.length > 0)
			return res[0];
		else
			return null;
	}

	static async getBoardId(username, boardName)
	{
		let res = await db.findBoardId(username, boardName);
		if (res.length == 0)
			return -1;
		else
			return res[0].BoardId;
	}

	static async getCompleteBoard(boardId)
	{
		let boardRes = await db.getBoard(boardId);
		if (boardRes.length == 0)
			return null;

		let board = boardRes[0];

		let taskLists = await db.getTaskLists(boardId);
		board.taskLists = taskLists;

		if (taskLists.length == 0)
			return board;

		for (let i = 0; i < board.taskLists.length; i++)
		{
			let tasksArray = await User.getTasks(board.taskLists[i].uuid);
			taskLists[i].tasks = tasksArray;
		}

		return board;
	}

	// verify if username meets the requirements for registration
	static isUsernameValid(username)
	{
		if (typeof username != "string")
			return false;

		if (username.length < 3 || username.length > 32)
			return false;

		return true;
	}

	// verify if password meets the requirements for registration
	static isPasswordValid(password)
	{
		if (typeof password != "string")
			return false;

		if (password.length < 8 || password.length > 50)
			return false;

		return true;
	}
};
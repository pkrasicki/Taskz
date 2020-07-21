const mysql = require("mysql");
const {v4: uuidv4} = require("uuid");
const config = require("../config");
const verify = require("../verify/verify");
const con = mysql.createConnection({
	host: config.database.host,
	user: config.database.user,
	password: config.database.password,
	database: config.database.dbName
});

function handleQueryError(error, results, fields)
{
	if (error)
	{
		console.log("Error executing a query");
		throw error;
	}
}

module.exports =
{
	connect()
	{
		return new Promise((resolve) =>
		{
			con.connect((err) =>
			{
				if (err)
					throw err;

				console.log(`connected to db (connection id: ${con.threadId})`);
				resolve();
			});
		});
	},

	createTables()
	{
		let queryString;

		queryString = `\
			create table if not exists Users (\
				UserId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				Name VARCHAR(${verify.MAX_USERNAME_LENGTH}) NOT NULL UNIQUE,\
				Password VARCHAR(80) NOT NULL,\
				CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\
			);`;

		con.query(queryString, handleQueryError);

		queryString = `\
			create table if not exists Boards (\
				BoardId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				Name VARCHAR(${verify.MAX_BOARD_NAME_LENGTH}) NOT NULL,\
				Type INT NOT NULL DEFAULT(0),\
				Color VARCHAR(15) NULL,\
				AdminId INT NOT NULL,\
				Uuid VARCHAR(60) NOT NULL UNIQUE,\
				FOREIGN KEY (AdminId) REFERENCES Users(UserId) ON DELETE CASCADE\
			);`;

		con.query(queryString, handleQueryError);

		queryString = `\
			create table if not exists Labels (\
				LabelId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				Text VARCHAR(${verify.MAX_BOARD_NAME_LENGTH}) NULL,\
				Color VARCHAR(15) NOT NULL\
			);`;

		con.query(queryString, handleQueryError);

		queryString = `\
			create table if not exists TaskLists (\
				TaskListId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				Name VARCHAR(${verify.MAX_TASK_LIST_NAME_LENGTH}) NOT NULL,\
				BoardId INT NOT NULL,\
				ListOrder INT NOT NULL,\
				Uuid VARCHAR(60) NOT NULL UNIQUE,\
				FOREIGN KEY (BoardId) REFERENCES Boards(BoardId) ON DELETE CASCADE\
			);`;

		con.query(queryString, handleQueryError);

		queryString = `\
			create table if not exists Tasks (\
				TaskId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				DueDate TIMESTAMP NULL,\
				CreatedDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\
				Content VARCHAR(${verify.MAX_TASK_CONTENT_LENGTH}) NOT NULL,\
				TaskOrder INT NOT NULL,\
				TaskListId INT NOT NULL,\
				Uuid VARCHAR(60) NOT NULL UNIQUE,\
				FOREIGN KEY (TaskListId) REFERENCES TaskLists(TaskListId) ON DELETE CASCADE\
			);`;

		con.query(queryString, handleQueryError);

		queryString = `\
			create table if not exists TaskComments (\
				TaskCommentId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\
				Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\
				Text VARCHAR(${verify.MAX_COMMENT_LENGTH}) NOT NULL,\
				TaskId INT NOT NULL,\
				UserId INT NOT NULL,\
				Uuid VARCHAR(60) NOT NULL UNIQUE,\
				FOREIGN KEY (TaskId) REFERENCES Tasks(TaskId) ON DELETE CASCADE,\
				FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE\
			);`;

		con.query(queryString, handleQueryError);

		queryString = "\
			create table if not exists AssignedUsers (\
				TaskId INT NOT NULL,\
				UserId INT NOT NULL,\
				FOREIGN KEY (TaskId) REFERENCES Tasks(TaskId) ON DELETE CASCADE,\
				FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE\
			);";

		con.query(queryString, handleQueryError);

		queryString = "\
			create table if not exists BoardAccess (\
				BoardId INT NOT NULL,\
				UserId INT NOT NULL,\
				FOREIGN KEY (BoardId) REFERENCES Boards(BoardId) ON DELETE CASCADE,\
				FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE\
			);";

		con.query(queryString, handleQueryError);

		queryString = "\
			create table if not exists TasksLabels (\
				TaskId INT NOT NULL,\
				LabelId INT NOT NULL,\
				FOREIGN KEY (TaskId) REFERENCES Tasks(TaskId) ON DELETE CASCADE,\
				FOREIGN KEY (LabelId) REFERENCES Labels(LabelId) ON DELETE CASCADE\
			);";

		con.query(queryString, handleQueryError);
	},

	getUserByName(name)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT * from Users WHERE Name = ? LIMIT 1;";
			con.query(queryString, [name], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	findUsername(name)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT Name from Users WHERE Name = ? LIMIT 1;";
			con.query(queryString, [name], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	findUserId(id)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT UserId from Users WHERE UserId = ? LIMIT 1;";
			con.query(queryString, [id], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	createUser(name, passwordHash)
	{
		return new Promise(resolve =>
		{
			let queryString = "INSERT INTO Users (Name, Password) values (?, ?);";
			con.query(queryString, [name, passwordHash], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	createBoard(userId, name, type=0, color=null)
	{
		return new Promise(resolve =>
		{
			const queryString = "INSERT INTO Boards (Name, AdminId, Type, Color, Uuid) values (?, ?, ?, ?, ?);";
			const uuid = uuidv4();
			con.query(queryString, [name, userId, type, color, uuid], (error, results) =>
			{
				if (error)
					throw error;

				results.uuid = uuid;
				resolve(results);
			});
		});
	},

	deleteBoard(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "DELETE FROM Boards WHERE Uuid = ?;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	grantBoardAccess(userId, boardId)
	{
		return new Promise(resolve =>
		{
			let queryString = "INSERT INTO BoardAccess (BoardId, UserId) values (?, ?);";
			con.query(queryString, [boardId, userId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	hasAccess(userId, boardId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT BoardId FROM BoardAccess WHERE UserId = ? AND BoardId = ? LIMIT 1;";
			con.query(queryString, [userId, boardId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	isOwner(userId, boardUuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT BoardId FROM Boards WHERE Uuid = ? AND AdminId = ? LIMIT 1;";
			con.query(queryString, [boardUuid, userId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getOwnedBoards(userId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT B.Name as title, B.Type as type, B.Color FROM Boards as B WHERE AdminId = ?;";
			con.query(queryString, [userId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getBoards(userId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT B.Name as title, B.Type as type, B.Color as color, B.Uuid as uuid FROM BoardAccess as BA LEFT JOIN Boards as B ON BA.UserId = ? AND BA.BoardId = B.BoardId WHERE B.BoardId IS NOT NULL;";
			con.query(queryString, [userId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getBoard(boardId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT B.Name as title, B.Type as type, B.Color as color FROM Boards as B WHERE B.BoardId = ? LIMIT 1;";
			con.query(queryString, [boardId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	findBoardId(username, boardName)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT B.BoardId FROM Users as U LEFT JOIN BoardAccess AS BA \
			ON U.UserId = BA.UserId and U.Name = ? LEFT JOIN Boards as B ON B.BoardId = BA.BoardId and B.Name = ? \
			WHERE B.BoardId IS NOT NULL;";
			con.query(queryString, [username, boardName], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	createTaskList(boardId, name, order)
	{
		return new Promise(resolve =>
		{
			const uuid = uuidv4();
			let queryString = "INSERT INTO TaskLists (Name, BoardId, ListOrder, Uuid) values (?, ?, ?, ?);";
			con.query(queryString, [name, boardId, order, uuid], (error, results) =>
			{
				if (error)
					throw error;

				results.uuid = uuid;
				resolve(results);
			});
		});
	},

	updateTaskList(uuid, name, order)
	{
		return new Promise(resolve =>
		{
			let queryString = "UPDATE TaskLists SET Name=?, ListOrder=? WHERE Uuid = ?;";
			con.query(queryString, [name, order, uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	deleteTaskList(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "DELETE FROM TaskLists WHERE Uuid = ?;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	moveTaskListsRight(boardId, startOrder)
	{
		return new Promise(resolve =>
		{
			let queryString = "UPDATE TaskLists SET ListOrder=ListOrder+1 WHERE BoardId = ? and ListOrder >= ?;";
			con.query(queryString, [boardId, startOrder], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	createTask(taskListId, content, order, dueDate=null)
	{
		return new Promise(resolve =>
		{
			const uuid = uuidv4();
			let queryString = "INSERT INTO Tasks (Content, DueDate, TaskOrder, TaskListId, Uuid) values (?, ?, ?, ?, ?);";
			con.query(queryString, [content, dueDate, order, taskListId, uuid], (error, results) =>
			{
				if (error)
					throw error;

				results.uuid = uuid;
				resolve(results);
			});
		});
	},

	updateTask(uuid, content, order, dueDate=null)
	{
		return new Promise(resolve =>
		{
			let queryString = "UPDATE Tasks SET Content=?, DueDate=?, TaskOrder=? WHERE Uuid = ?;";
			con.query(queryString, [content, dueDate, order, uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	deleteTask(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "DELETE FROM Tasks WHERE Uuid = ?;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	moveTasksDown(taskListId, startOrder)
	{
		return new Promise(resolve =>
		{
			let queryString = "UPDATE Tasks SET TaskOrder=TaskOrder+1 WHERE TaskListId = ? and TaskOrder >= ?;";
			con.query(queryString, [taskListId, startOrder], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getTaskLists(boardId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT TaskLists.Name as title, TaskLists.ListOrder as 'order', TaskLists.Uuid as uuid FROM Boards JOIN TaskLists ON Boards.BoardId = ? AND TaskLists.BoardId = Boards.BoardId;";
			con.query(queryString, [boardId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getTaskList(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT Name as title, ListOrder as 'order', Uuid as uuid, BoardId as boardId FROM TaskLists WHERE Uuid = ? LIMIT 1;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	findTaskListId(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT TaskListId FROM TaskLists WHERE Uuid = ? LIMIT 1;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getTasks(taskListId)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT DueDate as dueDate, CreatedDate as createdDate, Content as content, TaskOrder as 'order', Uuid FROM Tasks WHERE TaskListId = ?;";
			con.query(queryString, [taskListId], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getTask(uuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT DueDate as dueDate, CreatedDate as createdDate, Content as content, TaskOrder as 'order', Uuid, TaskListId as taskListId FROM Tasks WHERE Uuid = ? LIMIT 1;";
			con.query(queryString, [uuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	},

	getTasksByListUuid(taskListUuid)
	{
		return new Promise(resolve =>
		{
			let queryString = "SELECT T.DueDate as dueDate, T.CreatedDate as createdDate, T.Content as content, TaskOrder as 'order', T.Uuid as uuid FROM Tasks as T JOIN TaskLists as TL ON T.TaskListId = TL.TaskListId AND TL.Uuid = ?;";
			con.query(queryString, [taskListUuid], (error, results) =>
			{
				if (error)
					throw error;

				resolve(results);
			});
		});
	}
};
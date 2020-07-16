const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {requireAuthentication} = require("../auth/auth");
const SuccessResponse = require("../models/success-response");
const ErrorResponse = require("../models/error-response");
const config = require("../config");
const verify = require("../verify/verify");

function noPermissionResponse(res)
{
	res.status(403);
	res.json(new ErrorResponse("You don't have permission to edit this board"));
}

router.post("/login", passport.authenticate("local", {failWithError: true}), (req, res, next) =>
{
	const user =
	{
		name: req.user.Name,
		joinedDate: req.user.CreatedDate
	};

	res.cookie("username", req.user.Name);
	res.json(new SuccessResponse(user));

}, (err, req, res, next) =>
{
	if (err.status = 400 || err.status == 401)
	{
		res.status(400);
		res.json(new ErrorResponse("Wrong username or password"));
	}
});

router.post("/register", (req, res) =>
{
	const {name, password, password2} = req.body;
	let errors = [];

	if (name == null || password == null)
	{
		errors.push("Please fill in all of the fields");

	} else if (!User.isUsernameValid(name))
	{
		errors.push("Username needs to be between 3 and 32 characters long");

	} else if (!User.isPasswordValid(password))
	{
		errors.push("Password needs to be between 8 and 50 characters long");

	} else if (password != password2)
	{
		errors.push("Passwords don't match");
	}

	if (errors.length > 0)
	{
		res.status(400);
		res.json(new ErrorResponse("registration error", errors));

	} else
	{
		User.usernameExists(name).then(exists =>
		{
			if (!exists)
			{
				bcrypt.genSalt(config.security.saltSize, (err, salt) =>
				{
					bcrypt.hash(password, salt, (err, hash) =>
					{
						if (err)
							throw err;
	
						const newUser = new User(name);
						newUser.create(hash).then(userId =>
						{
							if (userId != -1)
							{
								res.json(new SuccessResponse());

							} else
							{
								console.log("Error registering user");
								res.status(500);
								res.json(new ErrorResponse("server error"));
							}

						}).catch(err => console.log(err));
					});
				});
			} else
			{
				errors.push("User already exists");
				res.status(400);
				res.json(new ErrorResponse("registration error", errors));
			}
		});
	}
});

router.get("/user", (req, res) =>
{
	if (req.isAuthenticated())
	{
		res.json(new SuccessResponse({authenticated: true}));
	} else
	{
		res.status(401);
		res.json(new ErrorResponse("Not authenticated", {authenticated: false}));
	}
});

router.get("/logout", (req, res) =>
{
	req.logout();
	res.cookie("username", "", {expires: new Date()});
	res.json(new SuccessResponse());
});

// get list of boards
router.get("/boards", requireAuthentication, (req, res) =>
{
	let userId = req.user.UserId;
	let user = new User("", userId);

	user.getBoards().then(boards =>
		res.json(new SuccessResponse(boards))
	).catch(e =>
	{
		throw e;
	});
});

// get board
router.get("/:username/boards/:boardName", async (req, res) =>
{
	const {username, boardName} = req.params;
	const isAuthenticated = req.isAuthenticated();

	if (username == null)
	{
		res.status(400);
		res.json(new ErrorResponse("username is missing"));

	} else if (boardName == null)
	{
		res.status(400);
		res.json(new ErrorResponse("board name is missing"));

	} else
	{
		let boardId = await User.getBoardId(username, boardName);
		if (boardId == -1)
		{
			res.status(404);
			res.json(new ErrorResponse("not found"));
			return;
		}

		let board = await User.getCompleteBoard(boardId);
		board.ownerUsername = username;

		if (board.type == 1) // is public board
		{
			res.json(new SuccessResponse(board));

		} else if (!isAuthenticated)
		{
			res.status(401);
			res.json(new ErrorResponse("Not authenticated", {authenticated: false}));

		} else
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);
			if (hasAccess)
				res.json(new SuccessResponse(board));
			else
				noPermissionResponse(res);
		}
	}
});

// create board
router.post("/boards", requireAuthentication, (req, res) =>
{
	if (req.body.title == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		let title = req.body.title;
		let type = req.body.type || 0;
		let color = req.body.color || null;

		title = verify.validBoardTitle(title);

		let user = new User(req.user.Name, req.user.UserId);
		user.createBoard(title, type, color, false).then(boardInfo =>
		{
			if (boardInfo.id > 0)
			{
				let board =
				{
					ownerUsername: req.user.Name,
					title: title,
					type: type,
					color: color,
					uuid: boardInfo.uuid
				};

				res.json(new SuccessResponse(board));
			} else if (boardInfo.id == -1)
			{
				res.status(400);
				res.json(new ErrorResponse("Couldn't create board"));
			} else
			{
				console.log("Error creating board");
				res.status(500);
				res.json(new ErrorResponse("server error"));
			}
		});
	}
});

// delete board
router.delete("/boards/:id", requireAuthentication, async(req, res) =>
{
	const {id} = req.params;

	if (id == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		let user = new User(req.user.Name, req.user.UserId)
		let isOwner = await user.isOwner(id);
		if (isOwner)
		{
			let affectedRows = await user.deleteBoard(id);
			if (affectedRows > 0)
			{
				res.json(new SuccessResponse({id: id}));
			} else
			{
				res.status(500);
				res.json(new ErrorResponse("couldn't delete board"));
			}
		} else
		{
			res.status(403);
			res.json(new ErrorResponse("you don't own this board"));
		}
	}
});

// create task list
router.post("/:username/boards/:boardName/taskLists", requireAuthentication, async (req, res) =>
{
	const {username, boardName} = req.params;
	let {title, order, tasks} = req.body;

	if (username == null || boardName == null || title == null || order == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		title = verify.validListTitle(title);

		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let result = await user.createTaskList(boardId, title, order, tasks);
				if (result.insertId > 0)
				{
					res.json(new SuccessResponse({
						id: result.uuid,
						title: title,
						order: order,
						tasks: tasks || []
					}));

				} else
				{
					console.log("Error creating task list");
					res.status(500);
					res.json(new ErrorResponse("server error"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

// update task list
router.put("/:username/boards/:boardName/taskLists/:id", requireAuthentication, async (req, res) =>
{
	const {username, boardName, id} = req.params;
	let {title, order} = req.body;

	if (username == null || boardName == null || id == null || title == null || order == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		title = verify.validListTitle(title);

		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let changedRows = await user.updateTaskList(id, title, order);
				if (changedRows > 0)
				{
					res.json(new SuccessResponse({id: id, title: title, order: order}));
				} else
				{
					res.status(500);
					res.json(new ErrorResponse("task list couldn't be updated"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

// delete task list
router.delete("/:username/boards/:boardName/taskLists/:id", requireAuthentication, async (req, res) =>
{
	const {username, boardName, id} = req.params;

	if (username == null || boardName == null || id == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let affectedRows = await user.deleteTaskList(id);
				if (affectedRows > 0)
				{
					res.json(new SuccessResponse({id}));
				} else
				{
					res.status(500);
					res.json(new ErrorResponse("task list couldn't be deleted"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

// create task
router.post("/:username/boards/:boardName/taskLists/:id", requireAuthentication, async (req, res) =>
{
	const {username, boardName, id} = req.params;
	let {content, order, dueDate} = req.body;

	if (username == null || boardName == null || id == null || content == null || order == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		content = verify.validTaskContent(content);

		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let result = await user.createTaskUuid(id, content, order, dueDate);

				if (result.insertId > 0)
				{
					res.json(new SuccessResponse({id: result.uuid, content: content, order: order, dueDate: dueDate}));

				} else
				{
					console.log("Error creating task");
					res.status(500);
					res.json(new ErrorResponse("server error"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

// update task
router.put("/:username/boards/:boardName/tasks/:id", requireAuthentication, async (req, res) =>
{
	const {username, boardName, id} = req.params;
	let {content, order, dueDate} = req.body;

	if (username == null || boardName == null || id == null || content == null || order == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		content = verify.validTaskContent(content);

		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let changedRows = await user.updateTask(id, content, order, dueDate);
				if (changedRows > 0)
				{
					res.json(new SuccessResponse({id: id, content: content, order: order, dueDate: dueDate}));
				} else
				{
					res.status(500);
					res.json(new ErrorResponse("task couldn't be updated"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

// delete task
router.delete("/:username/boards/:boardName/tasks/:id", requireAuthentication, async (req, res) =>
{
	const {username, boardName, id} = req.params;

	if (username == null || boardName == null || id == null)
	{
		res.status(400);
		res.json(new ErrorResponse("missing parameter"));
	} else
	{
		let boardId = await User.getBoardId(username, boardName);
		if (boardId != -1)
		{
			let user = new User(req.user.Name, req.user.UserId);
			let hasAccess = await user.hasAccess(boardId);

			if (hasAccess)
			{
				let affectedRows = await user.deleteTask(id);
				if (affectedRows > 0)
				{
					res.json(new SuccessResponse({id: id}));
				} else
				{
					res.status(500);
					res.json(new ErrorResponse("task couldn't be deleted"));
				}
			} else
			{
				noPermissionResponse(res);
			}
		}
	}
});

module.exports = router;
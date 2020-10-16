# Taskz
Free and open source task management app.

![screenshot](screenshot.png?raw=true)

![screenshot 2](screenshot2.png?raw=true)

## Dependencies
- [Node.js](https://nodejs.org)
- [Npm](https://npmjs.com)
- [Redis](https://redis.io)
- [MySQL](https://mysql.com) or [MariaDB](https://mariadb.org)

## Build from source
Install remaining dependencies:

`npm install`

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build. Use `--watch` flag if you want frontend to rebuild on changes (useful for development).

## Configure
Before you can run the app, you will need to:
1. Create a MySQL or MariaDB database for Taskz to use.
2. Edit `config.json` and provide necessary details for the database. If your redis server is not running on localhost with default port, provide those details too.

## Run
Run `node app.js` to start the app. Navigate to `http://localhost:4000`.
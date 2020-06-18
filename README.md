# Taskz
Free and open source task management app.

![screenshot](screenshot.png?raw=true)

## Dependencies
- [Node.js](https://nodejs.org)
- [Npm](https://npmjs.com)
- [Redis](https://redis.io)
- [MySQL](https://mysql.com) or [MariaDB](https://mariadb.org)

## Config
1. Create a MySQL (or MariaDB) database.
2. Generate a session secret.
3. Provide the necessary details in `config.json`.

## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build. Use `--watch` flag if you want frontend to rebuild on changes (useful for development).

## Run
Run `nodemon app.js` to start the app. Navigate to `http://localhost:4000`. The backend will automatically reload if you change any of its files.
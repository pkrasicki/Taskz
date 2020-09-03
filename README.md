# Taskz
Free and open source task management app.

![screenshot](screenshot.png?raw=true)

## Dependencies
- [Node.js](https://nodejs.org)
- [Npm](https://npmjs.com)
- [Redis](https://redis.io)
- [MySQL](https://mysql.com) or [MariaDB](https://mariadb.org)

## Install with Npm
`npm install taskz-app`

## Build from source
Install remaining dependencies:

`npm install`

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build. Use `--watch` flag if you want frontend to rebuild on changes (useful for development).

## Configure
1. Create a MySQL or MariaDB database.
2. Run `npm run setup` to create a config file.
3. Edit `config.json` and provide database details.

## Run
Run `npx nodemon app.js` to start the app. Navigate to `http://localhost:4000`. The backend will automatically reload if you change any of its files.
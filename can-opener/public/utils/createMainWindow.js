const { BrowserWindow } = require("electron");
const { join } = require("path");
const { autoUpdater } = require("electron-updater");
const remote = require("@electron/remote/main");
const config = require("./config");
const https = require("https");
const db = require("../db/index.ts");

exports.createMainWindow = async () => {
	const window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			devTools: config.isDev,
			contextIsolation: false,
		},
		frame: false,
		icon: config.icon,
		title: config.appName,
	});

	remote.enable(window.webContents);

	await window.loadURL(
		config.isDev
			? "http://localhost:3000"
			: `file://${join(__dirname, "..", "../build/index.html")}`,
	);

	window.once("ready-to-show", () => {
		autoUpdater.checkForUpdatesAndNotify();
	});

	window.on("close", (e) => {
		if (!config.isQuiting) {
			e.preventDefault();

			window.hide();
		}
	});

	window.webContents.session.webRequest.onHeadersReceived(
		{ urls: ["*://*/*"] },
		(details, callback) => {
			Object.keys(details.responseHeaders)
				.filter((x) => x.toLowerCase() === "x-frame-options")
				.map((x) => delete details.responseHeaders[x]);

			callback({
				cancel: false,
				responseHeaders: details.responseHeaders,
			});
		},
	);

	window.on("asm", () => {
		const session = window.webContents.session;
		session.protocol.registerHttpProtocol("https", (request) => {
			const options = {
				method: request.method,
			};

			const req = https.request(request.url, options, (res) => {
				res.on("data", (body) => {
					if (
						res.headers["content-type"] ===
						"text/javascript; charset=UTF-8"
					) {
						db.insert.request(
							request.url,
							request.method,
							JSON.stringify(request.headers),
							JSON.stringify(res.headers),
							body.toString("utf8"),
						);
					}
				});
			});
			req.end();

			// req.on("error", (error) => {
			// 	console.error(error);
			// });

			// const resp = callback()
		});
	});

	return window;
};


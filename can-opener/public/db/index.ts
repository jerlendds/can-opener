const sqlite3 = require("sqlite3").verbose();

const db = {
	init: () => {
		const db = new sqlite3.Database("./public/db/db.sqlite");

		try {
			db.serialize(() => {
				db.run(
					`CREATE TABLE requests (
          url TEXT,
          method TEXT,
          headers TEXT
        )`,
				);
				db.run(
					`CREATE TABLE responses (
          request_id INTEGER,
          headers TEXT,
          body TEXT,
          FOREIGN KEY(request_id) REFERENCES request(id)
        )`,
				);

				// 	const stmt = db.prepare("INSERT INTO requests VALUES (?)");
				// 	for (let i = 0; i < 10; i++) {
				// 		stmt.run("Ipsum " + i);
				// 	}
				// 	stmt.finalize();

				// 	db.each("SELECT rowid AS id, info FROM requests", (err, row) => {
				// 		console.log(row.id + ": " + row.info);
				// 	});
			});
		} catch {}

		db.close();
	},
	insert: {
		request: (url, method, headers, res_headers, body) => {
			const db = new sqlite3.Database("./public/db/db.sqlite");
			let stmt = db.prepare("INSERT INTO requests VALUES (?, ?, ?)");
      console.log('should be inserted? ', stmt)
			stmt.run(url, method, headers);
			stmt.finalize();

			stmt = db.prepare("INSERT INTO responses VALUES (?, ?, ?)");
      stmt.run(1, res_headers, body);
			stmt.finalize();
			db.close();
		},
	},
};

module.exports = db;


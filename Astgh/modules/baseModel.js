const jsonfile = require('jsonfile');

class base {
	readAll(path) {
		return jsonfile.readFile(path);
	}

	readItem(path, id) {
		jsonfile.readFile(path)
			.then((infoObj) => { return infoObj[id] })
			.catch((err) => { return });
	}

	addItem(path, id, info) {
		jsonfile.readFile(path)
			.then((infoObj) => {
				infoObj[id] = info;
				jsonfile.writeFile(path, infoObj, { spaces: 2, EOL: '\r\n' })
			})
			.catch((err) => { return });
	}

	deleteItem(path, id) {
		jsonfile.readFile(path)
			.then((infoObj) => {
				if (infoObj[id]) {
					delete (infoObj[id]);
					jsonfile.writeFile(path, infoObj, { spaces: 2, EOL: '\r\n' });
				}
			})
			.catch((err) => { return });
	}
}

module.exports = base;
const jsonfile = require('jsonfile');

class base {
	readAll(path) {
		return jsonfile.readFile(path);
	}

	readItem(path, id) {
		return jsonfile.readFile(path)
			.then((infoObj) => { 
				if (infoObj && infoObj[id] !== undefined) {
					return infoObj[id];
				}
				return null;
			});
	}

	addItem(path, id, info) {
		jsonfile.readFile(path)
			.then((infoObj) => {
				infoObj[id] = info;
				return jsonfile.writeFile(path, infoObj, { spaces: 2, EOL: '\r\n' })
			})
	}

	deleteItem(path, uniqueInfo) {
		return jsonfile.readFile(path)
			.then((infoObj) => {
				if (infoObj[uniqueInfo]) {
					delete (infoObj[uniqueInfo]);
					return jsonfile.writeFile(path, infoObj, { spaces: 2, EOL: '\r\n' });
				}
			});
	}
}

module.exports = base;

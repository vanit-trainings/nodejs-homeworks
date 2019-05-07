const jsonfile = require('jsonfile');

class baseObj {
	readAll(path) {
		return jsonfile.readFile(path);
	}

	additem(path, key, value){
		return this.readAll(path)
			.then(result => {
				result[ key ] = value;
				return result;
			})
			.then(resultWrite => {
				return jsonfile.writeFile(path, resultWrite, {spaces : 4, EOL : '\r\n'});
			})
			.catch(err => err);
	}

	deleteItem(path, id){
		return this.readAll(path)
			.then(result => {
				if(!result[ id ]){
					return 'Record Not Found : id - is not correct (no match found)';
				}
				delete result[ id ];
				return jsonfile.writeFile(path, result, {spaces : 4, EOL : '\r\n'});
			})
			.catch(err => err);
	}

	readItem(path, id){
		return this.readAll(path)
			.then(result => {
				return result[ id ] ? result[ id ] : 'Record Not Found : id - is not correct (no match found)';
			})
			.catch(err => err);
	}

	updateItem(path, id, obj){
		return this.readAll(path)
			.then(result => {
				if(!result[ id ]){
					return 'Record Not Found : id - is not correct (no match found)';
				}
				for(let i in obj){
					result[ id ][ i ] = obj[ i ];
				}
				return jsonfile.writeFile(path, result, {spaces : 4, EOL : '\r\n'});
			}).catch((err) => err);
	}
}

module.exports = new baseObj();

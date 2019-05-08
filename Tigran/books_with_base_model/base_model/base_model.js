const jsonfile = require('jsonfile');
var allBooks = "./data/allBooks.json";

// class baseModel  {

// }


const readAll = (path) => {
	return jsonfile.readFile(path, "utf-8")
	.then(data => {
			const books = [];
			for(let isbn in data){
				books.push({"title" : data[isbn].title, "subtitle" : data[isbn].subtitle, "author" : data[isbn].author});
			}
			return {
				status : 200,
				send : books
			}
		})
	.catch(err => {
		return {
			status : 500,
			send : 'server error'
		}
	});
}


const addItem = (item) => {//item (new book) should validate
	return jsonfile.readFile(allBooks, "utf-8")
		.then( data => {
			data[item.isbn] = item;
			return data;
		})
		.then(changedData => {
			return jsonfile.writeFile(allBooks, changedData, { spaces: 2, EOL: '\r\n' })
				.then(() => {
					return {
						status : 200,
						send : 'succsess'
					}
				})
				.catch(err => {// ete es catch@ chexni 51rd toxi catch@ kngni?????
					return {
						status : 500,
						send : 'server error'
					}
				})
		})
		.catch(error => {
			return {
				status : 500,
				send : 'server error'
			}
		})
}

const readItem = (itemID) => {
	return 	jsonfile.readFile(allBooks, 'utf-8')
			.then( data => {
				if (!data[itemID]) {
					return {
						status : 404,
						send : 'not found'
					}
				}
				return {
					status : 200,
					send : data[ itemID ]
				}
			})
			.catch(err => {
				return {
					status : 500,
					send : 'server error'
				}
			});
}
const deleteItem = (itemID) => {
	return jsonfile.readFile(allBooks,'utf-8')
			.then(data => {
				if (!data[ itemID ]) {
					throw new Error()//reject
				}
				delete data[ itemID ];
				return data;//resolve
			})
			.then(changedData => {
				return jsonfile.writeFile(allBooks, changedData, { spaces: 2, EOL: '\r\n' })
						.then(() => {
							return {
								status : 200,
								send : 'succsess'
							}
						})
						.catch(err => {// ete es catch@ chexni 51rd toxi catch@ kngni?????
							return {
								status : 500,
								send : 'server error'
							}
						})
			})
			.catch(err => {
				return {
					status : 500,
					send : 'server error'
				}
			})
}
const updateItem = (item) => {
	return jsonfile.readFile(allBooks, "utf-8")
		.then( data => {
			let changedItem =
			data[ item.isbn ] = item;
			return data;
		})
		.then(changedData => {
			return jsonfile.writeFile(allBooks, changedData, { spaces: 2, EOL: '\r\n' })
				.then(() => {
					return {
						status : 200,
						send : 'succsess'
					}
				})
				.catch(err => {// ete es catch@ chexni 51rd toxi catch@ kngni?????
					return {
						status : 500,
						send : 'server error'
					}
				})
		})
		.catch(error => {
			return {
				status : 500,
				send : 'server error'
			}
		})
}



module.exports.readAll = readAll;
module.exports.addItem = addItem;
module.exports.readItem = readItem;
module.exports.deleteItem = deleteItem;
module.exports.updateItem = updateItem;

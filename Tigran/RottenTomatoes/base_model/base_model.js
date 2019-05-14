const jsonfile = require('jsonfile');
const BoxOficeMovieLists = "./data/Movie_lists/Box_ofice_movie_lists.json";

const readAll = (path) => {
	return jsonfile.readFile(path, "utf-8")
	.then(data => {
			const films = [];
			for(let title in data){
				films.push(data[title]);
			}
			return {
				status : 200,
				send : films
			}
		})
	.catch(err => {
		return {
			status : 500,
			send : 'server error'
		}
	});
}
const readMovie = (path, id) => {
	return jsonfile.readFile(path, "utf-8")
	.then(data => {
			const film = data[id];
			if (film) {
				return {
					status : 200,
					send : film
				}
			}
			return {
				status : 404,
				send : "not found"
			}

		})
	.catch(err => {
		return {
			status : 500,
			send : 'server error'
		}
	});
}
const searchForKey = (object,searchKey) => {
	let result = [];
	for (let movie in object) {
		if (movie.title.indexOf(searchKey) !== -1) {
			result.push(movie);
		}
	}
	return result;
}
const search = (path1,searchKey) => {
	let result = [];
	return jsonfile.readFile(path1,'utf-8')
			.then(data => {
				for (let movie in data) {
					if (data[movie].title.indexOf(searchKey) !== -1) {
						result.push(data[movie]);
					}
				}
				return result;
			})
}

module.exports.readAll = readAll;
module.exports.readMovie = readMovie;
module.exports.search = search;

// module.exports.addItem = addItem;
// module.exports.readItem = readItem;
// module.exports.deleteItem = deleteItem;
// module.exports.updateItem = updateItem;

const express = require('express');
const router = express.Router();
const jsonfile = require('jsonfile');
const users = "./data/users.json";
const userLogin = "./data/userLog.json";

function isvVlidUsernameOrPasswoord(usernameOrPassword) {
	const reg = new RegExp(/^[a-zA-Z][a-z0-9-_]{2,16}/);
	return reg.test(usernameOrPassword);
}


router.post('/', function (req, res) {
	jsonfile.readFile(users, function (err, obj) {
		if (err) {
			console.log(err);
			return res.status(500).send("Server error");
		}
		if (!isvVlidUsernameOrPasswoord(req.body.username) && !isvVlidUsernameOrPasswoord(req.body.password)) {
			return res.status(400).send("bad request");
		}
		if (obj[req.body.username]) {
			return res.status(400).send("Username is already used");
		}
		obj[req.body.username] = {
			username: req.body.username,
			password: req.body.password

		};
		let obj2 = {};
		obj2[req.body.username] = {
			username: req.body.username,
			password: req.body.password,
			token: token(5),
			date: new Date().getTime()

		};
		jsonfile.writeFile(users, obj, function (err) {
			if (err) {
				console.log(err);
				return res.status(500).send("Server error");
			}
			return res.status(200).send("ok");
		});
		jsonfile.readFile(userLogin, function (err, obj) {


			jsonfile.writeFile(userLogin, obj2, function (err) {

				if (err) {
					console.log(err);
					return res.status(500).send("Server error");
				}
				return res.status(200).send("ok");
			});
		})
	})
});

router.post('/login', function (req, res) {
	jsonfile.readFile(users, function (err, obj) {
		jsonfile.writeFile(users, obj, function (err) {
			if (err) {
				console.log(err);
				return res.status(500).send("Server error");
			}
			return res.status(200).send("ok");
		});
		jsonfile.readFile(userLogin, function (err, obj) {
			let obj2 = {};
			obj2[req.body.username] = {
				username: req.body.username,
				password: req.body.password,
				token: token(),
				date: new Date().getTime()

			};

			jsonfile.writeFile(userLogin, obj2, function (err) {
				if (req.body.username === obj[req.body.username].username && req.body.password === obj[req.body.username].password) {
					expiredDate();
				} else {
					return res.status(400).send("bad reques1t");
				}
				if (err) {
					console.log(err);
					return res.status(500).send("Server error");
				}
				return res.status(200).send("ok");
			});
		})
	})
})
router.delete('/logout/:username', function (req, res) {
	jsonfile.readFile(userLogin, function (err, obj2) {
		if (err) {
			return res.status(500).send("EXTERNAL SERVER ERROR");
		}
		const username = req.params.username;
		if (!obj2[username]) {
			return res.status(400).send("BAD RAQUEST");
		}
		delete obj2[username];
		jsonfile.writeFile(userLogin, obj2, function (err, obj2) {
			if (err) {
				return res.status(500).send("EXTERNAL SERVER ERROR");
			}
			res.status(204).send("NO CONTENT");
		})
	})
})

function expiredDate() {
	let diffDate = new Date().getTime() - obj2[req.body.username].date
	if (diffDate > 72000) {
		obj2[req.body.username].token = token(32);
		return res.status(200).send("token is ubdated");
	}
	return res.status(200).send("Username ka");
}


function token(length) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTYVWXYZabcdefghijklmnopqrstyvwxyz0123456789';
	let len = characters.length;
	for (let i = 0; i < len; i++) {
		result += characters.charAt(Math.floor(Math.random() * len - 30));
	}
	return result;
}

module.exports = router;
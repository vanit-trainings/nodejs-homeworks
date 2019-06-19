const express = require('express');

const router = express.Router();
const jsonfile = require('jsonfile');

const combine = './data/combinedPrint.json';
const hardcover = './data/hardcoverFiction.json';
const serverError = 500;
const OK = 200;
const five = 5;

router.get('/', (req, res) => {
    const lists = {
        combine: [],
        hardcover: []
    };

    jsonfile.readFile(combine, (err1, data) => {
        if (err1) {
            return res.status(serverError).send('Server error1!');
        }
        for (let i = 0; i < five; i++) {
            lists.combine.push(data[ Object.keys(data)[ i ] ]);
        }
        jsonfile.readFile(hardcover, (err2, data2) => {
            if (err2) {
                return res.status(serverError).send('Server error!');
            }
            for (let i = 0; i < five; i++) {
                lists.hardcover.push(data2[ Object.keys(data2)[ i ] ]);
            }
            return res.status(OK).send(lists);
        });
    });
});

router.get('/combined-print-and-e-book-fiction', (req, res) => {
    jsonfile.readFile(combine, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });
});
router.delete('/combined-print-and-e-book-fiction/delete-book',(req, res) => {
    jsonfile.readFile(combine, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        let title = req.body.title;
        //delete crime.title
        
        //jsonfile.writeFile(crime, delete crime.title)
        function deleteFunc(title) {
            delete data[title];
            return data;
        }
        jsonfile.writeFile(combine, deleteFunc(title), { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('OK');
        });
    });
});
router.get('/hardcover-fiction', (req, res) => {
    jsonfile.readFile(hardcover, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        return res.status(OK).send(data);
    });
});
router.delete('/hardcover-fiction/delete-book',(req, res) => {
    jsonfile.readFile(hardcover, (err, data) => {
        if (err) {
            return res.status(serverError).send('Server error!');
        }
        let title = req.body.title;
        //delete crime.title
        
        //jsonfile.writeFile(crime, delete crime.title)
        function deleteFunc(title) {
            delete data[title];
            return data;
        }
        jsonfile.writeFile(hardcover, deleteFunc(title), { spaces: 4, EOL: '\r\n' }, (err) => {
            if (err) {
                return res.status(serverError).send('Server error');
            }
            return res.status(OK).send('OK');
        });
    });
});


module.exports = router;

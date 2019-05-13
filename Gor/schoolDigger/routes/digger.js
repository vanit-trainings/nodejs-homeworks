const express = require('express');
const jsonfile = require('jsonfile');
const router = express.Router();

const districtPath = './data/districts.json';
const schoolPath = './data/schools.json';

router.get('/v1/districts', function(req, res) {
    jsonfile.readFile(districtPath, (DistrictErr, district) => {
        if (DistrictErr) {
            return res.status(500).send('SERVER ERROR');
        }
        let districtList = [];
        const query = require('url').parse(req.url,true).query;
        if (!query.st) {
            return res.status(400).send('BAD REQUEST');
        }
        for (item in district) {
            districtList.push(district[item]);
        }
        districtList = districtList.filter(dist => dist.address.state === query.st);
        if (query.city) {
            if (districtList.length) {
                districtList = districtList.filter(dist => dist.address.city === query.city);
            }
        }
        if (query.zip) {
            if (districtList.length) {
                districtList = districtList.filter(dist => dist.address.zip === query.zip);
            }
        }
        return res.status(200).send({'districtList': districtList, 'numberOfDistricts': districtList.length, 'numberOfPages': Math.ceil(districtList.length/5)});
    })
});

router.get('/v1/districts/:id', function(req, res) {
    jsonfile.readFile(districtPath, (DistrictErr, district) => {
        if (DistrictErr) {
            return res.status(500).send('SERVER ERROR');
        }
        const districtID = req.params.id;
        const regex = /^[0-9]{7}$/;
        if (!regex.test(districtID)) {
            return res.status(400).send('BAD REQUEST');
        }
        if (!district[districtID]) {
            return res.status(404).send('NOT FOUND');
        }
        return res.status(200).send(district[districtID]);
    })
});

router.get('/v1/schools', function(req, res) {
    jsonfile.readFile(schoolPath, (schoolErr, school) => {
        if (schoolErr) {
            return res.status(500).send('SERVER ERROR');
        }
        const schoolList = [];
        for (item in school) {
            schoolList.push(school[item]);
        }
        schoolList = schoolList.filter(sch => sch.address.state === query.st);
        if (query.districtID) {
            if (schoolList.length) {
                schoolList = schoolList.filter(sch => sch.district.city === query.districtID);
            }
        }
        if (query.zip) {
            if (schoolList.length) {
                schoolList = schoolList.filter(sch => sch.address.zip === query.zip);
            }
        }
        if (query.city) {
            if (schoolList.length) {
                schoolList = schoolList.filter(sch => sch.address.city === query.city);
            }
        }
        return res.status(200).send({'schoolList': schoolList, 'numberOfSchools': schoolList.length, 'numberOfPages': Math.ceil(schoolList.length/5)});
    })
});

router.get('/v1/schools/:id', function(req, res) {
    jsonfile.readFile(schoolPath, (schoolErr, school) => {
        if (schoolErr) {
            return res.status(500).send('SERVER ERROR');
        }
        const schoolID = req.params.id;
        const regex = /^[0-9]{12}$/;
        if (!regex.test(schoolID)) {
            return res.status(400).send('BAD REQUEST');
        }
        if (!school[schoolID]) {
            return res.status(404).send('NOT FOUND');
        }
        return res.status(200).send(school[schoolID]);
    })
});

module.exports = router;
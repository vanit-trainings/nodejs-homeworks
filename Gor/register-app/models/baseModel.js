const jsonfile = require('jsonfile');

/*GET ALL DATA*/
const getItems = (filePath) => {
    return jsonfile.readFile(filePath);
}

console.log(getItems('./data/user.json').then(data => console.log(data)).catch(err => console.log(data)));

/*GET DATA BY ID*/
const getItem = (filePath, id) => {
    return jsonfile.readFile(filePath).
        then(obj => obj[id]).
        catch(err => err)    
}

console.log(getItem('./data/user.json', 'Aas567').then(data => console.log('SINGLE ITEM::', data)).catch(err => console.log(data)));

/*GET DATA BY ID*/
const addItem = (filePath, id) => {
    return jsonfile.readFile(filePath).
    then(data => {
        data[id] = '123';
        return jsonfile.writeFile(filePath, data)
    })
}

addItem('./data/user.json', 'Aas56').
then(data => 
     console.log(getItems('./data/user.json').
                 then(data => console.log(data)).
                 catch(err => console.log(data))));

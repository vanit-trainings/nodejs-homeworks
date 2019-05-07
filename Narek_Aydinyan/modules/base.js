const jsonfile = require('jsonfile');

class baseObj{
    readAll(filePath) {
        return jsonfile.readFile(filePath)
    }
    
    addItem(filePath, key, value) {
        this.readAll(filePath).
        then((data) => {
        data[key] = value;
            return jsonfile.writeFile(filePath, data, { spaces: 2, EOL: '\r\n' })
        }).
        catch((err) => {
            return ;
        });
    }

    deleteItem(filePath, key) {
        jsonfile.readFile(filePath).
        then((data) => {
            delete(data[key]);
            jsonfile.writeFile(filePath, x, { spaces: 2, EOL: '\r\n' });
        });
    }

    readItem(filePath, key) {
        return jsonfile.readFile(filePath).
        then((data) => {
            if (data && data[key] !== undefined) {
                return data[key];
            }
            else {
                return null;
            }
        });
    }
}

module.exports = baseObj;
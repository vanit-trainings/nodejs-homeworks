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
        this.readAll(filePath).
        then((data) => {
            if (data[key]) {
                delete(data[key]);
                return jsonfile.writeFile(filePath, data, { spaces: 2, EOL: '\r\n' })
            }
        }).
        catch((err) => {
            return ;
        });
    }

    readItem(filePath, key) {
        this.readAll(filePath).
        then((data) => {
            if (data[key]) {
                return data[key];
            }
            else {
                return null;
            }
        }).
        catch((err) => {
            return ;
        });
    }
}

module.exports = baseObj;
const readAll = function('/'){
	jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) {
            return undefined;
        }

}

const readItem = function('/', id){
	jsonfile.readFile(filepath, (err1, obj) => {
        if (err1) {
            return undefined;
        }
	if(!obj.id){
		return null;
	}
}

const addItem = function('/'){
	jsonfile.writeFile(users, obj, { spaces: 4, EOL: '\r\n' }, (err) => {
                if (err) {
                    return undefined;
                }
            });


}

const newBookSchema = (book) => {
	return new Promise((resolve,reject) => {
        let count = 0;
        if (!(book.isbn && book.title && book.author && book.website)) {
            reject({
                status : 400,
                send : 'bad request'
            })
        }
        for(let key in book){
            if (typeof(book[ key ]) !== bookSchema[ key ]) {
                reject({
                    status : 400,
                    send : 'bad request'
                })
            }
            else{
                count++;
            }
        }
        if (count < 4) {
            reject({
                    status : 400,
                    send : 'bad request'
                })
        }
        resolve(book);
	})
}

const changeBookSchema = (changingBook) => {
    return new Promise((resolve,reject) => {
        for(let key in changingBook){
            if (typeof(changingBook[ key ]) !== bookSchema[ key ]) {
                reject({
                    status : 400,
                    send : 'bad request'
                })
            }
        }
        resolve();
    })
}

const bookSchema = {
    "isbn": "string",
    "title": "string",
    "subtitle": "string",
    "author": "string",
    "published": "string", 
    "publisher": "string",
    "pages": "number", 
    "description": "string",
    "website": "string" 
};




module.exports.newBookSchema = newBookSchema;
module.exports.changeBookSchema = changeBookSchema;
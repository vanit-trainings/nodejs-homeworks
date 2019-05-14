class Schema  {
	validator(type = String, required = false, lengthMin = 0, lengthMax = 0, test = /^.*$/{
		return {
			type : String,
			required : required,
			length : {
				min : lengthMin,
				max : lengthMax
			},
			test : test
		}
	}
	getLists(){
		return {
			getLists: {
				list : validator(String, true, 1, 30),
				weeksOnList : validator(String, false, 1, 30),
				bestSellersDate : datevalidator(String, false, 0, 10, /^[0-9]{4}[-](0[1-9]|1[0-2])[-](0[1-9]||1[0-9]||2[0-9]||3[0-1]){2}$/),
				date : validator(String, false, 0, 10, /^[0-9]{4}[-](0[1-9]|1[0-2])[-](0[1-9]||1[0-9]||2[0-9]||3[0-1]){2}$/),
				isbn : validator(String, false, 10, 10, /^[0-9]({10}|{13})$/),	
				publishedDate : datevalidator(String, false, 0, 10, /^[0-9]{4}[-](0[1-9]|1[0-2])[-](0[1-9]||1[0-9]||2[0-9]||3[0-1]){2}$/),
				rank : validator(Integer, false, 0, 1, /^[0-9]$/),
				rankLastWeek : validator(Integer, false, 0, 1, /^[0-9]$/),
				offset : validator(Integer, false, 0, 1, /^[0-9]$/),
				sortOrder : validator(String, false, 3, 4, /^ASC|DESC$/),
			}
		};
	}
}
module.exports = new Schema();
ASC
DESC
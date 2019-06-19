const film_schema = {
    "title" : "string",
    "Critics Consensus" : "string",
    "TOMATOMETER" : "string",
    "AUDIENCE SCORE" : "string",
    "videos" : "object",
    "photos" : "object",
    "movie_info" : "object",
    "critic_rewiews" : "object",
    "cast" : "object",
    "audience_reviws" : "object"
};

const schema_for_top_movie = {
    "rank" : "number",
    "name" : "string",
    "year" : "number",
    "num_of_reviews" : "number",
    "tomatometer" : "number"
};

const schema_for_top_tv = {
    "name" : "string",
    "seeason" : "number",
    "tomatometer" : "number",
    "Critic Consensus" : "string"
};

module.exports.film_schema = film_schema;
module.exports.schema_for_top_tv = schema_for_top_tv;
module.exports.schema_for_top_movie = schema_for_top_movie;

// module.exports.addItem = addItem;
// module.exports.readItem = readItem;
// module.exports.deleteItem = deleteItem;
// module.exports.updateItem = updateItem;

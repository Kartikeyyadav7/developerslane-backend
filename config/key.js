module.exports = {
	mongoURI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@developerslane-p3o4t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
	secret: process.env.SECRET,
};

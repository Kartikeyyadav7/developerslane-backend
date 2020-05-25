const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Creating schema
const ProfileSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},
	handle: {
		type: String,
		required: true,
	},
	company: {
		type: String,
	},
	website: {
		type: String,
	},
	location: {
		type: String,
	},
	bio: {
		type: String,
	},
	status: {
		type: String,
		required: true,
	},
	skills: {
		type: [String],
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	social: {
		youtube: {
			type: String,
		},
		twitter: {
			type: String,
		},
		instagram: {
			type: String,
		},
		facebook: {
			type: String,
		},
		linkedin: {
			type: String,
		},
	},
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);

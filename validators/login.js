const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function ValidateLogin(data) {
	let errors = {};

	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";

	if (Validator.isEmpty(data.email)) {
		errors.email = "Email should not be empty";
	}
	if (!Validator.isEmail(data.email)) {
		errors.email = "Email should be valid";
	}
	if (Validator.isEmpty(data.password)) {
		errors.password = "Password should not be empty";
	}
	if (!Validator.isLength(data.password, { min: 5, max: 30 })) {
		errors.password = "Password should be atleast 6 characters";
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};

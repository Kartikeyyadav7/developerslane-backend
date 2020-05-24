const Validator = require("validator");
const isEmpty = require("./is-empty");
module.exports = function ValidateRegister(data) {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : "";
	data.email = !isEmpty(data.email) ? data.email : "";
	data.password = !isEmpty(data.password) ? data.password : "";
	data.password2 = !isEmpty(data.password2) ? data.password2 : "";

	if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
		errors.name = "Name should be in between 2 to 30 characters";
	}

	if (Validator.isEmpty(data.name)) {
		errors.name = "Name should not be empty";
	}
	if (Validator.isEmpty(data.email)) {
		errors.email = "Email should not be empty";
	}
	if (!Validator.isEmail(data.email)) {
		errors.email = "Email should be valid";
	}
	if (Validator.isEmpty(data.password)) {
		errors.password = "Password should not be empty";
	}
	if (Validator.isEmpty(data.password2)) {
		errors.password2 = "Confirm Password should not be empty";
	}
	if (!Validator.isLength(data.password, { min: 5, max: 30 })) {
		errors.password = "Password should be atleast 6 characters";
	}
	if (!Validator.equals(data.password, data.password2)) {
		errors.password2 = "Must be same ";
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};

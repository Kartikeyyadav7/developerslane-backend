const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function ValidateProfile(data) {
	let errors = {};

	data.handle = !isEmpty(data.handle) ? data.handle : "";
	data.status = !isEmpty(data.status) ? data.status : "";
	data.skills = !isEmpty(data.skills) ? data.skills : "";

	if (!Validator.isLength(data.handle, { min: 2, max: 30 })) {
		errors.handle = "Handle should be atleast 2 to 30 letters";
	}
	if (Validator.isEmpty(data.status)) {
		errors.status = "Status should not be empty";
	}
	if (Validator.isEmpty(data.skills)) {
		errors.skills = "Skills should not be empty";
	}
	if (Validator.isEmpty(data.handle)) {
		errors.handle = "Handle should not be empty";
	}

	if (!isEmpty(data.website)) {
		if (Validator.isURL(data.website)) {
			errors.website = "Input a valid URL";
		}
	}
	if (!isEmpty(data.website)) {
		if (Validator.isURL(data.website)) {
			errors.website = "Input a valid URL";
		}
	}
	if (!isEmpty(data.youtube)) {
		if (Validator.isURL(data.youtube)) {
			errors.youtube = "Input a valid URL";
		}
	}
	if (!isEmpty(data.twitter)) {
		if (Validator.isURL(data.twitter)) {
			errors.twitter = "Input a valid URL";
		}
	}
	if (!isEmpty(data.instagram)) {
		if (Validator.isURL(data.instagram)) {
			errors.instagram = "Input a valid URL";
		}
	}
	if (!isEmpty(data.linkedin)) {
		if (Validator.isURL(data.linkedin)) {
			errors.linkedin = "Input a valid URL";
		}
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};

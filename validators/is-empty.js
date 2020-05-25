const isEmpty = (value) =>
	value === null ||
	value === undefined ||
	(typeof value === "object" && Object.keys.length === 0) ||
	(typeof value === "string" && value.trim().length === 0);

module.exports = isEmpty;

const isEmpty = (data) => {
	return (
		data === null ||
		data === undefined ||
		(typeof data === "object" && Object.keys.length === 0) ||
		(typeof data === "string" && data.trim().length === 0)
	);
};
module.exports = isEmpty;

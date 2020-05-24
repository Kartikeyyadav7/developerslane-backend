const express = require("express");
const router = express.Router();

// @route  GET api/user/test
// @desc   This is test route
// @access Public

router.get("/test", (req, res) => {
	res.json({ msg: "tested" });
});

module.exports = router;

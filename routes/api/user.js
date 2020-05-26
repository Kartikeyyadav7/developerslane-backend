const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/key");
const passport = require("passport");
const User = require("../../models/User");
// @route  GET api/user/test
// @desc   This is test route
// @access Public

router.get("/test", (req, res) => {
	res.json({ msg: "tested" });
});

// @route  POST api/user/register
// @desc   REgistration route
// @access Public

router.post("/register", (req, res) => {
	const avatar = gravatar.url(req.body.email, {
		s: "200",
		r: "pg",
		d: "mm",
	});
	User.findOne({ email: req.body.email }).then((user) => {
		if (user) {
			res.status(400).json({ email: "Email already exists" });
		} else {
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				avatar,
			});

			bycrypt.genSalt(10, (err, salt) => {
				if (err) throw err;
				bycrypt.hash(newUser.password, salt, (err, hash) => {
					if (err) throw err;
					newUser.password = hash;
					newUser
						.save()
						.then((user) => {
							return res.json({ user });
						})
						.catch((err) => console.log(err));
				});
			});
		}
	});
});

// @route  POST api/user/login
// @desc   Login user
// @access Public

router.post("/login", (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email }).then((user) => {
		// Checking from user
		if (!user) {
			return res.status(404).json({ email: "User not found" });
		}

		// Checking for password
		bycrypt.compare(password, user.password).then((isMatch) => {
			if (isMatch) {
				// user info to be passed along with the token i.e payload
				const payload = {
					name: user.name,
					id: user.id,
					email: user.email,
					avatar: user.avatar,
				};

				// JWT token
				jwt.sign(payload, key.secret, { expiresIn: 3600 }, (err, token) => {
					if (err) {
						return res.status(400).json({ err: "errror occured" });
					}
					res.json({
						success: true,
						token: "Bearer " + token,
					});
				});
			} else {
				errors.password = "Incorrect Password";
				res.status(400).json(errors);
			}
		});
	});
});

// @route  GET api/user/current
// @desc   Getting user
// @access Private

router.get(
	"/current",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		res.json(req.user);
	}
);

module.exports = router;

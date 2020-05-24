const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/key");
const passport = require("passport");
// User module
const User = require("../../models/User");
const ValidateRegister = require("../../validators/register");
const ValidateLogin = require("../../validators/login");

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
	const { errors, isValid } = ValidateRegister(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	const avatar = gravatar.url(req.body.email, {
		s: "200",
		r: "pg",
		d: "mm",
	});
	User.findOne({ email: req.body.email }).then((user) => {
		if (user) {
			errors.email = "Email already exists";
			res.status(400).json(errors);
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
							res.json({ user });
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
	const { errors, isValid } = ValidateLogin(req.body);

	if (!isValid) {
		return res.status(400).json(errors);
	}
	const { email, password } = req.body;
	User.findOne({ email }).then((user) => {
		// Checking from user
		if (!user) {
			errors.email("User not found");
			return res.status(404).json(errors);
		}

		// Checking for password
		bycrypt.compare(password, user.password).then((isMatch) => {
			if (isMatch) {
				// user info to be passed along with the token i.e payload
				const payload = {
					name: user.name,
					id: user._id,
					email: user.email,
					avatar: user.avatar,
				};

				// JWT token
				jwt.sign(payload, key.secret, { expiresIn: 3600 }, (err, token) => {
					if (err) throw err;
					res.json({
						success: true,
						token: "Bearer " + token,
					});
				});
			} else {
				errors.password = "Incorrect Password";
				return res.status(400).json(errors);
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

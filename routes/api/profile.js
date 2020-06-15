const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route  GET api/profile/test
// @desc   This is test route
// @access Public

router.get("/test", (req, res) => {
	res.json({ msg: "tested" });
});

// @route  GET api/profile/handle/:handle
// @desc   Get user profile
// @access Public

router.get("/handle/:handle", (req, res) => {
	Profile.findOne({ handle: req.params.handle })
		.populate("user", ["name", "avatar"])
		.then((profile) => {
			if (!profile) {
				res.status(400).json({ error: "No profile exists" });
			}
			res.json(profile);
		})
		.catch((err) => res.json(err));
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) return res.status(400).json({ msg: "Profile not found" });

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == "ObjectId") {
			return res.status(400).json({ msg: "Profile not found" });
		}
		res.status(500).send("Server Error");
	}
});
// @route  GET api/profile/all
// @desc   Get all profiles
// @access Public

router.get("/all", (req, res) => {
	Profile.find()
		.populate("user", ["name", "avatar"])
		.then((profile) => {
			if (!profile) {
				res.status(400).json({ error: "No profile exists" });
			}
			res.json(profile);
		})
		.catch((err) => res.json(err));
});

// @route  GET api/profile/
// @desc   To get profile
// @access Private

router.get(
	"/",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Profile.findOne({ user: req.user.id })
			.then((profile) => {
				if (!profile) {
					return res.status(404).json({ msg: "No profile found" });
				} else {
					res.json(profile);
				}
			})
			.catch((err) => res.status(400).json(err));
	}
);

// @route  POST api/profile/
// @desc   Create and update profile
// @access Private

router.post(
	"/",
	[
		check("handle", "Handle is required").not().isEmpty(),
		check("status", "Status is required").not().isEmpty(),
		check("skills", "Skills is required").not().isEmpty(),
	],
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array()[0].msg });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			handle,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (handle) profileFields.handle = handle;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (skills) {
			profileFields.skills = skills.split(",").map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true }
			);
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	}
);

// @route  DELETE api/profile/
// @desc   delete account
// @access Private

router.delete(
	"/",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Profile.findOneAndRemove({ user: req.user.id })
			.then(() =>
				User.findOneAndRemove({ _id: req.user.id }).then(() =>
					res.json({ msg: "user deleted" })
				)
			)

			.catch((err) => res.status(500).json({ msg: "not able to delete user" }));
		// remove the profile
		// remove the user
	}
);

module.exports = router;

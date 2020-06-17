const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const multer = require("multer");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

// defining how files to be stored
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/");
	},
	filename: (req, file, cb) => {
		const now = new Date().toISOString();
		const date = now.replace(/:/g, "-");
		cb(null, date + file.originalname);
	},
});

// TO accept a certain format of file type
const fileFormat = (req, file, cb) => {
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(new Error("Input proper file format"), false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 3,
	},
	fileFilter: fileFormat,
});

// @route  GET api/post/test
// @desc   This is test route
// @access Public

router.get("/test", (req, res) => {
	res.json({ msg: "tested" });
});

// @route  POST api/post/
// @desc   Posting the posts
// @access Private

router.post(
	"/",
	passport.authenticate("jwt", { session: false }),
	upload.single("postImage"),
	async (req, res) => {
		const result = await cloudinary.uploader.upload(req.file.path);

		const newPost = new Post({
			text: req.body.text,
			name: req.body.name,
			avatar: req.body.avatar,
			user: req.user.id,
			postImage: result.secure_url,
		});

		const postDetails = await newPost.save();
		res.json(postDetails);
	}
);

// @route  GET api/post/
// @desc   Getting posts
// @access Public

router.get("/", (req, res) => {
	Post.find()
		.sort({ date: -1 })
		.then((posts) => res.json(posts))
		.catch((err) => res.status(404).json({ NoPostFound: "No post found" }));
});

// @route  GET api/post/:id
// @desc   Getting posts by id
// @access Public

router.get("/:id", (req, res) => {
	Post.findById(req.params.id)
		.then((post) => res.json(post))
		.catch((err) => res.status(404).json({ NoPostFound: " no post found" }));
});

// @route  DELETE api/post/:id
// @desc   deleting posts by id
// @access Private

router.delete(
	"/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Profile.findOne({ user: req.user.id }).then((profile) =>
			Post.findById(req.params.id)
				.then((post) => {
					// Check the post owner
					if (post.user.toString() !== req.user.id) {
						return res.status(401).json({ err: "Unauthorized" });
					}
					// delete
					post.remove().then(() => res.json({ success: true }));
				})
				.catch((err) =>
					res.status(404).json({ nopostfound: " post not found" })
				)
		);
	}
);

// @route  POST api/post/like/:id
// @desc   like a posts
// @access Private

router.put(
	"/like/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Profile.findOne({ user: req.user.id }).then((profile) => {
			Post.findById(req.params.id)
				.then((post) => {
					if (
						post.likes.filter((like) => like.user.toString() === req.user.id)
							.length > 0
					) {
						return res
							.status(400)
							.json({ alreadyLiked: "you have already liked the post" });
					}

					// add user like to likes array
					post.likes.unshift({ user: req.user.id });

					post.save().then((post) => res.json(post));
				})
				.catch((err) => res.status(404).json(err));
		});
	}
);
// @route  POST api/post/unlike/:id
// @desc   Unlike a posts
// @access Private

router.post(
	"/unlike/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Profile.findOne({ user: req.user.id }).then((profile) => {
			Post.findById(req.params.id)
				.then((post) => {
					if (
						post.likes.filter((like) => like.user.toString() === req.user.id)
							.length === 0
					) {
						return res.status(400).json({
							msg: "post is not liked to be unliked you hate him this much",
						});
					}

					// unlike the post
					// removing the user
					const removeIndex = post.likes
						.map((item) => item.user.toString())
						.indexOf(req.user.id);

					// splice the user out of array
					post.likes.splice(removeIndex, 1);

					// save the user
					post.save().then((post) => res.json(post));
				})
				.catch((err) => res.status(404).json(err));
		});
	}
);

// @route  PUT api/post/comment/:id
// @desc   comment on a posts
// @access Private

router.put(
	"/comment/:id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Post.findById(req.params.id)
			.then((post) => {
				const newComment = {
					text: req.body.text,
					name: req.body.name,
					avatar: req.body.avatar,
					user: req.user.id,
				};

				post.comments.unshift(newComment);

				//save the user

				post.save().then((post) => res.json(post));
			})
			.catch((err) => res.status(404).json(err));
	}
);

// @route  DELETE api/post/comment/:id
// @desc   delete comment on a posts
// @access Private

router.delete(
	"/comment/:id/:comment_id",
	passport.authenticate("jwt", { session: false }),
	(req, res) => {
		Post.findById(req.params.id)
			.then((post) => {
				if (
					post.comments.filter(
						(comment) => comment._id.toString() === req.params.comment_id
					).length === 0
				) {
					res
						.status(400)
						.json({ msg: "Sorry u haven't commented to delete it" });
				}

				const removeIndex = post.comments
					.map((comment) => comment._id.toString())
					.indexOf(req.params.comment_id);

				post.comments.splice(removeIndex, 1);

				post.save().then((post) => res.json(post));
			})
			.catch((err) => res.status(404).json(err));
	}
);

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const passport = require("passport");
const cors = require("cors");
//Import routes
const user = require("./routes/api/user");
const profile = require("./routes/api/profile");
const post = require("./routes/api/post");

// DB confilg
const db = require("./config/key").mongoURI;
// Db connection
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => console.log("Db connected"))
	.catch((err) => console.log(err));

app.get("/", (req, res) => {
	res.send("Hello there");
});

// middleware
app.use(passport.initialize());
// passport config
require("./config/passport")(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
// Routes
app.use("/api/user", user);
app.use("/api/profile", profile);
app.use("/api/post", post);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

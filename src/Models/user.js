const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },

  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },
  questions: [
    {
      subject: String,
      questions: Array,
      sharedWithCommunity: Boolean,
    },
  ],

  token: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(uniqueValidator);

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      "ilovesoccerandbasketball",
      { expiresIn: "1h" }
    );
    this.token = token;
    await this.save();
    return this.token;
  } catch (e) {
    console.log(e);
  }
};

userSchema.methods.addQuestions = async function (questions) {
  try {
    this.questions.push(...questions);
    await this.save();
    return this.questions;
  } catch (e) {
    console.log(e);
  }
};

userSchema.methods.editQuestions = async function (questions, subjectId) {
  try {
    const oldIndex = this.questions.findIndex(
      (question) => question._id.toString() === subjectId
    );
    if (!questions) {
      this.questions.splice(oldIndex, 1);
    } else {
      this.questions.splice(oldIndex, 1, questions);
    }

    await this.save();
    return this.questions;
  } catch (e) {
    console.log(e);
  }
};

userSchema.statics.findByCredentials = async (userName, password) => {
  try {
    const user = await User.findOne({ userName });

    if (!user) {
      return { error: "Wrong Credentials" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Wrong Credentials" };
    }
    return user;
  } catch (e) {
    return e;
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;

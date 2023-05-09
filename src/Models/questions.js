const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },

  questions: {
    type: Array,
    required: true,
    validate(value) {
      if (value.length === 0) {
        throw new Error("nothing here");
      }
    },
  },

  valid: {
    type: Boolean,
    default: false,
  },
});

const Questions = mongoose.model("Questions", questionsSchema);

module.exports = Questions;

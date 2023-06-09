const express = require("express");
const router = new express.Router();
const User = require("../Models/user");

router.post("/users", async (req, res) => {
  const user = new User({
    ...req.body,
    questions: req.body.questions.map((question) => ({
      subject: question.subject,
      questions: question.questions,
      communityId: question.communityId,
    })),
    communityQuestions: req.body.communityQuestions.map((question) => ({
      subject: question.subject,
      questions: question.questions,
    })),
  });
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({
      id: user._id,
      token,
      questions: user.questions,
      communityQuestions: user.communityQuestions,
    });
  } catch (error) {
    const { password, userName, questions } = error.errors;
    res.status(400).send({
      passwordError: password,
      userNameError: userName,
      questionsError: questions,
    });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.userName,
      req.body.password
    );
    if (user.error) return res.status(401).send(user);
    const questions = await user.addQuestions(req.body);
    const token = await user.generateAuthToken();
    res.send({
      questions,
      token,
      id: user._id,
      isAdmin: user.isAdmin,
      communityQuestions: user.communityQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

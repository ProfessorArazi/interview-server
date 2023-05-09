const express = require("express");
const router = new express.Router();
const User = require("../Models/user");

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({
      id: user._id,
      token,
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
    const questions = await user.addQuestions(req.body.questions);
    const token = await user.generateAuthToken();
    res.send({
      questions,
      token,
      id: user._id,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/addQuestions", async (req, res) => {
  try {
    const { token, id, questions } = req.body;
    const user = await User.findById(id);
    if (!user.token === token) {
      return res.status(401).send({ message: "unauthorized" });
    }
    const userQuestions = await user.addQuestions(questions);
    res.status(201).send({
      questions: userQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/getQuestions", async (req, res) => {
  try {
    const { token, id } = req.body;
    const user = await User.findById(id);
    if (!user.token === token) {
      return res.status(401).send({ message: "unauthorized" });
    }
    res.status(201).send({
      questions: user.questions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

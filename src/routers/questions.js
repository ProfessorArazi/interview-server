const express = require("express");
const router = new express.Router();
const User = require("../Models/user");
const Questions = require("../Models/questions");
const { getUser } = require("../../helpers");

router.post("/addQuestions", async (req, res) => {
  try {
    const { token, id, questions, community } = req.body;
    const user = await User.findById(id);
    if (!user.token === token) {
      return res.status(401).send({ message: "unauthorized" });
    }
    const userQuestions = await user.addQuestions(questions);
    res.status(201).send({
      questions: userQuestions,
    });
    if (community) {
      const question = new Questions(questions[0]);
      console.log(question);
      await question.save();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/getQuestions", async (req, res) => {
  try {
    const user = await getUser(req.body);
    res.status(201).send({
      questions: user.questions,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/community", async (req, res) => {
  try {
    const user = await getUser(req.body);
    const { valid } = req.body;
    if (!valid && user.isAdmin) {
      const invalidQuestions = await Questions.find({ valid: false });
      return res.status(200).send({
        questions: invalidQuestions,
      });
    }
    const validQuestions = await Questions.find({ valid: true });

    res.status(200).send({
      questions: validQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

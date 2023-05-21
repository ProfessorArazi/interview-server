const express = require("express");
const router = new express.Router();
const User = require("../Models/user");
const Questions = require("../Models/questions");
const { getUser } = require("../../helpers");

router.post("/addQuestions", async (req, res) => {
  try {
    const { token, id, questions, community } = req.body;
    let communityId = "";
    if (community) {
      const question = new Questions({ ...questions[0], userId: id || "" });
      communityId = question._id;
      await question.save();
    }
    if (id) {
      const user = await User.findById(id);
      if (!user.token === token) {
        return res.status(401).send({ message: "unauthorized" });
      }
      const userQuestions = await user.addQuestions([
        { ...questions[0], communityId },
      ]);
      res.status(201).send({
        question: userQuestions[userQuestions.length - 1],
      });
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
      communityQuestions: user.communityQuestions,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/editQuestions", async (req, res) => {
  try {
    const user = await getUser(req.body);
    const { questions, subjectId } = req.body;
    const { userQuestions, communityId } = await user.editQuestions(
      questions,
      subjectId
    );
    if (questions && communityId) {
      await Questions.findByIdAndUpdate(
        { _id: communityId },
        { ...questions, valid: false }
      );
    }
    res.status(201).send({
      questions: userQuestions,
      communityQuestions: user.communityQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/approveQuestions", async (req, res) => {
  try {
    const user = await getUser(req.body);
    if (user) {
      const { approved, rejected } = req.body;
      await Questions.deleteMany({ _id: { $in: rejected } });
      await Questions.updateMany(
        { _id: { $in: approved } },
        { $set: { valid: true } }
      );
      res.status(200).send({ message: "Questions updated successfully" });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/community", async (req, res) => {
  try {
    const { id, communityId } = req.body;
    const user = id ? await getUser(req.body) : {};
    const { valid } = req.body;
    if (!valid && user.isAdmin) {
      const invalidQuestions = await Questions.find({ valid: false });
      return res.status(200).send({
        questions: invalidQuestions,
      });
    }
    const validQuestions = await Questions.find({
      valid: true,
      userId: { $ne: id },
      _id: communityId,
    });
    if (user) user.communityQuestions.push(validQuestions[0]);
    await user.save();

    res.status(200).send({
      questions: validQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/community/remove", async (req, res) => {
  try {
    const user = await getUser(req.body);
    const { communityId } = req.body;
    const communityIndex = user.communityQuestions.findIndex(
      (community) => community._id === communityId
    );
    user.communityQuestions.splice(communityIndex, 1);
    await user.save();

    res.status(200).send({
      questions: user.communityQuestions,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/community/keys", async (req, res) => {
  const { id } = req.body;

  try {
    const subjects = await Questions.find({
      userId: { $ne: id },
      valid: true,
    }).select("subject");
    res.status(200).send({
      subjects,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

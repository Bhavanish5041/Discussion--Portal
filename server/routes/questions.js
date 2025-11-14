import express from 'express';
import Question from '../models/Question.js';

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question with answers
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/questions
// @desc    Create a question
// @access  Public (should be protected in production)
router.post('/', async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Please provide title, content, and category' });
    }

    const question = await Question.create({
      title,
      content,
      category,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/questions/:id/answers
// @desc    Add an answer to a question
// @access  Public (should be protected in production)
router.post('/:id/answers', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Please provide answer content' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = {
      content,
      votes: 0,
      userVote: 0,
    };

    question.answers.push(answer);
    await question.save();

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/questions/:id/vote
// @desc    Vote on a question
// @access  Public (should be protected in production)
router.patch('/:id/vote', async (req, res) => {
  try {
    const { vote } = req.body; // vote should be 1 (upvote), -1 (downvote), or 0 (remove vote)

    if (vote === undefined || (vote !== 1 && vote !== -1 && vote !== 0)) {
      return res.status(400).json({ message: 'Vote must be 1, -1, or 0' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const oldVote = question.userVote || 0;
    const voteChange = vote - oldVote;

    question.userVote = vote;
    question.votes = (question.votes || 0) + voteChange;

    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/questions/:id/answers/:answerId/vote
// @desc    Vote on an answer
// @access  Public (should be protected in production)
router.patch('/:id/answers/:answerId/vote', async (req, res) => {
  try {
    const { vote } = req.body; // vote should be 1 (upvote), -1 (downvote), or 0 (remove vote)
    const { answerId } = req.params;

    if (vote === undefined || (vote !== 1 && vote !== -1 && vote !== 0)) {
      return res.status(400).json({ message: 'Vote must be 1, -1, or 0' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = question.answers.id(answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const oldVote = answer.userVote || 0;
    const voteChange = vote - oldVote;

    answer.userVote = vote;
    answer.votes = (answer.votes || 0) + voteChange;

    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


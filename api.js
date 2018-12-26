const express = require('express');
const tasks = require('./api/tasks');

const router = express.Router();

router.use('/tasks', tasks);

module.exports = router;

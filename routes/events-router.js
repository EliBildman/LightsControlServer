const express = require('express');
const router = express.Router();

const activity = require('../scheduling/activity');


router.post('/room-active', (req, res) => {
    activity.set_active();
});

module.exports = router;
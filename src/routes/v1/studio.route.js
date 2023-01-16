const express = require('express');
const studioController = require('../../controllers/studio.controller.js');
const router = express.Router();
router
    .route('/')
    .post(studioController.postPrompt);

module.exports = router;

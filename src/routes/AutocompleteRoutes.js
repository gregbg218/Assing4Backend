const express = require('express');
const router = express.Router();
const AutocompleteController = require('../controllers/AutocompleteController');

const autocompleteController = new AutocompleteController();

router.get('/suggestions', (req, res) => 
    autocompleteController.getAutocompleteSuggestions(req, res)
);

module.exports = router;
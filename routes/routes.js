const express = require('express');
const router = express.Router();
const {saveCollage, downloadCollage} = require('../controllers/saveCollageController');

// Save Collage API 
// Parameter is files
router.post('/save-collage', saveCollage);

module.exports = router;
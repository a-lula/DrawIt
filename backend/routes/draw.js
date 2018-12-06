const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/* Models */
const Draw = require("../models/draw");


/* GET new altID */
router.get('/init', function(req, res) {
    let cDraw = new Draw({
        altID: crypto.randomBytes(20).toString('hex'),
    });
    cDraw.save((err,drawObj) => {
        if (err) return res.json({success: false});
        return res.json({success: true, altID: drawObj.altID})
    });
    
});
module.exports = router;
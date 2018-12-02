const express = require('express');
const crypto = require('crypto');
const router = express.Router();

/* Models */
const Draw = require("../models/draw");


/* PUT update */
router.put('/put', function(req, res) {
    if(!req.body.altID){return res.json({success: false, msg: "altID not provided"})}
    if(!req.body.image){return res.json({success: false, msg: "no image link provided"})}
    //also check if image link is an imgur link before preceding
    Draw.findOne({altID: req.body.altID},(err,drawObj) => {
        if (err) {return res.json({success: false, msg: "invalid altID"})}
        drawObj.image = req.body.image;
        drawObj.save((err,NA) => {
            if (err) return res.json({success: false,msg: "couldn't save to DB"});
            return res.json({success: true})
        });
    });
});
/* GET updates */
router.get('/get', function(req, res) {
    if(!req.body.altID){return res.json({success: false, msg: "altID not provided"})}
    Draw.findOne({altID: req.body.altID},(err,drawObj) => {
        if (err) {return res.json({success: false, msg: "invalid altID"})}
        return res.json({success: true, image: drawObj.image});
    });
});
/* GET new altID */
router.get('/init', function(req, res) {
    let cDraw = new Draw({
        image: "undef",
        altID: crypto.randomBytes(20).toString('hex')
    });
    cDraw.save((err,drawObj) => {
        if (err) return res.json({success: false});
        return res.json({success: true, altID: drawObj.altID})
    });
    
});
module.exports = router;
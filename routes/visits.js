import express from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    const { date, lat, long } = req.query;
    console.log(date);
    res.json({id : 1});
});

module.exports = router;

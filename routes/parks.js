import express from 'express';
import funcs from '../src/getCounters'

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.json(funcs.getParks());
});

module.exports = router;

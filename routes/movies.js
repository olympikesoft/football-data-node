var express = require('express');
var router = express.Router();


const MovieController = require("../core/MovieController.js");
const movie = new MovieController();

router.get('/get-free-videos', (req, res, next) => movie.getMoviesFreeWatch(req, res, next));
router.post('/get-paid-videos', (req, res, next) => movie.getMoviesFromPaidUsers(req, res, next));
router.get('/get-top-movies-week', (req, res, next) => movie.getTop10MoviesWeek(req, res, next));
router.get('/get-related-movies', (req, res, next) => movie.getRelatedMoviesByCreator(req, res, next));
router.get('/check-access-movie', (req, res, next) => movie.getAccessMovie(req, res, next));
module.exports = router;
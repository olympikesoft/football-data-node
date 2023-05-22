"use strict";

var firebase = require("firebase/compat/app");
require("firebase/compat/database");

const stripe = require("stripe")("sk_test_NEbjH7cEfVImWXfCVnVZc5Ar");

const firebaseConfig = {
  apiKey: "AIzaSyALE9n5g1VbyvlljRA349MnF4gYJDausaM",
  authDomain: "kidstreamplay.firebaseapp.com",
  databaseURL: "https://kidstreamplay-default-rtdb.firebaseio.com",
  projectId: "kidstreamplay",
  storageBucket: "kidstreamplay.appspot.com",
  messagingSenderId: "331334625731",
  appId: "1:331334625731:web:8295ac0128f4bd6130f576",
  measurementId: "G-VXC5XJYF5N",
};

firebase.initializeApp(firebaseConfig);

var db = firebase.database();

class MovieController {
  // return all movies paid that user have bought
  // adding filters
  // paid; free;
  // get by creators
  // get by type
  // get by language
  // get by date range
  // get by likes_count

  async getMoviesFromPaidUsers(creatorId) {
    const snapshot = await db
      .ref("/movies/")
      .orderByChild("creatorId")
      .equalTo(creatorId)
      .once("value");
    return snapshot.val();
  }

  async getMoviesFreeWatch(req, res, next) {
    const { typeVideo } = req.query;
    console.log(typeVideo);
    try {
      const snapshot = await db
        .ref("/movies/")
        .orderByChild("isFree")
        .equalTo("Free")
        .once("value");

      const data = snapshot.val();
      if (data) {
        const movies = [];
        for (let key in data) {
          const movieData = data[key];
          if(movieData.movieType === "Action"){
            movieData.id = key;
            movies.push(movieData);
          }
        }
        res.json(movies);
      }
    } catch (error) {
      console.error("Error creating Stripe account: ", error);
      res.status(500).json({ error: "Failed to get movies free" });
    }
  }

  async getTop10MoviesWeek(req, res, next) {
    try {
      const snapshot = await db
      .ref("/movies/") 
      .orderByChild("views_count")
      .limitToLast(10)
      .once("value");
      const data = snapshot.val();
      if (data) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let movies = [];
        for (let movie in data) {
            const movieDate = new Date(data[movie].dateCreated);
            if (movieDate > oneWeekAgo) {
                movies.push(data[movie]);
            }
        }
        movies = movies.slice(0, 10);
        res.json(movies);
      }else{
        res.json({ message: 'No top 10 movies found'})
      }
    } catch (error) {
      console.error("Error creating Stripe account: ", error);
      res.status(500).json({ error: "Failed to get movies free" });
    }
  }

  async getMoviesUser(req, res, next) {
    const { user } = req.body;
    try {
      const snapshot = await db
        .ref("/followers/")
        .orderByChild("userUuid")
        .equalTo(user)
        .once("value");

      const data = snapshot.val();
      if (data) {
        const movies = [];
        for (let key in data) {
          const movieData = await this.getMoviesFromPaidUsers(
            data[key].followerMaster
          );
          movies.push(movieData);
        }
        res.json(movieData);
      }
    } catch (error) {
      console.error("Error creating Stripe account: ", error);
      res.status(500).json({ error: "Failed to create Stripe account" });
    }
  }
}
module.exports = MovieController;

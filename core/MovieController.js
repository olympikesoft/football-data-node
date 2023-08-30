"use strict";

var firebase = require("firebase/compat/app");
require("firebase/compat/database");

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
    let finalType = typeVideo.replace("?", "");
    try {
      const snapshot = await db
        .ref("/movies/")
        .orderByChild("isFree")
        .equalTo("Free")
        .once("value");

      const data = snapshot.val();
      if (data) {
        let movies = [];
        for (let key in data) {
          const movieData = data[key];
          if (movieData.movieType === finalType) {
            movieData.id = key;
            movies.push(movieData);
          }
        }
        res.json(movies);
      }
    } catch (error) {
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
            movies.push({ id: movie, ...data[movie] });
          }
        }
        movies = movies.slice(0, 10);
        res.json(movies);
      } else {
        res.json({ message: "No top 10 movies found" });
      }
    } catch (error) {
      console.error("Error creating Stripe account: ", error);
      res.status(500).json({ error: "Failed to get movies free" });
    }
  }

  async getRelatedMoviesByCreator(req, res, next) {
    const { movieUuid } = req.query;

    let finalMovieId = movieUuid.replace("?", "");

    try {
      const query = await db.ref("/movies/" + finalMovieId).once("value");
      const movieData = query.val();

      console.log(movieData);

      const snapshot = await db
        .ref("/movies/")
        .orderByChild("creatorId")
        .equalTo(movieData.creatorId)
        .once("value");

      const data = snapshot.val();
      if (data) {
        const movies = [];
        for (let key in data) {
          if (key !== finalMovieId) {
            movies.push({ id: key, ...data[key] });
          }
        }
        res.json(movies);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to getRelatedMoviesByCreator" });
    }
  }

  async getAccessMovie(req, res, next) {
    const { userUuid, movieUuid } = req.query;
    try {
      // get the creator of Movie
      const movie = await db
        .ref("/movies/")
        .orderByChild("creatorId")
        .equalTo(movieUuid)
        .once("value");

      const data = movie.val();
      if (data) {
        if (data.isFree === "Free") {
          return res.json({ access: true });
        }

        const movieCreatorId = data.creatorId;
        const userSubscription = await db
          .ref("/subscriptions")
          .orderByChild("userUuid")
          .equalTo(userUuid)
          .once("value");

        let isSubscribedToMovieCreator = false;
        userSubscription.forEach((subscription) => {
          if (
            subscription.val().subscriptionPlanCreatorUuid === movieCreatorId
          ) {
            isSubscribedToMovieCreator = true;
          }
        });

        if (isSubscribedToMovieCreator) {
          return res.json({ access: true });
        } else {
          return res.json({ access: false });
        }
      } else {
        return res.json({ access: false });
      }
    } catch (error) {
      console.log(error);
      return res.json({ access: false });
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
          movies.push({ id: key, ...movieData });
        }
        res.json(movieData);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to getMoviesUser" });
    }
  }
}
module.exports = MovieController;

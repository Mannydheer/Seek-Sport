"use strict";
//env vairablkes
require("dotenv").config();

//allows to fetch to an API from backend with fetch method API.
const fetch = require("isomorphic-fetch");
//@endpoint POST /nearbySearch
//@desc authenticate user token and send back user info
//@access PRIVATE - will need to validate token?
const { BadRequestError } = require("../utils/errors");

// -------------------API NEARBY SEARCH----------------------
const handleNearbySearch = async (req, res, next) => {
  try {
    let coordinates = req.body;
    let latitude = coordinates.lat;
    let longitude = coordinates.lng;
    let radMetter = 2 * 1000; // Search withing 2 KM radius
    if (!coordinates.lat || !coordinates.lng) {
      throw new BadRequestError(
        "Coordinates not received in handleNearbySearch"
      );
    }
    const url =
      "https://maps.googleapis.com/maps/api/place/textsearch/json?location=" +
      latitude +
      "," +
      longitude +
      "&radius=" +
      radMetter +
      "&key=" +
      process.env.CLIENT_SECRET_KEY +
      "&query=parc";
    let responseNearestPlaces = await fetch(url);
    if (responseNearestPlaces.status !== 200) {
      throw new BadRequestError(
        "Failed retrieving data from handleNearbySearch Api."
      );
    }
    //add error handling
    let places = await responseNearestPlaces.json();
    res.status(200).json(places);
  } catch (err) {
    next(err);
  }
};
//@endpoint POST /parkPhoto
//@desc send back selected park picture.
//@access PRIVATE - will need to validate token?

// -------------------API PHOTO---------------------

const handlePhoto = async (req, res, next) => {
  try {
    let photo = req.body.photo;
    if (!photo) {
      throw new BadRequestError("photo variable not received in handlePhoto");
    }
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo}&key=${process.env.CLIENT_SECRET_KEY}`;
    let responsePhoto = await fetch(url);
    if (responsePhoto.status !== 200) {
      throw new BadRequestError("Failed retrieving data from handlePhoto Api.");
    }
    return res
      .status(200)
      .json({ message: "Picture success", image: responsePhoto.url });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleNearbySearch,
  handlePhoto,
};

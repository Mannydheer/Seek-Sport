
'use strict';
//env vairablkes
require('dotenv').config();

//allows to fetch to an API from backend with fetch method API.
const fetch = require('isomorphic-fetch');
//@endpoint POST /nearbySearch
//@desc authenticate user token and send back user info
//@access PRIVATE - will need to validate token?

// -------------------API NEARBY SEARCH----------------------
const handleNearbySearch = async (req, res) => {
    let coordinates = req.body
    let latitude = coordinates.lat
    let longitude = coordinates.lng

    let radMetter = 2 * 1000; // Search withing 2 KM radius
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?location=' + latitude + ',' + longitude + '&radius=' + radMetter + '&key=' + process.env.CLIENT_SECRET_KEY + '&query=parc'
    try {
        let responseNearestPlaces = await fetch(url)
        //add error handling
        let places = await responseNearestPlaces.json()
        res.status(200).json(places)
    }
    catch (err) {
        console.log(err)
    }
}
//@endpoint POST /parkPhoto
//@desc send back selected park picture.
//@access PRIVATE - will need to validate token?

// -------------------API PHOTO---------------------

const handlePhoto = async (req, res) => {
    let photo = req.body.photo;
    console.log(photo)
    try {
        const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo}&key=${process.env.CLIENT_SECRET_KEY}`
        let responsePhoto = await fetch(url)
        if (responsePhoto.status === 200) {
            console.log(responsePhoto.url)
            res.status(200).json({ message: "Picture success", image: responsePhoto.url })
        }
        else {
            res.status(400).json({ message: "Error occured retrieving pictured. " })
        }
    }
    catch (err) {
        res.status(500).json({ message: "Error occured in handlePhoto fetch function. " })
    }
}

module.exports = {
    handleNearbySearch, handlePhoto
}
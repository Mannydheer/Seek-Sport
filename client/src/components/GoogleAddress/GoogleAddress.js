import React, { useState, useEffect } from 'react';
import PlacesAutocomplete, {
    geoCodeByAddress,
} from 'react-places-autocomplete';
import Geocode from "react-geocode";
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';




const GoogleAddress = ({ setCoordinates, setParkMenu }) => {

    const [address, setAddress] = useState('')






    const handleSelect = async (value) => {

        //get longitude and latitude.
        Geocode.setApiKey("AIzaSyAt-D4AMalUpyQjUe3laQYyjjNgy_hcCOc");
        // set response language. Defaults to english.
        Geocode.setLanguage("en");
        // set response region. Its optional.
        // A Geocoding request with region=es (Spain) will return the Spanish city.
        Geocode.setRegion("ca");
        // Enable or disable logs. Its optional.
        Geocode.enableDebug();
        // Get latidude & longitude from address.
        Geocode.fromAddress(value).then(
            response => {
                const { lat, lng } = response.results[0].geometry.location;
                console.log(lat, lng);
                setCoordinates({
                    lat: lat,
                    lng: lng
                })
                setParkMenu(false)
            },
            error => {
                console.error(error);
            }
        );
    }
    return (
        <Wrapper>
            <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelect}>
                {/*wants render prop function as child.  */}
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) =>
                    <div>
                        <StyledInput {...getInputProps({ placeholder: "Enter an address!" })}></StyledInput>
                        <StyledFaSearch></StyledFaSearch>
                        <StyledSearches>
                            {loading ? <div>...loading</div> : null}
                            {/* add styling. */}
                            {suggestions.map((suggestion) => {
                                return <StyledSuggestion {...getSuggestionItemProps(suggestion)}> {suggestion.description}</StyledSuggestion>
                            })}
                        </StyledSearches>
                    </div>}
            </PlacesAutocomplete>
        </Wrapper>
    )

}

export default GoogleAddress;

const StyledInput = styled.input`
width: 100%;
height: 30px;
font-size: 1.5rem;
border: solid 2px black;
padding: 10px;
outline: none;
border-radius: 25px;
position: relative;



`
const Wrapper = styled.div`
display: flex;
justify-content: center;
`

const StyledSearches = styled.div`
width: 40vw;
`

const StyledSuggestion = styled.div`
&:hover {
    cursor: pointer;
    background-image: linear-gradient(-60deg, #16a085 0%, #f4d03f 100%);
    border-radius: 10px;

}
`


const StyledFaSearch = styled(FaSearch)`
    position: absolute;
 
    
    
`
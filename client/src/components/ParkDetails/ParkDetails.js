import React, { useState, useEffect } from 'react';
import styled from 'styled-components';



const ParkDetails = ({ parkInfo }) => {

    const [image, setImage] = useState(null)


    //-----------------------SELECTED PARK PHOTO ------------------------------
    useEffect(() => {
        const handlePhoto = async () => {
            if (parkInfo.photos === undefined) {
                //put something that does exist. 
                console.log('photo does not exist')
            }
            else {

                let photo = parkInfo.photos[0].photo_reference;
                console.log(photo, 'inside handle photo')
                try {
                    let response = await fetch('/parkPhoto', {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-type': 'application/json'
                        },
                        body: JSON.stringify({ photo })
                    })
                    if (response.status === 200) {
                        let image = await response.json();
                        setImage(image.image)
                    }
                    else {
                        console.log('error occured fetching park image.')
                    }
                }
                catch (err) {
                    console.log("error occured in Catch for handlePhoto", err)
                }
            }


        }
        handlePhoto();
    }, [parkInfo])






    return (

        <Wrapper>
            <Title>
                <Name>{parkInfo.name}</Name>
                <img src={parkInfo.icon}></img>
            </Title>

            <h2>{parkInfo.formatted_address}</h2>
            {image !== null && <img src={image}></img>}
            <div>Ratings: {parkInfo.user_ratings_total}</div>
        </Wrapper>
    )

}

export default ParkDetails;

const Wrapper = styled.div`
    h2 {
        font-size: 1.1rem;
        padding: 1rem;
    }
`

const Name = styled.div`

font-size: 2rem;`


const Title = styled.div`

img {
    width: 5rem;
    height: 5rem;

                }


`
import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';



const Rooms = ({ event, index }) => {
    const HtmlTooltip = withStyles(theme => ({
        tooltip: {
            backgroundColor: 'white',
            color: 'black',
            maxWidth: 220,
            border: '1px solid #dadde9',
            fontSize: '1.1rem',
            borderRadius: '25px',
            padding: '20px'

        },
    }))(Tooltip);
    return (<Wrapper>
        <HtmlTooltip
            title={
                <React.Fragment>
                    <strong>{event.parkName}</strong>
                    <div>{event.readTime}</div>
                    <div>{event.bookedDate}</div>
                    <div>{event.sport}</div>

                </React.Fragment>
            }
        >
            <Button>{event.groupName}</Button>
        </HtmlTooltip>
    </Wrapper>)
}
export default Rooms;

const Wrapper = styled.div`
border-radius: 10px;
border: solid white 2px;
color: white;

margin-bottom: 4px;
width: 100%;


button {
    color: white;
    width: 100%;

    &:hover {
        cursor: pointer;
        opacity: 0.8;
    }
}


@media screen and (max-width: 768px) {
button {
    font-size: 0.7rem;
}
            }
`

const StyledEventInformation = styled.div`

`
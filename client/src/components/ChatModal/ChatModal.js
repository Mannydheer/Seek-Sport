import React from 'react';

import Chat from '../Chat';
import styled from 'styled-components';



export default function ChatModal() {
    // getModalStyle is not a pure function, we roll the style only on the first render
    const [open, setOpen] = React.useState(false);
    const visibility = open ? "visible" : "hidden";

    const handleOpen = () => {
        setOpen(!open);
    };

    const handleClose = () => {
        setOpen(false);
    };



    return (
        <div>
            <StyledButton type="button" onClick={handleOpen}>
                Open Modal
      </StyledButton>
            <div style={{ visibility }}>
                <StyledChat>
                    <Chat></Chat>
                </StyledChat>
            </div>
            <CancelButton onClick={() => setOpen(false)}>X</CancelButton>
        </div>
    );
}

const StyledButton = styled.button`
position: fixed;
bottom: 0;
right: 0;
background-color: yellow;

`
const CancelButton = styled.button`
position: fixed;
bottom: 0;
right: 0;
background-color: blue;
z-index: 1000;

`

const StyledChat = styled.div`
position: fixed;
bottom: 0;
right: 0;
background-color: yellow;
width: 1000px;
height: 1000px;

`
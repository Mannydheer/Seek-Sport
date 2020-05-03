import React, { useState } from 'react';
import io from 'socket.io-client';
const Chat = () => {
    //pseudocode.
    //most likely, by when joined within an event.
    //a chat button will appear... which will open a modal...
    //since we are on the page.. we have access to the participant ID of that event...
    //we will use this as the rooms for each chat.
    //so ... when clicking on the button, you will now be inside the chat...
    //redirect to chat messaging component..



    //as soon as component is loaded.
    //get the 

    const socket = io('localhost:4000');

    console.log(socket)

    const [name, setName] = useState('');


    //form submit function.

    const handleSubmit = () => {


    }





    return <form onSubmit={handleSubmit}>
        <input placeholder="enter" type="text" onChange={(e) => setName(e.target.value)}></input>
        <button type='submit'></button>

        CHAT
    </form>
}

export default Chat;
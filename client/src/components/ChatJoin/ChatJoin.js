import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';




let socket;


const ChatJoin = () => {
    let ENDPOINT = 'localhost:4000';

    //now we have the eventId of which we want to join the chat
    //we have access to the participant ID which will be the room.
    let eventId = useParams().eventId;


    const userInfo = useSelector(state => state.userReducer);
    const userRegisteredEvents = useSelector(state => state.userRegisteredReducer)
    const [name, setName] = useState('');
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([])
    const [message, setMessage] = useState(null)



    //use effect on mount, will get the eventId which will be the participanID.
    //now we have access to the eventInformation... where we will use the 
    //participantId as the ROOM. 
    useEffect(() => {
        const handleGetRoomId = async () => {

            try {
                let response = await fetch(`/getChatRoom/${eventId}`);
                let eventResponse = await response.json()
                console.log(eventResponse)
                if (eventResponse.status === 200) {
                    //we will get back the participantId which is the same as the roomId
                    //now we can add add socket to particular room collection.
                    setRoom(eventResponse.participantId)
                }
                else {
                    console.log('error occured')
                }
            } catch (err) {
                console.log(err)
            }
        }
        handleGetRoomId()
        //only if these two values change.
    }, [eventId, ENDPOINT])



    //once the room set.
    //useEffect will hit the socket and try to join the room. 
    useEffect(() => {
        let userId = userInfo._id;
        socket = io(ENDPOINT);
        //now we can emit events from a socket.
        socket.emit('join', { name: userInfo.user, userId: userId, room: room })

        //useEffect cleanup.
        return () => {
            //this will occur when leaving the chat.
            socket.emit('disconnect');
            // //also need to turn off sokcet.
            socket.off();
        }
        //once you get the room
        //or the value of the room changes. then a refetch occurs.
    }, [room])




    useEffect(() => {
        let userId = userInfo._id;
        socket = io(ENDPOINT);
        //now we can emit events from a socket.
        socket.on('chat-message', (message) => {
            console.log(message)
            setMessages([...messages, message])

        })
        //useEffect cleanup.
        return () => {
            //this will occur when leaving the chat.
            socket.emit('disconnect');
            // //also need to turn off sokcet.
            socket.off();
        }

    }, [message])


    const handleSubmit = (e) => {

        console.log('inside handle submit')
        e.preventDefault();
        if (message) {
            socket.emit('sendMessage', message, () =>
                setMessage('')
            )
        }
    }

    console.log(messages)

    return <div>
        <StyledTitle>Welcome to the chat!</StyledTitle>
        <StyledForm onSubmit={handleSubmit}>
            <input placeholder="message" type="text" onChange={(e) => setMessage(e.target.value)}></input>
            <button type='submit'>send</button>
            <Link to={`/chat?name=${name}`}></Link>
        </StyledForm>
        {messages !== null && messages.length > 0 &&
            <div>
                {messages.map(message => {
                    return <div>
                        {message}
                    </div>
                })}
            </div>
        }
    </div>
}

export default ChatJoin;


const StyledForm = styled.form`
`
const StyledTitle = styled.h1`
    font-size: 3rem;
    text-align: center;
    border-bottom: solid black 2px;
    width: 40%;
    margin: 0 auto;

`
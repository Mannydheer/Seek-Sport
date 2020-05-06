const intitialState = {
    status: 'idle',
    isLoading: false,
    rooms: [],


};

export default function chatReducer(state = intitialState, action) {
    switch (action.type) {
        //singup or login success
        case "REQUEST_CHAT": {
            console.log(action)
            return {
                ...state,
                status: 'requesting chat...',
                isLoading: true,
            }
        }
        case "RETRIEVE_CHAT": {
            let stateCopy = { ...state }

            //check if you can find the room.
            let findRoom = stateCopy.rooms.find(room => {
                if (room._id === action.payload._id) {
                    return room;
                }
            })

            if (!findRoom) {
                stateCopy.rooms.push(action.payload)
            }
            return {
                ...stateCopy,
                status: 'retrieved',
                isLoading: false,
            }
        }
        case "RETRIEVE_CHAT_ERROR": {
            console.log(action)
            return {
                ...state,
                status: 'Error occured retrieving chats.',
                isLoading: false,
                rooms: null
            }
        }
        case "ADD_MESSAGE": {
            let stateCopy = { ...state }

            console.log('HIT ADD MESSAGE.')

            let findRoom = stateCopy.rooms.find(room => {
                if (room._id === action.message.room) {
                    //if there are no room messages.
                    //make them and then push the message that is coming...
                    if (!room.messages) {
                        room.messages = [];
                        room.messages.push(action.message)
                    }
                    //if there are messages array.. push inc msg.
                    else {
                        room.messages.push(action.message)
                    }
                    //once you find the room... push the new message.
                }
                else {
                    console.log('room was not found..')
                }
            })
            return {
                ...stateCopy,
            }
        }
        case "LEAVE_ROOM": {
            let stateCopy = { ...state }

            let findRoom = stateCopy.rooms.find((room, index) => {
                if (room._id === action.data.room && room.chatParticipants) {
                    //once you find the room... push the new message.
                    room.chatParticipants.find((participant, index) => {
                        if (participant.userId === action.data.userId) {
                            console.log('splicing')
                            //remove that participant.
                            room.chatParticipants.splice(index, 1)
                        }
                    })
                }
            })


            return {
                ...stateCopy,
            }
        }
        case "ADD_CHAT_PARTICIPANT": {
            console.log(action, 'adding chat participants')
            let stateCopy = { ...state }

            stateCopy.rooms.find((room, index) => {
                if (room._id === action.data.room) {
                    //check was done in the back end whether or not he is allowed to join.
                    room.chatParticipants.push(action.data.memberDetails)
                }
            })

            return {
                ...stateCopy,
            }
        }

        case "REMOVE_CHAT_PARTICIPANT": {
            let stateCopy = { ...state }


            return {
                ...stateCopy,
            }
        }

        default:
            return state;
    }
}
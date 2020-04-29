import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { skillLevel, sports } from '../data';
import { useDispatch, useSelector } from 'react-redux';
import {
    updateEvent
} from '../actions/parkActions';



export default function Join({ event }) {

    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const userInfo = useSelector(state => state.userReducer)

    //
    const [sportSelect, setSportSelect] = useState("Choose sport");
    const [skillSelect, setSkillSelect] = useState("Choose skill level");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        // setOpen(false);
    };

    //function that will add participants.
    const handleJoinEvent = async () => {

        if (userInfo.isAuthenticated) {
            const participantDetails = {
                name: userInfo.user,
                userId: userInfo._id,
                sportSelected: sportSelect,
                skillSelected: skillSelect,
                eventId: event._id,
            }

            let token = localStorage.getItem('accesstoken')

            try {
                let response = await fetch("/joinEvent", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Authorization': `${token}`
                    },
                    body: JSON.stringify({
                        eventInformation: event,
                        participantDetails: participantDetails,
                    })
                })

                let joinResponse = await response.json();
                console.log(joinResponse.event)
                if (joinResponse.status === 200) {
                    setOpen(false)

                    window.alert(joinResponse.message)
                }
                else {
                    setOpen(false)
                    window.alert(joinResponse.message)
                }



            } catch (err) { throw err, 'inside catch JOIN component' }
        } else {
            console.log('not auth inside JOIN component. In the else.')
        }
    }

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                Join?
      </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Join Game</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Fill up the information to join.
          </DialogContentText>
                    {/* <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                    /> */}
                    <select required onChange={(event) => setSportSelect(event.target.value)}>
                        {sports.map(sport => {
                            return (
                                <option key={sport}>{sport}</option>
                            )
                        })}
                    </select>
                    <select required onChange={(event) => setSkillSelect(event.target.value)}>
                        {skillLevel.map(skill => {
                            return (
                                <option key={skill}>{skill}</option>
                            )
                        })}
                    </select>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleJoinEvent} color="primary">
                        Accept
          </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
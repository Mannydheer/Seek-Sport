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
import Snackbars from '../SnackBar';

import { makeStyles } from '@material-ui/core/styles';

//styled.
const useStyles = makeStyles({
    root: {
        background: "linear-gradient(15deg, #13547a 0%, #80d0c7 100%)",
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 32,

        padding: '0 30px',
    },
});



export default function Join({ setJoined, joined, event }) {

    const dispatch = useDispatch();



    const [open, setOpen] = React.useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMsg, setSnackMsg] = useState('')
    const userInfo = useSelector(state => state.userReducer)

    //style modal.
    const classes = useStyles();

    //control joined.

    //
    const [skillSelect, setSkillSelect] = useState("Choose skill level");

    console.log(joined)

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    //function that will add participants.
    const handleJoinEvent = async () => {
        if (userInfo.isAuthenticated && skillSelect !== "Choose skill level") {
            const participantDetails = {
                name: userInfo.user,
                profileImage: userInfo.profileImage,
                userId: userInfo._id,
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
                    //double check why it happens for only one.
                    setJoined(true)
                    setOpen(false)
                    setOpenSnack(true)
                    setSnackMsg(joinResponse.message)
                }
                else {
                    //set joined here?
                    setOpen(false)
                    setOpenSnack(true)
                    setSnackMsg(joinResponse.message)
                }
            } catch (err) { throw err, 'inside catch JOIN component' }
        } else {
            console.log('not auth inside JOIN component. In the else.')
        }
    }

    console.log(joined, 'INSIDE JOIN COMPONENT')

    return (
        <div>
            <Button disabled={joined} variant="outlined" className={classes.root} onClick={handleClickOpen}>
                Join?
      </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Join Game</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Fill up the information to join.
          </DialogContentText>
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
            <Snackbars snackMsg={snackMsg} openSnack={openSnack} setOpenSnack={setOpenSnack}></Snackbars>

        </div>
    );
}
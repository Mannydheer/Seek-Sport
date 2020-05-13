import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import Snackbars from '../SnackBar';

const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 32,

        padding: '0 30px',
    },
});
export default function Leave({ setJoined, joined, event }) {
    const [open, setOpen] = React.useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMsg, setSnackMsg] = useState('')
    //modal styles.
    const classes = useStyles();
    const userInfo = useSelector(state => state.userReducer)
    //---------------FUNCTIONS--------------
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleLeaveEvent = async () => {
        if (userInfo.isAuthenticated) {
            const participantDetails = {
                userId: userInfo._id,
            }
            let token = localStorage.getItem('accesstoken')
            try {
                let response = await fetch("/leaveEvent", {
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
                let leaveResponse = await response.json();
                console.log(leaveResponse.event)
                if (leaveResponse.status === 200) {
                    // setRefetchParticipants(true)
                    setOpen(false)
                    setOpenSnack(true)
                    //since we left 
                    setJoined(false)
                    // //snackbar
                    setSnackMsg(leaveResponse.message)
                }
                else {
                    setOpen(false)
                    setSnackMsg(leaveResponse.message)
                }
            } catch (err) { throw err, 'inside catch handleLeaveEvent component' }
        } else {
            console.log('not auth inside handleLeaveEvent component. In the else.')
        }
    }
    return (
        <div>
            <Button className={classes.root} disabled={!joined} variant="outlined" onClick={handleClickOpen}>
                Leave?
      </Button>

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Leave Game</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to leave the game?
          </DialogContentText>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleLeaveEvent} color="primary">
                        Accept
          </Button>
                </DialogActions>
            </Dialog>

            <Snackbars snackMsg={snackMsg} openSnack={openSnack} setOpenSnack={setOpenSnack}></Snackbars>
        </div>
    );
}
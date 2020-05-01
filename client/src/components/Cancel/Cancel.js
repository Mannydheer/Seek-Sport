import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';

import { skillLevel, sports } from '../data';
import { useDispatch, useSelector } from 'react-redux';
//snackbar
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';



import {
    updateEvent
} from '../actions/parkActions';
import Snackbars from '../SnackBar';


//styled.
const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(to top, #c71d6f 0%, #d09693 100%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 32,

        padding: '0 30px',
    },
});



export default function Cancel({ event, canceled, setCanceled }) {

    const [open, setOpen] = React.useState(false);
    const [openSnack, setOpenSnack] = useState(false);
    const [snackMsg, setSnackMsg] = useState('')

    const dispatch = useDispatch();


    //style modal.
    const classes = useStyles();



    const userInfo = useSelector(state => state.userReducer)

    //control joined.


    console.log(event, 'iside cancel')
    //


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCancelEvent = async () => {
        //ensure user is authenticated.

        let token = localStorage.getItem('accesstoken')
        try {
            let response = await fetch("/cancelEvent", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify({
                    eventId: event._id,
                })
            })
            let deletedResponse = await response.json();
            console.log(deletedResponse)
            if (deletedResponse.status === 200) {
                setOpen(false)
                setSnackMsg(deletedResponse.message)
                setOpenSnack(true)
                setCanceled(true)
            }

        } catch (err) { throw err, 'inside catch handlecancelEvent component' }

    }
    return (
        <div>
            <Button className={classes.root} variant="outlined" onClick={handleClickOpen}>
                Cancel?
      </Button>

            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Cancel Event</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel the event?
          </DialogContentText>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={handleCancelEvent} color="primary">
                        Accept
          </Button>
                </DialogActions>
            </Dialog>

            <Snackbars snackMsg={snackMsg} openSnack={openSnack} setOpenSnack={setOpenSnack}></Snackbars>
        </div>
    );
}
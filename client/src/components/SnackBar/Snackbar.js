import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

export default function Snackbars({ snackMsg, openSnack, setOpenSnack }) {
    const classes = useStyles();



    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnack(false);
    };

    return (
        <div className={classes.root}>
            <Snackbar open={openSnack} autoHideDuration={3000} onClose={handleClose}>
                {snackMsg !== '' && <Alert onClose={handleClose} severity="success">
                    {snackMsg}
                </Alert>}
            </Snackbar>
            {/* <Alert severity="success">This is a success message!</Alert> */}
        </div>
    );
}
import React, { useEffect } from 'react';
import styled from 'styled-components';
// import Snackbar from '@material-ui/core/Snackbar';
// import MuiAlert from '@material-ui/lab/Alert';
// import { makeStyles } from '@material-ui/core/styles';

// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }
// const useStyles = makeStyles((theme) => ({
//     root: {
//         width: '100%',
//         '& > * + *': {
//             marginTop: theme.spacing(2),
//         },
//     },
// }));
export default function Snackbars({ openSnack, snackMsg, setOpenSnack }) {
    // const classes = useStyles();
    // const handleClose = (event, reason) => {
    //     if (reason === 'clickaway') {
    //         return;
    //     }
    //     setOpenSnack(false);
    // };

    useEffect(() => {
        setTimeout(() => {
            setOpenSnack(false)
        }, 3000);
    }, [])





    return (
        <Alert>
            {snackMsg}
            {/* <Snackbar open={openSnack} autoHideDuration={3000} onClose={handleClose}>
                {snackMsg !== '' && <Alert onClose={handleClose} severity="success">
                    {snackMsg}
                </Alert>}
            </Snackbar> */}
        </Alert>
    );
}


const Alert = styled.div`
color: white;
position: absolute;
font-weight: bolder;
bottom: 10px;
left: 45vw;
text-align: center;
width: 200px;
padding: 10px;
font-size: 1.1rem;
border-radius: 10px;
box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
background-color:green;
z-index: 1500;
`
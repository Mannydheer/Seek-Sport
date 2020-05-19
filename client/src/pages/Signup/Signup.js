import React, { useState, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import styled from "styled-components";
import ImageUploader from 'react-images-upload';
import { useDispatch } from 'react-redux';
import { loginRequest, loginSuccess, loginError } from '../../components/actions/userActions';

//Reference Sebastian Silbermann - Materials UI OpenSource Code
function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="/">
                Seek & Sport

      </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),

    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function SignUp() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(false)
    const formRef = useRef(null);
    const dispatch = useDispatch();

    const [userInfo, setUserInfo] = useState({
        user: '',
        pass: '',
    })
    const [file, setFile] = useState(null)
    const classes = useStyles();
    //---------------FUNCTIONS--------------
    const handleClickOpen = () => {
        setOpen(true);
        setError(false)
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleDone = (e) => {
        e.preventDefault();
        const files = new FormData();
        files.append('file', file)
        files.append('name', userInfo.user)
        files.append('pass', userInfo.pass)
        const handleSignup = async () => {

            if (userInfo.user !== '' && userInfo.pass !== '' && file !== null) {

                //remove previous token since there is a new user.
                localStorage.removeItem('accesstoken')

                dispatch(loginRequest())
                try {
                    let response = await fetch('/SignUp', {
                        method: "POST",
                        body: files
                    })
                    let userResponse = await response.json();
                    if (response.status === 200) {

                        localStorage.setItem('accesstoken', userResponse.accessToken)
                        //dispatch action.
                        let name = userResponse.username.split('@')[0]
                        dispatch(loginSuccess({
                            name: name,
                            token: userResponse.accessToken,
                            _id: userResponse._id,
                            profileImage: userResponse.profileImage
                        }))
                        //close modal.
                        setOpen(false)
                    }
                    else {
                        setError(userResponse.message)
                        dispatch(loginError(userResponse.message))
                    }
                }
                catch (err) {
                    console.log(err)
                }
            }
            else {
                setError('Ensure all fields are filled.')
            }
        }
        handleSignup()
    }
    //image uploader.
    const onDrop = (file) => {
        if (file !== undefined) {
            // let image = picture[0].name;
            setFile(file[0])
        }
        else return;
    }
    return (<>
        <List onClick={handleClickOpen}>
            Sign up
      </List>
        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        {/* <LockOutlinedIcon /> */}
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
        </Typography>
                    <form className={classes.form} onSubmit={handleDone} enctype="multipart/form-data">
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required

                            fullWidth
                            type='email'
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            onChange={(e) => setUserInfo({
                                ...userInfo,
                                user: e.target.value,
                            })}
                            value={userInfo.user}
                            helperText={error === null ? '' : error}
                        />
                        <TextField

                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={(e) => setUserInfo({
                                ...userInfo,
                                pass: e.target.value,
                            })}

                            value={userInfo.pass}

                        />
                        <ImageUploader
                            name='file'

                            buttonText='Upload Profile Picture!'
                            onChange={onDrop}
                            imgExtension={['.jpg', '.gif', '.png', '.gif']}
                            maxFileSize={5242880}
                            withPreview={true}

                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            Sign up
                     </Button>
                        <Button onClick={handleClose}

                            fullWidth
                            variant="contained"
                            color="inherit"
                            className={classes.submit}
                        >
                            Cancel
                        </Button>
                    </form>
                </div>
                <Box mt={8}>
                    <Copyright />
                </Box>
            </Container>
        </Dialog>

    </>);
}


const List = styled.li`

  background: none;
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  position: relative;
  list-style: none;
  cursor: pointer;

 
  &:after {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: white;

    
  }
  /* on hover over ... give it 100% width so we see it. */
  &:hover::after {
    width: 100%;
    transition: width .3s;

  }
  
 
`
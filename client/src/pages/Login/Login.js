import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
// import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Dialog from "@material-ui/core/Dialog";
import styled from "styled-components";
import {
  loginSuccess,
  loginError,
  loginRequest,
} from "../../components/actions/userActions";
import { useDispatch } from "react-redux";
//Reference Sebastian Silbermann - Materials UI OpenSource Code
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright ©  "}
      <Link color="inherit" href="/">
        Seek & Sport
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  const [open, setOpen] = useState(false);

  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState({
    user: "",
    pass: "",
  });
  const classes = useStyles();
  //---------------FUNCTIONS--------------
  const handleClickOpen = () => {
    setOpen(true);
    setError(false);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleDone = (e) => {
    e.preventDefault();
    const handleLogin = async () => {
      //action to request user data.
      dispatch(loginRequest());

      try {
        let response = await fetch("/Login", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify(userInfo),
        });
        let userResponse = await response.json();
        console.log(userResponse);
        if (response.status === 200) {
          let name = userResponse.username.split("@")[0];
          localStorage.setItem("accesstoken", userResponse.accessToken);
          //dispatch to make userState
          dispatch(
            loginSuccess({
              name: name,
              token: userResponse.accessToken,
              _id: userResponse._id,
              profileImage: userResponse.profileImage,
            })
          );
          setOpen(false);
        } else {
          setError(userResponse.message);
          dispatch(loginError());
        }
      } catch (err) {
        console.log(err);
      }
    };
    handleLogin();
  };

  return (
    <>
      <List onClick={handleClickOpen}>Login</List>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              {/* <LockOutlinedIcon /> */}
            </Avatar>
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <form className={classes.form} onSubmit={handleDone}>
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) =>
                  setUserInfo({
                    ...userInfo,
                    user: e.target.value,
                  })
                }
                value={userInfo.user}
                helperText={error === null ? "" : error}
              />
              <TextField
                required
                variant="outlined"
                margin="normal"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) =>
                  setUserInfo({
                    ...userInfo,
                    pass: e.target.value,
                  })
                }
                value={userInfo.pass}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              <Button
                onClick={handleClose}
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
    </>
  );
}

const List = styled.li`
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  position: relative;
  cursor: pointer;
  /* inserts content after it is selected. */
  /* like having a div under it. */
  &:after {
    content: "";
    display: block;
    width: 0;
    height: 2px;
    background: white;
  }
  /* on hover over ... give it 100% width so we see it. */
  &:hover::after {
    width: 100%;
    transition: width 0.3s;
  }
`;

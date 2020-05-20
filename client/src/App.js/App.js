import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "../../src/pages/Navbar";
import GlobalStyles from "../GlobalStyles";
import Home from "../../src/pages/Home";
import Sports from "../../src/pages/Sports";
import Host from "../../src/pages/Host";
import { fetchUserProfile } from "../components/helpers/helpers";
import {
  loginSuccess,
  loginError,
  loginRequest,
} from "../components/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import ViewActivity from "../components/ViewActivity";
import UserHostedEvents from "../../src/pages/UserHostedEvents";
import UserActivities from "../../src/pages/UserActivities";
import Footer from "../../src/pages/Footer";
import ChatJoin from "../../src/pages/ChatJoin";
import Chat from "../../src/pages/Chat";
import Chatbot from "../../src/pages/Chatbot";
import styled from "styled-components";

function App() {
  const dispatch = useDispatch();
  const userLoggedIn = useSelector((state) => state.userReducer);
  //validate if a user token still available in browser.
  //keep user logged in.
  useEffect(() => {
    const handleTokenUser = async () => {
      dispatch(loginRequest());
      try {
        let response = await fetchUserProfile();
        let userResponse = await response.json();
        console.log(userResponse);
        if (response.status === 200) {
          let name = userResponse.username.split("@")[0];
          dispatch(
            loginSuccess({
              name: name,
              token: userResponse.accessToken,
              _id: userResponse._id,
              profileImage: userResponse.profileImage,
            })
          );
        } else {
          dispatch(loginError(userResponse.message));
        }
      } catch (err) {
        console.log(err);
      }
    };
    handleTokenUser();
  }, []);

  return (
    <>
      <GlobalStyles></GlobalStyles>
      <Router>
        <Navbar></Navbar>
        <Switch>
          <Route exact path="/">
            <Home></Home>
          </Route>
          <Route exact path="/sports">
            <Sports></Sports>
          </Route>
          <Route exact path="/hostPark">
            {userLoggedIn.isAuthenticated ? (
              <Host></Host>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
          <Route exact path="/viewActivity">
            {userLoggedIn.isAuthenticated ? (
              <ViewActivity></ViewActivity>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
          <Route exact path="/userEvents">
            {userLoggedIn.isAuthenticated ? (
              <UserHostedEvents></UserHostedEvents>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
          <Route exact path="/userActivities">
            {userLoggedIn.isAuthenticated ? (
              <UserActivities></UserActivities>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
          <Route exact path="/chat">
            {userLoggedIn.isAuthenticated ? (
              <BigWrapper>
                <ChatWrapper>
                  <Chat></Chat>
                  <ChatJoin></ChatJoin>
                </ChatWrapper>
              </BigWrapper>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
          <Route exact path="/chatJoin/:eventId/:groupName">
            {userLoggedIn.isAuthenticated ? (
              <BigWrapper>
                <ChatWrapper>
                  <Chat></Chat>
                  <ChatJoin></ChatJoin>
                </ChatWrapper>
              </BigWrapper>
            ) : (
              <h1 style={{ textAlign: "center" }}>
                Must be logged in to view this page.
              </h1>
            )}
          </Route>
        </Switch>
        <FooterDiv>
          <Footer></Footer>
        </FooterDiv>
        {userLoggedIn.isAuthenticated && <Chatbot></Chatbot>}
      </Router>
    </>
  );
}

export default App;

const ChatWrapper = styled.div`
  display: flex;
  align-content: center;
  background: linear-gradient(to right, #91eae4, #86a8e7, #7f7fd5);
  padding: 2rem;
  @media screen and (max-width: 768px) {
    display: block;
    align-content: center;
  }
`;

const BigWrapper = styled.div``;
const FooterDiv = styled.div`
  width: 100%;
`;

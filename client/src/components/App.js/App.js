import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from '../Navbar';
import GlobalStyles from '../GlobalStyles';
import Home from '../Home';
import Sports from '../Sports';
import Host from '../Host';
import { fetchUserProfile } from '../helpers/helpers'
import { loginSuccess, loginError, loginRequest } from '../actions/userActions';
import { useDispatch, useSelector } from 'react-redux';
import ViewActivity from '../ViewActivity';
import UserHostedEvents from '../UserHostedEvents';
import UserActivities from '../UserActivities';
import Footer from '../Footer';
import ChatJoin from '../ChatJoin';
import Chat from '../Chat';





function App() {

  const dispatch = useDispatch();

  const userLoggedIn = useSelector(state => state.userReducer)
  const hostsInfo = useSelector(state => state.hostReducer)






  //validate if a user token still available in browser.
  //keep user logged in.
  useEffect(() => {
    const handleTokenUser = async () => {
      dispatch(loginRequest())
      try {
        let response = await fetchUserProfile();
        console.log(response, 'inside app token')
        let userResponse = await response.json()
        if (response.status === 200) {
          let name = userResponse.username.split('@')[0]
          dispatch(loginSuccess({
            name: name,
            token: userResponse.accessToken,
            _id: userResponse._id,
            profileImage: userResponse.profileImage
          }))
        }
        else {
          dispatch(loginError(userResponse.message))
        }
      } catch (err) {
        console.log(err)
      }
    }
    handleTokenUser()
  }, [])




  return (
    <>
      <GlobalStyles></GlobalStyles>
      <Router>
        <Navbar></Navbar>
        <Switch>
          <Route exact path='/'>
            <Home></Home>
          </Route>
          <Route exact path='/sports'>
            <Sports></Sports>
          </Route>
          <Route exact path='/hostPark'>
            {userLoggedIn.isAuthenticated ? <Host></Host> :
              <h1 style={{ textAlign: 'center' }}>Must be logged in to view this page.</h1>}
          </Route>
          <Route exact path='/viewActivity'>
            {userLoggedIn.isAuthenticated ? <ViewActivity></ViewActivity> :
              <h1 style={{ textAlign: 'center' }}>Must be logged in to view this page.</h1>}
          </Route>
          <Route exact path='/userEvents'>
            {userLoggedIn.isAuthenticated ? <UserHostedEvents></UserHostedEvents> :
              <h1 style={{ textAlign: 'center' }}>Must be logged in to view this page.</h1>}
          </Route>
          <Route exact path='/userActivities'>
            {userLoggedIn.isAuthenticated ? <UserActivities></UserActivities> :
              <h1 style={{ textAlign: 'center' }}>Must be logged in to view this page.</h1>}
          </Route>
          <Route exact path='/chat'>
            <Chat></Chat>
          </Route>
          <Route exact path='/chatJoin'>
            <ChatJoin></ChatJoin>
          </Route>
        </Switch>
        {/* footer */}
        <Footer></Footer>
      </Router>
    </>


  );
}

export default App;

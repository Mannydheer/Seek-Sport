import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js/index.js'
import configureStore from './components/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';


const store = configureStore();

const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (e) { console.log(e) }

}


store.subscribe(() => saveToLocalStorage(store.getState()))


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,

  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

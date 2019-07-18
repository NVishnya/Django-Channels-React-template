import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import RoomInput from './components/RoomInput';
import ChatRoom from './components/ChatRoom';

function App() {
  return (
    <Router>
      <Route exact path="/" component={RoomInput} />
      <Route path="/:room" component={ChatRoom} />
    </Router>
  );
}

export default App;

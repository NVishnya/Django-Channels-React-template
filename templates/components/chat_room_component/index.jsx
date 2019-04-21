import React from 'react'
import ReactDOM from 'react-dom'
import ChatRoom from './ChatRoom.jsx'
import $ from 'jquery'

var chat_socket = 'ws://' + window.location.host + '/ws' + window.location.pathname;
var messages_in_room = null;

var room = window.location.pathname.split('/').reverse().filter(x => x)[0];
$.get('/api/messages/' + room + '/?format=json', function(result){
  messages_in_room = result;
  render_component();
})
function render_component(){
  ReactDOM.render(
    <ChatRoom socket={chat_socket} messages={messages_in_room}/>,
    document.getElementById('chat_room')
  );
}

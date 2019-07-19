import React from 'react'
import MessageList from './MessageList';
import $ from 'jquery'

class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            current_message: '',
            room: props.match.params.room,
            socket: new WebSocket(
                "ws://" + window.location.host + "/ws/" + this.room + '/'
            )
        }
        this.messageInputRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmin = this.handleSubmin.bind(this);
        this.sendSocketMessage = this.sendSocketMessage.bind(this);
    }
    componentDidMount() {
        this.getMessages();
        let self = this;
        this.state.socket.addEventListener("message", function (event) {
            self.handleData(event.data);
        });
    }
    getMessages() {
        let self = this;
        $.get('/api/messages/' + this.state.room + '/?format=json')
            .done(function (data) {
                self.setState({ messages: data })
            })
    }
    handleData(data) {
        let result = JSON.parse(data);
        this.setState({ messages: [...this.state.messages, result['message']] });
        console.log(this.state.messages)
    }
    sendSocketMessage(message) {
        this.state.socket.send(JSON.stringify({ message: message }));
    }
    handleChange(event) {
        this.setState({ current_message: event.target.value });
    }
    handleSubmin(event) {
        event.preventDefault();
        if (this.state.current_message !== "") {
            this.sendSocketMessage(this.state.current_message);
        }
        this.setState({ current_message: '' });
    }
    render() {
        return (
            <center style={{ "position": "relative", "top": "10px" }}>
                <form onSubmit={this.handleSubmin}>
                    <input id='message-input-field' type="text" placeholder="Type your message here" ref={this.messageInputRef}
                        value={this.state.current_message} onChange={this.handleChange} />
                    <input type="submit" value="Send" />
                </form>
                <MessageList messages={this.state.messages} />
            </center>
        )
    }
}
export default ChatRoom;
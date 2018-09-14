import React from 'react'
import Websocket from 'react-websocket'

class MessagesList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            content: this.props.content
        }
    }
    componentWillReceiveProps(nextProps){
        this.setState({content: nextProps.content});
    }
    render(){
        return(
            <div className="col-12">
                {this.state.content.map(item => <p key={item.id}>{item.text}</p>)}
            </div>
        )
    }
}
class ChatRoom extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: props.messages,
            current_message: '',
        }
        this.socketRef = React.createRef();
        this.messageInputRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmin = this.handleSubmin.bind(this);
        this.sendSocketMessage = this.sendSocketMessage.bind(this);

    }
    componentWillUnmount(){
        this.serverRequest.abort();
    }
    handleData(data){
        let result  = JSON.parse(data);
        this.setState({ messages: [ ...this.state.messages, result['message']]});
    }
    sendSocketMessage(message){
        const socket = this.socketRef.current;
        socket.state.ws.send(JSON.stringify({'message': message}));
    }
    handleChange(event){
        this.setState({current_message: event.target.value});
    }
    handleSubmin(event){
        event.preventDefault();
        if(this.state.current_message != ""){
            this.sendSocketMessage(this.state.current_message);
        }
        this.setState({current_message: ''});
    }
    render(){
        return(
            <div>
                <form onSubmit={this.handleSubmin} className="form-inline col-12">
                    <div className="form-group">
                    <input type="text" placeholder="Type your message here" 
                        ref={this.messageInputRef} value={this.state.current_message} onChange={this.handleChange} 
                        className="form-control mr-2"/>
                    </div>
                    <input type="submit" value="Send" className='btn btn-primary'/>
                </form>
                <MessagesList content={this.state.messages}/>
                <Websocket ref={this.socketRef} url={this.props.socket} 
                    onMessage={this.handleData.bind(this)} reconnect={true} />
            </div>
        )
    }
}

export default ChatRoom;
export {MessagesList};

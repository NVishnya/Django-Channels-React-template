import React from 'react'

class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: this.props.messages
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ messages: nextProps.messages });
    }
    render() {
        return (
            <div id="chat-log">
                {this.state.messages.map(item => <p key={item.id}>{item.text}</p>)}
            </div>
        )
    }
}
export default MessageList;

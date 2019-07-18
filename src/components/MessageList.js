import React from 'react'

class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: this.props.content
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ content: nextProps.content });
    }
    render() {
        return (
            <div id="chat-log">
                {this.state.content.map(item => <p key={item.id}>{item.text}</p>)}
            </div>
        )
    }
}
export default MessageList;

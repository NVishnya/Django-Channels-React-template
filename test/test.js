import React from 'react';
import  ChatRoom, { MessagesList } from '../templates/components/chat_room_component/ChatRoom.jsx';
describe('ChatRoom cpmponent', () => {
    it('renders the MessagesList component', () =>{
        const wrapper = shallow(<ChatRoom messages={[]}/>);
        expect(wrapper.find(MessagesList)).to.have.length(1);
    });
    it('passes messages to MessagesList component', () =>{
        const wrapper = shallow(<ChatRoom messages={[]}/>);
        let messageslistWrapper = wrapper.find(MessagesList);
        
        wrapper.setState({ messages: ["1"] });

        messageslistWrapper = wrapper.find(MessagesList);
        expect(messageslistWrapper.props().content).to.eql(["1"]);
    });

});
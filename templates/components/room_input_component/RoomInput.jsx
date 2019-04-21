import React from 'react'

class RoomInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {room_name: ''}
        this.roomNameInputRef = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmin = this.handleSubmin.bind(this);
    }
    componentDidMount(){
        this.roomNameInputRef.current.focus();
    }
    handleChange(event){
        this.setState({room_name: event.target.value});
    }
    handleSubmin(event){
        event.preventDefault();
        window.location.pathname = window.location.pathname + this.state.room_name
    }
    render(){
        return (
            <center style={{"position": "relative", "top": "10px"}}>
                <form onSubmit={this.handleSubmin}>
                    <input id='room-input-field' type="text" placeholder="ROOM NAME" ref={this.roomNameInputRef}
                           value={this.state.room_name} onChange={this.handleChange}/>   
                    <input type="submit" value="Go!"/>
                </form>
            </center>
        )
    }
}
export default RoomInput;

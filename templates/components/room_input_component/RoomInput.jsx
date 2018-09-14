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
            <form onSubmit={this.handleSubmin} className="form-inline col-12">
                <div className="form-group">
                    <input type="text" placeholder="ROOM NAME"
                        ref={this.roomNameInputRef} value={this.state.room_name} onChange={this.handleChange}
                        className="form-control mr-2" />   
                </div>
                <input type="submit" value="Go!" className='btn btn-primary'/>
            </form>
        )
    }
}
export default RoomInput;

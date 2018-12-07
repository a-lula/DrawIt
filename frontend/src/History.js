import React, { Component } from 'react';
import io from 'socket.io-client'
import './Draw.css';
import crypto from "crypto";

const serverAddress = 'http://localhost:4000';
class History extends Component {
  constructor(props) {
    super(props);
    this.display = React.createRef();
    this.socket = null;
    this.state = {
      hist_index: 1,
      altID: this.props.match.params.id,
      room: crypto.randomBytes(5).toString('hex'),
      height: window.innerHeight,
      width: window.innerWidth,
      length: 0,
    }
  }
  resize = () => {
    const displayCtx = this.display.current.getContext('2d');
    displayCtx.clearRect(0, 0, window.innerWidth, window.innerHeight * 4.0/5.0);
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth,
    });
    this.componentDidMount();
  }
  componentDidMount() {
    window.addEventListener('resize', this.resize)
    this.socket = io(serverAddress);
    this.setState({altID: this.props.match.params.id});
    this.socket.emit('joinHistory',this.state.room)
    this.socket.on('draw_history', data => {
      this.setState({length: data.length});
      let [x1,y1,x2,y2] = data.lineCoords;
      x1 = x1*window.innerWidth/data.resolution[0];
      x2 = x2*window.innerWidth/data.resolution[0];
      y1 = y1*window.innerHeight/data.resolution[1];
      y2 = y2*window.innerHeight/data.resolution[1];
      const displayCtx = this.display.current.getContext('2d');
      displayCtx.lineWidth = data.lineWidth;
      displayCtx.strokeStyle = `rgba(${data.lineColor.r},${data.lineColor.g},${data.lineColor.b},${data.lineColor.a})`;
      displayCtx.beginPath();
      displayCtx.moveTo(x1,y1);
      displayCtx.lineTo(x2,y2);
      displayCtx.stroke();
    });
    this.socket.emit('draw_history',{
        room: this.state.room,
        hist_index: this.state.hist_index,
        altID: this.state.altID,
    })
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }
  getHistoryAtI(e) {
    if(e.target.value < this.state.hist_index){
        const displayCtx = this.display.current.getContext('2d');
        displayCtx.clearRect(0, 0, window.innerWidth, window.innerHeight * 4.0/5.0);
    }
    this.setState({hist_index: e.target.value});
    this.socket.emit('draw_history',{
        room: this.state.room,
        hist_index: this.state.hist_index,
        altID: this.state.altID,
    })
  }

  render() {
    return (
      <div>
        <canvas className="display" width={this.state.width} height={this.state.height * 4.0/5.0} ref={this.display}></canvas>
        <code className="index-label">
              Index: ({String(this.state.hist_index)})
        </code> 
        <input onChange={this.getHistoryAtI.bind(this)}
              value={this.state.hist_index}
              type="range" min="0" max={this.state.length}
        />
      </div>); //add scroller
  }
}

export default History;
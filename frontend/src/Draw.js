import React, { Component } from 'react';
import {ChromePicker} from 'react-color'
import Tool from './Tool'
import io from 'socket.io-client'
import './Draw.css';

const serverAddress = 'http://localhost:4000';
class Draw extends Component {
  constructor(props) {
    super(props);
    this.display = React.createRef();
    this.chat = React.createRef();
    this.socket = null;
    this.messages = null;
    this.state = {
      name: "undefined",
      message: "Enter Name",
      brushColor: {r:0, g: 0, b: 0, a: 255},
      brushSize: 3,
      toolId: 'pen',
      isPenDown: false,
      mouseX: 0,
      mouseY: 0,
      prevX: 0,
      prevY: 0,
      room: this.props.match.params.id,
      height: window.innerHeight,
      width: window.innerWidth,
      nameSet: false,
    }
  }
  resize = () => {
    const displayCtx = this.display.current.getContext('2d');
    displayCtx.clearRect(0, 0, window.innerWidth * 2.0/3.0, window.innerHeight);
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth,
    });
    this.componentDidMount();
  }
  componentDidMount() {
    window.addEventListener('resize', this.resize)
    this.socket = io(serverAddress);
    //while(!this.state){}
    this.socket.emit('joinRoom',this.state.room)
    this.socket.on('draw', data => {
      data.room = this.state.room;
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
    this.socket.on('message', data => {

      this.chat.current.innerText += data.name + " " + data.msg + "\n";
      this.chat.current.scrollTop = this.chat.current.scrollHeight;
    });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }
  handleChange(e) {
    this.setState({message: e.target.value});
  }
  handleToolClick(toolId) {
    this.setState({toolId});
    if (toolId === 'clear'){
      this.socket.emit('draw',{
        room: this.state.room,
        lineWidth: this.state.width * 1,
        lineColor: {r: 255, g: 255, b: 255, a: this.state.brushColor.a},
        lineCoords: [this.state.width * 1.0/3.0, 0, this.state.width * 1.0/3.0, this.state.height],
        resolution: [window.innerWidth,window.innerHeight]
      });
    }
  }
  handleColorChange(color) {
    this.setState({brushColor: color.rgb});
  }
  handleDisplayMouseMove(e) {
    this.setState({
      mouseX: e.clientX,
      mouseY: e.clientY
    });
    if(this.state.isPenDown) {
      this.display.current.getContext('2d').lineCap = 'round';
      const {top, left} = this.display.current.getBoundingClientRect();
      switch(this.state.toolId) {
        case 'pen':
          this.socket.emit('draw',{
            room: this.state.room,
            lineWidth: this.state.brushSize,
            lineColor: this.state.brushColor,
            lineCoords: [this.state.prevX - left, this.state.prevY - top, this.state.mouseX - left, this.state.mouseY - top],
            resolution: [window.innerWidth,window.innerHeight]
          });
          break;
        case 'eraser':
          this.socket.emit('draw',{
            room: this.state.room,
            lineWidth: this.state.brushSize,
            lineColor: {r: 255, g: 255, b: 255, a: this.state.brushColor.a},
            lineCoords: [this.state.prevX, this.state.prevY, this.state.mouseX, this.state.mouseY],
            resolution: [window.innerWidth,window.innerHeight]
          });
          break;
        default: break;
      }
    }
    this.setState({
      prevX: this.state.mouseX,
      prevY: this.state.mouseY
    });
    if(!this.state.isPenDown) {
      this.setState({
        prevX: e.clientX,
        prevY: e.clientY
      });
    }
  }
  handleDisplayMouseDown(e) {
    this.setState({isPenDown: true});
  }
  handleDisplayMouseUp(e) {
    this.setState({isPenDown: false});
  }
  handleBrushResize(e) {
    this.setState({brushSize: e.target.value})
  }
  onSave(e) {
    e.preventDefault();
    //still need to figure out
    let image = this.display.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    window.location.href=image
  }
  onSubmitMessage(e){
    e.preventDefault();
    if(this.state.nameSet){
      this.socket.emit('message',{
        room: this.state.room,
        message: this.state.message,
        name: this.state.name,
      });
    } else {
      this.setState({name: this.state.message,nameSet: true,message: ""});
    }
    this.setState({message: ""});
    e.target.value = "";
  }
  render() {
    return (
      <div>
        <canvas className="display" width={this.state.width * 2.0/3.0} height={this.state.height} ref={this.display}
          onMouseMove={this.handleDisplayMouseMove.bind(this)}
          onMouseDown={this.handleDisplayMouseDown.bind(this)}
          onMouseUp={this.handleDisplayMouseUp.bind(this)}>
        </canvas>
        <div className="toolbox">
            <ChromePicker color={this.state.brushColor} onChangeComplete={this.handleColorChange.bind(this)}></ChromePicker>
            <Tool name="Eraser" currentTool={this.state.toolId} toolId="eraser" onSelect={this.handleToolClick.bind(this)}/>
            <Tool name="Pen" currentTool={this.state.toolId} toolId="pen" onSelect={this.handleToolClick.bind(this)}/>
            <Tool name="Clear" currentTool={this.state.toolId} toolId="clear" onSelect={this.handleToolClick.bind(this)}/>
            <code className="brush-size-label">
              Size ({String((this.state.brushSize>9)?this.state.brushSize:("0" + this.state.brushSize))})</code> 
            <input onChange={this.handleBrushResize.bind(this)}
              value={this.state.brushSize}
              type="range" min="1" max="50"
            />
            <span className="brush-size-indicator" style={{width: this.state.brushSize + 'px', height: this.state.brushSize + 'px', background: this.state.brushColor}}></span>
        </div>
        <div className="chatbox" ref={this.chat}></div>
        <form onSubmit={this.onSubmitMessage.bind(this)}>
          <input className="enterline" ype="text" name="name" value={this.state.message} onChange={this.handleChange.bind(this)} />
        </form>
      </div>);
  }
}

export default Draw;
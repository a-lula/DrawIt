import React, { Component } from 'react';
import Button from "@material-ui/core/Button";
import axios from "axios";
const serverAddress = "http://127.0.0.1:4000";

class Home extends Component {


  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <p>Welcome to DrawIt</p>
        <Button
          fullWidth
          onClick={() =>{
            axios
              .get(`${serverAddress}/draw/init`)
              .then(res => {
                if (res.data.success) {
                  this.props.history.push("/draw/" + res.data.altID);
                } else {
                  alert("Try Again!");
                }
              })
              .catch(err => console.log(err));
          }}
          style={{
            backgroundColor: "#002f04",
            color: "#fff"
          }}
          >
         Create New Drawing
         </Button>
         <h3>About</h3>
         <p>Simple drawing application with viewable history using Node.js with Express, React.js and Socket.io to synchronize changes. Using MongoDB to store draw history</p>
      </div>
    );
  }
}
export default Home;
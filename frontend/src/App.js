import React, { Component } from 'react';
import { BrowserRouter,Switch, Route } from "react-router-dom";
import Draw from "./Draw";
import Home from "./Home";
import History from "./History";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
        <Route exact path="/"
            render={myprops => <Home {...myprops} />}
          />
          <Route exact path="/draw/:id"
            render={myprops => <Draw {...myprops} />}
          />
          <Route exact path="/draw/:id/history"
            render={myprops => <History {...myprops} />}
          />
        </Switch>
      </BrowserRouter>
    )
  }
}
export default App;
import React from 'react';
import './App.css';

class App extends React.Component {
  constructor() {
    super();
    // this.state = {
    //   history: [{
    //     squares: Array(9).fill(null),
    //   }],
    //   stepNumber: 0,
    //   xIsNext: true,
    // };
  }

  render() {
    return <div className="App">
      <header className="App-header">
        <h1>Todo list</h1>
        <ul>
          { this.state.items.map(item => <li>item</li>) };
        </ul>
      </header>
    </div>
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';

class App extends Component {
  // Initialize state
  state = { passwords: [] }

  // Fetch passwords after first mount
  componentDidMount() {
    this.getPasswords();
  }

  getPasswords = () => {
    // Get the passwords and store them in state
    fetch('/api/test')
      .then(res => res.json())
      .then(count => this.setState({ count }));
  }

  render() {
    const { passwords } = this.state;

    return (
			<div className="container">
				<header>
					<h1>npmsize</h1>
				</header>
				<div className="search">
					<label className="visuallyhidden" htmlFor="search">Repository name</label>
					<input className="searchInput" placeholder="Package name..." id="search" type="text" />
				</div>
			</div>
    );
  }
}

export default App;

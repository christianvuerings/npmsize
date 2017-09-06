import React, { Component } from "react";
import LineChart from "./js/LineChart";
import "./App.css";

class App extends Component {
	// Initialize state
	state = { loading: true, repo: "", searchInput: "gestalt" };

	// Fetch passwords after first mount
	componentDidMount() {
		this.getRepo();
	}

	getRepo = () => {
		const { searchInput } = this.state;
		if (searchInput) {
			fetch("/api/repo/" + searchInput)
				.then(res => res.json())
				.then(res => {
					console.log(res);
					this.setState({
						loading: false,
						repo: res
					})
				});
		} else {
			this.setState({
				loading: false,
				repo: {}
			});
		}

	}

	handleChange = (event) => {
		const value = event.target.value;
		this.setState({
			loading: true,
			searchInput: value
		}, this.getRepo);
	}

	render() {
		const { loading, repo, searchInput } = this.state;

		return (
			<div className="container">
				<header>
					<h1>npmsize</h1>
				</header>
				<div className="search">
					<label className="visuallyhidden" htmlFor="search">
						Repository name
					</label>
					<input
						className="searchInput"
						placeholder="Package name..."
						id="search"
						type="text"
						value={searchInput}
						onChange={this.handleChange}
					/>
				</div>
				<div className="content">
					{loading && <div>Loading</div>}
					<LineChart data={repo} />
					{repo && <div>{JSON.stringify(repo, null, 2)}</div>}
				</div>
			</div>
		);
	}
}

export default App;

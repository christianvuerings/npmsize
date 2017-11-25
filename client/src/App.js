import React, { Component } from "react";
import 'chart.js';
import Chart from "./js/Chart";

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

class File extends Component {
	render() {
		const { path, loading, data } = this.props;

		return (
			<div className="fileContainer">
				<h2>{path}</h2>
				{loading && <div>Loading</div>}
				{!loading && data && <Chart data={data} />}
			</div>

		)
	}
};

class App extends Component {
	// Initialize state
	state = { loading: true, repo: "", searchInput: "gestalt" };

	// constructor
	constructor(props) {
		super(props);

		this.getFilesDebounce = debounce(this.getFiles, 1000);
	}

	// Fetch passwords after first mount
	componentDidMount() {
		this.getFiles();
	}

	getFileInfo = (repo, path) => {
		fetch("/api/repo/" + repo + "/path/?path=" + encodeURIComponent(path))
			.then(res => res.json())
			.then(res => {
				this.setState({
					files: {
					  ...this.state.files,
					  [path]: {
						  loading: false,
						  data: res
					  },
					},
				  });
			});
	}

	getFilesInfo = (repo, paths) => {
		paths.forEach(path => this.getFileInfo(repo, path));
	}

	getFiles = () => {
		const { searchInput } = this.state;
		if (searchInput) {
			fetch("/api/repo/" + searchInput + "/files")
				.then(res => res.json())
				.then(res => {

					this.getFilesInfo(searchInput, res.lastVersion);

					const files = {};

					res.lastVersion.forEach((path) => {
						files[path] = {
							loading: true,
							data: {}
						}
					});
					this.setState({
						loadingFiles: false,
						files: files
					})
				});
		} else {
			this.setState({
				loadingFiles: false,
				files: {}
			});
		}
	}

	handleChange = (event) => {
		const value = event.target.value;
		this.setState({
			loadingFiles: true,
			searchInput: value
		}, this.getFilesDebounce);
	}

	render() {
		const { loadingFiles, files, searchInput } = this.state;

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
					{loadingFiles && <div>Loading</div>}
					{files && Object.keys(files).map(file =>
						<File path={file} data={files[file].data} loading={files[file].loading} key={file} />
					)}
					{/* <LineChart data={files} /> */}
					{/* {files && <div>{JSON.stringify(files, null, 2)}</div>} */}
				</div>
			</div>
		);
	}
}

export default App;

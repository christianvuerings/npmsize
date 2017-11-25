import React, { Component } from "react";
import { BarChart } from "react-chartkick";

const padding = 5;

class Chart extends Component {
  static defaultProps = {
    data: []
  };

  render() {
    const { data } = this.props;

    if (!data) {
      return null;
		}

		// Filter out 0 & null values
		const filteredData = data.filter(el => !!el[1]);

		// Get all the actual values for the data (kb)
		const values = filteredData.map(el => el[1]);

		// Calculate min + max for those values (layout purposes)
		const min = Math.floor(Math.min(...values) - padding);
		const max = Math.round(Math.max(...values) + padding);

		const height = 100 + filteredData.length * 12;

    return <BarChart data={filteredData} height={height} min={min} max={max} />;
  }
}

export default Chart;

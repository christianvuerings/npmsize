import React, { Component } from "react";
import { BarChart } from "react-chartkick";

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
		const minValue = Math.min(...values);
		const maxValue = Math.max(...values);

		const min = minValue - minValue / 15 > 0 ? Math.floor(minValue - minValue / 15) : Math.floor(minValue);
		const max = Math.round(maxValue + maxValue / 15);

		const height = 100 + filteredData.length * 12;

    return <BarChart data={filteredData} height={height} min={min} max={max} />;
  }
}

export default Chart;

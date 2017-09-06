import React, { Component } from 'react'

export default class Bars extends Component {
	handleOnMouseOver = (event) => {
		// console.log('handleOnMouseOver', event);
	}
  render() {
    const { scales, margins, data, svgDimensions } = this.props
    const { xScale, yScale } = scales
    const { height } = svgDimensions

    const bars = (
      data.map(el =>
        <rect
					onMouseOver={() => this.handleOnMouseOver(el)}
          key={el.version}
          x={xScale(el.version)}
          y={yScale(el.size)}
          height={height - margins.bottom - scales.yScale(el.size)}
          width={xScale.bandwidth()}
          fill="7B1FA2"
        />,
      )
    )

    return (
      <g>{bars}</g>
    )
  }
}

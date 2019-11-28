import React, { Component } from 'react';
import style from './style.styl';

type Props = {
	size: number
};

export default class Spinner extends Component<Props> {
	props: Props;

	render() {
		const values=[0.083, 0.166, 0.25, 0.332, 0.415, 0.5, 0.58, 0.665, 0.75, 0.85, 0.915, 1];
		const { size = 32 } = this.props;
		const lines = Array(values.length).fill(0).map((value, index) => (
			<ellipse key={values[index]} cx="16" cy="6" rx="1.7" ry="3"
				transform={`rotate(${index * 30}, 16, 16)`}
				opacity={values[index]}
			/>
		));
		return (
			<svg xmlns="http://www.w3.org/2000/svg"
				width={size}
				height={size}
				viewBox="0 0 32 32"
				className={style.spinner}
			>
				<g strokeWidth="4" strokeLinecap="round" fill="#1A0F0B">
					{lines}
				</g>
			</svg>
		)
	}
}
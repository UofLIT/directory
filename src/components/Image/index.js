import { h, Component } from "preact";
import HTMLWrapper from "../HTMLWrapper";
import PlaceholderImage from "../PlaceholderImage";

export default class Image extends Component {
	/**
	 * @typedef ImageProps
	 * @type {Object}
	 * @property {Image} img
	 */

	/**
	 * @param {ImageProps} props 
	 */
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
		};
	}

	handleLoad = event => {
		this.setState({
			loaded: event.target.complete,
		});
	};

	/**
	 * @param {ImageProps} props 
	 */
	render({ img }) {
		return (
			<div>
				<HTMLWrapper
					element={img}
					class="img-polaroid"
					onLoad={this.handleLoad}
					style={!this.state.loaded ? { visibility: 'hidden', position: 'absolute' } : {}} />
				{!this.state.loaded ? <PlaceholderImage /> : null}
			</div>
		);
	}
}
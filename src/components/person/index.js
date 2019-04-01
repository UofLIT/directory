import { h, Component } from "preact";
import PlaceholderImage from "../PlaceholderImage";
import style from "./style.scss";

export default class Person extends Component {
	constructor(props) {
		super(props);
		this.infoPromise = props.infoPromise;
		this.state = {
			details: {},
		};
	}

	async componentDidMount() {
		let details = await this.infoPromise;
		if (details) {
			this.setState({ details });
		}
	}

	/**
	 * change text to a class name
	 * @param {string} text
	 */
	textToClass(text) {
		return text.trim().toLowerCase().replace(/\W+/g, '-')
	}

	render({ name, href }, { details: { Image, Title, Department, Contact, ...others } }) {
		return (
			<div class={'person ' + style.person}>
				<a href={href}>
					{Image || <PlaceholderImage />}
					<h3>{name}</h3>
				</a>
				{Title || Department ?
					<p>
						{Title ? <em>{Title}</em> : null}
						{Department}
					</p> : null}
				{Contact}
				{Object.keys(others).map(heading =>
					<div>
						<h4 class={textToClass(heading)}>{heading}</h4>
						{others[heading]}
					</div>
				)}
			</div>
		);
	}
}

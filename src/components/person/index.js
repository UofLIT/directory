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

	componentDidMount = async () => {
		let details = await this.infoPromise;
		if (details) {
			this.setState({ details });
		}
	};

	render({ name, href }, { details: { Image, Title, Contact, ...others } }) {
		return (
			<div class={'person ' + style.person}>
				<a href={href}>
					{Image || <PlaceholderImage/>}
					<h3>{name}</h3>
				</a>
				{Title ? <em>{Title}</em> : null}
				{Contact}
				{Object.keys(others).map(heading =>
					<div>
						<h4 class={heading.trim().toLowerCase().replace(/\W+/g, '-')}>{heading}</h4>
						{others[heading]}
					</div>
				)}
			</div>
		);
	}
}

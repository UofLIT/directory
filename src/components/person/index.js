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
			this.setState({details});
		}
	};

	render({name, href}, {details: {Image, Contact, ...others}}) {
		let imageElm = Image || <PlaceholderImage/>
		let detailsElm = Object.keys(others).map(heading => (
			<div>
				<h4 class={heading.replace(/\W/g, '')}>{heading}</h4>
				<div dangerouslySetInnerHTML={{ __html: others[heading].outerHTML }} />
			</div>
		));
		return (
			<div class={style.person}>
				<a href={href}><h3>{name}</h3></a>
				{imageElm}
				{Contact}
				{detailsElm}
			</div>
		);
	}
}

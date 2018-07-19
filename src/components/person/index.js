import { h, Component } from "preact";
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

	render({name, href}, {details: {Image, ...others}}) {
		let imageElm = Image ? <img class="img-polaroid" src={Image.src} alt={Image.alt} /> : <img class="img-polaroid" src="blank-portrait.png" />
		let detailsElm = Object.keys(others).map(heading => (
			<div>
				<h4 class={heading.replace(/\W/g, '')}>{heading}</h4>
				<div dangerouslySetInnerHTML={{ __html: others[heading].outerHTML }} />
			</div>
		));
		return (
			<div class={"span6 " + style.person}>
				<a href={href}><h3>{name}</h3></a>
				{imageElm}
				{detailsElm}
			</div>
		);
	}
}

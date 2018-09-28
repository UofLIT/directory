import { h, Component } from "preact";
import Person from "../person";
//import "./style.scss";

export default class Tag extends Component {
	constructor(props) {
		super(props);
	}

	render({title, people, headingsToLoad}) {
		let titleElm = title ? <h2>{title}</h2> : null;
		let rows = [];
		let hrefs = Object.keys(people);
		
		for (let i = 0; i < hrefs.length; i += 2) {
			rows.push(
				<div class="row-fluid">
					{hrefs.slice(i, i + 2).map(href => (
						<Person name={people[href].name} href={href} infoPromise={people[href].promise} />
					))}
				</div>
			);
		}
		return (
			<div>
				{titleElm}
				{rows}
			</div>
		);
	}
}

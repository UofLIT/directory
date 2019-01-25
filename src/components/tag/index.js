import { h, Component } from "preact";
import Person from "../person";
import style from "./style.scss";

export default class Tag extends Component {
	constructor(props) {
		super(props);
	}

	/**
	 * 
	 * @param {Object} props
	 * @param {string} props.title
	 * @param {Object.<string, {name: string, promise: Promise}>} props.people
	 * @param {number} [props.cols = 2]
	 * @returns {JSX.Element}
	 */
	render({title, people, cols = 2}) {
		let titleElm = title ? <h2>{title}</h2> : null;
		let rows = [];
		let hrefs = Object.keys(people);
		
		for (let i = 0; i < hrefs.length; i += cols) {
			rows.push(
				<div class="row-fluid">
					{hrefs.slice(i, i + cols).map(href => (
						<div class={`span${12/cols} ${style.col}`}>
							<Person name={people[href].name} href={href} infoPromise={people[href].promise} />
						</div>
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

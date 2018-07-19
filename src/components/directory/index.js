import { h, Component } from "preact";
import arrayFrom from "array-from";
import Tag from "../tag";
import Person from "../person";
import style from "./style.scss";

export default class Directory extends Component {
	constructor(props) {
		super(props);
		this.people = {};
		this.peopleInfoCache = {};
		this.toLoad = props.load;
		this.parser = new DOMParser();
	}

	getPersonInfo = async function (href) {
		const fetchHref = process.env.NODE_ENV === 'production' ? href + '/getText' : href.substring('http://louisville.edu/nursing/directory'.length) + '.html';
		const response = await fetch(fetchHref);
		if (!response.ok) {
			return;
		}
		else {
			const doc = this.parser.parseFromString(await response.text(), "text/html");
			return this.toLoad.reduce((details, entry) => {
				let heading, element;
				switch (typeof entry) {
					case "string":
						heading = entry;
						if (heading == "Image")
							element = doc.querySelector('img');
						else
							element = doc.evaluate(`//*[contains(text(),'${heading}')][1]/following-sibling::*[1]`, doc.body, null, XPathResult.ANY_TYPE, null).iterateNext();
						break;
					case "object":
						heading = Object.keys(entry)[0];
						element = doc.querySelector(entry[heading].css);
						break;
				}
				if (element)
					details[heading] = element;
				else
					console.warn(`no ${heading} found for ${href}`);
				return details;
			}, {});
		}
	};

	componentWillMount = () => {
		let table = document.querySelector('#content-core table.listing');
		for (let row of arrayFrom(table.rows).slice(1)) {
			let href = row.cells[0].lastChild.href;
			let name = row.cells[0].lastChild.textContent;
			let promise = this.getPersonInfo(href);
			let tagsText = !row.cells[1] ? '' : row.cells[1].textContent;
			for (let tag of tagsText.split(', ')) {
				if (!this.people[tag]) this.people[tag] = [];
				this.people[tag][href] = { name, promise };
			}
		}
	};

	render(props) {
		let tags = [];
		for (let tag in this.people) {
			tags.push(
				<Tag title={tag} people={this.people[tag]} peopleInfoCache={this.peopleInfoCache} />
			);
		}
		return <div id={style.directory}>{tags}</div>;
	}
}

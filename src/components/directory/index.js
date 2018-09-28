import { h, Component } from "preact";
import arrayFrom from "array-from";
import HTMLWrapper from "../HTMLWrapper";
import Tag from "../tag";
import Person from "../person";
import style from "./style.scss";

export default class Directory extends Component {
	constructor(props) {
		super(props);
		this.people = {};
		this.peopleInfoCache = {};
		this.toLoad = props.load;
		this.pageType = props.pageType;
		this.parser = new DOMParser();
	}

	getFetchHref = href => {
		let fetchHref;
		if (process.env.NODE_ENV === 'production') {
			if (this.pageType === 'bio-page') {
				fetchHref = href + '?bio-info';
			}
			else {
				fetchHref = href + '/getText';
			}
		}
		else {
			fetchHref = href.substring(href.lastIndexOf('/') + 1) + '.html'
		}
		return fetchHref;
	};

	getPersonInfo = async href => {
		const fetchHref = this.getFetchHref(href);
		const response = await fetch(fetchHref);
		if (!response.ok) {
			return;
		}
		else {
			const doc = this.parser.parseFromString(await response.text(), "text/html");
			const contextNode = this.pageType === 'bio-page' ? doc.getElementById('bio') : doc.body;

			// const seachFrom = this.pageType == 'bio-page' ? null : doc;
			return this.toLoad.reduce((details, entry) => {
				let heading, element;
				switch (typeof entry) {
					case 'string':
						heading = entry;
						switch (heading) {
							case 'Image':
								element = <HTMLWrapper element={doc.querySelector('img')} class="img-polaroid"/>;
								break;
							case 'Contact':
								if('bio-page' === this.pageType) {
									const title = doc.querySelector('#bio-contact h2');
									const titleElm = title ? <em>{title.textContent}</em> : null;
									//let department = doc.querySelector('#bio-contact h3');
									const contact = doc.querySelector('#bio-contact ul');
									const contactElm = contact ? <HTMLWrapper element={contact}/> : null;
									element = (
										<div>
											{titleElm}
											{contactElm}
										</div>
									);
									break;
								}
							default:
								element = <HTMLWrapper element={doc.evaluate(`//*[contains(text(),'${heading}')][1]/following-sibling::*[1]`, contextNode, null, XPathResult.ANY_TYPE, null).iterateNext()}/>;
						}
						break;
					case 'object':
						heading = Object.keys(entry)[0];
						if (entry[heading].css) {
							// split and loop so first selector is preferred
							for (let css of entry[heading].css.split(', ')) {
								let elem;
								if (elem = doc.querySelector(css)) {
									element = <HTMLWrapper element={elem}/>
									break;
								}
							}
						}
						if (!element && entry[heading].xpath) {
							element = <HTMLWrapper element={doc.evaluate(entry[heading].xpath, contextNode, null, XPathResult.ANY_TYPE, null).iterateNext()}/>;
						}
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
		//                                    slice off headers
		for (let row of arrayFrom(table.rows).slice(1)) {
			let href = row.cells[0].lastElementChild.href;
			let name = row.cells[0].lastElementChild.textContent;
			let promise = this.getPersonInfo(href);
			// tags column may not exist
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

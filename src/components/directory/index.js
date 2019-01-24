import { h, Component } from "preact";
import arrayFrom from "array-from";
import HTMLWrapper from "../HTMLWrapper";
import Tag from "../tag";
import Image from "../image";
import style from "./style.scss";

/**
 * @property 
 */
export default class Directory extends Component {
	/**
	 * 
	 * @param {Object} props
	 * @param {string[]} props.load headings of sections of bio page to load
	 */
	constructor(props) {
		super(props);
		/** @type {Object.<string, Object.<string, {name: string, promise: Promise}>>} */
		this.people = {};
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

	/**
	 * @async
	 * @param {string} href 
	 * @returns {Promise<Object.<string, preact.ComponentChild}>}
	 */
	async loadPersonInfo(href) {
		const fetchHref = this.getFetchHref(href);
		const response = await fetch(fetchHref);
		if (!response.ok) {
			return;
		}
		const doc = this.parser.parseFromString(await response.text(), 'text/html');
		const contextNode = this.pageType === 'bio-page' ? doc.getElementById('bio') : doc.body;

		// const seachFrom = this.pageType == 'bio-page' ? null : doc;
		return this.toLoad.reduce((details, entry) => {
			/** @type {string} */
			let heading;
			/** @type {preact.ComponentChild} */
			let element;
			switch (typeof entry) {
				case 'string':
					heading = entry;
					switch (heading) {
						case 'Image':
							const img = doc.querySelector('img');
							element = img ? <Image img={img} /> : null;
							break;
						case 'Title':
							if ('bio-page' === this.pageType) {
								const title = doc.querySelector('#bio-contact h2');
								element = title ? title.textContent : null;
								break;
							}
						case 'Contact':
							if ('bio-page' === this.pageType) {
								//let department = doc.querySelector('#bio-contact h3');
								const contact = doc.querySelector('#bio-contact ul');
								element = contact ? <HTMLWrapper element={contact} /> : null;
								break;
							}
						default:
							element = <HTMLWrapper element={doc.evaluate(`//*[contains(text(),'${heading}')][1]/following-sibling::*[1]`, contextNode, null, XPathResult.ANY_TYPE, null).iterateNext()} />;
					}
					break;
				case 'object':
					heading = Object.keys(entry)[0];
					if (entry[heading].css) {
						// split and loop so first selector is preferred
						for (let css of entry[heading].css.split(', ')) {
							let elem;
							if (elem = doc.querySelector(css)) {
								element = <HTMLWrapper element={elem} />
								break;
							}
						}
					}
					if (!element && entry[heading].xpath) {
						element = <HTMLWrapper element={doc.evaluate(entry[heading].xpath, contextNode, null, XPathResult.ANY_TYPE, null).iterateNext()} />;
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

	/**
	 * @param {DOMTokenList} classList
	 * @returns {(string|undefined)}
	 */
	getPloneType(classList) {
		let a = classList[0];
		for (let i = 0; i < classList.length; i++) {
			const className = classList[i];
			if (className.startsWith('contenttype-')) {
				return className.substring('contenttype-'.length);
			}
		}
		return;
	}

	componentWillMount() {
		/** @type {HTMLTableElement} */
		const table = document.querySelector('#content-core table.listing');
		// start at 1 to skip header row
		for (let i = 1; i < table.rows.length; i++) {
			const row = table.rows[i];
			const href = row.cells[0].lastElementChild.href;
			const name = row.cells[0].lastElementChild.textContent;
			const type = this.getPloneType(row.cells[0].lastElementChild.classList);
			let promise;
			if (type === 'image') {
				const image = document.createElement('img');
				// remove '/view'
				image.src = href.slice(0, -4);
				promise = { Image: <Image img={image} /> };
			}
			else {
				promise = this.loadPersonInfo(href);
			}
			// tags column may not exist
			const tagsText = !row.cells[1] ? '' : row.cells[1].textContent;
			for (const tag of tagsText.split(', ')) {
				if (!this.people[tag]) {
					this.people[tag] = [];
				}
				this.people[tag][href] = { name, promise };
			}
		}
	}

	/**
	 * 
	 * @param {Object} props
	 * @param {number} props.cols
	 * @returns {JSX.Element}
	 */

	render({ cols }) {
		return (
			<div class="hsc-directory" id={style.directory}>
				{Object.keys(this.people).map(tag =>
					<Tag key={tag} title={tag} people={this.people[tag]} cols={cols} />
				)}
			</div>
		);
	}
}

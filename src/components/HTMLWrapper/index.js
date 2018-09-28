import { h, Component } from "preact";
import arrayFrom from "array-from";

export default class HTMLWrapper extends Component {
	render({element, children, ...props}) {
		// turn element attributes into a plain object
		let attributes = arrayFrom(element.attributes).reduce(
			(obj, attr) => {
				// override with passed values
				obj[attr.nodeName] = props[attr.nodeName] || attr.nodeValue;
				return obj;
			},
			{ dangerouslySetInnerHTML: { __html: element.innerHTML } }
		);
		return h(element.tagName, attributes, children);
	}
}

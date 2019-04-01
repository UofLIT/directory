import { h, Component } from "preact";
import arrayFrom from "array-from";

export default class HTMLWrapper extends Component {
	/**
	 * 
	 * @param {Object} props
	 * @param {HTMLElement} props.element
	 * @param {string=} props.tagName - tag name to replace root tag with
	 * @param {preact.ComponentChildren[]} props.children
	 * @returns {JSX.Element}
	 */
	render({element, tagName, children, ...props}) {
		// turn element attributes into a plain object
		const attributes = arrayFrom(element.attributes).reduce(
			(obj, attr) => {
				// override with passed values
				if (!obj[attr.name])
					obj[attr.name] = attr.value;
				return obj;
			},
			{ ...props, dangerouslySetInnerHTML: { __html: element.innerHTML } }
		);
		return h(tagName || element.tagName, attributes, children);
	}
}

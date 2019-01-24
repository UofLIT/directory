import { h, Component } from "preact";
import arrayFrom from "array-from";

export default class HTMLWrapper extends Component {
	/**
	 * 
	 * @param {Object} props
	 * @param {HTMLElement} props.element
	 * @param {preact.ComponentChildren[]} props.children
	 * @returns {JSX.Element}
	 */
	render({element, children, ...props}) {
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
		return h(element.tagName, attributes, children);
	}
}

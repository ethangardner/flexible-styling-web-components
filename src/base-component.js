/**
 * @class EGBaseComponent
 * I like to have a base class for components in a design system that other
 * components can extend from. This allows me to setup common functionality
 * that all components should have. Here, I'm using the example of recording
 * performance marks and measures and extending it with the extensibility API to give it a
 * custom track as described here: https://developer.chrome.com/docs/devtools/performance/extension
 */
export default class EGBaseComponent extends HTMLElement {
	constructor() {
		super();
	}

	/**
	 * Creates a devtools detail object
	 * @param {string} dataType - The data type (marker or measure)
	 * @param {Object} customDetail - Additional detail properties (optional)
	 * @returns {Object} The detail object
	 */
	createDevtoolsDetail(dataType, customDetail = {}) {
		return {
			devtools: {
				dataType,
				track: this.constructor.name,
				trackGroup: this.constructor.trackGroup || "My design system",
			},
			...customDetail,
		};
	}

	/**
	 * Records a performance mark with devtools metadata
	 * @param {string} markName - The name of the performance mark
	 * @param {Object} options - Configuration options
	 * @param {Object} options.detail - Additional detail properties (optional)
	 */
	recordPerformanceMark(markName, { detail = {} } = {}) {
		performance.mark(markName, {
			detail: this.createDevtoolsDetail("track-entry", detail),
		});
	}

	/**
	 * Records a performance measure with devtools metadata
	 * @param {string} measureName - The name of the performance measure
	 * @param {Object} options - Configuration options
	 * @param {string} options.startMark - The start mark name
	 * @param {string} options.endMark - The end mark name
	 * @param {Object} options.detail - Additional detail properties (optional)
	 */
	recordPerformanceMeasure(
		measureName,
		{ startMark, endMark, detail = {} } = {},
	) {
		performance.measure(measureName, {
			start: startMark,
			end: endMark,
			detail: this.createDevtoolsDetail("track-entry", detail),
		});
	}
}

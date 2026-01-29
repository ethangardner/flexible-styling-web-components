import EGBaseComponent from "./base-component.js";

/**
 * @summary A step indicator component for displaying progress through a sequence of steps.
 *
 * @tag step-indicator
 * @slot - The steps to display.
 * @attribute {number} step - The current step number.
 * @csspart container - The container element.
 * @csspart steps - The list of steps.
 * @cssprop --eg-c-step-indicator-border-color-active - The border color for the active step.
 * @cssprop --eg-c-step-indicator-border-color-completed - The border color for the completed steps.
 * @cssprop --eg-c-step-indicator-border-color-default - The default border color for steps.
 * @cssprop --eg-c-step-indicator-color-active - The text color for the active step.
 * @cssprop --eg-c-step-indicator-color-completed - The text color for the completed steps.
 * @cssprop --eg-c-step-indicator-color-default - The default text color for steps.
 * @cssprop --eg-c-step-indicator-font-weight-active - The font weight for the active step.
 * @cssprop --eg-c-step-indicator-gap - The gap between individual steps.
 * @cssprop --eg-c-step-indicator-item-border-size - The border width for steps indicator segments.
 * @cssprop --eg-c-step-indicator-item-marker-color - The color of the marker for the active step.
 * @cssprop --eg-c-step-indicator-item-marker-size - The size of the marker for the active step.
 * @cssprop --eg-c-step-indicator-item-padding-block - The internal block padding between the step text and the border.
 * @cssprop --eg-c-step-indicator-item-padding-inline - The internal inline padding between the step text and the border.
 */
class EGStepIndicator extends EGBaseComponent {
	static observedAttributes = ["step"];

	constructor() {
		super();
		this.handleSlotChange = this.handleSlotChange.bind(this);
	}

	connectedCallback() {
		this.recordPerformanceMark("step-indicator:connectedCallback:start");
		const shadowRoot = this.attachShadow({ mode: "open" });
		this.render(shadowRoot);

		const slot = shadowRoot.querySelector("slot:not([name])");
		slot.addEventListener("slotchange", this.handleSlotChange);

		this.updateStepClasses();
		this.recordPerformanceMark("step-indicator:connectedCallback:end");
	}

	render(shadowRoot) {
		this.recordPerformanceMark("step-indicator:render:start");

		shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					--_border-color-active: var(--eg-c-step-indicator-border-color-active, var(--_color-active));
					--_border-color-completed: var(--eg-c-step-indicator-border-color-completed, var(--_color-completed));
					--_border-color-default: var(--eg-c-step-indicator-border-color-default, var(--_color-default));
					--_border-size: var(--eg-c-step-indicator-item-border-size, 5px);
					--_color-active: var(--eg-c-step-indicator-color-active, hsl(0 0 30%));
					--_color-completed: var(--eg-c-step-indicator-color-completed, hsl(0 0 0));
					--_color-default: var(--eg-c-step-indicator-color-default, hsl(0 0 0));
					--_font-weight-active: var(--eg-c-step-indicator-font-weight-active, 700);
					--_gap: var(--eg-c-step-indicator-gap, 0.25rem);
					--_marker-color: var(--eg-c-step-indicator-item-marker-color, var(--_border-color-active));
					--_marker-size: var(--eg-c-step-indicator-item-marker-size, var(--_border-size));
					--_padding-inline: var(--eg-c-step-indicator-item-padding-inline, 1rem);
					--_padding-block: var(--eg-c-step-indicator-item-padding-block, .25rem);
				}

				@media (prefers-color-scheme: dark) {
					:host {
						--_color-active: var(--eg-c-step-indicator-color-active, hsl(0 0 100%));
						--_color-completed: var(--eg-c-step-indicator-color-completed, hsl(0 0 70%));
						--_color-default: var(--eg-c-step-indicator-color-default, hsl(0 0 70%));
					}
				}

				ol {
					display: flex;
					flex-direction: column;
					gap: var(--_gap);
					list-style: none;
					margin-inline-start: 0;
					padding-inline-start: 0;
				}

				::slotted(li) {
					color: var(--_color-default);
					flex: 1 0 0;
					padding-block: var(--_padding-block);
					padding-inline: var(--_padding-inline);
					position: relative;
				}

				::slotted(li)::after {
					background: var(--_border-color-default);
					content: "";
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: var(--_border-size);
				}

				::slotted(li.active) {
					color: var(--_color-active);
					font-weight: var(--_font-weight-active);
				}

				::slotted(li.active)::after {
					background: var(--_border-color-active);
				}

				::slotted(li.active)::before {
  				border-block: var(--_marker-size) solid transparent;
  				border-inline-start: var(--_marker-size) solid var(--_border-color-active);
					content: "";
					position: absolute;
					top: 50%;
					left: var(--_border-size);
					transform: translateY(-50%);
					height: 0;
					width: 0;
				}

				::slotted(li.completed) {
					color: var(--_color-completed);
				}

				::slotted(li.completed)::after {
					background: var(--_border-color-completed);
				}
			</style>
			<div part="container">
				<ol part="steps">
					<slot></slot>
				</ol>
			</div>
		`;

		this.recordPerformanceMark("step-indicator:render:end");
		this.recordPerformanceMeasure("step-indicator:render", {
			startMark: "step-indicator:render:start",
			endMark: "step-indicator:render:end",
		});
	}

	handleSlotChange() {
		this.updateStepClasses();
	}

	disconnectedCallback() {
		const slot = this.shadowRoot?.querySelector("slot:not([name])");
		if (slot) {
			slot.removeEventListener("slotchange", this.handleSlotChange);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "step") {
			this.updateStepClasses();
		}
	}

	updateStepClasses() {
		if (!this.shadowRoot) return;

		const stepAttr = this.getAttribute("step");
		const step = stepAttr ? parseInt(stepAttr, 10) : 1;

		if (isNaN(step)) return;

		this.recordPerformanceMark("step-indicator:update-step-classes:start");

		const slot = this.shadowRoot.querySelector("slot:not([name])");
		const slottedElements = slot.assignedElements();

		slottedElements.forEach((element, index) => {
			const stepNumber = index + 1;

			element.classList.remove("active");
			element.removeAttribute("aria-current");

			if (stepNumber === step) {
				element.classList.add("active");
				element.setAttribute("aria-current", "true");
				element.classList.remove("completed");
				element.removeAttribute("aria-label");
			} else if (stepNumber < step) {
				element.classList.remove("active");
				element.removeAttribute("aria-current");
				element.classList.add("completed");
				element.setAttribute("aria-label", "completed");
			} else {
				element.classList.remove("active");
				element.removeAttribute("aria-current");
				element.classList.remove("completed");
				element.removeAttribute("aria-label");
			}
		});

		this.recordPerformanceMark("step-indicator:update-step-classes:end");
	}
}

customElements.define("eg-step-indicator", EGStepIndicator);

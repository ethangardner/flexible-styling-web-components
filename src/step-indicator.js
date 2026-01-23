/**
 * @summary A step indicator component for displaying progress through a sequence of steps.
 *
 * @tag step-indicator
 * @slot - The steps to display.
 * @attribute {number} step - The current step number.
 * @csspart container - The container element.
 * @csspart steps - The list of steps.
 * @cssprop --step-indicator-border-color-default - The default border color for steps.
 * @cssprop --step-indicator-border-color-active - The border color for the active step.
 * @cssprop --step-indicator-border-color-completed - The border color for the completed steps.
 * @cssprop --step-indicator-color-default - The default text color for steps.
 * @cssprop --step-indicator-color-active - The text color for the active step.
 * @cssprop --step-indicator-color-completed - The text color for the completed steps.
 * @cssprop --step-indicator-font-weight-active - The font weight for the active step.
 * @cssprop --step-indicator-gap - The gap between individual steps.
 * @cssprop --step-indicator-item-border-width - The border width for steps indicator segments.
 * @cssprop --step-indicator-item-padding-block - The internal block padding between the step text and the border.
 */
class StepIndicator extends HTMLElement {
	static observedAttributes = ["step"];

	constructor() {
		super();
		this.handleSlotChange = this.handleSlotChange.bind(this);
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: "open" });
		this.render(shadowRoot);

		const slot = shadowRoot.querySelector("slot:not([name])");
		slot.addEventListener("slotchange", this.handleSlotChange);

		this.updateStepClasses();
	}

	render(shadowRoot) {
		shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					--_border-color-default: var(--_color-default);
					--_border-color-active: var(--_color-active);
					--_border-color-completed: var(--_color-completed);
					--_border-width: var(--step-indicator-item-border-width, 5px);
					--_color-default: var(--step-indicator-color-default, hsl(0 0 0));
					--_color-active: var(--step-indicator-color-active, hsl(0 0 30%));
					--_color-completed: var(--step-indicator-color-completed, hsl(0 0 0));
					--_font-weight-active: var(--step-indicator-font-weight-active, 700);
					--_gap: var(--step-indicator-gap, 0.5rem);
					--_padding-block: var(--step-indicator-item-padding-block, 1rem);
				}

				@media (prefers-color-scheme: dark) {
					:host {
						--_color-default: var(--step-indicator-color-default, hsl(0 0 70%));
						--_color-active: var(--step-indicator-color-active, hsl(0 0 100%));
						--_color-completed: var(--step-indicator-color-completed, hsl(0 0 70%));
					}
				}

				ol {
					display: flex;
					list-style: none;
					margin-inline-start: 0;
					padding-inline-start: 0;
					gap: var(--_gap);
				}

				::slotted(li) {
					border-block-start: var(--_border-width) solid var(--_border-color-default);
					color: var(--_color-default);
					flex: 1 0 0;
					padding-block: var(--_padding-block);
				}

				::slotted(li.active) {
					border-block-start-color: var(--_border-color-active);
					color: var(--_color-active);
					font-weight: var(--_font-weight-active);
				}

				::slotted(li.completed) {
					border-block-start-color: var(--_border-color-completed);
					color: var(--_color-completed);
				}
			</style>
			<div part="container">
				<ol part="steps">
					<slot></slot>
				</ol>
			</div>
		`;
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
	}
}

customElements.define("step-indicator", StepIndicator);

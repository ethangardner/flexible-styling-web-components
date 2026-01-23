/**
 * A step indicator component for displaying progress through a series of steps.
 *
 * @tag step-indicator
 * @slot - The steps to display.
 * @attribute {number} step - The current step number.
 * @csspart container - The container element.
 * @csspart steps - The list of steps.
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
					--_border-color-todo: var(--step-indicator-color-todo, hsl(0 0 44%));
					--_border-color-active: var(--step-indicator-color-active, hsl(0 0 22%));
					--_border-color-completed: var(--step-indicator-color-completed, hsl(0 0 0));
					--_border-width: var(--step-indicator-item-border-width, 5px);
					--_gap: var(--step-indicator-gap, 0.5rem);
					--_padding-block: var(--step-indicator-item-padding-block, 1rem);
				}

				@media (prefers-color-scheme: dark) {
					:host {
						--_border-color-todo: var(--step-indicator-color-todo, hsl(0 0 100%));
						--_border-color-active: var(--step-indicator-color-active, hsl(0 0 75%));
						--_border-color-completed: var(--step-indicator-color-completed, hsl(0 0 50%));
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
					border-block-start: var(--_border-width) solid var(--_border-color-todo);
					flex: 1 0 0;
					padding-block: var(--_padding-block);
				}

				::slotted(li.active) {
					border-block-start-color: var(--_border-color-active);
				}

				::slotted(li.completed) {
					border-block-start-color: var(--_border-color-completed);
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
			const originalLabel = element.textContent.trim();

			element.classList.remove("active");
			element.removeAttribute("aria-current");

			if (stepNumber === step) {
				element.classList.add("active");
				element.setAttribute("aria-current", "true");
			} else if (stepNumber < step) {
				element.classList.remove("active");
				element.removeAttribute("aria-current");
				element.classList.add("completed");
				element.setAttribute("aria-label", `${originalLabel} (completed)`);
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

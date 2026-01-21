class StepIndicator extends HTMLElement {
	static observedAttributes = ["step"];

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
					--_border-color-todo: var(--step-indicator-color-todo, #333333);
					--_border-color-active: var(--step-indicator-color-active, #163233);
					--_border-color-completed: var(--step-indicator-color-completed, #163317);
				}

				@media (prefers-color-scheme: dark) {
					:host {
						--_border-color-todo: var(--step-indicator-color-todo, #ccc);
						--_border-color-active: var(--step-indicator-color-active, #4cadb0);
						--_border-color-completed: var(--step-indicator-color-completed, #4caf50);
					}
				}

				ol {
					display: flex;
					list-style: none;
					margin-inline-start: 0;
					padding-inline-start: 0;
					gap: 0.5rem;
				}

				::slotted(li) {
					border-block-start: 5px solid var(--_border-color-todo);
					flex: 1 0 0;
					padding: 1rem 0;
				}

				::slotted(li.active) {
					border-block-start-color: var(--_border-color-active);
				}

				::slotted(li.completed) {
					border-block-start-color: var(--_border-color-completed);
				}
			</style>
			<div class="container">
				<ol>
					<slot></slot>
				</ol>
				<slot name="text"></slot>
			</div>
		`;

		// Listen for slot changes (handles dynamically added elements)
		const slot = shadowRoot.querySelector("slot:not([name])");
		slot.addEventListener("slotchange", () => {
			this.updateStepClasses();
		});

		// Initial update
		this.updateStepClasses();
	}

	disconnectedCallback() {}

	connectedMoveCallback() {}

	adoptedCallback() {}

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
			}

			if (stepNumber < step) {
				element.classList.add("completed");
				element.setAttribute("aria-label", `${originalLabel} (completed)`);
			} else {
				element.classList.remove("completed");
				element.removeAttribute("aria-label");
			}
		});
	}
}

customElements.define("step-indicator", StepIndicator);

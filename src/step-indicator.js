class StepIndicator extends HTMLElement {
    static observedAttributes = ['step'];

    constructor() {
        super();
    }

    connectedCallback() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    --_border-color-todo: var(--step-indicator-color-todo, #ccc);
                    --_border-color-active: var(--step-indicator-color-active, #ccc);
                    --_border-color-completed: var(--step-indicator-color-completed, #4caf50);
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
                    flex: 1 1 auto;
                    padding: 1rem 0;
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
        const slot = shadowRoot.querySelector('slot:not([name])');
        slot.addEventListener('slotchange', () => {
            this.updateStepClasses();
        });

        // Initial update
        this.updateStepClasses();
    }

    disconnectedCallback() {
    }

    connectedMoveCallback() {
    }

    adoptedCallback() {
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'step') {
            this.updateStepClasses();
        }
    }

    updateStepClasses() {
        if (!this.shadowRoot) return;

        const step = parseInt(this.getAttribute('step'), 10);
        if (isNaN(step)) return;

        const slot = this.shadowRoot.querySelector('slot:not([name])');
        const slottedElements = slot.assignedElements();

        slottedElements.forEach((element, index) => {
            if (index + 1 < step) {
                element.classList.add('completed');
                element.setAttribute('aria-label', `completed`);
            } else {
                element.classList.remove('completed');
                element.removeAttribute('aria-label');
            }
        });
    }
}

customElements.define('step-indicator', StepIndicator);
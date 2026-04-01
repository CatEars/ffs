import { BaseFormComponent } from '../base-form.js';

function formatCommand(cmd) {
    return `${cmd['program']} ${cmd.args.join(' ')}`;
}

class CliCommand extends BaseFormComponent {
    static observedAttributes = ['command'];

    render(html) {
        const command = JSON.parse(this.getAttribute('command') || '{}');
        const formattedCommand = formatCommand(command);
        const method = this.getAttribute('method');
        const action = this.getAttribute('action');

        const onInputChange = () => {
            const commandDisplay = this.shadowRoot.querySelector('#command-display');
            const inputs = this.shadowRoot.querySelectorAll('input[type="text"]');
            let updatedCommand = formattedCommand;

            for (const inputIdx of range(inputs.length)) {
                const input = inputs[inputIdx];
                const typedValue = input.value;
                if (typedValue) {
                    updatedCommand = updatedCommand.replaceAll(`$${inputIdx + 1}`, typedValue);
                }
            }
            commandDisplay.textContent = updatedCommand;
        };

        return html`
            <style>
                ol {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                ol > label > span {
                    margin-right: 0.5rem;
                }
                form {
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border: 1px solid black;
                    border-radius: 3px;
                }
                button {
                    max-width: 8rem;
                }
            </style>
            <form action="${action}" method="${method}">
                <input type="hidden" name="index" value="${command.index}" />
                <fieldset>
                    <legend>
                        Example: <span id="command-display">${formatCommand(command)}</span>
                    </legend>
                </fieldset>
                ${range(command.nargs).map(
                    (x) =>
                        html`<fieldset>
                            <legend>$${x + 1}</legend>
                            <input onchange="${onInputChange}" name="arg" type="text" />
                        </fieldset>`
                )}
                <fieldset>
                    <button type="submit">Run</button>
                </fieldset>
            </form>
        `;
    }
}

export default CliCommand;

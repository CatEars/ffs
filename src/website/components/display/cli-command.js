import { BaseWebComponent } from '../base.js';

function formatCommand(cmd) {
    return `${cmd['program']} ${cmd.args.join(' ')}`;
}

class CliCommand extends BaseWebComponent {
    static observedAttributes = ['command'];

    render(html) {
        const command = JSON.parse(this.getAttribute('command') || '{}');
        const method = this.getAttribute('method');
        const action = this.getAttribute('action');

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
                <div class="form-row">
                    <span>Example: <span>${formatCommand(command)}</span></span>
                </div>
                <div>
                    <ol>
                        ${command.args.map(
                            (x) =>
                                html`<label>
                                    <span>${x}</span>
                                    <input name="arg" type="text" />
                                </label>`
                        )}
                    </ol>
                </div>
                <button type="submit">Run</button>
            </form>
        `;
    }
}

export default CliCommand;

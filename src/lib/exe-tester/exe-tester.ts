export class ExecutableTester {
    private readonly executable: string;
    private readonly args: string[];
    private readonly tester: RegExp;

    constructor(exe: string, args: string[], tester: RegExp) {
        this.executable = exe;
        this.args = args;
        this.tester = tester;
    }

    async isAvailable() {
        try {
            const command = new Deno.Command(this.executable, { args: this.args });
            const proc = await command.output();
            const stdout = new TextDecoder().decode(proc.stdout);
            return proc.success && this.tester.test(stdout);
        } catch {
            return false;
        }
    }
}

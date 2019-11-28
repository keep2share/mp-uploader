import {Command, flags} from '@oclif/command'

class CLITool extends Command {
	async run() {
		this.parse(CLITool);
	}
}

CLITool.flags = {
	// add --version flag to show CLI version
	version: flags.version({char: 'v'}),
	// add --help flag to show CLI version
	help: flags.help({char: 'h'}),
}

export default CLITool

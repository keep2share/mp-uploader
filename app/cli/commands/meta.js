import { Command, flags } from '@oclif/command'
import Help from "@oclif/plugin-help"

class Meta extends Command {
	static id = '';

	static flags = {
	  // add --version flag to show CLI version
	  version: flags.version({char: 'v'}),
	  // add --help flag to show CLI version
	  help: flags.boolean({char: 'h', description: 'show CLI help'}),
	}

	static aliases = ['-h', '--help'];

	async run() {
	  const {argv} = this.parse();
	  new Help(this.config, {all: true}).showHelp(argv);
	}
}


export default Meta

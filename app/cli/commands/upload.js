import { Command, flags } from '@oclif/command'
import runner from '../../shared/runner'
import Log from '../components/Log'
import config from '../config'

class Upload extends Command {
	static id = 'upload';

	static description = 'Upload files on server';

	static flags = {
		'source-folder': flags.string({
			char: 's',
			description: 'path to local folder',
			required: true,
		}),
		'destination-folder': flags.string({
			char: 'd',
			description: 'folder Id on server',
			default: null,
		}),
		'path-to-csv': flags.string({
			char: 'c',
			description: 'local path to generated result file',
			default: 'upload_log.csv',
		}),
		'access-token': flags.string({
			char: 'a',
			description: 'access token from your profile',
			required: true,
		}),
		'stdout-json': flags.string({
			char: 'j',
			description: 'stdout in json format',
			default: false,
		}),
		'domain-name': flags.string({
			char: 'n',
			description: 'domain name for generated URLs',
			default: 'k2s',
			options: ['k2s', 'fb', 'p2m', 'tz'],
		}),
	};

	static aliases = ['u', 'upl'];

	constructor(argv, options) {
		super(argv, options);
		const { flags: stdinFlags } = this.parse(Upload);
		const {
			'source-folder': sourceFolder,
			'destination-folder': destinationFolder,
			'path-to-csv': pathToCsv,
			'access-token': accessToken,
			'stdout-json': stdoutJson,
			'domain-name': domainName,
		} = stdinFlags;

		const urlConfig = config.phpApiHosts[domainName];
		const { origin } = urlConfig;
		this.logger = new Log({ pathToCsv, stdoutJson, origin });

		this.state = {
			apiUrl: urlConfig.api,
			sourceFolder,
			destinationFolder: destinationFolder || null,
			accessToken,
			origin,
			logger: this.logger,
		};
	}

	async run() {
		try {
			await runner(this.state);
		} catch (err) {
			return this.logger.logError({ errorMessage: err.message, code: err.code });
		}
	}

}

export default Upload

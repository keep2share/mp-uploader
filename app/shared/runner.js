import Api from '../cli/api'
import Uploader from '../cli/components/Uploader'

export default async function runner (props) {
	const { apiUrl, logger, isDebug } = props;

	const api = new Api({ apiUrl, logger, isDebug });

	const result = await api.getRequestsPerSecond();
	if (result.body && result.body.extendedOptions) {
		const { requestsPerSecond } = result.body.extendedOptions;
		api.setRequestsPerSecond(requestsPerSecond);
	}

	const { hostname } = new URL(apiUrl);
	const uploader = new Uploader({ ...props, api, hostname });
	return uploader.readAndUploadFiles();
}

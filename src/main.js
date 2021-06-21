const core = require('@actions/core');
const axios = require('axios');

(async function main() {
    const instanceName = core.getInput('instance-name', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const pass = core.getInput('devops-integration-user-pass', { required: true });
    const defaultHeaders = { 'Content-Type': 'application/json' };

    const sncPackageURL = `https://${env.DEVOPS_INTEGRATION_USER_NAME}:${env.DEVOPS_INTEGRATION_USER_PASS}@${env.INSTANCE_NAME}.service-now.com/api/sn_devops/devops/package/registration?orchestrationToolId=${env.TOOL_ID}`;

    let githubContext = core.getInput('context-github', { required: true })

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`exception parsing github context ${e}`);
    }


    let artifacts;
    if (!!core.getInput('artifacts'), { required: true }) {
        try {
            artifacts = JSON.parse(core.getInput('artifacts'), { required: true });
        } catch (e) {
            core.setFailed(`failed to parse artifacts JSON: ${e}`);
            return;
        }
    }

    let artifactsPayload = {
	'artifacts': artifacts,
	'pipelineName': `${githubContext.workflow}`,
	'stageName': `${githubContext.job}`,
	'taskExecutionNumber': `${githubContext.run_number}`
    };

    let packageBody = {
	    'name': `rapdev-package-${github.run_number}`,
	    'artifacts': artifactsPayload,
	    'pipelineName': `${github.workflow}`,
	    'stageName': `${github.job}`,
	    'taskExecutionNumber': `${github.run_number}`
    }

    let packagePayload;
    try {
	packagePayload = await axios.post(sncPackageURL, packageBody, packageHeaders);
    } catch (e) {
	core.setFailed('failed to create artifact package ' + e)
	return
    }

})();
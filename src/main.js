const core = require('@actions/core');
const axios = require('axios');

(async function main() {
    const instanceName = core.getInput('instance-name', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const pass = core.getInput('devops-integration-user-pass', { required: true });
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const sncPackageURL = `https://${username}:${pass}@${instanceName}.service-now.com/api/sn_devops/devops/package/registration?toolId=${toolId}&orchestrationToolId=${toolId}`;

    let githubContext = core.getInput('context-github', { required: true });
    let packageName = core.getInput('name', { required: false });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`exception parsing github context ${e}`);
    }

    if(!packageName) {
        packageName = `${githubContext.repository}-package-${githubContext.run_number}`;
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

    let stageName = core.getInput('stage-name', { required: false });
    let packageBody = {
        'name': packageName,
        'artifacts': artifacts,
        'pipelineName': `${githubContext.repository}/${githubContext.workflow}`,
        'stageName': `${githubContext.job}`,
        'taskExecutionNumber': `${githubContext.run_number}`
    }

    if(stageName) {
            artifactBody.stageName = stageName;
    }

    let response;

    console.log("Package Body: " + JSON.stringify(packageBody));

    try {
        response = await axios.post(sncPackageURL, packageBody, defaultHeaders);
        console.log("ServiceNow Status: " + response.status + "; Response: " + JSON.stringify(response.data));
    } catch (e) {
        packageBody = JSON.stringify(packageBody);
        core.setFailed(`failed to create artifact package ${e} \nPayload is ${packageBody}`);
        return
    }

})();
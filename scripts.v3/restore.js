/**
 * This script restores previously captured developer portal content.
 * The idea is to be able to have scheduled backups of a portal and
 * then restore to the same (or a different) instance.
 * 
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./restore ^
 *    --subscriptionId "< your subscription ID >" ^
 *    --resourceGroupName "< your resource group name >" ^
 *    --serviceName "< your service name >"
 * 
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally)
 * and upload the generated static files to your hosting after the migration is completed.
 */

const { ImporterExporter } = require('./utils.js');

const yargs = require('yargs')
    .example(`node ./restore ^ \r
    *    --subscriptionId "< your subscription ID > \r
    *    --resourceGroupName "< your resource group name > \r
    *    --serviceName "< your service name >\n`)
    .option('subscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('resourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('serviceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .option('folder', {
        type: 'string',
        default: '../dist/snapshot',
        description: 'path to folder that contains the previously captured portal content.',
        example: '../dist/snapshot',
        demandOption: false
    })
    .help()
    .argv;

async function restore() {
    try {
        const destImporterExporter = new ImporterExporter(yargs.subscriptionId,
                                                          yargs.resourceGroupName,
                                                          yargs.serviceName,
                                                          null,
                                                          null,
                                                          null,
                                                          yargs.folder);
        await destImporterExporter.cleanup();
        await destImporterExporter.import();
        await destImporterExporter.publish();
    }
    catch (error) {
        throw new Error(`Unable to complete restore. ${error.message}`);
    }
}

restore()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });

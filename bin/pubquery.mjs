
const   str_aboutMe = `

NAME

    pmedquery

SYNOPSIS

    node pmedquery.js

DESC

    This simple nodejs program is an entrypoint that calls the pubmed_search
    module to execute and parse pubmed queries.

ARGS

    --query <term>
    The query term to send to PubMed.

    --man
    Show this man page. All other options, even if specified, are ignored.

    --verbose silent|normal|chatty
    How much can I talk?

`;


import { outbox }   from '../utils/outboxp.mjs';
import { PubMed }   from '../lib/pubsearch.mjs';
import   yargs      from 'yargs';
import { hideBin }  from 'yargs/helpers';
import { Refprint } from '../utils/refprint.mjs';

const pubmed        = new PubMed();
const output        = new outbox();
output.outputBox_setup();

function checkOn(payload) {
    if(!payload.status) {
        const error = `
        ERROR:

        In <${pubmed.activity}> the following occurred:
        ${pubmed.errorMessage}

        Returning to system.
        `;
        output.outputBox_print(error, 'error');
        process.exit();
    }
    return payload.return;
}

const CLIoptions  = yargs(hideBin(process.argv))
    .options(
        "query", {
            describe:       "The PubMed conformant query string",
            type:           "string",
            default:        "",
        })
    .option(
        "verbosity", {
            describe:       "If specified, be chatty",
            type:           "string",
            default:        "normal",
            choices:        ['silent', 'normal', 'chatty']
        })
    .option(
        "man", {
            describe:       "If specified, show a man page",
            type:           "boolean",
            default:        false
        })
    .parse();


async function main() {
    // Process CLI flags
    if(CLIoptions.man || !CLIoptions.query.length) {
        output.outputBox_print(str_aboutMe);
        process.exit();
    }

    const idlist  = checkOn(await pubmed.ids_get(CLIoptions.query));
    const publist = checkOn(await pubmed.ids_process(idlist));
    if(publist) {
        const refprint    = new Refprint(publist);
        refprint.do();
    }
}

main();




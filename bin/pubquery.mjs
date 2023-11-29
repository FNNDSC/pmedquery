#!/usr/bin/env node

const   str_aboutMe = `

NAME

    pmedquery

SYNOPSIS

    pmedquery.mjs   [--query <search>]              \\
                    [--man]                         \\
                    [--verbose <level>]             \\
                    [--json] [--bibTeX] [--term]

DESC

    This simple nodejs program restores CLI sanity to performing PubMed searches.
    Rejoice!

ARGS

    --query <search>
    The search term to send to PubMed. Any PubMed query construct is valid here.

    --json
    If specified, output the results as a JSON object.

    --bibTeX
    If specified, output the results in bibTeX format.

    --term
    If specified, output the results to the console/terminal. Note if neither
    '--json' nor '--bibTex' is specified, then '--term' is assumed.

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
    .option(
        "json", {
            describe:       "If specified, output a JSON return",
            type:           "boolean",
            default:        false
        })
    .option(
        "bibTeX", {
            describe:       "If specified, output a bibTeX return",
            type:           "boolean",
            default:        false
        })
    .option(
        "term", {
            describe:       "If specified, output a terminal return",
            type:           "boolean",
            default:        false
        })
    .option(
        "man", {
            describe:       "If specified, show a man page",
            type:           "boolean",
            default:        false
        })
    .parse();

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

function output_process(publist) {
    if(publist) {
        if(!CLIoptions.json || !CLIoptions.bibTeX)
            CLIoptions.term = true;
        if(CLIoptions.term) {
            const refprint    = new Refprint(publist);
            refprint.do();
        }
        if(CLIoptions.json) {
            console.log(JSON.stringify(publist, null, 4))
        }
    }
}

async function main() {
    // Process CLI flags
    if(CLIoptions.man || !CLIoptions.query.length) {
        output.outputBox_print(str_aboutMe);
        process.exit();
    }

    const idlist  = checkOn(await pubmed.ids_get(CLIoptions.query));
    const publist = checkOn(await pubmed.ids_process(idlist));
    output_process(publist);
}

main();




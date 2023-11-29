import chalk from 'chalk';

export const Refprint = function(arr_jsonRef) {
    this.str_aboutMe = `
    A simple module that prints a collected PubMed query to console.
    in a variety of opinionated ways.
    `;

    if(Array.isArray(arr_jsonRef))
        this.arr_jsonRef    = arr_jsonRef;
    else
        this.arr_jsonRef    = [];
};

Refprint.prototype  = {
    constructor:    Refprint,

    do:         function() {
        for(const jsonRef of this.arr_jsonRef) {
            console.log(ref_format(jsonRef));
        }
    }
}

const ref_format    = (ref) => {
    let str_stdout  = "";

    str_stdout  += chalk.yellow.italic(ref.id) + "\n";
    str_stdout  += chalk.whiteBright.bold(ref.title) + "\n";
    str_stdout  += chalk.white.italic(ref.authors) + "\n";
    if(ref.abstract.length) str_stdout += chalk.cyan(ref.abstract) + "\n";
    str_stdout  += chalk.magenta.bold(ref.journal) + "\n";
    if(ref.volume)  str_stdout += chalk.green(ref.volume) + ": ";
    if(ref.number)  str_stdout += chalk.green.italic(ref.number) + ", ";
    if(ref.pages)   str_stdout += chalk.yellowBright(ref.pages) + ", ";
    if(ref.date)    str_stdout += chalk.white.bold(ref.date) + ".\n";
    return str_stdout;
}

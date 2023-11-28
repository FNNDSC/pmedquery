import chalk from 'chalk';
import boxen from 'boxen';

// Use a function expression to define a function named outbox
export const outbox = function(options) {
    // Assign the properties to the this object
    this.str_help = `

    A simple output "box" handler.

    `;

    this.options = options;
    this.boxenOptions = null;
    this.error = null;
};

// Use the prototype keyword to add methods to the outbox function
outbox.prototype = {
    constructor: outbox,

    // Use the function syntax to define the outputBox_setup method
    outputBox_setup: function() {
        this.boxenOptions = {
            padding: 4,
            margin: 0,
            borderStyle: "round",
            borderColor: "green",
            backgroundColor: "#222222",
        };
    },

    outputBox_print: function(str_info, comms = "normal") {
        let str_boxText = "";
        str_boxText = str_info;
        switch (comms) {
            case "normal":
                str_boxText = chalk.white.bold(str_info);
                break;
            case "error":
                str_boxText = chalk.red.bold(str_info);
                break;
            case "warning":
                str_boxText = chalk.yellow.bold(str_info);
                break;
            default:
                str_boxText = chalk.white.bold(str_info);
                break;
        }
        const msgBox = boxen(str_boxText, this.boxenOptions);
        console.log("\n");
        console.log(msgBox);
    },
};


import chalk from 'chalk';
import boxen from 'boxen';

// Use the class keyword to define a class named outbox
export class outbox {
    // Use the constructor method to initialize the properties
    constructor(options) {
        this.str_help = `

            A simple output "box" handler.

        `;

        this.options = options;
        this.boxenOptions = null;
        this.error = null;
    }

    // Use the method syntax to define the outputBox_setup method
    outputBox_setup() {
        this.boxenOptions = {
            padding: 1,
            margin: 0,
            borderStyle: "round",
            borderColor: "green",
            backgroundColor: "#222222",
        };
    }

    outputBox_print(str_info, comms = "normal") {
        let str_boxText     = ""
        str_boxText         = str_info;
        switch(comms) {
            case 'normal':
                str_boxText   = chalk.white.bold(str_info);
                break;
            case 'error':
                str_boxText   = chalk.red.bold(str_info);
                break;
            case 'warning':
                str_boxText   = chalk.yellow.bold(str_info);
                break;
            default:
                str_boxText   = chalk.white.bold(str_info);
                break;
            }
        const msgBox        = boxen(str_boxText, this.boxenOptions);
        console.log("\n");
        console.log(msgBox);
    }
}


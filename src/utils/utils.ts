import * as _ from 'lodash';
import * as vscode from "vscode"; // NOSONAR
import * as os from 'os';
import * as path from 'path';
import * as fsextra from "fs-extra";
import { parse} from "comment-json";
import { spawn } from "child_process";

export class Utils {
    
    private static outputChannel: vscode.OutputChannel;

    public static async displayOptions(inputRequest: string, optionsList: vscode.QuickPickItem[]): Promise<vscode.QuickPickItem> {
        const options = { placeHolder: inputRequest, canPickMany: false, matchOnDetail: true, ignoreFocusOut: true };
        return vscode.window.showQuickPick(optionsList, options);
    }

    public static async getConfigFileField(field: string): Promise<any> {
        const configFilePath = this.getConfigFilePath();
        try {
            const jsonStr = await fsextra.readFile(configFilePath, "utf8");
            const configJson = parse(jsonStr);
            return configJson[field];
        } catch (error) {
            // empty or non existing file
        }
    }

    public static executeTask(execution: vscode.ShellExecution): void {
        let buildTask = new vscode.Task(
            { type: 'shell' },
            vscode.TaskScope.Workspace,
            'MTA',
            'MTA',
            execution);
 
        vscode.tasks.executeTask(buildTask);
    }

    public static async execCommand(command: string, commandArgs: string[], options?: any): Promise<any> {
        return new Promise<string>((resolve, reject) => {
            let stdout = "";
            const childProcess = spawn(command, commandArgs, options);
            
            childProcess.stdout.on("data", (data) => {
                if (!childProcess.killed) {
                    stdout = stdout.concat(data);
                    resolve(data);
                }
            });
            childProcess.stderr.on("data", (data) => {
                resolve(data);
            });
            childProcess.on("exit", (code: number) => {
                this.resultOnExit(stdout, resolve, code);
            });
            childProcess.on("error", (err: any) => {
                this.resultOnExit(stdout, resolve, err.code);
            });
        });
    }

    public static writeToOutputChannel(message: any) {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel(`MTA`);
            this.outputChannel.show();
        }

        if (!_.isString(message)) {
            message = String.fromCharCode.apply(null, new Uint16Array(message));
        }

        this.outputChannel.append(message);
        this.outputChannel.show();
    }

    private static resultOnExit(stdout: string, resolve: any, code: any) {
        resolve({exitCode: code});
    }

    private static getConfigFilePath(): string {
        const cfHome = _.get(process, "env.CF_HOME", path.join(os.homedir(), ".cf"));
        return path.join(cfHome, "config.json");
    }
}
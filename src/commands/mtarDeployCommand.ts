import * as _ from "lodash";
import * as vscode from "vscode"; // NOSONAR
import { platform } from "os";
import { Utils } from "../utils/utils";
import { SelectionItem } from "../utils/selectionItem";
import { messages } from "../i18n/messages";

const CF_COMMAND = "cf";
const CF_LOGIN_COMMAND = "cf.login";
const isWindows = platform().indexOf("win") > -1;
const homeDir = require("os").homedir();

export class MtarDeployCommand {
  private path: string;

  public async mtarDeployCommand(selected: any): Promise<void> {
    const response = await Utils.execCommand(
      CF_COMMAND,
      ["plugins", "--checksum"],
      { cwd: homeDir }
    );
    if (!_.includes(response.data, "multiapps")) {
      vscode.window.showErrorMessage(messages.INSTALL_MTA_CF_CLI);
      return;
    }

    if (selected) {
      this.path = selected.path;
    } else {
      const mtarFilesPaths = await vscode.workspace.findFiles(
        "**/*.mtar",
        "**/node_modules/**"
      );
      const len = mtarFilesPaths.length;
      if (len === 0) {
        vscode.window.showErrorMessage(messages.NO_MTA_ARCHIVE);
        return;
      } else if (len === 1) {
        this.path = mtarFilesPaths[0].path;
      } else {
        const inputRequest = messages.SELECT_MTA_ARCHIVE;
        const selectionItems: SelectionItem[] = await SelectionItem.getSelectionItems(
          mtarFilesPaths
        );
        const userSelection: vscode.QuickPickItem = await Utils.displayOptions(
          inputRequest,
          selectionItems
        );
        this.path = userSelection.label;
      }
    }
    this.path = isWindows ? _.trimStart(this.path, "/") : this.path;

    if (await this.isLoggedInToCF()) {
      await this.execDeployCmd();
    } else {
      await this.loginToCF();
      if (await this.isLoggedInToCF()) {
        await this.execDeployCmd();
      }
    }
  }

  private async execDeployCmd(): Promise<any> {
    const options: vscode.ShellExecutionOptions = { cwd: homeDir };
    const execution = new vscode.ShellExecution(
      CF_COMMAND + " deploy " + this.path,
      options
    );
    Utils.execTask(execution, messages.DEPLOY_MTAR);
  }

  private async isLoggedInToCF(): Promise<boolean> {
    const results = await Promise.all([
      Utils.getConfigFileField("OrganizationFields"),
      Utils.getConfigFileField("SpaceFields")
    ]);
    const orgField = _.get(results, "[0].Name");
    const spaceField = _.get(results, "[1].Name");
    return !(_.isEmpty(orgField) && _.isEmpty(spaceField));
  }

  private async loginToCF(): Promise<void> {
    const commands = await vscode.commands.getCommands(true);
    if (_.includes(commands, CF_LOGIN_COMMAND)) {
      await vscode.commands.executeCommand(CF_LOGIN_COMMAND);
    } else {
      vscode.window.showErrorMessage(messages.LOGIN_VIA_CLI);
    }
  }
}

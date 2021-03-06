import * as sinon from "sinon";
import { mockVscode, testVscode } from "../mockUtil";
mockVscode("src/commands/mtarDeployCommand");
import { MtarDeployCommand } from "../../src/commands/mtarDeployCommand";
mockVscode("src/utils/utils");
import { Utils } from "../../src/utils/utils";
import { messages } from "../../src/i18n/messages";
import { SelectionItem } from "../../src/utils/selectionItem";

describe("Deploy mtar command unit tests", () => {
  let sandbox: any;
  let mtarDeployCommand: MtarDeployCommand;
  let utilsMock: any;
  let windowMock: any;
  let workspaceMock: any;
  let selectionItemMock: any;
  let commandsMock: any;
  let tasksMock: any;

  const selected = {
    path: "mta_archives/mtaProject_0.0.1.mtar"
  };
  const CF_CMD = "cf";
  const DEPLOY = "deploy";
  const CF_LOGIN_CMD = "cf.login";
  const expectedPath = "mta_archives/mtaProject_0.0.1.mtar";
  const homeDir = require("os").homedir();

  const execution = new testVscode.ShellExecution(CF_CMD, [
    DEPLOY,
    expectedPath
  ]);
  const buildTask = new testVscode.Task(
    { type: "shell" },
    testVscode.TaskScope.Workspace,
    messages.DEPLOY_MTAR,
    "MTA",
    execution
  );

  before(() => {
    sandbox = sinon.createSandbox();
  });

  after(() => {
    sandbox = sinon.restore();
  });

  beforeEach(() => {
    mtarDeployCommand = new MtarDeployCommand();
    utilsMock = sandbox.mock(Utils);
    windowMock = sandbox.mock(testVscode.window);
    workspaceMock = sandbox.mock(testVscode.workspace);
    selectionItemMock = sandbox.mock(SelectionItem);
    commandsMock = sandbox.mock(testVscode.commands);
    tasksMock = sandbox.mock(testVscode.tasks);
  });

  afterEach(() => {
    utilsMock.verify();
    windowMock.verify();
    workspaceMock.verify();
    selectionItemMock.verify();
    commandsMock.verify();
    tasksMock.verify();
  });

  it("mtarDeployCommand - Deploy mtar from context menu", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("OrganizationFields")
      .atLeast(1)
      .resolves({ Name: "org" });
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("SpaceFields")
      .atLeast(1)
      .resolves({ Name: "space" });
    tasksMock
      .expects("executeTask")
      .once()
      .withExactArgs(buildTask);
    await mtarDeployCommand.mtarDeployCommand(selected);
  });

  it("mtarDeployCommand - Deploy mtar from command when no MTA archive in the project", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    workspaceMock.expects("findFiles").returns(Promise.resolve([]));
    tasksMock.expects("executeTask").never();
    windowMock
      .expects("showErrorMessage")
      .withExactArgs(messages.NO_MTA_ARCHIVE);
    await mtarDeployCommand.mtarDeployCommand(undefined);
  });

  // TODO: Failing for Raya to correct.
  it.skip("mtarDeployCommand - Deploy mtar from command with only one MTA archive in the project", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    workspaceMock.expects("findFiles").returns(Promise.resolve([selected]));
    tasksMock
      .expects("executeTask")
      .once()
      .withExactArgs(buildTask);
    await mtarDeployCommand.mtarDeployCommand(undefined);
  });

  // TODO: Failing for Raya to correct.
  it.skip("mtarDeployCommand - Deploy mtar from command with several MTA archives in the project", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    workspaceMock
      .expects("findFiles")
      .returns(
        Promise.resolve([selected, { path: "mta_archives/mta_0.0.1.mtar" }])
      );
    selectionItemMock
      .expects("getSelectionItems")
      .once()
      .returns(Promise.resolve());
    utilsMock
      .expects("displayOptions")
      .once()
      .returns(Promise.resolve({ label: expectedPath }));
    tasksMock
      .expects("executeTask")
      .once()
      .withExactArgs(buildTask);
    await mtarDeployCommand.mtarDeployCommand(undefined);
  });

  it("mtarDeployCommand - Deploy mtar with no mta-cf-cli plugin installed", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "some other plugin" });
    tasksMock.expects("executeTask").never();
    windowMock
      .expects("showErrorMessage")
      .withExactArgs(messages.INSTALL_MTA_CF_CLI);
    await mtarDeployCommand.mtarDeployCommand(selected);
  });

  it("mtarDeployCommand - Deploy mtar when user needs to login via CF login command", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("OrganizationFields")
      .atLeast(1)
      .resolves();
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("SpaceFields")
      .atLeast(1)
      .resolves();
    commandsMock
      .expects("getCommands")
      .once()
      .withExactArgs(true)
      .returns([CF_LOGIN_CMD]);
    commandsMock
      .expects("executeCommand")
      .once()
      .withExactArgs(CF_LOGIN_CMD)
      .returns(Promise.resolve());
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("OrganizationFields")
      .atLeast(1)
      .resolves({ Name: "org" });
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("SpaceFields")
      .atLeast(1)
      .resolves({ Name: "space" });
    tasksMock
      .expects("executeTask")
      .once()
      .withExactArgs(buildTask);
    await mtarDeployCommand.mtarDeployCommand(selected);
  });

  it("mtarDeployCommand - Deploy mtar when user needs to login via CF CLI", async () => {
    utilsMock
      .expects("execCommand")
      .once()
      .withExactArgs(CF_CMD, ["plugins", "--checksum"], { cwd: homeDir })
      .returns({ data: "multiapps " });
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("OrganizationFields")
      .atLeast(1)
      .resolves();
    utilsMock
      .expects("getConfigFileField")
      .withExactArgs("SpaceFields")
      .atLeast(1)
      .resolves();
    commandsMock
      .expects("getCommands")
      .once()
      .withExactArgs(true)
      .returns([]);
    tasksMock.expects("executeTask").never();
    windowMock
      .expects("showErrorMessage")
      .withExactArgs(messages.LOGIN_VIA_CLI);
    await mtarDeployCommand.mtarDeployCommand(selected);
  });
});

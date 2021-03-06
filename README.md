## Description

The **VS Code Multi-Target Application (MTA) tools** extension is a VS Code extension for development of multi-target applications.
It can be used to build multitarget applications using the [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool) and to deploy the build result to Cloud Foundry.
The extension is being developed and currently contains limited features.

### Requirements

Make sure that you are familiar with the multi-target application concept and terminology. For background and detailed information, see [Multi-Target Application Model](https://www.sap.com/documents/2016/06/e2f618e4-757c-0010-82c7-eda71af511fa.html).

Make sure the following tools are installed in your environment:

- `GNU Make 4.2.1` or later to build MTA project.
- [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool) to build MTA project.
- [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) to work with Cloud Foundry.
- [MultiApps CF CLI Plugin](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin) to deploy MTA archive to Cloud Fountry.

### Download and Installation

Import the extension into your Visual Studio Code.
Run `npm install` to install all the needed dependencies.

### Contributing

Contributions are greatly appreciated.
See [CONTRIBUTING.md](https://github.wdf.sap.corp/devx-wing/vscode-mta-tools/blob/master/.github/CONTRIBUTING.md) for details.

### Support

Please report [here](https://github.wdf.sap.corp/devx-wing/vscode-mta-tools/issues) on any issue.

### License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.

This file is licensed under the Apache 2.0 License [except as noted otherwise in the LICENSE file](https://github.wdf.sap.corp/devx-wing/vscode-mta-tools/blob/master/LICENSE).

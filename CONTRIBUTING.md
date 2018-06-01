# Contribution Guidelines

Thank you for your interest in contributing to this project!

The following is a set of guidelines for contributing to **GDPR CLI**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## How can I contribute?

### Reporting bugs

Bugs are tracked on [Github Issues](https://github.com/mirkoschubert/gdpr-cli/issues). Before you open a new bug report on this section, please check if the bug already exists. If you find a closed issue with the same thing you're experiencing, open a new issue and include a link to the original issue.

Explain the problem and include additional details to help maintainers reproduce the problem. You can also use the [Bug Report Template](https://github.com/mirkoschubert/gdpr-cli/blob/master/.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Enhancements

You can always suggest new features or other enhancements for this project on [Github Issues](https://github.com/mirkoschubert/gdpr-cli/issues). Before you open a new enhancements report, please check if a similar suggestion already has been made. You should also check the [Road Map](https://github.com/mirkoschubert/gdpr-cli#roadmap) of this project, so you're not proposing any features which are already planned for the future.

Explain your suggestion as detailed as possible. You can also use the [Feature Request Template](https://github.com/mirkoschubert/gdpr-cli/blob/master/.github/ISSUE_TEMPLATE/feature_request.md).

### Your Code Contribution

Unsure where to begin contributing to **GDPR CLI**? You can start with looking if any [help-wanted](https://github.com/mirkoschubert/gdpr-cli/labels/help%20wanted) issues are open.

I'm really bad with writing tests, so if you're better with these kind of things, you can definitely help me. I'm using [Ava](https://github.com/avajs/ava) for now, but you can also suggest an alternative.

### Pull Requests

You're always welcome so send pull requests (PRs) for optimizing my code, implementing a existing task, suggesting new enhancements or fixing bugs. Before you do, please read my [Coding Standards] and have the following points in mind:

* If you're refering to an open issue, include the issue number to the description.
* Send pull requests **only** to the `dev` branch.
* Avoid platform dependant code and code for `node@10` only.
* Please comment new code intelligibly.
* If you don't use `Visual Studio Code` and the extentions `Todo+` and `Projects+ Todo+`, do **not** touch the `TODO.md` file.

## Coding Standards

I code using `Visual Studio Code` with extentions like `prettier`, `eslint`, `Todo+` and `Highlight`, but those extentions aren't mandatory. But you should use an indentation of 2 spaces and only single quotes if possible.

Please try to be in accordance with the already existing classes and modules. If you would change the basic structure of the software, discuss it with me first.

As of now there are two main branches:

* `master` is the official (and hopefully stable) version of the tool, wich is mainly used for [npm](https://www.npmjs.com/package/gdpr-cli) and the [releases](https://github.com/mirkoschubert/gdpr-cli/releases).
* `dev` is the »developer edition« of the software and the main branch to push changes to.

Since the `dev` branch is usually ahead, please use this one for your development and any PRs.

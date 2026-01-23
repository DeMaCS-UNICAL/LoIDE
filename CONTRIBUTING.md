# Contributing to _Lo_**IDE**

<!--
Inspired by:
 - https://github.com/nayafia/contributing-template/blob/master/CONTRIBUTING-template.md
 - http://mozillascience.github.io/working-open-workshop/contributing
-->

<!-- Table of Contents -->
- [Contributing to _Lo_**IDE**](#contributing-to-loide)
  - [Types of contributions](#types-of-contributions)
  - [How to](#how-to)
    - [File a bug report](#file-a-bug-report)
    - [Suggest a new feature](#suggest-a-new-feature)
    - [Contribute to a repository](#contribute-to-a-repository)
    - [Submit a pull request](#submit-a-pull-request)
  - [Appendix](#appendix)
    - [Syncing Your Fork with Upstream `develop`](#syncing-your-fork-with-upstream-develop)

First off, thanks for taking the time to contribute to _Lo_**IDE**! :+1:  
It's people like you that make _Lo_**IDE** such a great tool.

The following is a set of guidelines for contributing to _Lo_**IDE** on GitHub.
These are mostly guidelines, not rules.
Use your best judgment, and feel free to propose changes to this document in a pull request.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project.
In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

All contributors are expected to follow the _Lo_**IDE** **Code of Conduct**.

## Types of contributions

_Lo_**IDE** is an open source project, and we love to receive contributions from our community — you!
There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into _Lo_**IDE** itself.

Specifically, contributions to any component of the _Lo_**IDE** project are welcome:

- [LoIDE-PWA](https://github.com/DeMaCS-UNICAL/LoIDE-PWA)
- [LoIDE-API-Server](https://github.com/DeMaCS-UNICAL/LoIDE-API-Server)
- [LoIDE-Classic](https://github.com/DeMaCS-UNICAL/LoIDE-Classic)
- [PythonESE](https://github.com/DeMaCS-UNICAL/PythonESE)
- [EmbASPServerExecutor](https://github.com/DeMaCS-UNICAL/EmbASPServerExecutor)

Furthermore, contributions to the documentation held within this repository, and to the [Wiki](https://github.com/DeMaCS-UNICAL/LoIDE/wiki), are also greatly appreciated.

<!-- TODO Explain contributions you are NOT looking for (if any). -->

<!-- TODO Your roadmap or vision for the project -->
<!-- TODO How contributors should (or should not) get in touch with you -->

## How to

### File a bug report

When submitting a bug report, please include a clear and concise description of the issue, the steps to reproduce it, the expected behaviour, and the actual behaviour.
Providing detailed information like the operating system, browser version (if applicable), and any relevant error messages significantly increases the likelihood of a quick resolution.
Ideally, use the provided issue templates to structure your report, as they prompt for essential details.
Screenshots or even short screen recordings can be incredibly helpful in visualizing the problem.
Please remember to search existing issues before creating a new one to avoid duplicates.
A well-written bug report not only assists the developers in understanding and fixing the issue but also benefits the wider community by providing a documented history of known issues and their solutions.

### Suggest a new feature

When proposing a new feature, prioritize clarity and context.
Begin by outlining the problem the feature aims to solve and why it's important to address it.
Describe the desired functionality in detail, including any specific use cases or scenarios.
Consider providing mockups or sketches to visually represent the proposed changes.
It's also valuable to discuss potential alternative solutions or existing implementations and explain why your approach is preferred.
This collaborative approach reduces the likelihood of wasted effort and encourages the development of features that truly benefit the _Lo_**IDE** ecosystem.

### Contribute to a repository

We use a Gitflow workflow to manage development.
You can learn more about Gitflow at:
[Gitflow Workflow | Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

Here's a brief summary on how to contribute:

1. **Identify an open issue:**  
   Before beginning work on a bug fix or new feature, please check the issue tracker to see if it's already been reported or discussed.
   Duplicate reports create unnecessary noise and can slow down progress.
   If you don't find an existing issue, [file a bug report](#file-a-bug-report) or [suggest a new feature](#suggest-a-new-feature) following the guidelines provided.
2. **Create a Feature/Bugfix Branch:**  
   Create a new branch, from the `develop` branch, for your feature or bug fix.
   The easiest way is to use the functionality already provided by GitHub: [Creating a branch to work on an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-a-branch-for-an-issue).  
   Otherwise, please use a descriptive naming convention:
   - `feature/<feature-name>` for new features
   - `fix/<bug-description>` for bug fixes

   > [!IMPORTANT]  
   > Please note that if a branch already exists for the feature you want to work on, commits should be made to that branch (unless starting from scratch is preferable) rather than creating a new one.

3. **Submit a Pull Request:**  
   Once you've completed your changes, submit a Pull Request (PR) from your feature/bugfix branch to the `develop` branch of the main _Lo_**IDE** repository.
   See [Submit a pull request](#submit-a-pull-request) for details.

Please note that if you do not have write access to the repository, you must ensure your local `develop` branch is up-to-date with the main LoIDE repository before proceeding to step 2.
See [Syncing Your Fork with Upstream `develop`](#syncing-your-fork-with-upstream-develop) for further information on this step.

### Submit a pull request

Pull requests (PRs) are the primary mechanism for contributing code changes to _Lo_**IDE**.
To ensure a smooth and efficient review process, it's essential to follow established best practices.
Keep pull requests concise and focused on a single logical change (feature or bug), making them easier to understand and review.
Ensure your code adheres to the project's coding style and includes comprehensive unit tests to verify functionality and prevent regressions.
A well-written pull request should include a clear and informative description of the changes, the rationale behind them, and any relevant context or dependencies.
Furthermore, it should address any open issues or feedback provided during the review process.
Prior to submission, rebase your branch against the latest `develop` branch to avoid merge conflicts and maintain a clean commit history.
Whenever you create a new pull request, please add a team member for review.

If a PR introduces significant structural changes or new functionalities requiring documentation in the Wiki, the PR should include proposed descriptions and/or figures (as correctly done in this PR) that will be incorporated into the Wiki once merged.

Each new feature should include (at least) some unit tests that allow us to verify its correctness.
This is not only a best-practice, but also the (only) viable way to maintain a small project like ours with the limited effort we can dedicate to it. We will have no time to write tests later or undertake significant refactoring.

Whenever new libraries are introduce, include a brief comment explaining their purpose and rationale.
Maintaining up-to-date and cohesive libraries is a significant undertaking, which we must therefore minimise.
**Write Clear Commit Messages:**  Use concise and informative commit messages.
**Follow Code Style:**  Adhere to the project's code style.

-----

## Appendix

Useful notes and guidelines to perform some actions mentioned in this document.

### Syncing Your Fork with Upstream `develop`

To merge the upstream `develop` branch into your fork, you need to first set up the **original repository** as a remote called **`upstream`** (if you haven't already), fetch the changes, and then merge or rebase them into your local `develop` branch.

Here are the step-by-step instructions using the **Git command line**:  
(note that the following steps assume you have already **cloned your fork** to your local machine and your fork is set as the `origin` remote)

1. Add the Upstream Remote (One-Time Setup):  
   If you have never configured a remote for the original repository, you need to add it. You can check your existing remotes with `git remote -v`.

    ```bash
    # Replace <ORIGINAL_OWNER> and <ORIGINAL_REPOSITORY> with the actual details
    git remote add upstream https://github.com/<ORIGINAL_OWNER>/<ORIGINAL_REPOSITORY>.git

    # Verify that the new remote is set up
    git remote -v
    ```

2. Fetch the Upstream Changes:  
   Fetch the branches and commits from the upstream repository, storing them in remote-tracking branches (like `upstream/develop`).

    ```bash
    git fetch upstream
    ```

3. Check Out Your Local `develop` Branch:  
   Switch to your fork's local `develop` branch, which is the branch you want to update.

    ```bash
    git checkout develop
    ```

4. Merge Upstream `develop` into Your Local Branch:  
   You have two options for incorporating the changes: **merge** or **rebase**.
    - **Option A: Merge (Recommended for a simple sync)**  
      This creates a **merge commit** in your history, explicitly showing where the upstream changes were incorporated. This is the safest default choice, especially if others are collaborating on your fork.

        ```bash
        git merge upstream/develop
        ```

    - **Option B: Rebase (For a cleaner, linear history)**  
      This moves your local commits (if any) to the _top_ of the upstream changes, resulting in a perfectly linear history without a merge commit. **Do not rebase if you have already pushed your `main` branch commits to your remote fork** and others are working with your fork, as it rewrites history.

        ```bash
        git rebase upstream/develop
        ```

    > **Note:** If Git encounters **merge conflicts** during the merge or rebase, you will need to manually resolve them in the affected files, `git add` the files, and then continue (either `git merge --continue` or `git rebase --continue`).

5. Push the Updated Branch:  
   Once the merge/rebase is complete and all conflicts are resolved, push the updated `develop` branch to your remote fork (`origin`).

    ```bash
    git push origin develop
    ```

Your fork's `develop` branch is now synchronized with the upstream repository's `develop` branch.

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
    - [Submit effective bug reports](#submit-effective-bug-reports)
    - [Propose a new feature](#propose-a-new-feature)
    - [Contribute to a repository](#contribute-to-a-repository)
    - [Submit a pull request](#submit-a-pull-request)
    - [Merge a Pull Request](#merge-a-pull-request)
    - [Create a release](#create-a-release)
  - [Appendix](#appendix)
    - [Syncing Your Fork with Upstream `develop`](#syncing-your-fork-with-upstream-develop)
    - [Merging and Syncing branches](#merging-and-syncing-branches)
      - [Feature branch → `develop`](#feature-branch--develop)
      - [Hotfix branch → `main`](#hotfix-branch--main)

First off, thanks for taking the time to contribute to _Lo_**IDE**! :+1:  
It's people like you that make _Lo_**IDE** such a great tool.

The following is a set of guidelines for contributing to _Lo_**IDE** on GitHub.
These are mostly guidelines, not rules.
Use your best judgment, and feel free to propose changes to this document in a pull request.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project.
In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

All contributors are expected to follow the [_Lo_**IDE** **Code of Conduct**](./CODE_OF_CONDUCT.md).

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

### Submit effective bug reports

Here's how to best report bugs, ensuring a faster resolution for everyone:

- **Clear Description:** Provide a concise explanation of the problem.
- **Steps to Reproduce:** Detail the exact steps needed to trigger the bug.
- **Expected vs. Actual Behaviour:** Clearly state what _should_ happen and what _actually_ happens.
- **Detailed Information:** Include your operating system, browser version (if relevant), and any error messages.
- **Use Issue Templates:** Leverage provided templates for structured reporting.
- **Visual Aids:** Screenshots or screen recordings are highly valuable.
- **Search First:** Check for existing reports to avoid duplicates.

A thorough bug report helps developers and the community efficiently address and track issues, leading to a better user experience.

### Propose a new feature

Here's how to effectively propose a new feature:

- **Problem Statement:** Clearly define the problem your feature addresses and explain its importance.
- **Detailed Functionality:** Describe the desired functionality thoroughly, including specific use cases and scenarios.
- **Visual Aids (Optional):** Consider mockups or sketches to illustrate the proposed changes.
- **Alternative Solutions:** Discuss potential alternatives and justify your preferred approach.

Following these steps fosters collaboration and maximizes the impact of new features.

### Contribute to a repository

Gitflow workflow is used to manage development.
You can learn more about Gitflow at:
[Gitflow Workflow | Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

Here's a brief summary on how to contribute:

1. **Identify an open issue:**  
   Before beginning work on a bug fix or new feature, please check the issue tracker to see if it's already been reported or discussed.
   Duplicate reports create unnecessary noise and can slow down progress.
   If you don't find an existing issue, [file a bug report](#submit-effective-bug-reports) or [suggest a new feature](#propose-a-new-feature) following the guidelines provided.
2. **Create a Feature/Bugfix Branch:**  
   Create a new branch, from the `develop` branch, for your feature or bug fix.
   The easiest way is to use the functionality already provided by GitHub: [Creating a branch to work on an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-a-branch-for-an-issue)
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

Here's a breakdown of key guidelines:

- **Concise & Focused PRs:** Each pull request should address a single logical change (feature or bug).
- **Code Quality:** Ensure code adheres to project style and standards.
- **Commit Messages:** Write concise and informative commit messages.
- **Informative Descriptions:** Provide a clear description of changes, rationale, and context. Address feedback during review.
- **Unit Tests:** Include unit tests for each new feature to verify correctness.
  - not only a best-practice, but the (only) viable way to maintain a small project with limited effort; we won't have time for tests or refactoring later.
- **Library Rationale:** Briefly comment on the purpose of any new library introduced.
  - maintaining up-to-date and cohesive libraries is a significant undertaking, which we must therefore minimise.
- **Rebasing:** Rebase your branch against `develop` before submission to avoid conflicts and maintain a clean history.
- **Reviewers:** Add a team member for review upon creation.
- **Wiki Updates:** For significant changes, include proposed Wiki descriptions/figures in the PR.

These best practices ensure a smooth and efficient code review process.

### Merge a Pull Request

To keep the branching model clean and the release history reproducible, the appropriate merge strategy should be applied according to Git‑Flow conventions when a PR is ready, based on its type:

| Type        | Target    | Merge strategy       | Rationale                                                         |
|-------------|-----------|----------------------|-------------------------------------------------------------------|
| **Feature** | `develop` | **Squash and Merge** | Collapse all feature commits into one clean commit on `develop`.  |
| **Hotfix**  | `main`    | **3‑way merge**      | Preserve the hotfix history on `main`.\*                          |

\* After a hotfix, always sync `develop` with `main` to avoid diverging histories.
To guarantee that the same commit appears in both `main` and `develop`, merge `main` into `develop`.

See [Merging and Syncing branches](#merging-and-syncing-branches) for further information on this step.

### Create a release

A release can now be generated following the Git Flow methodology, by transferring changes from `develop` to `main` while preserving the full commit history, using a GitHub Action:

1. Navigate to **Actions** → **Create Release**
2. Click **Run workflow**
3. Enter the version number (e.g., `1.5.0`)
4. Optionally, check "Mark as pre-release" for beta/RC versions
5. Click **Run workflow**

No further steps are required.

-----

## Appendix

Notes and guidance for carrying out the actions described in this document.

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

### Merging and Syncing branches

#### Feature branch → `develop`

Use the GitHub **Squash and Merge** button or, if you prefer the CLI, run:

```bash
git checkout develop
git merge --no-ff --squash feature-branch
git commit -m "Squash merge feature‑branch"
```

#### Hotfix branch → `main`

Use the GitHub **Merge** button or, if you prefer the CLI, run:

```bash
   git checkout main
   git merge --no-ff hotfix-branch

   # Sync develop after hotfix
   git checkout develop
   git merge --no-ff main
```

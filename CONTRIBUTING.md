# **Contributing Guidelines** 📄

This documentation contains a set of guidelines to help you during the contribution process.
We are happy to welcome all the contributions from anyone willing to improve/add new scripts to this project.
Thank you for helping out and remember, **no contribution is too small.**
<br>
Please note we have a [code of conduct](CODE_OF_CONDUCT.md)  please follow it in all your interactions with the project.

<hr>

## Contribution

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

- If you have any suggestions for the project, such as reporting a bug, improving the UI, or enhancing the README.md file, feel free to **open an issue** to discuss it or directly create a pull request with the necessary changes.
- Please make sure to check your spelling and grammar.
- Create individual pull requests for each suggestion to keep changes focused and manageable.

Your involvement helps to improve the project and make it better for everyone. Thank you for your contributions!

<hr>

## How to Contribute ?

1. **Star the Repo**

2. **Fork the Project:**
    - Click on the "Fork" button at the top right corner of the repository's page on GitHub to create your own copy of the project.

3. **Clone Your Forked Repository:**
    - Clone the forked repository to your local machine using the following command:
    ```sh
     git clone https://github.com/<your_user_name>/BlogLog
    ```
    - Navigate to project folder:
    ```sh
     cd BlogLog
    ```


4. **Set up environment variables:**
    - Create a .env file in the root directory and add the following:
    ```sh
    MONGODB_URI=mongodb://localhost:27017/bloglog
    ```
5. **Install npm packages:**
    ```sh
    npm install
    ```

6. **Add a reference(remote) to the original repository:**

    ```
    git remote add upstream https://github.com/jinx-vi-0/BlogLog
    ```
7. **Check the remotes for this repository.**
    ```
    git remote -v
    ```

8. **Always take a pull from the upstream repository to your master branch to keep it at par with the main project (updated repository).**
    ```
    git pull upstream main
    ```

9. **Create a New Branch and Move to the Branch:**
    - Create a new branch for your changes and move to that branch using the following commands:
    ```sh
    git checkout -b <branch-name>
    ```

10. **Add Your Changes:**
    - After you have made your changes, check the status of the changed files using the following command:
    ```sh
    git status -s
    ```
    - Add all the files to the staging area using the following command:
    ```sh
    git add .
    ```
    or add specific files using:
    ```sh
    git add <file_name1> <file_name2>
    ```
11. **Commit Your Changes:**
    - Commit your changes with a descriptive message using the following command:
    ```sh
    git commit -m "<EXPLAIN-YOUR_CHANGES>"
    ```

12. **Push Your Changes:**
    - Push your changes to your forked repository on GitHub using the following command:
    ```sh
    git push origin <branch-name>




### Creating Pull Request

13. **Open a Pull Request:**
    - Go to the GitHub page of your forked repository, and you should see an option to create a pull request. Click on it, provide a descriptive title and description for your pull request, and then submit it.


<hr>

### Alternatively contribute using GitHub Desktop
<hr>

1. **Open GitHub Desktop:**
   Launch GitHub Desktop and log in to your GitHub account if you haven't already.

2. **Clone the Repository:**
   - If you haven't cloned the BlogLog repository yet, you can do so by clicking on the "File" menu and selecting "Clone Repository."
   - Choose the BlogLog repository from the list of repositories on GitHub and clone it to your local machine.

3. **Switch to the Correct Branch:**
   - Ensure you are on the branch that you want to submit a pull request for.
   - If you need to switch branches, you can do so by clicking on the "Current Branch" dropdown menu and selecting the desired branch.

4. **Make Changes:**
   Make your changes to the code or files in the repository using your preferred code editor.

5. **Commit Changes:**
   - In GitHub Desktop, you'll see a list of the files you've changed. Check the box next to each file you want to include in the commit.
   - Enter a summary and description for your changes in the "Summary" and "Description" fields, respectively. Click the "Commit to <branch-name>" button to commit your changes to the local branch.

6. **Push Changes to GitHub:**
   After committing your changes, click the "Push origin" button in the top right corner of GitHub Desktop to push your changes to your forked repository on GitHub.

7. **Create a Pull Request:**
  - Go to the GitHub website and navigate to your fork of the BlogLog repository.
  - You should see a button to "Compare & pull request" between your fork and the original repository. Click on it.

8. **Review and Submit:**
   - On the pull request page, review your changes and add any additional information, such as a title and description, that you want to include with your pull request.
   - Once you're satisfied, click the "Create pull request" button to submit your pull request.

9. **Wait for Review:**
    Your pull request will now be available for review by the project maintainers. They may provide feedback or ask for changes before merging your pull request into the main branch of the BlogLog repository.

## **Issue Report Process 📌**

1. Go to the project's issues.
2. Give proper description for the issues.
3. Don't spam to get the assignment of the issue 😀.
4. Wait for till someone is looking into it !.
5. Start working on issue only after you got assigned that issue 🚀.

## **Pull Request Process 🚀**

1. Ensure that you have self reviewed your code 😀
2. Make sure you have added the proper description for the functionality of the code
3. I have commented my code, particularly in hard-to-understand areas.
4. Add screenshot it help in review.
5. Submit your PR by giving the necesarry information in PR template and hang tight we will review it really soon 🚀




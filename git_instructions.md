# Git Push Instructions

Follow these steps to push the Wildfire Detection System code to the GitHub repository:

## Prerequisites
- Git installed on your system
- GitHub account with appropriate permissions for the repository

## Steps

1. **Open Command Prompt or Terminal**
   - Navigate to your project directory:
   ```
   cd /c:/lemon/Wildfire detection
   ```

2. **Initialize Git Repository** (if not already done)
   ```
   git init
   ```

3. **Add Files to Staging**
   ```
   git add index.html
   git add styles.css
   git add script.js
   ```
   
   Or add all files at once:
   ```
   git add .
   ```

4. **Commit the Changes**
   ```
   git commit -m "Initial commit: Wildfire Detection System"
   ```

5. **Add the Remote Repository**
   ```
   git remote add origin https://github.com/aravinthcheran/early_wildfire_detection_system.git
   ```

6. **Push to GitHub**
   ```
   git push -u origin master
   ```
   
   Note: If the default branch is 'main' rather than 'master', use:
   ```
   git push -u origin main
   ```

7. **Authentication**
   - You'll be prompted to enter your GitHub username and password
   - For security, GitHub now requires a Personal Access Token instead of a password
   - If you don't have a token, create one at: GitHub → Settings → Developer settings → Personal access tokens

## Troubleshooting

- **Permission denied error**: Ensure you have write access to the repository
- **Rejected push**: Try pulling first with `git pull origin main --rebase`
- **Unable to push large files**: Check if any files exceed GitHub's size limit

## Additional Commands

- Check repository status: `git status`
- View commit history: `git log`
- Create and switch to a new branch: `git checkout -b branch-name`

# 📋 JobSphere - Complete Setup Guide for Beginners

Welcome to **JobSphere** - a modern, full-featured job portal application built with Flask! This guide will walk you through every step to get the application running on your computer.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Step-by-Step Installation](#step-by-step-installation)
4. [Running the Application](#running-the-application)
5. [Features Overview](#features-overview)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)

---

## 📦 Prerequisites

Before you start, make sure you have:

- **Windows** (or Mac/Linux with similar commands)
- **Internet connection** (to download dependencies)
- **Git** (to clone the repository) - [Download Git](https://git-scm.com/)
- **Python 3.8 or higher** - [Download Python](https://www.python.org/downloads/)

### Check if Python is Installed

Open **PowerShell** or **Command Prompt** and run:

```bash
python --version
```

You should see something like: `Python 3.10.5` or higher.

---

## 🖥️ System Requirements

| Component | Requirement |
|-----------|------------|
| OS | Windows 10+, Mac, or Linux |
| Python | 3.8 or higher |
| RAM | 2GB minimum |
| Disk Space | 500MB minimum |
| Browser | Chrome, Firefox, Safari, or Edge (modern versions) |

---

## 🚀 Step-by-Step Installation

### **Step 1: Download/Clone the Project**

#### Option A: Using Git (Recommended)

Open **PowerShell** and run:

```bash
git clone https://github.com/YOUR_USERNAME/jobsphere.git
cd "Job Application"
```

#### Option B: Download as ZIP

1. Go to the GitHub repository
2. Click **Code** → **Download ZIP**
3. Extract the ZIP file to your desired location
4. Open **PowerShell** and navigate to the folder:

```bash
cd "Path\To\Job Application"
```

---

### **Step 2: Create a Virtual Environment**

A virtual environment isolates project dependencies so they don't conflict with other Python projects.

Run this command in PowerShell:

```bash
python -m venv .venv
```

This creates a `.venv` folder in your project directory.

---

### **Step 3: Activate the Virtual Environment**

Now activate it by running:

```bash
.venv\Scripts\Activate.ps1
```

If you get an error about execution policy, run this first:

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Then try again:

```bash
.venv\Scripts\Activate.ps1
```

**✅ Success indicators:**
- Your PowerShell prompt should show `(.venv)` at the beginning
- Example: `(.venv) C:\Users\YourName\Job Application>`

---

### **Step 4: Install Dependencies**

All required packages are listed in `requirements.txt`. Install them with:

```bash
pip install -r jobsphere/requirements.txt
```

Wait for the installation to complete. You should see messages like:
```
Successfully installed Flask-3.0.0
Successfully installed Flask-Login-0.6.3
...
```

---

### **Step 5: Initialize the Database**

The application uses SQLite, a lightweight database that stores all data locally.

Navigate to the jobsphere directory and seed the database with sample data:

```bash
cd jobsphere
python seed_data.py
```

You should see output like:
```
Database seeded with sample data!
```

This creates a `jobsphere.db` file with:
- Sample job listings
- Test user accounts
- Sample applications

---

### **Step 6: Configure Environment Variables (Optional)**

Create a `.env` file in the `jobsphere` folder for sensitive settings:

```bash
# In jobsphere/ directory
echo. > .env
```

Open `.env` with your text editor and add:

```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-this
DATABASE_URL=sqlite:///jobsphere.db
```

---

## ▶️ Running the Application

### **Start the Development Server**

Make sure you're in the `jobsphere` directory and the virtual environment is activated. Then run:

```bash
python app.py
```

You should see output like:

```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
 * WARNING: This is a development server. Do not use it in production.
```

---

### **Access the Application**

Open your web browser and go to:

```
http://127.0.0.1:5000
```

Or simply click: [http://localhost:5000](http://localhost:5000)

🎉 **The application is now running!**

---

## 📱 Using the Application

### **Home Page**
- Browse available features
- See job listings overview
- Access navigation menu

### **Sign Up / Login**

**Test Accounts** (created during seeding):

#### Job Seeker Account:
- **Email:** seeker@example.com
- **Password:** password123
- **Role:** Job Seeker

#### Employer Account:
- **Email:** employer@example.com
- **Password:** password123
- **Role:** Employer

Or create your own account by clicking **"Join Now"** → **"Sign Up"**

---

### **Key Features to Explore**

1. **Browse Jobs** (available for all)
   - View job listings
   - Filter by location, type, experience level
   - Apply to jobs (requires seeker account)

2. **Post Jobs** (employer account required)
   - Create new job postings
   - Manage your listings
   - View applications

3. **Dashboard** (after login)
   - Seeker: View applications and saved jobs
   - Employer: Manage job postings and view candidates

4. **Theme Switcher** (top-right)
   - Toggle between **Light** and **Dark** modes
   - Themes persist across sessions

5. **Weather Effects** (Light theme only)
   - Click the cloud icon (top-right)
   - Select: Rain ☁️, Snow ❄️, Sunny ☀️, Pollen 🌸, or Clear
   - Effects are subtle and don't block content

6. **Notifications**
   - Bell icon in navbar
   - View application updates
   - Receive notifications in real-time

---

## 🔧 Stopping the Application

To stop the development server:

1. Go to PowerShell where the app is running
2. Press **Ctrl + C**

You should see: `Keyboard interrupt received, shutting down.`

---

## 🐛 Troubleshooting

### **Problem: "python command not found"**

**Solution:** Python is not in your system PATH.

1. Uninstall Python and reinstall
2. ✅ Make sure to check **"Add Python to PATH"** during installation
3. Restart PowerShell and try again

---

### **Problem: Virtual environment won't activate**

**Solution:** Try the alternative command:

```bash
.venv\Scripts\activate.bat
```

Or on Mac/Linux:

```bash
source .venv/bin/activate
```

---

### **Problem: "ModuleNotFoundError: No module named 'flask'"**

**Solution:** Virtual environment isn't activated or dependencies not installed.

1. Check if `(.venv)` shows in your PowerShell prompt
2. If not, activate it: `.venv\Scripts\Activate.ps1`
3. Run: `pip install -r jobsphere/requirements.txt`

---

### **Problem: "Address already in use"**

**Solution:** Port 5000 is being used by another application.

Option 1: Stop the other application using port 5000

Option 2: Run Flask on a different port:

```bash
python app.py --port 5001
```

Then visit: `http://127.0.0.1:5001`

---

### **Problem: Database errors or "no such table"**

**Solution:** Reseed the database:

```bash
cd jobsphere
python seed_data.py
python app.py
```

---

### **Problem: CSS/JavaScript not loading (styling looks broken)**

**Solution:** Clear your browser cache:

1. Press **Ctrl + Shift + Delete** (or Cmd + Shift + Delete on Mac)
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear"
5. Refresh the page: **F5** or **Ctrl + R**

---

## 📁 Project Structure

```
Job Application/
│
├── .venv/                          # Virtual environment (created during setup)
│
├── jobsphere/                      # Main application folder
│   ├── app.py                      # Main Flask application
│   ├── config.py                   # Configuration settings
│   ├── models.py                   # Database models (User, Job, Application)
│   ├── forms.py                    # Web forms (Login, Register, Job posting)
│   ├── decorators.py               # Custom decorators
│   ├── utils.py                    # Utility functions
│   ├── seed_data.py                # Sample data generator
│   ├── requirements.txt            # Python dependencies list
│   ├── jobsphere.db                # SQLite database (created after seeding)
│   │
│   ├── static/                     # Static files (CSS, JavaScript, Images)
│   │   ├── css/
│   │   │   ├── main.css            # Main styles
│   │   │   ├── themes.css          # Light/Dark theme styles
│   │   │   ├── components.css      # Component styles (cards, buttons, weather UI)
│   │   │   └── animations.css      # Animation definitions
│   │   │
│   │   └── js/
│   │       ├── theme.js            # Theme switcher logic
│   │       ├── weather.js          # Weather effects system
│   │       ├── ui.js               # General UI interactions
│   │       ├── nature.js           # Light theme animations (deprecated)
│   │       └── stars.js            # Dark theme animations (deprecated)
│   │
│   └── templates/                  # HTML templates
│       ├── base.html               # Base template (used by all pages)
│       ├── index.html              # Home page
│       ├── auth/
│       │   ├── login.html          # Login page
│       │   └── register.html       # Registration page
│       ├── jobs/
│       │   ├── list.html           # Job listings page
│       │   ├── detail.html         # Single job detail page
│       │   └── post.html           # Post new job page (employer)
│       ├── dashboard/
│       │   ├── seeker.html         # Job seeker dashboard
│       │   └── employer.html       # Employer dashboard
│       ├── applications/
│       │   └── list.html           # View applications
│       └── notifications/
│           └── list.html           # Notifications page
│
└── SETUP.md                        # This file!
```

---

## 🎨 Customization

### **Change the Application Title**

Edit `jobsphere/templates/base.html`:

```html
<title>{% block title %}JobSphere - Your world of opportunities{% endblock %}</title>
```

Change "JobSphere" and "Your world of opportunities" to your preferred text.

---

### **Customize Colors**

Edit `jobsphere/static/css/themes.css`:

```css
:root[data-theme="light"] {
    --accent-primary: #2E7D52;      /* Green */
    --accent-secondary: #5B8DB8;    /* Blue */
    --text-primary: #1A2E1A;        /* Dark text */
    --bg-primary: #FAFAF7;          /* Light background */
}
```

Change the hex color values and refresh your browser.

---

### **Add More Test Users**

Edit `jobsphere/seed_data.py` and add more user entries, then run:

```bash
python seed_data.py
```

---

## 📚 Learning Resources

- **Flask Documentation:** https://flask.palletsprojects.com/
- **SQLAlchemy:** https://www.sqlalchemy.org/
- **HTML/CSS Basics:** https://developer.mozilla.org/en-US/docs/Web/
- **JavaScript:** https://javascript.info/

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the Troubleshooting section** above
2. **Google the error message** - it's usually a common issue
3. **Check Flask error logs** in your terminal
4. **Review the project documentation** in comments
5. **Create a GitHub issue** with detailed error information

---

## 🚀 Next Steps

1. **Explore the code** - Read through `app.py` to understand the structure
2. **Make changes** - Customize colors, add features, modify templates
3. **Test thoroughly** - Create accounts, post jobs, apply for jobs
4. **Deploy** - When ready, deploy to a server (Heroku, AWS, DigitalOcean)

---

## 📝 Important Notes

- 🔒 **Never share your `.env` file** or SECRET_KEY publicly
- 🗑️ **Don't commit database files** (`jobsphere.db`) to version control
- 🐛 **Development mode is for testing only** - not for production
- 📱 **Always test on multiple browsers** for compatibility
- 🔄 **Restart the server** after making code changes

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Virtual environment created and activated
- [ ] All dependencies installed without errors
- [ ] Database seeded successfully
- [ ] Application running on http://127.0.0.1:5000
- [ ] Can access home page
- [ ] Can log in with test accounts
- [ ] Jobs display correctly
- [ ] Theme switcher works
- [ ] Weather effects visible in light theme
- [ ] Responsive design works on different screen sizes

---

## 🎓 For Beginners: Key Concepts

### **What is Flask?**
A lightweight Python web framework for building web applications with ease.

### **What is SQLite?**
A simple, file-based database perfect for learning and small projects.

### **What is a Virtual Environment?**
An isolated Python environment where packages are installed separately from your system Python, preventing conflicts.

### **What is localhost:5000?**
- `localhost` or `127.0.0.1` = Your local computer
- `5000` = Port number (like a "channel" on your computer)
- Together they mean: "Open the web app on my computer at this specific port"

---

## 🎉 Congratulations!

You've successfully set up JobSphere! Start exploring and building. Happy coding! 🚀

---

**Last Updated:** May 2026  
**Version:** 1.0.0  
**Status:** Development

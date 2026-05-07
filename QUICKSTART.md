# 🚀 JobSphere - Quick Start Guide

Get the JobSphere application running in **5 minutes**!

---

## ⚡ Quick Setup (Copy & Paste)

### **1. Open PowerShell**

Press `Win + X` and select **Windows PowerShell (Admin)**

### **2. Navigate to Project**

```bash
cd "C:\Path\To\Job Application"
```

### **3. Create Virtual Environment**

```bash
python -m venv .venv
```

### **4. Activate Virtual Environment**

```bash
.venv\Scripts\Activate.ps1
```

**If error:** Try this first:
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

### **5. Install Dependencies**

```bash
pip install -r jobsphere/requirements.txt
```

### **6. Seed Database**

```bash
cd jobsphere
python seed_data.py
```

### **7. Run Application**

```bash
python app.py
```

### **8. Open in Browser**

Visit: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔐 Test Login Credentials

### **Job Seeker:**
- Email: `seeker@example.com`
- Password: `password123`

### **Employer:**
- Email: `employer@example.com`
- Password: `password123`

---

## 🎮 Common Commands

| Task | Command |
|------|---------|
| **Activate Virtual Env** | `.venv\Scripts\Activate.ps1` |
| **Deactivate Virtual Env** | `deactivate` |
| **Install Dependencies** | `pip install -r jobsphere/requirements.txt` |
| **Start App** | `python app.py` (in jobsphere folder) |
| **Stop App** | Press `Ctrl + C` |
| **Reset Database** | `python seed_data.py` |
| **Check Python Version** | `python --version` |
| **List Installed Packages** | `pip list` |
| **Update Pip** | `python -m pip install --upgrade pip` |

---

## 📍 Expected Output

When everything works:

```
(.venv) C:\Users\YourName\Job Application\jobsphere> python app.py
 * Running on http://127.0.0.1:5000
 * Debug mode: on
 * WARNING: This is a development server...
```

Then you should see **JobSphere** homepage at http://127.0.0.1:5000

---

## ❌ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"python not found"** | Reinstall Python with "Add to PATH" option |
| **"Module not found"** | Activate venv: `.venv\Scripts\Activate.ps1` |
| **"Port already in use"** | Run: `python app.py --port 5001` |
| **Styling looks broken** | Press `Ctrl + Shift + Delete` → clear cache → refresh |
| **"Permission denied"** | Run PowerShell as Administrator |

---

## 📚 Next Steps

1. **Read SETUP.md** for detailed explanations
2. **Explore the code** in `app.py`
3. **Create an account** and test features
4. **Modify colors/text** to customize
5. **Deploy** when ready

---

**Need help?** See SETUP.md for detailed troubleshooting!

# 🚀 Hosting Guide: NXF CHAT ROOM (Free on Render.com)

To host your chat app for **free**, we will use **[Render.com](https://render.com/)**. It supports both the Node.js Backend and the React Frontend perfectly.

---

## 1️⃣ STEP 1: Upload to GitHub (Prerequisite)
1. Initialize Git in your project root:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   ```
2. Create a new **Public or Private** repository on **GitHub** (e.g., `nxf-chat-room`).
3. Push your code to GitHub:
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git branch -M main
   git push -u origin main
   ```

---

## 2️⃣ STEP 2: Deploy the BACKEND on Render
1. Log in to **[Render.com](https://dashboard.render.com)**.
2. Click **New +** ➡️ **Web Service**.
3. Connect your GitHub repository.
4. **Configure settings**:
   - **Name**: `nxf-chat-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node index.js`
   - **Plan**: Free
5. **Add Environment Variables** (under `Environment` tab):
   - `PORT` = `3001`
   - `FRONTEND_URL` = (Leave empty for now until you deploy the frontend).
6. Click **Create Web Service**. 
   - Render will build and give you a **Backend URL** (e.g., `https://nxf-chat-backend.onrender.com`). **Copy this URL.**

---

## 3️⃣ STEP 3: Deploy the FRONTEND on Render
1. Click **New +** ➡️ **Static Site** on Render.
2. Connect the **same** GitHub repository.
3. **Configure settings**:
   - **Name**: `nxf-chat-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free
4. **Add Environment Variables**:
   - `VITE_BACKEND_URL` = `https://nxf-chat-backend.onrender.com` (Use YOUR backend URL from STEP 2).
5. Click **Create Static Site**.
   - Render will build and give you a **Frontend URL** (e.g., `https://nxf-chat-frontend.onrender.com`).

---

## 4️⃣ STEP 4: Connect Backend with Frontend CORS
1. Go back to your **Backend Service** dashboard on Render.
2. In the **Environment** tab, update:
   - `FRONTEND_URL` = `https://nxf-chat-frontend.onrender.com` (Your Frontend URL from STEP 3).
3. Save changes. The backend will auto-restart.

🎉 **All Done!** Your app is live with real Audio Recording, Persistence, Multi-group, and search features!

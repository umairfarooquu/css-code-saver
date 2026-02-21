# Deploying SnipSave CLI to the Internet

SnipSave CLI is currently a local Node.js application that uses your local computer's hard drive to store data in `snippets.json` and `folders.json`. 

To put this app "online" so you can access it from anywhere, you need a hosting provider. However, you must choose a host that provides **Persistent File Storage**.

## ⚠️ The Ephemeral File System Warning

Many popular, free hosting platforms (like **Vercel**, **Netlify**, or the basic free tiers of **Heroku** and **Render**) use "ephemeral" filesystems. This means their servers spin up and down constantly. If you deploy SnipSave there:
- The app will run.
- You can save a snippet.
- A few hours later, the server will go to sleep. When it wakes up, `snippets.json` will be completely wiped clean back to its original state.

To prevent your snippets from deleting themselves, you must use one of the methods below.

---

## Option 1: The Easiest Free Method (Glitch.com)

[Glitch](https://glitch.com) is a platform built for fast, simple Node.js apps. Crucially, it provides a persistent file system in its `.data` folder, making it perfect for free SnipSave hosting.

**Steps:**
1. Go to [Glitch.com](https://glitch.com) and create a free account.
2. Click **New Project** -> **Import from GitHub** (you will need to push your local folder to a GitHub repository first).
3. Once imported, you need to tell Glitch where to safely store your JSON files. 
4. Open the Glitch terminal and run: `mkdir .data`
5. In your `server.js` file, change the paths to point to the secure data folder:
   ```javascript
   const DATA_FILE = path.join(__dirname, '.data', 'snippets.json');
   const FOLDERS_FILE = path.join(__dirname, '.data', 'folders.json');
   ```
6. Glitch will automatically run your `server.js` and give you a live URL (e.g., `https://your-snipsave.glitch.me`)!

---

## Option 2: The Professional Method (Render or Railway)

If you want a more robust, professional solution, platforms like **Render** or **Railway** are the modern standard.

**Steps (Using Render):**
1. Create a GitHub repository and push your `css-code-saver` folder to it.
2. Create an account on [Render.com](https://render.com).
3. Click **New** -> **Web Service**.
4. Connect your GitHub account and select your SnipSave repository.
5. Set the Build Command to `npm install` and the Start Command to `node server.js`.
6. **Crucial Step:** Scroll down to **Advanced** and click **Add Disk**.
   - Name: `snipsave-data`
   - Mount Path: `/opt/render/project/src/data`
   - Size: 1 GB
7. Update your `server.js` to point to the new disk mount path:
   ```javascript
   const DATA_FILE = path.join(__dirname, 'data', 'snippets.json');
   const FOLDERS_FILE = path.join(__dirname, 'data', 'folders.json');
   ```
8. Deploy! (Note: Render Disks technically require a paid tier, which is ~ $7/month).

---

## Option 3: Refactoring to a Real Database (MongoDB/PostgreSQL)

If you want to host it entirely for free on platforms like Vercel or Render, you must stop using `fs.writeFile` to save data to JSON files.

Instead, you would need to connect the Node.js backend to a cloud database, such as:
- **MongoDB Atlas** (Free Tier available)
- **Supabase / PostgreSQL** (Free Tier available)

If you replace the JSON file reads/writes in `server.js` with database queries, your app becomes completely "stateless." You could then deploy the backend to Render (Free) and the frontend to Netlify/Vercel (Free) effortlessly!


Aman Music — Electron App (source)

What this archive contains
- A ready-to-build Electron project containing the web-based Aman Music UI.
- To produce a Windows installer (setup.exe) you must build it on a Windows machine.

Requirements (on your Windows PC)
1. Install Node.js (18+ recommended) from https://nodejs.org
2. Open PowerShell or CMD in this project's folder.
3. Run these commands:
   npm install
   npm run dist
   (The dist step uses electron-builder and will create an NSIS installer in the 'dist' folder)

Notes & tips
- Building will download Electron (~50-120 MB). The final installer will be ~80–150 MB.
- If you get permissions issues when running npm run dist, try opening PowerShell as Administrator.
- If you want me to guide you through building step-by-step on your PC, tell me and I will provide the exact commands and troubleshoot errors.
- If you prefer, you can use an online CI (GitHub Actions) to build and attach the artifact — I can provide a sample GitHub Actions workflow for auto-building when you push this repo.

If you want a fully pre-built setup.exe but can't build it yourself, you can either:
- Ask a friend with Node.js to run the build steps and send you the setup.exe, OR
- I can provide detailed step-by-step remote guidance while you run the commands on your PC.

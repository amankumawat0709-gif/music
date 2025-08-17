.github/workflows/
name: Build Windows Installer

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Build installer
        run: npm run dist

      - name: Upload installer
        uses: actions/upload-artifact@v3
        with:
          name: AmanMusic-Installer
          path: dist/*.exe

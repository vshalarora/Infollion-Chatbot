# Infollion Chatbot (Powered by Gemini 2.5 Flash)

A full-stack, responsive chatbot web application built with **React** (Vite) and **Node.js** (Express). This project integrates the **Google Gemini API** (`gemini-2.5-flash`) to provide context-aware, multimodal AI conversational capabilities. It supports uploading text, PDFs, and images (PNG/JPG) as part of the conversation.

## 🌟 Features
- **Responsive Chat Interface**: Built with React and plain CSS for a sleek, dark-themed experience.
- **Multimodal Uploads**: Drag & drop or upload files directly:
  - 📄 `.pdf` & `.txt` support
  - 🖼️ `.png`, `.jpg`, & `.jpeg` image support
- **Context-Aware Sessions**: The chatbot remembers conversation history.
- **Image Previews**: Instantly preview uploaded images before sending.
- **Fast & Lightweight**: Powered by Vite and an Express backend using in-memory file handling.

---

## 📋 Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (Node Package Manager)
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

---

## 🚀 How to Install and Run

This project is separated into a `frontend` and a `backend`. You will need to run two separate terminal windows to start both servers.

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Set your Gemini API key (see section below).
4. Start the backend server:
   ```bash
   npm run dev
   # or node server.js
   ```
   *The backend will run on `http://localhost:3001`.*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

---

## 🔑 How to set Gemini API key

The backend requires your Gemini API key to communicate with Google's generative models.

1. Navigate to the `backend` folder.
2. Create a `.env` file (you can copy the `.env.example` file if one exists).
3. Open the `.env` file and configure it as follows:

   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3001
   ```
   *(Make sure to replace `your_actual_gemini_api_key_here` with your real key.)*

---

## 💡 Example Usage Steps

1. **Launch the app**: Open the provided frontend URL (e.g., `http://localhost:5173`) in your web browser.
2. **Start a conversation**: Type "Hello, who are you?" into the message box at the bottom and click the Send button (or press `Enter`). The bot will reply.
3. **Upload an image**: Click the paperclip icon (📎), select a `.jpg` or `.png` file. You will see a preview above the input box.
4. **Ask about the image**: Type "Describe what you see in this image" and hit Send.
5. **Upload a PDF/TXT**: Click the paperclip icon again, choose a `.pdf` file, type "Summarize this document," and send it.
6. **Reset Session**: Click the "**New Chat**" button in the top right to wipe the memory and start a fresh session.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Axios, Lucide React (Icons)
- **Backend**: Node.js, Express, Google Generative AI SDK, Multer (File Handling), PDF-Parse

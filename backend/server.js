const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || 'dummy_key';
const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-1.5-flash as it supports multimodality out of the box and is fast
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// In-memory store for chat histories
// Structure: Map<chatId, Array<{role: string, parts: Array<object>}>>
const chatHistories = new Map();

// POST /chat - Handle incoming messages and files
app.post('/chat', upload.single('file'), async (req, res) => {
    try {
        let { chatId, message } = req.body;

        // Generate a new chatId if one isn't provided
        if (!chatId) {
            chatId = crypto.randomUUID();
            chatHistories.set(chatId, []);
        }

        // Get existing history or start fresh
        let history = chatHistories.get(chatId);
        if (!history) {
            history = [];
            chatHistories.set(chatId, history);
        }

        const parts = [];

        // Handle file upload
        if (req.file) {
            const file = req.file;
            if (file.mimetype === 'application/pdf') {
                const pdfData = await pdfParse(file.buffer);
                parts.push({ text: `[Uploaded PDF Content]:\n${pdfData.text}` });
            } else if (file.mimetype === 'text/plain') {
                parts.push({ text: `[Uploaded Text Document]:\n${file.buffer.toString('utf-8')}` });
            } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                parts.push({
                    inlineData: {
                        data: file.buffer.toString('base64'),
                        mimeType: file.mimetype
                    }
                });
            } else {
                return res.status(400).json({ error: 'Unsupported file type. Only PDF, TXT, PNG, JPG are allowed.' });
            }
        }

        // Handle text message
        if (message && message.trim().length > 0) {
            parts.push({ text: message });
        }

        if (parts.length === 0) {
            return res.status(400).json({ error: 'Message or file is required.' });
        }

        // Start a chat session with the current history
        const chatSession = model.startChat({
            history: history
        });

        // Send the new parts
        const result = await chatSession.sendMessage(parts);
        const responseText = result.response.text();

        // Update history manually so we can persist it in memory across requests
        history.push({ role: 'user', parts: parts });
        history.push({ role: 'model', parts: [{ text: responseText }] });

        res.json({
            chatId,
            response: responseText
        });
    } catch (error) {
        console.error('Error in /chat:', error);
        res.status(500).json({ error: error.message || 'An error occurred while processing the request.' });
    }
});

// POST /reset - Clear chat history for a session and start fresh
app.post('/reset', (req, res) => {
    const { chatId } = req.body;
    if (chatId && chatHistories.has(chatId)) {
        chatHistories.delete(chatId);
    }
    const newChatId = crypto.randomUUID();
    chatHistories.set(newChatId, []);
    res.json({ chatId: newChatId, message: 'Chat history reset successfully.' });
});

// GET /health - Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});

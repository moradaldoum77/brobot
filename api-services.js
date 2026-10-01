// API Services for OpenAI and ElevenLabs

class APIServices {
    constructor() {
        this.conversationHistory = [];
    }

    /**
     * Get a response from OpenAI GPT-4o with the rude personality
     */
    async getAssistantResponse(userMessage) {
        this.conversationHistory.push({ role: 'user', content: userMessage });
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: this.conversationHistory })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || response.statusText);

            this.conversationHistory.push({ role: 'assistant', content: data.reply });
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }
            return data.reply;
        } catch (error) {
            this.conversationHistory.pop();
            console.error('Error getting assistant response:', error);
            throw error;
        }
    }

    /**
     * Convert text to speech via our own /api/tts route
     */
    async textToSpeech(text) {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`TTS error: ${err}`);
        }
        return URL.createObjectURL(await response.blob());
    }

    /**
     * Analyze sentiment to determine avatar mood
     */
    analyzeSentiment(text) {
        const lowerText = text.toLowerCase();

        // Check for angry/annoyed words
        const annoyedWords = ['ugh', 'seriously', 'whatever', 'annoying', 'stupid', 'dumb', 'wrong'];
        const isAnnoyed = annoyedWords.some(word => lowerText.includes(word));

        if (isAnnoyed) {
            return 'annoyed';
        }

        // Default to talking when generating response
        return 'talking';
    }

    /**
     * Count how many times "bro" appears in text
     */
    countBros(text) {
        const matches = text.toLowerCase().match(/\bbro\b/g);
        return matches ? matches.length : 0;
    }

    /**
     * Reset conversation history
     */
    resetConversation() {
        this.conversationHistory = [];
    }
}

// Create global instance
const apiServices = new APIServices();

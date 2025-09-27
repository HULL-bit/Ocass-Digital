interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor() {
    // Récupérer la clé API depuis les variables d'environnement
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    console.log('OpenAI API Key loaded:', this.apiKey ? 'Yes (hidden)' : 'No');
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here' || this.apiKey === 'sk-your-actual-api-key-here') {
      console.error('OpenAI API Key not configured:', this.apiKey);
      throw new Error('Clé API OpenAI non configurée. Veuillez ajouter VITE_OPENAI_API_KEY dans votre fichier .env');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur OpenAI: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    return response.json();
  }

  async chatCompletion(messages: ChatMessage[], model: string = 'gpt-3.5-turbo'): Promise<string> {
    try {
      const response: OpenAIResponse = await this.makeRequest('/chat/completions', {
        model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      return response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
    } catch (error) {
      console.error('Erreur lors de l\'appel à OpenAI:', error);
      throw error;
    }
  }

  async generateSupportResponse(userMessage: string, context: string = ''): Promise<string> {
    const systemPrompt = `Tu es un assistant client intelligent et professionnel pour une plateforme e-commerce. 
    Tu dois aider les clients avec leurs questions sur les commandes, livraisons, paiements, retours, et autres problèmes.
    
    Contexte de la plateforme:
    - Site e-commerce avec produits variés
    - Système de commandes et livraisons
    - Programme de fidélité
    - Support client 24/7
    
    Règles importantes:
    1. Sois toujours poli, professionnel et empathique
    2. Réponds en français
    3. Si tu ne connais pas une information spécifique, propose de créer un ticket ou de contacter un agent
    4. Pour les commandes, demande toujours le numéro de commande
    5. Pour les livraisons, propose de suivre le colis
    6. Pour les paiements, oriente vers les solutions appropriées
    7. Garde tes réponses concises mais utiles (max 200 mots)
    8. Propose des actions concrètes quand c'est possible
    
    ${context ? `Contexte supplémentaire: ${context}` : ''}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chatCompletion(messages);
  }

  async generateQuickResponse(userMessage: string): Promise<string> {
    const systemPrompt = `Tu es un assistant client rapide. Réponds de manière concise et utile en français.
    Si c'est une question simple, réponds directement. Sinon, propose de créer un ticket ou de parler à un agent.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return this.chatCompletion(messages);
  }
}

export default new OpenAIService();

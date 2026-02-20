import { CharacterData, SessionCheckpoint } from '../types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(character: CharacterData, checkpoints: SessionCheckpoint[]): string {
  const spheresList = Object.entries(character.spheres)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');

  const checkpointSummary = checkpoints.length > 0
    ? `\n\nPrevious session summaries:\n${checkpoints.map(cp => `- ${cp.summary}`).join('\n')}`
    : '';

  return `You are a Storyteller running a Mage: The Ascension 20th Edition tabletop RPG session.

Character Sheet:
- Name: ${character.name}
- Tradition: ${character.tradition}
- Concept: ${character.concept}
- Essence: ${character.essence}
- Arete: ${character.arete}
- Spheres: ${spheresList || 'none'}
- Willpower: ${character.willpowerCurrent}/${character.willpower}
- Quintessence: ${character.quintessence}/${character.quintessenceMax}
- Paradox: ${character.paradox}
- Notes: ${character.notes || 'none'}${checkpointSummary}

You are a collaborative storyteller. Respond in vivid, immersive narrative. Keep responses concise (2-4 paragraphs). Present situations and challenges appropriate for this mage's tradition and sphere ratings. Respect the character's concept and backstory. Ask for dice rolls when appropriate by stating the dice pool (e.g., "Roll Perception + Awareness, difficulty 6").`;
}

export async function streamChat(
  messages: ChatMessage[],
  character: CharacterData,
  checkpoints: SessionCheckpoint[],
  onChunk: (text: string) => void
): Promise<string> {
  const systemPrompt = buildSystemPrompt(character, checkpoints);
  
  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: ollamaMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from Ollama');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          fullResponse += parsed.message.content;
          onChunk(parsed.message.content);
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  }

  return fullResponse;
}

export async function generateSummary(messages: ChatMessage[], existingSummary: string): Promise<string> {
  const conversationText = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'Player' : 'Storyteller'}: ${m.content}`)
    .join('\n\n');

  const prompt = existingSummary
    ? `Previous summary: ${existingSummary}\n\nNew conversation:\n${conversationText}\n\nCreate a brief updated summary (2-3 sentences) of the key events:`
    : `Conversation:\n${conversationText}\n\nSummarize the key story events in 2-3 sentences:`;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json() as { response?: string };
  if (!data.response) {
    throw new Error('Unexpected response structure from Ollama generate endpoint');
  }
  return data.response.trim();
}

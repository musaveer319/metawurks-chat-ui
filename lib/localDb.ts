import fs from 'fs';
import path from 'path';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelId?: string;
}

export interface IConversation {
  _id: string;
  title: string;
  provider: string;
  modelId: string;
  persona: string;
  messages: IMessage[];
  createdAt: string;
  updatedAt: string;
}

const DB_FILE = path.join(process.cwd(), '..', '.chat-ui-data', 'conversations.json');
const ensureDb = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
  }
};

const readDb = (): IConversation[] => {
  ensureDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeDb = (data: IConversation[]) => {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const localDb = {
  getConversations: () => {
    const evs = readDb();
    evs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return evs.map(c => ({
      _id: c._id,
      title: c.title,
      provider: c.provider,
      modelId: c.modelId,
      persona: c.persona,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messages: c.messages.slice(-1)
    })).slice(0, 50);
  },

  getConversation: (id: string) => {
    return readDb().find(c => c._id === id) || null;
  },

  createConversation: (data: Partial<IConversation>) => {
    const db = readDb();
    const newConvo: IConversation = {
      _id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      title: data.title ?? 'New Chat',
      provider: data.provider ?? '',
      modelId: data.modelId ?? '',
      persona: data.persona ?? 'default',
      messages: data.messages ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.push(newConvo);
    writeDb(db);
    return newConvo;
  },

  updateConversation: (id: string, update: Partial<IConversation>) => {
    const db = readDb();
    const idx = db.findIndex(c => c._id === id);
    if (idx === -1) return null;

    db[idx] = {
      ...db[idx],
      ...update,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return db[idx];
  },

  deleteConversation: (id: string) => {
    const db = readDb();
    const newDb = db.filter(c => c._id !== id);
    writeDb(newDb);
    return true;
  }
};

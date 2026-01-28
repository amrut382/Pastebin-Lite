import { MongoClient, Db, Collection } from 'mongodb';

export interface PasteData {
  id: string;
  content: string;
  created_at: number;
  expires_at: number | null;
  max_views: number | null;
  views_used: number;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'pastebin';

// Cache the connection for serverless environments
// Using global to persist across serverless function invocations
declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  // Use global cache for serverless environments (Vercel)
  if (global._mongoClient && global._mongoDb) {
    return { client: global._mongoClient, db: global._mongoDb };
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  const db = client.db(MONGODB_DB);

  // Cache the connection globally for reuse across serverless invocations
  global._mongoClient = client;
  global._mongoDb = db;

  return { client, db };
}

function getCollection(): Promise<Collection<PasteData>> {
  return connectToDatabase().then(({ db }) => db.collection<PasteData>('pastes'));
}

export async function getPaste(id: string): Promise<PasteData | null> {
  try {
    const collection = await getCollection();
    const paste = await collection.findOne({ id });
    return paste;
  } catch (error) {
    console.error('Error fetching paste:', error);
    return null;
  }
}

export async function savePaste(paste: PasteData): Promise<boolean> {
  try {
    const collection = await getCollection();
    await collection.updateOne(
      { id: paste.id },
      { $set: paste },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving paste:', error);
    return false;
  }
}

export async function incrementViews(id: string): Promise<boolean> {
  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { id },
      { $inc: { views_used: 1 } }
    );
    return result.matchedCount > 0;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
}

export async function checkPersistence(): Promise<boolean> {
  try {
    const { client } = await connectToDatabase();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('Persistence check failed:', error);
    return false;
  }
}

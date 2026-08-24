import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq();

async function main() {
  try {
    const models = await groq.models.list();
    console.log("Available models:");
    models.data.forEach(m => console.log(m.id));
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

main();

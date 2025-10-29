import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  constructor(private readonly configService: ConfigService) {}

  async createCompletions(message: string) {
    const GROQ_API_KEY = this.configService.get<string>('GROQ_API_KEY');
    const client = new Groq({
      apiKey: GROQ_API_KEY,
    });
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `${message}` },
      ],
    });

    const response = completion?.choices[0]?.message?.content;

    return response;
  }
}

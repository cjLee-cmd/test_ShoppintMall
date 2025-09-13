// Minimal ambient module declaration for '@google/genai'
// This unblocks TypeScript type resolution in the editor.
declare module '@google/genai' {
  export type GenerateContentResponse = any;
  export enum Modality {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE'
  }
  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    models: {
      generateContent(args: any): Promise<GenerateContentResponse>;
    };
  }
}

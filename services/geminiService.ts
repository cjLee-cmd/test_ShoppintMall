
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Defines the structure for an image part sent to the Gemini API.
 */
type ImagePart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

const getBase64Data = (dataUrl: string): { mimeType: string; data: string } => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  const [, mimeType, data] = match;
  return { mimeType, data };
};

const generateSingleImage = async (
  personImagePart: ImagePart,
  clothingImagePart: ImagePart,
  prompt: string
): Promise<string> => {
  const textPart = { text: `Using the person in the first image and the clothing in the second image, create a single realistic, high-quality image showing the person wearing the clothing. It should look like a professional virtual try-on photoshoot. The person's pose should be: ${prompt}. Ensure a neutral background.` };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [personImagePart, clothingImagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("AI did not return an image. It might have refused the request due to safety policies. Please try a different image or prompt.");
};

export const virtualTryOn = async (
    personImageBase64: string, 
    clothingImageBase64: string,
    prompt: string
): Promise<string> => {
  try {
    const personImage = getBase64Data(personImageBase64);
    const clothingImage = getBase64Data(clothingImageBase64);

    const personImagePart: ImagePart = {
      inlineData: {
        mimeType: personImage.mimeType,
        data: personImage.data,
      },
    };
    
    const clothingImagePart: ImagePart = {
      inlineData: {
        mimeType: clothingImage.mimeType,
        data: clothingImage.data,
      },
    };

    const result = await generateSingleImage(personImagePart, clothingImagePart, prompt);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes("safety policies")) {
        throw new Error("이미지 생성 요청이 안전 정책에 의해 거부되었습니다. 다른 이미지를 사용해 보세요.");
    }
    throw new Error("Gemini API로 이미지 생성에 실패했습니다.");
  }
};


import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Lazy init: 페이지 로드시 즉시 크래시하지 않도록 지연 초기화
let ai: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  // Vite는 VITE_ 접두사의 환경변수를 노출합니다.
  const apiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    // 앱 로드는 유지하고, 기능 사용 시점에만 에러 처리되도록 합니다.
    throw new Error(
      "Gemini API 키가 설정되어 있지 않습니다. 저장소 Secrets에 GEMINI_API_KEY를 추가하고 워크플로우에서 VITE_GEMINI_API_KEY로 전달해주세요."
    );
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

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

  const response: GenerateContentResponse = await getClient().models.generateContent({
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

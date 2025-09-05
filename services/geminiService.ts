import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { GeneratedContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ImageData {
    base64: string;
    mimeType: string;
}

export const generatePoseFromImage = async (
  characterImageData: ImageData,
  poseReferenceImageData: ImageData | null,
  additionalReferenceImagesData: ImageData[],
  prompt: string,
  numberOfImages: number,
  quality: string,
  aspectRatio: string,
): Promise<GeneratedContent[]> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    // Dynamically set quality instructions based on the user's selection.
    let qualityInstructions = '';
    const aspectRatioText = `an image with a ${aspectRatio} aspect ratio`;

    switch (quality) {
        case 'Standard':
            qualityInstructions = `The output must be a clear, good quality, ${aspectRatioText} with simple, clean lighting.`;
            break;
        case 'High':
            qualityInstructions = `The output must be a high-resolution, detailed, ${aspectRatioText} with professional studio lighting. The focus should be sharp.`;
            break;
        case 'Ultra':
        default:
            qualityInstructions = `The output must be a photorealistic, ultra-detailed, 8k resolution, ${aspectRatioText}. The lighting should be cinematic and dramatic, highlighting the character's form and texture. The focus must be razor-sharp. Colors must be rich and perfectly balanced.`;
            break;
    }
    
    let fullPrompt = "";
    
    // Add priority instruction for pose replication if a pose reference image is provided.
    if (poseReferenceImageData) {
        fullPrompt += "PRIORITY ONE: Replicate the exact pose from the provided pose reference image. The final character's posture, limb positions, and angle must precisely match the reference pose. This is the most critical instruction. ";
    }
    
    // Add user's prompt.
    if (prompt.trim()) {
        fullPrompt += `${prompt.trim()}. `;
    }

    // Add base instructions and quality instructions.
    fullPrompt += `Place the character on a solid white background. ${qualityInstructions}`;

    // Dynamically construct the parts for the API request.
    const parts: Part[] = [
      { // The main character
        inlineData: {
          data: characterImageData.base64,
          mimeType: characterImageData.mimeType,
        },
      },
    ];

    // Add pose reference image if it exists.
    if (poseReferenceImageData) {
        parts.push({
            inlineData: {
                data: poseReferenceImageData.base64,
                mimeType: poseReferenceImageData.mimeType,
            }
        });
    }

    // Add all additional reference images
    for (const refImage of additionalReferenceImagesData) {
        parts.push({
            inlineData: {
                data: refImage.base64,
                mimeType: refImage.mimeType,
            }
        });
    }

    // The text prompt should always be the last part.
    parts.push({ text: fullPrompt });
    
    // Create an array of promises to generate multiple images in parallel.
    const generatePromises = Array(numberOfImages).fill(0).map(() => 
        ai.models.generateContent({
            model: model,
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );
    
    const responses = await Promise.all(generatePromises);

    const generatedContents: GeneratedContent[] = responses.map(response => {
        let image: string | null = null;
        let text: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            const responseParts = response.candidates[0].content.parts;
            for (const part of responseParts) {
                if (part.inlineData) {
                    image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                } else if (part.text) {
                    text = part.text;
                }
            }
        }
        return { image, text };
    });
    
    const successfulGenerations = generatedContents.filter(content => content.image !== null);

    if (successfulGenerations.length === 0) {
        throw new Error("API did not return any images. This could be due to a safety policy violation or an issue with the prompt.");
    }

    return successfulGenerations;

  } catch (error) {
    console.error("Error generating image(s):", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate pose(s): ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the pose(s).");
  }
};
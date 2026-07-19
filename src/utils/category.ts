import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

import { BUDGET_CATEGORIES } from "../constants";
import type { BudgetCategory } from "../types";
import { getExplicitHashtagCategory, getLocalFallbackCategory } from "./localFallbackCategory";

/**
 * Returns a Gemini API client instance if GEMINI_API_KEY is available.
 */
const getGeminiClient = (): GoogleGenerativeAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === '""') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Main categorization function using Gemini 3.5 Flash (with fallback to local parser).
 */
export const getCategoryFromDescription = async (description: string): Promise<BudgetCategory> => {
  // If there's an explicit hashtag, use it directly to save API overhead
  const explicitCategory = getExplicitHashtagCategory(description);
  if (explicitCategory) {
    return explicitCategory;
  }

  const client = getGeminiClient();
  if (!client) {
    return getLocalFallbackCategory(description);
  }

  try {
    const model = client.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            category: {
              type: SchemaType.STRING,
              format: "enum",
              enum: BUDGET_CATEGORIES as unknown as string[],
            },
          },
          required: ["category"],
        },
      },
    });

    const prompt = `Classify this transaction description into exactly one of these budget categories: ${BUDGET_CATEGORIES.join(", ")}.
Transaction: "${description}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText) as { category: string };

    if (data.category && BUDGET_CATEGORIES.includes(data.category as BudgetCategory)) {
      return data.category as BudgetCategory;
    }
  } catch (error) {
    console.error("❌ Gemini categorization failed, falling back to local matching:", error);
  }

  return getLocalFallbackCategory(description);
};

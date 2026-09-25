import { EXPENSE_KEYWORD_MAP } from '../constants/expenseKeyword.js'
import { INCOME_KEYWORD_MAP } from '../constants/incomeKeyword.js'
import type { BudgetCategoryExpense, BudgetCategoryIncome, KeywordMapType } from "../types/index.js";

/**
 * Categorize description using local keyword matching rules when Gemini is unavailable.
 */
export const getLocalFallbackCategory = (description: string, isExpense?: boolean): BudgetCategoryExpense | BudgetCategoryIncome => {
  const desc = description.toLowerCase();

  const keywordMap: KeywordMapType = isExpense ? EXPENSE_KEYWORD_MAP : INCOME_KEYWORD_MAP

  if (isExpense) {
    for (const [category, keywords] of Object.entries(keywordMap)) {
      for (const kw of keywords) {
        const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(desc)) {
          return category as BudgetCategoryExpense;
        }
      }
    }

    return "Other Expense";
  }

  for (const [category, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(desc)) {
        return category as BudgetCategoryIncome;
      }
    }
  }

  return "Other Income";

};

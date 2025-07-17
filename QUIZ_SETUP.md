# 1753 Skincare Quiz Setup

## Overview
The skincare quiz is a comprehensive 15-question assessment that uses GPT-4 to generate personalized skincare recommendations.

## Features
- 15 in-depth questions covering:
  - Skin type and concerns
  - Lifestyle factors (sleep, stress, water intake)
  - Diet and exercise habits
  - Environmental factors
  - Hormonal considerations
  - Sun exposure and smoking habits
  - Current skincare routine

- GPT-4 powered analysis providing:
  - Detailed skin analysis
  - Scientific explanations for skin conditions
  - Lifestyle recommendations
  - Product recommendations from 1753 product line
  - Daily skincare routine (morning & evening)
  - Long-term goals and expectations
  - Research citations about endocannabinoid system and CBD/CBG

## Setup

### Environment Variables
Add the following to your Railway environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Token Usage
The quiz uses approximately 2,500 tokens per completion:
- Input prompt: ~500-700 tokens (including user answers)
- Output: ~2,000 tokens (comprehensive analysis)
- Model: gpt-4-turbo-preview

### Cost Estimation
- GPT-4 Turbo pricing: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- Estimated cost per quiz: ~$0.07-0.08

## How It Works

1. **Welcome Screen**: Collects user name and email
2. **15 Questions**: One question at a time with smooth transitions
3. **Loading Animation**: 4.5-second loading screen with progress bar
4. **GPT Analysis**: Sends all answers to GPT-4 for personalized analysis
5. **Results Display**: Beautiful full-screen results with:
   - Formatted analysis with sections
   - Product recommendations with visual cards
   - Action buttons to shop or return home

## Customization

### Adding/Modifying Questions
Edit `frontend/src/components/quiz/quizData.ts` to add or modify questions.

### Adjusting GPT Prompt
Edit `frontend/src/app/api/quiz/results/route.ts` to modify the GPT prompt or analysis structure.

### Styling
The quiz uses a dark theme with brown (#8B4513) accents. All styling is in the quiz page component.

## Future Enhancements
- Save results to database
- Send email with results
- Add to email marketing list
- Track quiz completion analytics
- A/B test different question flows 
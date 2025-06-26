export async function matchUserToCircle(userProfile: any) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI that groups users into shopping circles based on location, life stage, and spending patterns.' },
        { role: 'user', content: JSON.stringify(userProfile) }
      ]
    }),
  });
  const data = await response.json();
  // Parse and return the group/circle assignment from OpenAI's response
  return data.choices[0].message.content;
} 
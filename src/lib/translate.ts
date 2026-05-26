export interface TranslateStep {
  lang: string;
  flag: string;
  text: string;
}

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

const LANGUAGES = {
  id: { name: 'Indonesian', flag: '🇮🇩' },
  nl: { name: 'Dutch', flag: '🇳🇱' },
  en: { name: 'English', flag: '🇬🇧' },
};

async function translate(text: string, source: string, target: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus === 200 || data.responseStatus === 206) {
      return data.responseData.translatedText || text;
    }

    throw new Error(`MyMemory status: ${data.responseStatus}`);
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Timeout translating ${source}→${target}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function paraphraseText(inputText: string): Promise<TranslateStep[]> {
  const steps: TranslateStep[] = [];

  const nlText = await translate(inputText, 'id', 'nl');
  steps.push({
    lang: 'nl',
    flag: LANGUAGES.nl.flag,
    text: nlText,
  });

  const enText = await translate(nlText, 'nl', 'en');
  steps.push({
    lang: 'en',
    flag: LANGUAGES.en.flag,
    text: enText,
  });

  const idText = await translate(enText, 'en', 'id');
  steps.push({
    lang: 'id',
    flag: LANGUAGES.id.flag,
    text: idText,
  });

  return steps;
}
// Используем Transformers.js — нейросеть прямо в браузере!
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js';

// Модели для разных стилей
const STYLE_PROMPTS = {
    pushkin: 'Напиши стихотворение в стиле Пушкина, романтическое, с рифмой:',
    esenin: 'Напиши стихотворение в стиле Есенина, о природе и душе:',
    akhmatova: 'Напиши стихотворение в стиле Ахматовой, глубокое и лиричное:',
    mayakovsky: 'Напиши стихотворение в стиле Маяковского, резкое, ритмичное:',
    custom: 'Напиши красивое современное стихотворение с рифмой:'
};

const SONG_PROMPTS = {
    pop: 'Напиши текст поп-песни с куплетом и припевом на тему:',
    rock: 'Напиши текст рок-песни с мощным припевом на тему:',
    rap: 'Напиши рэп-текст с ритмичными рифмами на тему:',
    folk: 'Напиши текст народной песни, душевной, на тему:'
};

let generator = null;

// Инициализация модели
async function initModel() {
    try {
        generator = await pipeline('text2text-generation', 'Xenova/t5-small');
        console.log('✅ Модель загружена');
    } catch (e) {
        console.log('Загрузка резервной модели...');
        generator = await pipeline('text-generation', 'Xenova/gpt2');
    }
}

// Генерация текста
async function generateText(prompt, style, mode) {
    if (!generator) await initModel();
    
    let fullPrompt;
    if (mode === 'poem') {
        fullPrompt = `${STYLE_PROMPTS[style]} ${prompt}\n\nСтихотворение:`;
    } else {
        fullPrompt = `${SONG_PROMPTS[style]} ${prompt}\n\nТекст песни:`;
    }

    const result = await generator(fullPrompt, {
        max_new_tokens: 200,
        temperature: 0.9,
        do_sample: true,
        top_p: 0.95,
    });

    return result[0].generated_text.replace(fullPrompt, '').trim();
}

// Обработчики UI
document.addEventListener('DOMContentLoaded', () => {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const poemStyles = document.getElementById('poemStyles');
    const songStyles = document.getElementById('songStyles');
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('prompt');
    const output = document.getElementById('output');
    const loading = document.getElementById('loading');
    const copyBtn = document.getElementById('copyBtn');
    const outputTitle = document.getElementById('outputTitle');

    let currentMode = 'poem';

    // Переключение режимов
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            
            if (currentMode === 'poem') {
                poemStyles.classList.remove('hidden');
                songStyles.classList.add('hidden');
                outputTitle.textContent = 'Стихотворение';
            } else {
                poemStyles.classList.add('hidden');
                songStyles.classList.remove('hidden');
                outputTitle.textContent = 'Текст песни';
            }
        });
    });

    // Генерация
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim() || 'любовь и звёзды';
        const style = currentMode === 'poem' 
            ? document.getElementById('poemStyle').value 
            : document.getElementById('songStyle').value;

        loading.classList.remove('hidden');
        output.innerHTML = '';
        generateBtn.disabled = true;

        try {
            const text = await generateText(prompt, style, currentMode);
            output.textContent = text;
        } catch (error) {
            output.innerHTML = '<p style="color:#e94560">Ошибка генерации. Попробуйте ещё раз.</p>';
            console.error(error);
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    // Копирование
    copyBtn.addEventListener('click', () => {
        const text = output.textContent;
        if (text && !text.includes('появится')) {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 2000);
            });
        }
    });

    // Инициализация модели при загрузке
    initModel();
});

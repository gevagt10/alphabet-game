import fs from "fs";
import path from "path";
import util from "util";
import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient();

const LETTER_AUDIO_FILES = {
    "א": "alef",
    "ב": "bet",
    "ג": "gimel",
    "ד": "dalet",
    "ה": "he",
    "ו": "vav",
    "ז": "zayin",
    "ח": "chet",
    "ט": "tet",
    "י": "yod",
    "כ": "kaf",
    "ל": "lamed",
    "מ": "mem",
    "נ": "nun",
    "ס": "samekh",
    "ע": "ayin",
    "פ": "pe",
    "צ": "tsadi",
    "ק": "qof",
    "ר": "resh",
    "ש": "shin",
    "ת": "tav",
    "ך": "final-kaf",
    "ם": "final-mem",
    "ן": "final-nun",
    "ף": "final-pe",
    "ץ": "final-tsadi"
};

const outputDir = path.resolve("public/sounds");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function generateSounds() {
    for (const [letter, name] of Object.entries(LETTER_AUDIO_FILES)) {
        const request = {
            input: { text: letter }, // אפשר להחליף ל־name אם רוצים שישמע את שם האות
            voice: { languageCode: "he-IL", ssmlGender: "FEMALE" },
            audioConfig: { audioEncoding: "MP3" },
        };

        const [response] = await client.synthesizeSpeech(request);
        const filename = path.join(outputDir, `${name}.mp3`);
        await util.promisify(fs.writeFile)(filename, response.audioContent, "binary");
        console.log(`✅ Created: ${filename}`);
    }
}

generateSounds().then(() => console.log("🎉 All letter sounds generated!"));

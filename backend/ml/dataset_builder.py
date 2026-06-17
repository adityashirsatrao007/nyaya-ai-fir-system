"""
FIR Dataset Builder for IPC Section Extraction
Builds training data from:
1. Existing FIR_details.json (real FIR annotations)
2. Synthetic Hindi/Marathi FIR text corpus
3. IPC section text as classification labels
"""
import json
import re
import random
from pathlib import Path
from typing import List, Dict

# ─── IPC section patterns commonly found in FIR text ───
IPC_TEXT_PATTERNS = [
    # English patterns
    r'(?:Section|Sec|u/s|IPC)\s*(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)',
    r'(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)\s*(?:of|u/s)?\s*IPC',
    r'(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)\s*Ipc',
    # Hindi patterns
    r'धारा\s*(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)',
    r'(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)\s*धारा',
    # Marathi patterns
    r'कलम\s*(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)',
    r'(\d{1,3}[A-Z]?(?:[/,]\s*\d{1,3}[A-Z]?)*)\s*कलम',
]

# ─── Synthetic FIR narratives in Hindi/Marathi/English ───
# Each maps (crime description → IPC sections)
SYNTHETIC_FIRS = [
    # ─── HINDI FIRs ───
    {
        "text": "शिकायतकर्ता ने बताया कि आरोपी ने उनके साथ मारपीट की और गंभीर चोट पहुंचाई। आरोपी ने लाठी और पत्थर से हमला किया। धारा 325 और 34 IPC के तहत मामला दर्ज किया गया।",
        "ipc_sections": ["325", "34"],
        "language": "hi",
        "crime_type": "assault"
    },
    {
        "text": "शिकायतकर्ता की पत्नी को उसके ससुराल वालों ने दहेज की मांग पर प्रताड़ित किया। धारा 498A, 306 और 304B IPC के तहत प्रथम सूचना रिपोर्ट दर्ज की गई।",
        "ipc_sections": ["498A", "306", "304B"],
        "language": "hi",
        "crime_type": "domestic_violence"
    },
    {
        "text": "आरोपी ने शिकायतकर्ता से झूठे वादे करके 5 लाख रुपए ठग लिए। धारा 420 और 406 IPC के अंतर्गत मुकदमा दर्ज किया गया।",
        "ipc_sections": ["420", "406"],
        "language": "hi",
        "crime_type": "cheating"
    },
    {
        "text": "प्रार्थी की रिपोर्ट है कि अज्ञात आरोपी ने रात के समय घर में घुसकर सोना-चाँदी की चोरी की। धारा 380, 457 IPC के तहत मामला पंजीकृत।",
        "ipc_sections": ["380", "457"],
        "language": "hi",
        "crime_type": "theft"
    },
    {
        "text": "रात्री 10 बजे आरोपी ने चाकू दिखाकर मोबाइल और नकदी छीन ली। धारा 392 और 34 IPC में प्रथम सूचना रिपोर्ट दर्ज।",
        "ipc_sections": ["392", "34"],
        "language": "hi",
        "crime_type": "robbery"
    },
    {
        "text": "वादी की बेटी को आरोपी ने बहला-फुसलाकर घर से भगा ले गया। धारा 363 और 366 IPC के तहत FIR दर्ज।",
        "ipc_sections": ["363", "366"],
        "language": "hi",
        "crime_type": "kidnapping"
    },
    {
        "text": "आरोपी ने शिकायतकर्ता को जान से मारने की धमकी दी और लाठी से सिर पर मारा जिससे गंभीर चोट आई। धारा 307, 506, 325 IPC।",
        "ipc_sections": ["307", "506", "325"],
        "language": "hi",
        "crime_type": "attempt_murder"
    },
    {
        "text": "वादिया रिपोर्ट: गुंडों के एक गिरोह ने दुकान में घुसकर लूटपाट की और गोली चलाई। धारा 395, 307, 34 IPC का मुकदमा।",
        "ipc_sections": ["395", "307", "34"],
        "language": "hi",
        "crime_type": "dacoity"
    },
    {
        "text": "महिला शिकायतकर्ता ने बताया कि पड़ोसी ने उनके साथ छेड़छाड़ की और अभद्र टिप्पणियाँ कीं। धारा 354, 509 IPC।",
        "ipc_sections": ["354", "509"],
        "language": "hi",
        "crime_type": "molestation"
    },
    {
        "text": "ट्रक चालक की लापरवाही से दुर्घटना हुई जिसमें दो लोग गंभीर रूप से घायल हुए। धारा 304A, 279, 338 IPC।",
        "ipc_sections": ["304A", "279", "338"],
        "language": "hi",
        "crime_type": "accident"
    },
    {
        "text": "आरोपी ने अपने भाई के साथ मिलकर शिकायतकर्ता को गाली-गलौज और मारपीट की। धारा 323, 341, 34 IPC का प्रकरण।",
        "ipc_sections": ["323", "341", "34"],
        "language": "hi",
        "crime_type": "assault"
    },
    {
        "text": "नकली दस्तावेज बनाकर बैंक से ऋण लेने के मामले में धारा 420, 468, 471 IPC के अंतर्गत प्राथमिकी दर्ज।",
        "ipc_sections": ["420", "468", "471"],
        "language": "hi",
        "crime_type": "fraud"
    },
    {
        "text": "आरोपी ने फर्जी पहचान पत्र बनाकर संपत्ति की रजिस्ट्री कराई। धारा 419, 420, 467 IPC।",
        "ipc_sections": ["419", "420", "467"],
        "language": "hi",
        "crime_type": "fraud"
    },
    {
        "text": "शिकायतकर्ता की नाबालिग बेटी के साथ जबरदस्ती की गई। धारा 376 IPC तथा POCSO Act की धाराएं लागू।",
        "ipc_sections": ["376"],
        "language": "hi",
        "crime_type": "sexual_assault"
    },
    {
        "text": "पड़ोसी ने मेरे घर में अनधिकृत रूप से प्रवेश किया और सामान तोड़-फोड़ किया। धारा 448, 427 IPC।",
        "ipc_sections": ["448", "427"],
        "language": "hi",
        "crime_type": "trespass"
    },
    {
        "text": "वादी रिपोर्ट: पाँच लोगों ने मिलकर शिकायतकर्ता को घेर लिया और मारपीट की। धारा 147, 148, 149, 323 IPC।",
        "ipc_sections": ["147", "148", "149", "323"],
        "language": "hi",
        "crime_type": "rioting"
    },
    {
        "text": "राजनैतिक भाषण में सरकार के विरुद्ध भड़काऊ बयान देने पर धारा 124A IPC के तहत मामला दर्ज।",
        "ipc_sections": ["124A"],
        "language": "hi",
        "crime_type": "sedition"
    },
    {
        "text": "आरोपी ने शिकायतकर्ता के मोबाइल फोन पर अश्लील संदेश और फोटो भेजे। धारा 509, 354D IPC और IT Act।",
        "ipc_sections": ["509", "354D"],
        "language": "hi",
        "crime_type": "harassment"
    },
    {
        "text": "प्रथम सूचना रिपोर्ट: घर में बने पटाखों के विस्फोट से दो लोगों की मृत्यु। धारा 304, 34 IPC।",
        "ipc_sections": ["304", "34"],
        "language": "hi",
        "crime_type": "culpable_homicide"
    },
    {
        "text": "आरोपी कर्मचारी ने कंपनी के पैसे गबन किए। धारा 406, 408 IPC।",
        "ipc_sections": ["406", "408"],
        "language": "hi",
        "crime_type": "embezzlement"
    },

    # ─── MARATHI FIRs ───
    {
        "text": "तक्रारदाराने सांगितले की आरोपीने त्याला लाठीने मारले व गंभीर दुखापत केली. भारतीय दंड संहितेच्या कलम 325 आणि 34 अन्वये गुन्हा नोंद केला.",
        "ipc_sections": ["325", "34"],
        "language": "mr",
        "crime_type": "assault"
    },
    {
        "text": "फिर्यादीच्या पत्नीला सासरच्यांनी हुंड्यासाठी त्रास दिला. कलम 498A, 304B भादंसं अन्वये प्रथम खबर नोंद.",
        "ipc_sections": ["498A", "304B"],
        "language": "mr",
        "crime_type": "domestic_violence"
    },
    {
        "text": "आरोपीने खोट्या आश्वासनांनी फिर्यादीकडून 3 लाख रुपये घेतले. भादंसं कलम 420 आणि 406 अन्वये गुन्हा नोंद.",
        "ipc_sections": ["420", "406"],
        "language": "mr",
        "crime_type": "cheating"
    },
    {
        "text": "रात्रीच्या वेळी आरोपीने घरात शिरून सोन्याचे दागिने चोरले. भादंसं कलम 380, 457 अन्वये गुन्हा.",
        "ipc_sections": ["380", "457"],
        "language": "mr",
        "crime_type": "theft"
    },
    {
        "text": "आरोपीने चाकू दाखवून मोबाईल आणि रोकड हिसकावून घेतले. कलम 392 आणि 34 भादंसं.",
        "ipc_sections": ["392", "34"],
        "language": "mr",
        "crime_type": "robbery"
    },
    {
        "text": "फिर्यादीच्या मुलीला आरोपीने बहकवून घरातून पळवून नेले. भादंसं कलम 363 आणि 366 अन्वये प्रथम खबर.",
        "ipc_sections": ["363", "366"],
        "language": "mr",
        "crime_type": "kidnapping"
    },
    {
        "text": "आरोपीने जीवे मारण्याची धमकी देऊन डोक्यावर दगड मारला. कलम 307, 506 भादंसं.",
        "ipc_sections": ["307", "506"],
        "language": "mr",
        "crime_type": "attempt_murder"
    },
    {
        "text": "पाच जणांच्या टोळीने दुकानात घुसून जबरदस्त लूट केली. भादंसं कलम 395, 149 अन्वये गुन्हा नोंद.",
        "ipc_sections": ["395", "149"],
        "language": "mr",
        "crime_type": "dacoity"
    },
    {
        "text": "महिला तक्रारदाराने सांगितले की शेजाऱ्याने तिच्याशी अश्लील वर्तन केले. कलम 354 आणि 509 भादंसं.",
        "ipc_sections": ["354", "509"],
        "language": "mr",
        "crime_type": "molestation"
    },
    {
        "text": "ट्रक चालकाच्या निष्काळजीपणामुळे अपघात होऊन दोन जण जखमी झाले. कलम 304A, 279 भादंसं.",
        "ipc_sections": ["304A", "279"],
        "language": "mr",
        "crime_type": "accident"
    },
    {
        "text": "आरोपीने भावासोबत मिळून तक्रारदाराला शिविगाळ करून मारहाण केली. कलम 323, 341, 34 भादंसं.",
        "ipc_sections": ["323", "341", "34"],
        "language": "mr",
        "crime_type": "assault"
    },
    {
        "text": "खोट्या कागदपत्रांनी बँकेकडून कर्ज घेतल्याप्रकरणी कलम 420, 467, 468 भादंसं.",
        "ipc_sections": ["420", "467", "468"],
        "language": "mr",
        "crime_type": "fraud"
    },
    {
        "text": "फिर्यादीच्या अल्पवयीन मुलीवर अत्याचार केला. भादंसं कलम 376 तसेच POCSO कायद्याच्या तरतुदी.",
        "ipc_sections": ["376"],
        "language": "mr",
        "crime_type": "sexual_assault"
    },
    {
        "text": "शेजाऱ्याने परवानगीशिवाय घरात प्रवेश करून सामान मोडतोड केले. कलम 448, 427 भादंसं.",
        "ipc_sections": ["448", "427"],
        "language": "mr",
        "crime_type": "trespass"
    },
    {
        "text": "दहा जणांच्या जमावाने तक्रारदाराला घेराव घालून मारहाण केली. कलम 143, 147, 148, 149, 323 भादंसं.",
        "ipc_sections": ["143", "147", "148", "149", "323"],
        "language": "mr",
        "crime_type": "rioting"
    },
    {
        "text": "वादक आणि त्याच्या साथीदारांनी मिळून दुकानदाराकडून खंडणी मागितली. कलम 384, 120B भादंसं.",
        "ipc_sections": ["384", "120B"],
        "language": "mr",
        "crime_type": "extortion"
    },
    {
        "text": "आरोपीने महिलेचा पाठलाग केला आणि अश्लील संदेश पाठवले. कलम 354D, 509 भादंसं.",
        "ipc_sections": ["354D", "509"],
        "language": "mr",
        "crime_type": "stalking"
    },
    {
        "text": "बांधकाम व्यावसायिकाने घर देण्याचे खोटे आश्वासन देऊन पैसे घेतले. कलम 420, 406 भादंसं.",
        "ipc_sections": ["420", "406"],
        "language": "mr",
        "crime_type": "cheating"
    },
    {
        "text": "आरोपी पतीने पत्नीला मानसिक व शारीरिक त्रास दिला. कलम 498A भादंसं.",
        "ipc_sections": ["498A"],
        "language": "mr",
        "crime_type": "domestic_violence"
    },
    {
        "text": "आरोपीने रस्त्यावर धावताना पादचाऱ्याला उडवले. कलम 279, 304A भादंसं.",
        "ipc_sections": ["279", "304A"],
        "language": "mr",
        "crime_type": "accident"
    },

    # ─── ENGLISH FIRs ───
    {
        "text": "The complainant states that the accused persons along with 3 others in furtherance of their common intention caused grievous hurt to the complainant by beating him with iron rods. Sections 325, 34 IPC are attracted.",
        "ipc_sections": ["325", "34"],
        "language": "en",
        "crime_type": "assault"
    },
    {
        "text": "First Information Report: The accused has committed murder by stabbing the deceased multiple times. Sections 302, 34 IPC are registered.",
        "ipc_sections": ["302", "34"],
        "language": "en",
        "crime_type": "murder"
    },
    {
        "text": "Complainant's wife subjected to dowry harassment. The accused husband and in-laws threatened to kill her. Sections 498A, 506, 307 IPC.",
        "ipc_sections": ["498A", "506", "307"],
        "language": "en",
        "crime_type": "domestic_violence"
    },
    {
        "text": "Accused cheated the complainant of Rs. 2 lakh by promising false returns on investment. U/s 420 and 406 IPC FIR registered.",
        "ipc_sections": ["420", "406"],
        "language": "en",
        "crime_type": "cheating"
    },
    {
        "text": "A group of 5 persons armed with rods and sticks committed robbery on the national highway. Sections 392, 395, 148, 149 IPC.",
        "ipc_sections": ["392", "395", "148", "149"],
        "language": "en",
        "crime_type": "robbery"
    },
    {
        "text": "Female complainant states that accused persons outraged her modesty and made indecent remarks. Sections 354, 509, 34 IPC registered.",
        "ipc_sections": ["354", "509", "34"],
        "language": "en",
        "crime_type": "molestation"
    },
    {
        "text": "Accused driver rashly drove the truck and knocked down two pedestrians causing grievous hurt. Sections 279, 338, 304A IPC.",
        "ipc_sections": ["279", "338", "304A"],
        "language": "en",
        "crime_type": "accident"
    },
    {
        "text": "Stolen mobile worth Rs. 15,000 from complainant's shop. Section 379 IPC case registered at this police station.",
        "ipc_sections": ["379"],
        "language": "en",
        "crime_type": "theft"
    },
    {
        "text": "The accused fired shots at complainant's house. Sections 307, 34 IPC and Arms Act sections applied.",
        "ipc_sections": ["307", "34"],
        "language": "en",
        "crime_type": "attempt_murder"
    },
    {
        "text": "Accused along with his associates wrongfully restrained the complainant and threatened him. Sections 341, 506, 34 IPC.",
        "ipc_sections": ["341", "506", "34"],
        "language": "en",
        "crime_type": "restraint"
    },

    # ─── CODE-MIXED (Marathi-English / Hindi-English) ───
    {
        "text": "Complainant states ki accused ne uske ghar mein ghus ke maarpit ki. Kalam 323, 448 IPC ke antargat FIR darj.",
        "ipc_sections": ["323", "448"],
        "language": "mixed",
        "crime_type": "assault"
    },
    {
        "text": "Tक्रारदार म्हणतो accused ne usse 3 lakh rupaye cheated. IPC कलम 420 ani 406 अन्वये case.",
        "ipc_sections": ["420", "406"],
        "language": "mixed",
        "crime_type": "cheating"
    },
    {
        "text": "पोलीस station मध्ये report: Accused आणि त्याचे 2 साथीदार यांनी मिळून murder केले. Section 302, 34 IPC.",
        "ipc_sections": ["302", "34"],
        "language": "mixed",
        "crime_type": "murder"
    },
]

# ─── Additional variations: different wordings for same crimes ───
SECTION_VARIATIONS = {
    "302": [
        "हत्या की धारा 302 IPC के तहत मुकदमा दर्ज।",
        "Murder case u/s 302 IPC registered.",
        "कलम 302 भादंसं अन्वये खुनाचा गुन्हा नोंद.",
        "धारा 302 में प्राथमिकी दर्ज की गई।",
        "Section 302 IPC murder FIR lodged.",
    ],
    "420": [
        "धोखाधड़ी के मामले में धारा 420 IPC।",
        "Cheating case Section 420 IPC.",
        "फसवणुकीप्रकरणी कलम 420 भादंसं.",
        "u/s 420 IPC case of fraud.",
        "420 Ipc cheating registered.",
    ],
    "498A": [
        "घरेलू हिंसा में धारा 498A IPC।",
        "Domestic violence Section 498A IPC.",
        "घरगुती हिंसा कलम 498A भादंसं.",
        "498-A IPC registered.",
        "Sec 498A IPC case.",
    ],
    "376": [
        "धारा 376 IPC बलात्कार का मुकदमा।",
        "Rape case Section 376 IPC.",
        "बलात्कार कलम 376 भादंसं.",
        "u/s 376 IPC case registered.",
    ],
    "307": [
        "हत्या के प्रयास में धारा 307 IPC।",
        "Attempt to murder Section 307 IPC.",
        "खुनाच्या प्रयत्नाप्रकरणी कलम 307 भादंसं.",
        "307 IPC attempt to murder.",
    ],
    "325": [
        "घोर उपहति में धारा 325 IPC।",
        "Grievous hurt Section 325 IPC.",
        "गंभीर दुखापतीसाठी कलम 325 भादंसं.",
        "325/34 IPC case.",
    ],
    "323": [
        "मारपीट में धारा 323 IPC।",
        "Simple hurt Section 323 IPC.",
        "मारहाणीसाठी कलम 323 भादंसं.",
        "323 Ipc case registered.",
    ],
    "379": [
        "चोरी में धारा 379 IPC।",
        "Theft Section 379 IPC.",
        "चोरीसाठी कलम 379 भादंसं.",
        "379 IPC theft case.",
    ],
    "392": [
        "लूट में धारा 392 IPC।",
        "Robbery Section 392 IPC.",
        "दरोड्यासाठी कलम 392 भादंसं.",
        "392/34 IPC robbery.",
    ],
    "506": [
        "धमकी देने में धारा 506 IPC।",
        "Criminal intimidation Section 506 IPC.",
        "धमकीसाठी कलम 506 भादंसं.",
        "506(ii) IPC case.",
    ],
}


def extract_sections_from_text(text: str) -> List[str]:
    """Extract IPC section numbers from text using all patterns"""
    sections = set()
    for pattern in IPC_TEXT_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            parts = re.split(r'[/,]\s*', match.strip())
            for part in parts:
                part = part.strip().upper()
                if re.match(r'^\d{1,3}[A-Z]?$', part):
                    sections.add(part)
    return sorted(list(sections))


def build_from_fir_details(fir_details_path: str) -> List[Dict]:
    """Build training samples from the FIR_details.json"""
    samples = []
    
    try:
        with open(fir_details_path) as f:
            fir_data = json.load(f)
        
        # Group by image_id
        by_image = {}
        for entry in fir_data:
            img_id = entry['image_id']
            if img_id not in by_image:
                by_image[img_id] = {'image_name': entry['image_name'], 'texts': [], 'ipcs': []}
            
            if entry.get('category_id') == 2:  # IPC section
                text = entry.get('text', '').strip()
                if text:
                    by_image[img_id]['ipcs'].append(text)
            else:
                text = entry.get('text', '').strip()
                if text:
                    by_image[img_id]['texts'].append(text)
        
        # Create training samples
        for img_id, data in by_image.items():
            if not data['ipcs']:
                continue
            
            # Extract section numbers from IPC text
            all_sections = []
            for ipc_text in data['ipcs']:
                sections = extract_sections_from_text(ipc_text)
                all_sections.extend(sections)
                # Also try direct parsing (e.g. "420/406/34 Ipc")
                parts = re.split(r'[/,]\s*', ipc_text)
                for part in parts:
                    part = re.sub(r'\s*ipc.*', '', part, flags=re.IGNORECASE).strip().upper()
                    if re.match(r'^\d{1,3}[A-Z]?$', part):
                        all_sections.append(part)
            
            all_sections = sorted(list(set(all_sections)))
            
            if all_sections:
                # Build context text from all non-IPC text from this FIR
                context = ' '.join(data['texts'])
                ipc_text_combined = ' '.join(data['ipcs'])
                full_text = f"{context} {ipc_text_combined}".strip()
                
                samples.append({
                    "text": full_text,
                    "ipc_sections": all_sections,
                    "ipc_raw": data['ipcs'],
                    "source": "fir_images",
                    "image_name": data['image_name'],
                    "language": "en"
                })
        
        print(f"Loaded {len(samples)} samples from FIR_details.json")
    except Exception as e:
        print(f"Error loading FIR details: {e}")
    
    return samples


def build_synthetic_dataset() -> List[Dict]:
    """Build synthetic training samples"""
    samples = []
    
    # Add base SYNTHETIC_FIRS
    for fir in SYNTHETIC_FIRS:
        samples.append({
            "text": fir["text"],
            "ipc_sections": fir["ipc_sections"],
            "source": "synthetic",
            "language": fir["language"],
            "crime_type": fir["crime_type"]
        })
    
    # Add SECTION_VARIATIONS
    for section, texts in SECTION_VARIATIONS.items():
        for text in texts:
            samples.append({
                "text": text,
                "ipc_sections": [section],
                "source": "synthetic_variation",
                "language": "mixed"
            })
    
    print(f"Generated {len(samples)} synthetic samples")
    return samples


def build_complete_dataset(output_path: str):
    """Build and save the complete training dataset"""
    base_dir = Path(__file__).parent.parent
    fir_details_path = base_dir.parent / "datasets" / "fir_documents" / "FIR_details.json"
    
    print("=" * 60)
    print("NYAYA AI — Building FIR Training Dataset")
    print("=" * 60)
    
    all_samples = []
    
    # Source 1: Real FIR images dataset
    real_samples = build_from_fir_details(str(fir_details_path))
    all_samples.extend(real_samples)
    
    # Source 2: Synthetic Hindi/Marathi/English FIRs
    synthetic_samples = build_synthetic_dataset()
    all_samples.extend(synthetic_samples)
    
    # Shuffle
    random.seed(42)
    random.shuffle(all_samples)
    
    # Stats
    languages = {}
    all_ipc = []
    for s in all_samples:
        lang = s.get('language', 'unknown')
        languages[lang] = languages.get(lang, 0) + 1
        all_ipc.extend(s.get('ipc_sections', []))
    
    unique_sections = sorted(list(set(all_ipc)))
    
    print("\n📊 Dataset Statistics:")
    print(f"  Total samples: {len(all_samples)}")
    print(f"  Languages: {languages}")
    print(f"  Unique IPC sections: {len(unique_sections)}")
    print(f"  IPC sections covered: {unique_sections}")
    
    # Save
    output = {
        "metadata": {
            "total_samples": len(all_samples),
            "sources": ["fir_images_icdar2023", "synthetic_hindi_marathi_english"],
            "languages": languages,
            "unique_ipc_sections": unique_sections,
            "ipc_section_count": len(unique_sections)
        },
        "samples": all_samples
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Saved dataset to {output_path}")
    return all_samples


if __name__ == "__main__":
    base_dir = Path(__file__).parent.parent
    output_path = base_dir / "data" / "fir_training_data.json"
    build_complete_dataset(str(output_path))

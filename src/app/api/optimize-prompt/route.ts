// src/app/api/optimize-prompt/route.ts
import { NextResponse } from 'next/server'; // <-- C'est ici que se trouvait l'erreur !

export async function POST(req: Request) {
  try {
    const { intention, type } = await req.json();

    if (!intention) {
      return NextResponse.json({ error: "L'intention est requise" }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Mistral non configurée" }, { status: 500 });
    }

    // Sélection du prompt système selon le type (texte ou image)
    const systemPromptText = `Tu es un formateur expert en ingénierie de prompt pour des professionnels de l'insertion (Missions Locales, Pôle Emploi).
Ton UNIQUE rôle est d'améliorer l'intention brute de l'utilisateur pour en faire un prompt parfait. 
TU NE DOIS PAS RÉPONDRE AU PROMPT. TU DOIS UNIQUEMENT GÉNÉRER LE TEXTE DU PROMPT OPTIMISÉ.

Applique rigoureusement les 5 règles suivantes dans ta proposition :
1. Donne un rôle à l'IA (Ex: "Tu es...")
2. Précise le contexte (Ex: "Je cherche à...")
3. Détaille la mission (Ex: "Ta tâche est de...")
4. Spécifie la forme (Ex: "Réponds sous forme de tableau...")
5. Encourage le dialogue (Ex: "Pose-moi des questions...")

Ne fais pas de blabla avant ou après, renvoie uniquement le prompt prêt à être copié-collé.`;

    const systemPromptImage = `Tu es un directeur artistique expert en IA générative d'images (Midjourney, DALL-E, etc.).
Ton UNIQUE rôle est de transformer l'idée brute de l'utilisateur en un prompt de génération d'image descriptif et puissant.
TU NE DOIS PAS GÉNÉRER D'IMAGE. TU DOIS UNIQUEMENT GÉNÉRER LE TEXTE DU PROMPT.

Applique rigoureusement les clés de structuration suivantes :
1. Contexte / Composition de la scène
2. Rôle du sujet ou des personnages
3. Intention stylistique (photo réaliste, peinture, 3D, etc.)
4. Scénographie, ambiance
5. Palette de couleurs
6. Apparence, détails
7. Limitations (pas de flou, pas de texte, etc.)

Ne fais pas de blabla, renvoie uniquement le prompt prêt à être utilisé.`;

    const systemPrompt = type === 'image' ? systemPromptImage : systemPromptText;

    // Appel à l'API Mistral
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Voici mon intention brute, optimise-la en un prompt expert : \n\n${intention}` }
        ],
        temperature: 0.7,
      }),
    });

    const data = await mistralResponse.json();

    if (!mistralResponse.ok) {
      throw new Error(data.error?.message || "Erreur avec Mistral API");
    }

    return NextResponse.json({ optimizedPrompt: data.choices[0].message.content });

  } catch (error: any) {
    console.error("Erreur API Mistral:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

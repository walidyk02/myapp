import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export async function generate(req: Request, res: Response) {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }

        // 1. Rechercher des scripts similaires
        const { data: similarScripts, error: searchError } = await supabase
            .rpc('search_similar_scripts', {
                p_query: description,
                p_limit: 3
            });

        if (searchError) {
            console.error('Error searching scripts:', searchError);
            throw searchError;
        }

        // 2. Construire le prompt avec les exemples
        const prompt = `
Je veux générer un script avec les caractéristiques suivantes:
Nom: ${name}
Description: ${description}

Voici des exemples de scripts similaires que vous pouvez utiliser comme référence:

${similarScripts.map((script: any, index: number) => `
Exemple ${index + 1}:
${script.script_content}
---
`).join('\n')}

Générez un nouveau script qui:
1. Suit le même style et les mêmes patterns que les exemples
2. Est adapté spécifiquement à la description fournie
3. Inclut la gestion des erreurs
4. Est bien documenté
5. Utilise les meilleures pratiques montrées dans les exemples

Le script généré doit être une nouvelle implémentation, pas une copie des exemples.
`;

        // 3. Appeler Ollama pour générer le script
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'codellama',
                prompt: prompt,
                stream: false
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error('Failed to generate script with Ollama');
        }

        const { response: generatedScript } = await ollamaResponse.json();

        // 4. Sauvegarder le script généré
        const { error: saveError } = await supabase
            .from('scenarios')
            .insert({
                name,
                description,
                script: generatedScript,
                reference_scripts: similarScripts.map((s: any) => s.id),
                created_at: new Date().toISOString()
            });

        if (saveError) {
            console.error('Error saving script:', saveError);
            throw saveError;
        }

        return res.json({
            script: generatedScript,
            references: similarScripts.map((s: any) => ({
                name: s.name,
                similarity: s.similarity
            }))
        });

    } catch (error) {
        console.error('Generation error:', error);
        return res.status(500).json({
            error: 'Failed to generate script',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

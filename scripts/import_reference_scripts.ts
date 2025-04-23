import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configurez vos credentials Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

// Dossier contenant vos scripts de référence
const SCRIPTS_DIR = path.join(__dirname, '../reference_scripts');

interface ScriptMetadata {
    name: string;
    description: string;
    category?: string;
    tags?: string[];
}

async function importScripts() {
    try {
        // Lire tous les fichiers du dossier des scripts
        const files = fs.readdirSync(SCRIPTS_DIR);
        
        for (const file of files) {
            if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.py')) {
                const filePath = path.join(SCRIPTS_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                
                // Lire le fichier metadata associé (si existe)
                const metadataPath = filePath + '.json';
                let metadata: ScriptMetadata = {
                    name: path.basename(file),
                    description: 'Script de référence'
                };
                
                if (fs.existsSync(metadataPath)) {
                    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
                    metadata = { ...metadata, ...JSON.parse(metadataContent) };
                }
                
                // Insérer dans Supabase
                const { error } = await supabase
                    .from('reference_scripts')
                    .insert({
                        name: metadata.name,
                        description: metadata.description,
                        script_content: content,
                        category: metadata.category,
                        tags: metadata.tags
                    });
                
                if (error) {
                    console.error(`Erreur lors de l'importation de ${file}:`, error);
                } else {
                    console.log(`✓ Importé avec succès: ${file}`);
                }
            }
        }
        
        console.log('Importation terminée!');
        
    } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
    }
}

// Lancer l'importation
importScripts();

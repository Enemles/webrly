// import-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Chemin vers le dossier avec les données exportées
const exportDir = path.join(__dirname, 'db_export');

async function main() {
  console.log('Connexion à la base de données locale...');
  
  // Connexion à la base locale
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://root:web3rly_@localhost:5432/weberly'
      }
    }
  });

  // Liste des modèles à importer dans l'ordre pour respecter les dépendances
  const models = [
    'Agency',
    'User',
    'SubAccount',
    'Permissions',
    'Tag',
    'Pipeline',
    'Lane',
    'Contact',
    'Ticket',
    'Media',
    'Funnel',
    'FunnelPage',
    'AgencySidebarOption',
    'SubAccountSidebarOption',
    'Invitation',
    'Notification',
    'Subscription'
  ];

  // Importer chaque modèle
  for (const model of models) {
    try {
      const filePath = path.join(exportDir, `${model}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`Pas de fichier d'export pour ${model}, on passe au suivant.`);
        continue;
      }
      
      console.log(`Importation des données du modèle: ${model}`);
      
      // Lire les données
      const dataStr = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(dataStr);
      
      if (data.length === 0) {
        console.log(`Aucune donnée pour ${model}, on passe au suivant.`);
        continue;
      }

      console.log(`Importation de ${data.length} enregistrements pour ${model}...`);

      // Créer les données
      for (const item of data) {
        try {
          // Supprimer les champs qui pourraient causer des problèmes
          const importItem = { ...item };
          delete importItem.createdAt;
          delete importItem.updatedAt;
          
          // @ts-ignore - nous utilisons la réflexion pour accéder aux modèles dynamiquement
          await localPrisma[model].create({
            data: importItem,
          });
        } catch (error) {
          console.error(`Erreur lors de l'importation d'un enregistrement ${model}:`, error.message);
        }
      }
      
      console.log(`Importation terminée pour ${model}`);
    } catch (error) {
      console.error(`Erreur lors de l'importation du modèle ${model}:`, error);
    }
  }

  await localPrisma.$disconnect();
  console.log('Importation terminée!');
}

main()
  .catch(e => {
    console.error('Erreur lors de l\'importation:', e);
    process.exit(1);
  }); 
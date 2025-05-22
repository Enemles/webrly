// export-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Créer un dossier pour les données exportées
const exportDir = path.join(__dirname, 'db_export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function main() {
  console.log('Connexion à la base de données Neon...');
  
  // Connexion à la base Neon
  const neonPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PROD_DATABASE_URL || 'postgres://neondb_owner:H7hCr3XQILGT@ep-billowing-salad-a2jsuer1-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require'
      }
    }
  });

  // Liste des modèles à exporter
  const models = [
    'User',
    'Agency',
    'SubAccount',
    'Permissions',
    'Pipeline',
    'Lane',
    'Ticket',
    'Tag',
    'Contact',
    'Media',
    'Funnel',
    'FunnelPage',
    'AgencySidebarOption',
    'SubAccountSidebarOption',
    'Invitation',
    'Notification',
    'Subscription'
  ];

  // Exporter chaque modèle
  for (const model of models) {
    try {
      console.log(`Exportation des données du modèle: ${model}`);
      
      // Obtenir les données
      let data = [];
      
      try {
        // @ts-ignore - nous utilisons la réflexion pour accéder aux modèles dynamiquement
        data = await neonPrisma[model].findMany();
      } catch (err) {
        console.warn(`Le modèle ${model} n'existe pas ou ne contient pas de données:`, err.message);
        continue;
      }
      
      if (data.length === 0) {
        console.log(`Aucune donnée pour ${model}, on passe au suivant.`);
        continue;
      }
      
      // Écrire dans un fichier JSON
      const filePath = path.join(exportDir, `${model}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`${data.length} enregistrements exportés vers ${filePath}`);
    } catch (error) {
      console.error(`Erreur lors de l'exportation du modèle ${model}:`, error);
    }
  }

  await neonPrisma.$disconnect();
  console.log('Exportation terminée!');
}

main()
  .catch(e => {
    console.error('Erreur lors de l\'exportation:', e);
    process.exit(1);
  }); 
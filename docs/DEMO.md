# Webrly — Visite guidée démo

> Démo CRM/funnels e-commerce — environnement de test, données fictives, aucune transaction réelle.

URL de connexion : **https://webrly.selmene.dev/agency/sign-in**

Identifiants : voir l'email d'invitation que tu as reçu.

---

## En 5 minutes, voici ce que tu vas voir

1. **L'agence** — un tableau de bord centralisé qui pilote 3 boutiques clientes (Pulse Commerce gère Maison Olive, Bloom Studio et Pixel Pro).
2. **Les sous-comptes** — chaque boutique a son propre espace isolé : son équipe, ses funnels, son pipeline de vente.
3. **Les funnels publiés en live** — chaque funnel a son propre sous-domaine accessible publiquement.
4. **Le pipeline de vente** — un tableau Kanban drag-and-drop pour suivre chaque opportunité commerciale.
5. **L'éditeur visuel** — un drag-and-drop pour modifier les landing pages, sans toucher au code.

---

## Étape 1 — Vue d'agence (`/agency/{id}`)

Après connexion, tu arrives sur le **launchpad de l'agence Pulse Commerce**. Tu y vois :

- Le total des sous-comptes (3 boutiques)
- Les actions de finition de setup (Stripe Connect, équipe, etc.)
- La barre latérale gauche avec : Dashboard, Launchpad, Billing, Settings, Sub Accounts, Team

👉 Clique sur **Sub Accounts** dans la sidebar.

---

## Étape 2 — Liste des boutiques clientes

Tu vois les **3 boutiques** :

| Boutique | Industrie | Ville |
| --- | --- | --- |
| Maison Olive | Épicerie fine méditerranéenne | Marseille |
| Bloom Studio | Mode et accessoires éthiques | Paris |
| Pixel Pro | Accessoires tech premium | Lyon |

Chaque boutique a son propre espace de travail — c'est la **multi-tenancy** : chaque client de l'agence n'a accès qu'à ses données.

👉 Clique sur **Bloom Studio** pour entrer dans son espace.

---

## Étape 3 — Espace boutique (`/subaccount/{id}`)

Tu es maintenant dans le contexte de **Bloom Studio**. La sidebar change : Dashboard, Launchpad, Settings, **Funnels**, Media, **Pipelines**, **Contacts**.

C'est ici que la boutique (ou un membre de son équipe) gère son quotidien.

👉 Clique sur **Funnels** dans la sidebar.

---

## Étape 4 — Funnels publiés

Tu vois la liste des funnels créés pour Bloom Studio :

- **Collection Automne** — drop principal de la saison
- **Capsule Lancement** — accès anticipé pour la liste d'attente
- **Programme Ambassadeur** — cooptation des ambassadeurs

Chaque funnel est **publié** (badge vert) avec son propre sous-domaine.

👉 Clique sur **Collection Automne**.

Tu vois :
- La **liste des pages** du funnel (Home, Merci…)
- Le bouton **Edit** pour ouvrir l'éditeur visuel
- L'URL publique en haut

### Voir la page en live

Ouvre un nouvel onglet et va sur :
- **https://collection-automne.webrly.selmene.dev** — la landing publiée

C'est ce que voient les clients finaux. La page est servie depuis le même backend, avec SSL automatique grâce au wildcard DNS.

👉 Reviens dans l'app, clique sur **Edit** sur la page Home.

---

## Étape 5 — Éditeur visuel

L'éditeur s'ouvre avec :
- À gauche : la palette de composants (Texte, Container, Section, Image, Vidéo, Formulaire de contact, Lien…)
- Au centre : la page rendue, modifiable en direct
- À droite : les paramètres du composant sélectionné (styles, contenu, layout)
- Le sélecteur **Desktop / Tablet / Mobile** en haut pour preview responsive
- **Undo/Redo** pour annuler/refaire

Glisse n'importe quel composant depuis la gauche vers la zone centrale, modifie le texte directement en cliquant dessus, ajuste les couleurs à droite. **Save**, puis recharge l'onglet public — la modif est en ligne.

---

## Étape 6 — Pipeline de vente (Kanban)

Reviens dans l'espace Bloom Studio (clic logo ou Dashboard), puis **Pipelines** dans la sidebar.

Tu vois le **Pipeline collections** avec ses 6 lanes :

```
Nouveau lead → Premier contact → Devis envoyé → Négociation → Gagné → Perdu
```

Chaque carte est un ticket (une opportunité commerciale) avec :
- Un nom (ex. "Commande #4521")
- Une valeur en € (panier prévisionnel)
- Un client rattaché (issu de la base Contacts)
- Des tags colorés
- Un assigné (membre de l'équipe)

**Drag-and-drop** : déplace un ticket d'une lane à l'autre — tu fais évoluer l'opportunité. La somme totale par lane se met à jour automatiquement.

👉 Essaye de déplacer un ticket de "Premier contact" vers "Devis envoyé".

---

## Étape 7 — Contacts

Dans la sidebar → **Contacts**.

Tu vois la liste des ~20 contacts de Bloom Studio — chacun est lié à un ou plusieurs tickets dans le pipeline. C'est le CRM clients de cette boutique.

Quand un visiteur remplit le formulaire d'un funnel publié, il atterrit automatiquement ici, et un ticket est créé dans la lane "Nouveau lead".

---

## Ce qu'il faut retenir

- **1 agence** = la marque agence (Pulse Commerce) qui pilote plusieurs clients
- **N sous-comptes** = chaque client de l'agence (sa boutique, son équipe, ses données isolées)
- **N funnels par boutique** = landing pages publiées en live avec leur propre sous-domaine
- **1 pipeline par boutique** = le tableau Kanban des ventes en cours
- **Contacts + Tickets** = le CRM et le suivi commercial

Le tout connecté à Stripe (Connect) pour les paiements, à Clerk pour l'auth, et hébergé sur infra cloud avec sous-domaines wildcard SSL.

---

## Tester d'autres parcours

- **Maison Olive** → funnel **Coffret Découverte** → https://coffret-decouverte.webrly.selmene.dev
- **Maison Olive** → funnel **Soldes d'Été** → https://soldes-ete-olive.webrly.selmene.dev
- **Pixel Pro** → funnel **Black Friday Tech** → https://black-friday-pixel.webrly.selmene.dev
- **Pixel Pro** → funnel **Précommande X2 Pro** → https://precommande-x2.webrly.selmene.dev
- **Bloom Studio** → funnel **Programme Ambassadeur** → https://ambassadeur-bloom.webrly.selmene.dev

---

## Questions ?

Si tu bloques quelque part ou veux qu'on creuse une fonctionnalité, contacte-moi.

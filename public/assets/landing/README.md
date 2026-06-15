# Vidéos démo de la landing

Dépose ici les 4 captures (Screen Studio) **avec ces noms exacts** :

| Fichier | Section (onglet) | Écran Webrly à filmer | Le scénario (~8-12 s, en boucle) |
|---|---|---|---|
| `website-builder.mp4` | Website Builder — "Ship client sites without code" | Éditeur de funnel (`subaccount/[id]/funnels` → éditeur) | Ouvrir un funnel → glisser-déposer un bloc / éditer un texte → cliquer **Publish** (bonus : la page live). Message : *no-code, drag-and-drop*. |
| `pipelines.mp4` | Pipelines — "See every deal at a glance" | Kanban (`subaccount/[id]/pipelines`) | Le board avec ses lanes → **glisser une carte** d'une lane à la suivante → (option) ouvrir une carte. Message : *visuel, drag-and-drop*. |
| `team-access.mp4` | Team Access — "Bring your whole team, safely" | Équipe (`agency/[id]/team`) | Page équipe → **inviter un membre** (email + rôle) → cocher/décocher l'accès à un sous-compte. Message : *rôles & accès cloisonné*. |
| `leads.mp4` | Leads — "Turn leads into revenue" | Dashboard / launchpad (l'écran du `preview.png`) | Survol du dashboard (Income, Pipeline Value, Conversions) → scroll Funnel Performance → (option) ouvrir un contact/lead. Message : *suivi des leads & conversion*. |

(Optionnel : `hero.mp4` — un montage court qui résume le produit, pour le hero.)

## Specs

- **Format** : MP4 (H.264). Pas besoin de faire le WebM ni le poster → je les génère depuis le MP4 (ffmpeg).
- **Ratio / taille** : **16:9, 1920×1080** (preset standard Screen Studio). Je calerai le cadre dessus.
- **Durée** : 8–12 s, **bouclable** (commence et finis sur une image proche pour un loop invisible).
- **Muet** (autoplay muted), **sans texte de narration** (le titre est déjà dans la section).
- **Poids** : vise ≤ 3–4 Mo / vidéo (Screen Studio → export web).

## Conseils Screen Studio
- **Dashboard Webrly en thème sombre** si possible → cohérent avec la landing dark.
- **Auto-zoom** sur le clic clé, **smooth cursor**, **motion blur** ON.
- Une **seule action claire** par vidéo (pas de tour complet).
- Masque les données perso (vrais emails/clients).

## Une fois prêtes
Dépose les `.mp4` ici et préviens-moi : je génère les `.webm` + posters et je câble `src/config/features.ts` (≈ 1 min). Tant qu'ils ne sont pas là, c'est le `preview.png` qui sert de placeholder.

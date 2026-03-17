# Action Items - Groupe Beauséjour

## Urgent - Cette semaine

### Etienne
- [ ] **Proposition complète** avec scope détaillé
- [ ] Envoyer questionnaire assets au client

---

## En attente du client (avant mi-janvier)

- [ ] **Dépôt** pour réserver créneau mi-janvier
- [ ] Logo vectoriel (couleurs mises à jour)
- [ ] Brand guidelines actualisées
- [ ] Photos professionnelles:
  - [ ] Chaque magasin (extérieur/intérieur)
  - [ ] Staff
  - [ ] Produits prêt-à-manger
- [ ] Vidéos recrutement (Isabelle)
- [ ] Email HR pour formulaire candidatures
- [ ] Handles réseaux sociaux confirmés
- [ ] Statut Google My Business par emplacement

---

## Phase 1: Groupe Beauséjour (Mi-Janvier 2025)

### Semaine 1-2: Wireframes & Content
- [ ] **Wireframes** (début mi-janvier)
- [ ] Wireframes approbation client
- [ ] Audit contenu existant
- [ ] Collecte textes définitifs
- [ ] Réception photos
- [ ] Revue brand guidelines

### Semaine 3-4: Design & Dev
- [ ] Design visuel
- [ ] Setup Webflow
- [ ] CMS Collections:
  - [ ] Emplacements
  - [ ] Prêt-à-manger
  - [ ] FAQ
- [ ] Intégration RGPD (cookies, privacy policy)
- [ ] Formulaires (contact, carrières, fournisseurs)
- [ ] Bilingue FR/EN
- [ ] Population contenu

### Semaine 5: Launch
- [ ] Tests cross-browser
- [ ] Tests mobile
- [ ] Révisions client
- [ ] Formation CMS client
- [ ] Setup analytics
- [ ] Mise en ligne

---

## Phase 2: Carrie Gingembre (Post Phase 1)

- [ ] Discovery call séparé
- [ ] Scope catalogue produits
- [ ] Timeline: 4-5 semaines

---

## Pages à créer

| Page | Priorité | Notes |
|------|----------|-------|
| Accueil | High | Hero, intro, CTA magasins |
| À propos | High | Histoire, mission, valeurs |
| Nos magasins | High | CMS collection, cartes, filtres |
| Prêt-à-manger | Medium | Catégories + lien Carrie Gingembre |
| Carrières | High | Recrutement prioritaire |
| Fournisseurs | Medium | Formulaire partenariats |
| Contact | High | Formulaire + infos |

---

## CMS Collections à configurer

### 1. Emplacements
```
- name (text)
- address (rich text)
- hours (text)
- is_24h (boolean)
- services (multi-select)
- carwash_type (select: manual/auto/both/none)
- image (image)
- directions_url (url)
- phone (text)
```

### 2. Prêt-à-manger
```
- category (select)
- name (text)
- description (rich text)
- image (image)
- available_at (multi-ref to stores)
- nutrition_file (file)
```

### 3. FAQ
```
- question (text)
- answer (rich text)
- category (select)
- order (number)
```

---

## Différences vs attentes initiales

| Attendu | Réalité |
|---------|---------|
| Simple refonte | CMS complet + autonomie |
| 1 projet | **2 projets** (Beauséjour + Carrie Gingembre) |
| Mono-langue | **Bilingue FR/EN** |
| - | RGPD compliance requis |
| - | Page Fournisseurs ajoutée |

```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%2C%22predecessors%22%3A%5B%5D%2C%22earliest%22%3A0%2C%22latest%22%3A0%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22a%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22b%22%5D%2C%22predecessors%22%3A%5B%22r%22%2C%22s%22%5D%2C%22earliest%22%3A282%2C%22latest%22%3A282%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22b%22%2C%22duration%22%3A12%2C%22successors%22%3A%5B%22c%22%2C%22d%22%2C%22e%22%2C%22f%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22c%22%2C%22duration%22%3A4%2C%22successors%22%3A%5B%22i%22%2C%22g%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22d%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22i%22%2C%22g%22%5D%7D%2C%7B%22id%22%3A%22e%22%2C%22name%22%3A%22e%22%2C%22duration%22%3A4%2C%22successors%22%3A%5B%22h%22%2C%22j%22%5D%7D%2C%7B%22id%22%3A%22f%22%2C%22name%22%3A%22f%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22h%22%2C%22j%22%5D%7D%2C%7B%22id%22%3A%22g%22%2C%22name%22%3A%22g%22%2C%22duration%22%3A24%2C%22successors%22%3A%5B%22h%22%2C%22j%22%5D%7D%2C%7B%22id%22%3A%22h%22%2C%22name%22%3A%22h%22%2C%22duration%22%3A20%2C%22successors%22%3A%5B%22k%22%2C%22l%22%5D%7D%2C%7B%22id%22%3A%22i%22%2C%22name%22%3A%22i%22%2C%22duration%22%3A12%2C%22successors%22%3A%5B%22k%22%2C%22l%22%5D%7D%2C%7B%22id%22%3A%22j%22%2C%22name%22%3A%22j%22%2C%22duration%22%3A16%2C%22successors%22%3A%5B%22k%22%2C%22l%22%5D%7D%2C%7B%22id%22%3A%22k%22%2C%22name%22%3A%22k%22%2C%22duration%22%3A32%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22l%22%2C%22name%22%3A%22l%22%2C%22duration%22%3A36%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%2C%22predecessors%22%3A%5B%22u%22%2C%22v%22%2C%22w%22%5D%2C%22earliest%22%3A289%2C%22latest%22%3A289%2C%22slack%22%3A0%7D%5D
```
# URLs de Test pour l'Éditeur CPM - Différents Scénarios

## 🔗 1. Projet Simple (3 tâches linéaires)
**Scénario** : Projet basique avec succession linéaire A → B → C
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22Conception%22%2C%22duration%22%3A10%2C%22successors%22%3A%5B%22b%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22D%C3%A9veloppement%22%2C%22duration%22%3A20%2C%22successors%22%3A%5B%22c%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22Tests%22%2C%22duration%22%3A5%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 2. Projet avec Parallélisme Simple
**Scénario** : Tâches parallèles A → (B,C) → D
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22Planification%22%2C%22duration%22%3A3%2C%22successors%22%3A%5B%22b%22%2C%22c%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22D%C3%A9veloppement%20Frontend%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22D%C3%A9veloppement%20Backend%22%2C%22duration%22%3A12%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22Int%C3%A9gration%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 3. Projet Complexe Multi-Branches !!!
**Scénario** : Structure complexe avec plusieurs points de convergence
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%2C%22b%22%5D%2C%22predecessors%22%3A%5B%5D%2C%22earliest%22%3A0%2C%22latest%22%3A0%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22a%22%2C%22duration%22%3A5%2C%22successors%22%3A%5B%22c%22%5D%2C%22predecessors%22%3A%5B%22start%22%5D%2C%22earliest%22%3A0%2C%22latest%22%3A0%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22b%22%2C%22duration%22%3A7%2C%22successors%22%3A%5B%22c%22%2C%22d%22%5D%2C%22predecessors%22%3A%5B%22start%22%5D%2C%22earliest%22%3A0%2C%22latest%22%3A0%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22c%22%2C%22duration%22%3A10%2C%22successors%22%3A%5B%22e%22%5D%2C%22predecessors%22%3A%5B%22a%22%5D%2C%22earliest%22%3A5%2C%22latest%22%3A5%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22d%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22e%22%2C%22f%22%5D%2C%22predecessors%22%3A%5B%22a%22%2C%22b%22%5D%2C%22earliest%22%3A7%2C%22latest%22%3A7%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22e%22%2C%22name%22%3A%22e%22%2C%22duration%22%3A20%2C%22successors%22%3A%5B%22g%22%5D%2C%22predecessors%22%3A%5B%22c%22%2C%22d%22%5D%2C%22earliest%22%3A15%2C%22latest%22%3A15%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22f%22%2C%22name%22%3A%22f%22%2C%22duration%22%3A12%2C%22successors%22%3A%5B%22g%22%5D%2C%22predecessors%22%3A%5B%22d%22%5D%2C%22earliest%22%3A15%2C%22latest%22%3A23%2C%22slack%22%3A8%7D%2C%7B%22id%22%3A%22g%22%2C%22name%22%3A%22g%22%2C%22duration%22%3A6%2C%22successors%22%3A%5B%22fin%22%5D%2C%22predecessors%22%3A%5B%22e%22%2C%22f%22%5D%2C%22earliest%22%3A35%2C%22latest%22%3A35%2C%22slack%22%3A0%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%2C%22predecessors%22%3A%5B%22g%22%5D%2C%22earliest%22%3A41%2C%22latest%22%3A41%2C%22slack%22%3A0%7D%5D
```

## 🔗 4. Projet avec Durées Variables (Test du Chemin Critique)
**Scénario** : Différentes durées pour identifier le chemin critique
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22Initialisation%22%2C%22duration%22%3A1%2C%22successors%22%3A%5B%22b%22%2C%22c%22%2C%22d%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22T%C3%A2che%20courte%22%2C%22duration%22%3A2%2C%22successors%22%3A%5B%22e%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22T%C3%A2che%20moyenne%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22e%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22T%C3%A2che%20longue%22%2C%22duration%22%3A25%2C%22successors%22%3A%5B%22f%22%5D%7D%2C%7B%22id%22%3A%22e%22%2C%22name%22%3A%22Convergence%201%22%2C%22duration%22%3A3%2C%22successors%22%3A%5B%22f%22%5D%7D%2C%7B%22id%22%3A%22f%22%2C%22name%22%3A%22Finalisation%22%2C%22duration%22%3A4%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 5. Projet Minimal (2 tâches)
**Scénario** : Configuration minimale pour test des limites
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22T%C3%A2che%20unique%22%2C%22duration%22%3A10%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 6. Projet avec Tâches Multiples ID (Test des Tirets)
**Scénario** : IDs avec plusieurs caractères pour tester le formatage automatique
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22task1%22%5D%7D%2C%7B%22id%22%3A%22task1%22%2C%22name%22%3A%22Premi%C3%A8re%20t%C3%A2che%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22task2%22%2C%22task3%22%5D%7D%2C%7B%22id%22%3A%22task2%22%2C%22name%22%3A%22Deuxi%C3%A8me%20t%C3%A2che%22%2C%22duration%22%3A12%2C%22successors%22%3A%5B%22final%22%5D%7D%2C%7B%22id%22%3A%22task3%22%2C%22name%22%3A%22Troisi%C3%A8me%20t%C3%A2che%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22final%22%5D%7D%2C%7B%22id%22%3A%22final%22%2C%22name%22%3A%22T%C3%A2che%20finale%22%2C%22duration%22%3A5%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 7. Projet en Diamant (Test de Convergence)
**Scénario** : Structure en diamant A → (B,C) → D pour tester la convergence
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22Pr%C3%A9paration%22%2C%22duration%22%3A5%2C%22successors%22%3A%5B%22b%22%2C%22c%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22Branche%20gauche%22%2C%22duration%22%3A10%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22Branche%20droite%22%2C%22duration%22%3A8%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22Convergence%22%2C%22duration%22%3A6%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 8. Projet Asymétrique (Test d'Équilibrage)
**Scénario** : Branches déséquilibrées pour tester l'algorithme CPM
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22D%C3%A9but%20projet%22%2C%22duration%22%3A2%2C%22successors%22%3A%5B%22b%22%2C%22c%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22Branche%20rapide%22%2C%22duration%22%3A3%2C%22successors%22%3A%5B%22e%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22Branche%20lente%22%2C%22duration%22%3A20%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22Suite%20lente%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22e%22%5D%7D%2C%7B%22id%22%3A%22e%22%2C%22name%22%3A%22R%C3%A9union%22%2C%22duration%22%3A4%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 9. Votre Projet Original (Complexe)
**Scénario** : Le projet complexe que vous avez fourni
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22a%22%5D%7D%2C%7B%22id%22%3A%22a%22%2C%22name%22%3A%22a%22%2C%22duration%22%3A7%2C%22successors%22%3A%5B%22b%22%5D%7D%2C%7B%22id%22%3A%22b%22%2C%22name%22%3A%22b%22%2C%22duration%22%3A7%2C%22successors%22%3A%5B%22c%22%5D%7D%2C%7B%22id%22%3A%22c%22%2C%22name%22%3A%22c%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22d%22%5D%7D%2C%7B%22id%22%3A%22d%22%2C%22name%22%3A%22d%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22e%22%2C%22g%22%2C%22h%22%5D%7D%2C%7B%22id%22%3A%22e%22%2C%22name%22%3A%22e%22%2C%22duration%22%3A45%2C%22successors%22%3A%5B%22f%22%5D%7D%2C%7B%22id%22%3A%22f%22%2C%22name%22%3A%22f%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22k%22%5D%7D%2C%7B%22id%22%3A%22g%22%2C%22name%22%3A%22g%22%2C%22duration%22%3A45%2C%22successors%22%3A%5B%22m%22%5D%7D%2C%7B%22id%22%3A%22h%22%2C%22name%22%3A%22h%22%2C%22duration%22%3A60%2C%22successors%22%3A%5B%22i%22%5D%7D%2C%7B%22id%22%3A%22i%22%2C%22name%22%3A%22i%22%2C%22duration%22%3A20%2C%22successors%22%3A%5B%22j%22%5D%7D%2C%7B%22id%22%3A%22j%22%2C%22name%22%3A%22j%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22m%22%5D%7D%2C%7B%22id%22%3A%22k%22%2C%22name%22%3A%22k%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22l%22%5D%7D%2C%7B%22id%22%3A%22l%22%2C%22name%22%3A%22l%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22m%22%5D%7D%2C%7B%22id%22%3A%22m%22%2C%22name%22%3A%22m%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22n%22%2C%22p%22%5D%7D%2C%7B%22id%22%3A%22n%22%2C%22name%22%3A%22n%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22o%22%5D%7D%2C%7B%22id%22%3A%22o%22%2C%22name%22%3A%22o%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22q%22%5D%7D%2C%7B%22id%22%3A%22p%22%2C%22name%22%3A%22p%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22t%22%5D%7D%2C%7B%22id%22%3A%22q%22%2C%22name%22%3A%22q%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22r%22%2C%22s%22%5D%7D%2C%7B%22id%22%3A%22r%22%2C%22name%22%3A%22r%22%2C%22duration%22%3A15%2C%22successors%22%3A%5B%22u%22%2C%22w%22%5D%7D%2C%7B%22id%22%3A%22s%22%2C%22name%22%3A%22s%22%2C%22duration%22%3A30%2C%22successors%22%3A%5B%22v%22%2C%22w%22%5D%7D%2C%7B%22id%22%3A%22t%22%2C%22name%22%3A%22t%22%2C%22duration%22%3A7%2C%22successors%22%3A%5B%22u%22%2C%22v%22%5D%7D%2C%7B%22id%22%3A%22u%22%2C%22name%22%3A%22u%22%2C%22duration%22%3A4%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22v%22%2C%22name%22%3A%22v%22%2C%22duration%22%3A2%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22w%22%2C%22name%22%3A%22w%22%2C%22duration%22%3A7%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

## 🔗 10. Projet Vide (Test des Limites)
**Scénario** : Uniquement début et fin pour tester la gestion des cas limites
```
http://localhost:3001/graphe?tasks=%5B%7B%22id%22%3A%22start%22%2C%22name%22%3A%22D%C3%A9but%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%22fin%22%5D%7D%2C%7B%22id%22%3A%22fin%22%2C%22name%22%3A%22fin%22%2C%22duration%22%3A0%2C%22successors%22%3A%5B%5D%7D%5D
```

---

## 🎯 Comment tester efficacement :

### 1. **Tests de Fonctionnalité de Base**
- URLs 1, 2, 5 : Vérifier l'affichage et la navigation

### 2. **Tests de Gestion des Tirets**
- URL 6 : Tester avec des IDs multi-caractères
- Modifier manuellement les successeurs dans l'éditeur

### 3. **Tests de Performance**
- URLs 3, 9 : Projets complexes avec nombreuses tâches

### 4. **Tests de Cas Limites**
- URLs 5, 10 : Configurations minimales

### 5. **Tests d'Algorithme CPM**
- URLs 4, 7, 8 : Vérifier les calculs de chemin critique

### 6. **Tests d'Interface**
- Toutes les URLs : Vérifier la responsivité et l'UX

Chaque URL représente un scénario différent pour valider le bon fonctionnement de votre application CPM et de la gestion automatique des tirets !
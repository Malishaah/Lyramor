# Git-arbetsflöde för Lyramor

## 1. Branch-struktur
- `main` – stabila releaser
- `development` – aktiv utvecklingsgren
- `features/*` – en gren per ny funktion (t.ex. `features/model`)

## 2. Skapa nya grenar
```bash
# Från development
git checkout development
git checkout -b features/<funktionsnamn>

3. Byta gren

git checkout <gren-namn>

4. Ta bort en gren

# Lokalt
git branch -d <gren-namn>

# På fjärr (GitHub)
git push origin --delete <gren-namn>

5. Slå ihop (merge)

# Från development
git checkout development
git merge features/<funktionsnamn>

6. Hantera konflikter

git merge krockar och visar vilka filer som konflikter.

Öppna filen, leta efter:

<<<<<<< HEAD
(din version)
=======
(remote-version)
>>>>>>> features/xyz

Redigera filen till korrekt slutresultat, ta bort konflikt­markeringar.

Markera som löst:

git add <fil>
git commit

Fortsätt arbeta eller pusha.

(Infoga gärna en skärmdump på konfliktmarkeringarna här.)

7. Pusha grenar

git push -u origin development
git push -u origin features/<funktionsnamn>

8. Release till main

# När development är stabil
git checkout main
git merge development
git push origin main
'use client';

import { useMemo } from 'react';
import type { Locale } from '@/components/analyze/types';
import type { ScheduleUi } from '@/components/analyze/CombinedScheduleStep';
import { TEXT } from '@/components/analyze/copy';

export function useScheduleUi(locale: Locale): ScheduleUi {
  const t = TEXT[locale];

  return useMemo(() => {
    const work = t.workTitle ?? (locale === 'fr' ? 'Travail' : locale === 'de' ? 'Arbeit' : 'Work');
    const sleep = t.sleepTitle ?? (locale === 'fr' ? 'Sommeil' : locale === 'de' ? 'Schlaf' : 'Sleep');

    if (locale === 'fr') {
      return {
        title: 'Agenda hebdomadaire',
        subtitle:
          'Vue semaine (travail + sommeil). Sélection : clic début → clic fin (pas 15 min). Over-midnight géré.',
        viewWeek: 'Semaine',
        viewDay: 'Jour',
        prev: t.previous ?? 'Précédent',
        next: t.next ?? 'Suivant',
        required: 'Ajoute au moins 1 segment Travail et 1 segment Sommeil pour continuer.',

        badgeWork: work,
        badgeSleep: sleep,
        clickDayToEdit: 'Clique dans la grille pour saisir, ou sur × pour supprimer.',
        editDayTitle: 'Modifier ce jour',
        overnightNotice: 'Nuit affichée en 2 parties : fin à 24:00 ↘ puis reprise à 00:00 ↗.',

        dayBadge: 'Jour',
        dayHelper:
          '1er clic = début · 2e clic = fin · pas 15 min · passage minuit OK · chevauchement bloqué',
        overlap: 'chevauchement',
        delete: 'Supprimer',
        undo: 'Annuler',
        deleted: 'Segment supprimé',
        tip: 'Astuce : en “Semaine”, tu peux faire Lun 22:00 → Mar 06:00 : ça split automatiquement.',

        sleepMissingTitle: 'Données de sommeil incomplètes',
        sleepMissingBody:
          "Ta saisie de sommeil semble insuffisante/incomplète. Ça peut fausser les scores. Continuer quand même ?",
        sleepMissingContinue: 'Oui, continuer',
        sleepMissingCancel: 'Retour',

        sleepMissingStatsDays: 'Jours avec sommeil',
        sleepMissingStatsTotal: 'Sommeil total (semaine)',
        sleepMissingStatsGap: 'Plus grand intervalle sans sommeil',
        sleepMissingStatsMissing: 'Jours sans sommeil',
        sleepMissingNoneMissing: 'Aucun',
      };
    }

    if (locale === 'de') {
      return {
        title: 'Wochenplan',
        subtitle:
          'Wochenansicht (Arbeit + Schlaf). Auswahl: Startklick → Endklick (15-Min Raster). Über Mitternacht unterstützt.',
        viewWeek: 'Woche',
        viewDay: 'Tag',
        prev: t.previous ?? 'Zurück',
        next: t.next ?? 'Weiter',
        required: 'Füge mindestens 1 Arbeits- und 1 Schlafsegment hinzu, um fortzufahren.',

        badgeWork: work,
        badgeSleep: sleep,
        clickDayToEdit: 'In die Grid klicken zum Eintragen oder × zum Löschen.',
        editDayTitle: 'Diesen Tag bearbeiten',
        overnightNotice: 'Über Nacht als 2 Teile: Ende 24:00 ↘ und Start 00:00 ↗.',

        dayBadge: 'Tag',
        dayHelper:
          '1. Klick = Start · 2. Klick = Ende · 15 Min Raster · Mitternacht OK · Überlappung blockiert',
        overlap: 'Überlappung',
        delete: 'Löschen',
        undo: 'Rückgängig',
        deleted: 'Segment gelöscht',
        tip: 'Tipp: In “Woche” kannst du Mo 22:00 → Di 06:00 setzen: wird automatisch gesplittet.',

        sleepMissingTitle: 'Schlafdaten unvollständig',
        sleepMissingBody:
          'Deine Schlafangaben wirken unvollständig/zu gering. Das kann die Scores verfälschen. Trotzdem fortfahren?',
        sleepMissingContinue: 'Ja, fortfahren',
        sleepMissingCancel: 'Zurück',

        sleepMissingStatsDays: 'Tage mit Schlaf',
        sleepMissingStatsTotal: 'Schlaf gesamt (Woche)',
        sleepMissingStatsGap: 'Längste Zeit ohne Schlaf',
        sleepMissingStatsMissing: 'Tage ohne Schlaf',
        sleepMissingNoneMissing: 'Keine',
      };
    }

    return {
      title: 'Weekly schedule',
      subtitle:
        'Week view (Work + Sleep). Selection: click start → click end (15 min snap). Cross-midnight supported.',
      viewWeek: 'Week',
      viewDay: 'Day',
      prev: t.previous ?? 'Prev',
      next: t.next ?? 'Next',
      required: 'Add at least one Work segment and one Sleep segment to continue.',

      badgeWork: work,
      badgeSleep: sleep,
      clickDayToEdit: 'Click in the grid to add, or × to delete.',
      editDayTitle: 'Edit this day',
      overnightNotice: 'Overnight shown in 2 parts: ends at 24:00 ↘ then resumes at 00:00 ↗.',

      dayBadge: 'Day',
      dayHelper: 'Click start · click end · 15 min snap · cross-midnight OK · overlaps blocked',
      overlap: 'overlap',
      delete: 'Delete',
      undo: 'Undo',
      deleted: 'Segment deleted',
      tip: 'Tip: In “Week”, you can set Mon 22:00 → Tue 06:00: it auto-splits.',

      sleepMissingTitle: 'Sleep data looks incomplete',
      sleepMissingBody:
        'Your sleep input looks incomplete/too low. This may distort the scores. Continue anyway?',
      sleepMissingContinue: 'Yes, continue',
      sleepMissingCancel: 'Go back',

      sleepMissingStatsDays: 'Days with sleep',
      sleepMissingStatsTotal: 'Total sleep (week)',
      sleepMissingStatsGap: 'Longest gap without sleep',
      sleepMissingStatsMissing: 'Days without sleep',
      sleepMissingNoneMissing: 'None',
    };
  }, [locale, t]);
}
export const LOCALES = ['fr', 'en', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
    return (LOCALES as readonly string[]).includes(value);
}

export const dictionaries = {
    fr: {
        tagline: 'Chronobiologie · horaires atypiques · recherche',
        days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        common: {
            home: 'Accueil',
            analyze: 'Analyse',
            method: 'Méthode',
            study: 'Étude',
            consent: 'Consentement',
            legal: 'Légal',
            about: 'À propos',
            shortMode: 'Court',
            longMode: 'Long',
            calculate: 'Calculer le score',
            exportReport: 'Exporter le rapport (JSON)',
            contribute: "Contribuer à l'étude",
            saveLocal: 'Sauvegarde locale (navigateur)',
            loading: 'Envoi...',
        },
        home: {
            badge: 'Circadian Research',
            title: 'Analyse de compatibilité travail / sommeil sur 7 jours',
            subtitle:
                'Shiftwell calcule des scores indicatifs à partir d’un agenda hebdomadaire (travail + sommeil) pour les professionnels à horaires atypiques.',
            cards: [
                {
                    kicker: 'Agenda',
                    title: 'Saisie semaine',
                    text: 'Saisis tes plages de travail et de sommeil, avec gestion des segments multiples et des shifts qui passent minuit.',
                },
                {
                    kicker: 'Scores',
                    title: '3 scores en sortie',
                    text: 'Risque (SLI proxy), sommeil (proxy) et adaptabilité (score principal) avec explications transparentes.',
                },
                {
                    kicker: 'Recherche',
                    title: "Contribution opt-in",
                    text: 'Le score est calculé localement. La contribution à l’étude est proposée ensuite, avec consentement explicite.',
                },
            ],
            disclaimerTitle: 'Important.',
            disclaimerText:
                'Outil de recherche / pré-analyse. Ne remplace pas un avis médical.',
            startCta: 'Commencer l’analyse',
        },
        analyze: {
            title: 'Analyse hebdomadaire',
            subtitle:
                'Version MVP logique (saisie par jour). On pourra ensuite passer à une vraie grille visuelle type calendrier.',
            modeLabel: 'Version du questionnaire',
            profileTitle: 'Profil',
            profession: 'Métier',
            ageBand: "Tranche d'âge",
            sex: 'Sexe',
            locale: 'Langue',
            timezone: 'Fuseau',
            professionOptions: [
                'Infirmier / Infirmière',
                'Sécurité',
                'Transport / Logistique',
                'Industrie',
                'Restauration / Hôtellerie',
                'Autre',
            ],
            ageBands: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
            sexOptions: ['Femme', 'Homme', 'Autre / non spécifié'],
            longQuestions: {
                title: 'Questions complémentaires (mode long)',
                fatigue: 'Fatigue perçue (0-10)',
                sleepQuality: 'Qualité de sommeil perçue (0-10)',
                lateCaffeine: 'Caféine tardive (après 16h)',
            },
            scheduleTitle: 'Agenda hebdomadaire',
            scheduleHelp:
                'Ajoute plusieurs segments si nécessaire. Si l’heure de fin est plus petite que l’heure de début, le segment est traité comme “passe minuit”.',
            workSegments: 'Travail',
            sleepSegments: 'Sommeil',
            addSegment: 'Ajouter',
            segmentStart: 'Début',
            segmentEnd: 'Fin',
            delete: 'Supprimer',
            resultsTitle: 'Résultats',
            scores: {
                adaptability: 'Adaptabilité',
                risk: 'Risque (SLI proxy)',
                sleep: 'Sommeil (proxy)',
            },
            scoreVersionLabel: 'Version score',
            noReferenceConfigured:
                'Référence moyenne non configurée (à brancher sur papier ou cohorte).',
            referenceDelta: 'Écart à la moyenne',
            metricsTitle: 'Métriques dérivées',
            explanationsTitle: 'Pourquoi ce score ?',
            consentTitle: "Contribution à l'étude",
            consentBody:
                "Le score est déjà calculé localement. Tu peux maintenant contribuer à l’étude (opt-in) en envoyant une version pseudonymisée de tes données.",
            explicitConsent:
                "J’accepte explicitement l’utilisation de mes données pour cette étude de chronobiologie (voir notice d’information).",
            recontactConsent:
                'J’accepte d’être recontacté ultérieurement (optionnel, dataset séparé plus tard).',
            consentNoticeVersion: 'Version notice',
            sendContribution: 'Envoyer ma contribution',
            collectorMissing:
                'Aucun endpoint de collecte configuré (NEXT_PUBLIC_SHIFTWELL_COLLECTOR_URL manquant).',
            contributionOk: 'Contribution envoyée.',
            contributionError: "Échec d'envoi de la contribution.",
            scientificNote:
                'Le scoring ci-dessous est une version proxy v0.1 (seuils à aligner finement avec le papier / protocole).',
        },
    },
    en: {
        tagline: 'Chronobiology · shift work · research',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        common: {
            home: 'Home',
            analyze: 'Analyze',
            method: 'Method',
            study: 'Study',
            consent: 'Consent',
            legal: 'Legal',
            about: 'About',
            shortMode: 'Short',
            longMode: 'Long',
            calculate: 'Calculate score',
            exportReport: 'Export report (JSON)',
            contribute: 'Contribute to the study',
            saveLocal: 'Local browser draft',
            loading: 'Sending...',
        },
        home: {
            badge: 'Circadian Research',
            title: 'Work / sleep compatibility analysis over 7 days',
            subtitle:
                'Shiftwell computes indicative scores from a weekly schedule (work + sleep) for professionals with atypical working hours.',
            cards: [
                {
                    kicker: 'Schedule',
                    title: 'Weekly input',
                    text: 'Enter work and sleep slots with multiple segments and cross-midnight support.',
                },
                {
                    kicker: 'Scores',
                    title: '3 outputs',
                    text: 'Risk (SLI proxy), sleep (proxy), and adaptability (main score) with transparent explanations.',
                },
                {
                    kicker: 'Research',
                    title: 'Opt-in contribution',
                    text: 'Your score is computed locally first. Study contribution is optional and shown afterwards with explicit consent.',
                },
            ],
            disclaimerTitle: 'Important.',
            disclaimerText:
                'Research / pre-analysis tool. Does not replace medical advice.',
            startCta: 'Start analysis',
        },
        analyze: {
            title: 'Weekly analysis',
            subtitle:
                'MVP logical version (day-based input). We can later switch to a visual calendar grid.',
            modeLabel: 'Questionnaire mode',
            profileTitle: 'Profile',
            profession: 'Profession',
            ageBand: 'Age band',
            sex: 'Sex',
            locale: 'Language',
            timezone: 'Timezone',
            professionOptions: [
                'Nurse',
                'Security',
                'Transport / Logistics',
                'Industry',
                'Hospitality / Food service',
                'Other',
            ],
            ageBands: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
            sexOptions: ['Female', 'Male', 'Other / not specified'],
            longQuestions: {
                title: 'Additional questions (long mode)',
                fatigue: 'Perceived fatigue (0-10)',
                sleepQuality: 'Perceived sleep quality (0-10)',
                lateCaffeine: 'Late caffeine (after 4 PM)',
            },
            scheduleTitle: 'Weekly schedule',
            scheduleHelp:
                'Add multiple segments when needed. If end time is smaller than start time, the segment is treated as “crosses midnight”.',
            workSegments: 'Work',
            sleepSegments: 'Sleep',
            addSegment: 'Add',
            segmentStart: 'Start',
            segmentEnd: 'End',
            delete: 'Delete',
            resultsTitle: 'Results',
            scores: {
                adaptability: 'Adaptability',
                risk: 'Risk (SLI proxy)',
                sleep: 'Sleep (proxy)',
            },
            scoreVersionLabel: 'Scoring version',
            noReferenceConfigured:
                'Reference mean not configured yet (paper or cohort baseline).',
            referenceDelta: 'Delta to average',
            metricsTitle: 'Derived metrics',
            explanationsTitle: 'Why this score?',
            consentTitle: 'Study contribution',
            consentBody:
                'Your score is already computed locally. You can now opt in and contribute a pseudonymized version of your data to the study.',
            explicitConsent:
                'I explicitly consent to the use of my data for this chronobiology study (see participant information notice).',
            recontactConsent:
                'I agree to be recontacted later (optional, separate dataset later).',
            consentNoticeVersion: 'Notice version',
            sendContribution: 'Send contribution',
            collectorMissing:
                'No collector endpoint configured (NEXT_PUBLIC_SHIFTWELL_COLLECTOR_URL missing).',
            contributionOk: 'Contribution sent.',
            contributionError: 'Failed to send contribution.',
            scientificNote:
                'The scoring below is a proxy v0.1 (thresholds still to be aligned precisely with the paper / protocol).',
        },
    },
    de: {
        tagline: 'Chronobiologie · Schichtarbeit · Forschung',
        days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        common: {
            home: 'Start',
            analyze: 'Analyse',
            method: 'Methodik',
            study: 'Studie',
            consent: 'Einwilligung',
            legal: 'Rechtliches',
            about: 'Über',
            shortMode: 'Kurz',
            longMode: 'Lang',
            calculate: 'Score berechnen',
            exportReport: 'Bericht exportieren (JSON)',
            contribute: 'Zur Studie beitragen',
            saveLocal: 'Lokal im Browser',
            loading: 'Senden...',
        },
        home: {
            badge: 'Circadian Research',
            title: 'Analyse von Arbeit / Schlaf über 7 Tage',
            subtitle:
                'Shiftwell berechnet indikative Scores aus einem Wochenplan (Arbeit + Schlaf) für Personen mit atypischen Arbeitszeiten.',
            cards: [
                {
                    kicker: 'Plan',
                    title: 'Wochen-Eingabe',
                    text: 'Arbeits- und Schlafzeiten mit mehreren Segmenten und Unterstützung für Schichten über Mitternacht.',
                },
                {
                    kicker: 'Scores',
                    title: '3 Ergebnisse',
                    text: 'Risiko (SLI-Proxy), Schlaf (Proxy) und Anpassungsfähigkeit (Hauptscore) mit transparenter Erklärung.',
                },
                {
                    kicker: 'Forschung',
                    title: 'Opt-in Beitrag',
                    text: 'Der Score wird zuerst lokal berechnet. Danach ist ein freiwilliger Studienbeitrag mit ausdrücklicher Einwilligung möglich.',
                },
            ],
            disclaimerTitle: 'Wichtig.',
            disclaimerText:
                'Forschungs-/Voranalyse-Tool. Kein Ersatz für medizinische Beratung.',
            startCta: 'Analyse starten',
        },
        analyze: {
            title: 'Wochenanalyse',
            subtitle:
                'MVP-Logikversion (tageweise Eingabe). Später kann eine visuelle Kalenderansicht folgen.',
            modeLabel: 'Fragebogen-Modus',
            profileTitle: 'Profil',
            profession: 'Beruf',
            ageBand: 'Altersgruppe',
            sex: 'Geschlecht',
            locale: 'Sprache',
            timezone: 'Zeitzone',
            professionOptions: [
                'Pflege',
                'Sicherheit',
                'Transport / Logistik',
                'Industrie',
                'Gastronomie / Hotel',
                'Andere',
            ],
            ageBands: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
            sexOptions: ['Weiblich', 'Männlich', 'Andere / nicht angegeben'],
            longQuestions: {
                title: 'Zusatzfragen (Langmodus)',
                fatigue: 'Wahrgenommene Müdigkeit (0-10)',
                sleepQuality: 'Wahrgenommene Schlafqualität (0-10)',
                lateCaffeine: 'Koffein spät (nach 16 Uhr)',
            },
            scheduleTitle: 'Wochenplan',
            scheduleHelp:
                'Mehrere Segmente sind möglich. Wenn die Endzeit kleiner als die Startzeit ist, wird das Segment als „über Mitternacht“ behandelt.',
            workSegments: 'Arbeit',
            sleepSegments: 'Schlaf',
            addSegment: 'Hinzufügen',
            segmentStart: 'Start',
            segmentEnd: 'Ende',
            delete: 'Löschen',
            resultsTitle: 'Ergebnisse',
            scores: {
                adaptability: 'Anpassungsfähigkeit',
                risk: 'Risiko (SLI-Proxy)',
                sleep: 'Schlaf (Proxy)',
            },
            scoreVersionLabel: 'Score-Version',
            noReferenceConfigured:
                'Referenzmittelwert noch nicht konfiguriert (Paper oder Kohorte).',
            referenceDelta: 'Abweichung vom Mittelwert',
            metricsTitle: 'Abgeleitete Metriken',
            explanationsTitle: 'Warum dieser Score?',
            consentTitle: 'Studienbeitrag',
            consentBody:
                'Dein Score wurde bereits lokal berechnet. Du kannst jetzt freiwillig eine pseudonymisierte Version deiner Daten an die Studie senden.',
            explicitConsent:
                'Ich willige ausdrücklich in die Nutzung meiner Daten für diese chronobiologische Studie ein (siehe Teilnehmerinformation).',
            recontactConsent:
                'Ich bin mit einer späteren Kontaktaufnahme einverstanden (optional, später getrenntes Dataset).',
            consentNoticeVersion: 'Version der Information',
            sendContribution: 'Beitrag senden',
            collectorMissing:
                'Kein Collector-Endpunkt konfiguriert (NEXT_PUBLIC_SHIFTWELL_COLLECTOR_URL fehlt).',
            contributionOk: 'Beitrag gesendet.',
            contributionError: 'Senden fehlgeschlagen.',
            scientificNote:
                'Das Scoring unten ist eine Proxy-Version v0.1 (Schwellen müssen noch präzise am Paper/Protokoll ausgerichtet werden).',
        },
    },
} as const;

export type Dictionary = typeof dictionaries.fr;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}
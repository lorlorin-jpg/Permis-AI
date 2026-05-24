import { PrismaClient, QuestionCategory, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface SeedAnswer {
  text: string;
  isCorrect: boolean;
}

interface SeedQuestion {
  text: string;
  explanation: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  tags: string[];
  answers: SeedAnswer[];
}

// ─────────────────────────────────────────
// Questions
// ─────────────────────────────────────────

const questions: SeedQuestion[] = [
  // ────────────────────────────────────────
  // SIGNS (Panneaux de signalisation)
  // ────────────────────────────────────────
  {
    text: "Que signifie un panneau circulaire rouge avec un chiffre blanc '50' ?",
    explanation:
      "Un panneau circulaire rouge avec un chiffre blanc indique une limitation de vitesse maximale autorisée. Le '50' signifie que vous ne devez pas dépasser 50 km/h. Cette limitation s'applique jusqu'au prochain panneau de fin de limitation ou jusqu'à la sortie de l'agglomération.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'vitesse', 'limitation', 'cercle rouge'],
    answers: [
      { text: 'Vitesse minimale recommandée de 50 km/h', isCorrect: false },
      { text: 'Vitesse maximale autorisée de 50 km/h', isCorrect: true },
      { text: 'Vous approchez d\'une zone à 50 km/h dans 500 mètres', isCorrect: false },
      { text: 'Fin de limitation de vitesse à 50 km/h', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un triangle rouge avec un point d'exclamation ?",
    explanation:
      "Le triangle rouge avec un point d'exclamation est le panneau de danger général. Il signale un danger particulier non spécifié par un autre panneau. Les conducteurs doivent redoubler de prudence et adapter leur vitesse aux conditions.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'danger', 'triangle', 'attention'],
    answers: [
      { text: 'Travaux en cours', isCorrect: false },
      { text: 'Passage pour piétons', isCorrect: false },
      { text: 'Danger général non spécifié', isCorrect: true },
      { text: 'Carrefour prioritaire', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau rectangulaire bleu avec une flèche blanche indiquant la droite ?",
    explanation:
      "Un panneau rectangulaire bleu avec une flèche blanche est un panneau d'indication ou de direction sur autoroute et routes principales. Il indique une direction ou une sortie à suivre. La couleur bleue est caractéristique des panneaux d'autoroute en Suisse.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'direction', 'autoroute', 'bleu'],
    answers: [
      { text: 'Interdiction de tourner à droite', isCorrect: false },
      { text: 'Direction obligatoire vers la droite', isCorrect: false },
      { text: 'Indication de direction ou de sortie', isCorrect: true },
      { text: 'Déviation vers la droite', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau circulaire bleu avec une flèche blanche tournant vers la droite ?",
    explanation:
      "Un panneau circulaire bleu avec une flèche blanche indique une obligation. Dans ce cas, la flèche vers la droite signifie que vous êtes obligé de tourner à droite. Contrairement aux panneaux rouges qui interdisent, les panneaux bleus ronds prescrivent un comportement obligatoire.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.MEDIUM,
    tags: ['panneau', 'obligation', 'bleu', 'direction obligatoire'],
    answers: [
      { text: 'Recommandation de tourner à droite', isCorrect: false },
      { text: 'Interdiction de tourner à gauche', isCorrect: false },
      { text: 'Obligation de tourner à droite', isCorrect: true },
      { text: 'Sens unique à droite recommandé', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau circulaire rouge avec une barre horizontale blanche ?",
    explanation:
      "Ce panneau signifie 'Entrée interdite' (sens interdit). Il est placé à l'entrée d'une voie à sens unique ou d'une zone d'accès limité. Aucun véhicule ne peut s'engager dans cette direction sous peine d'amende et de risque d'accident frontal.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'interdiction', 'sens interdit', 'entrée interdite'],
    answers: [
      { text: 'Fin de toutes les interdictions', isCorrect: false },
      { text: 'Arrêt interdit', isCorrect: false },
      { text: 'Entrée interdite (sens interdit)', isCorrect: true },
      { text: 'Stationnement interdit', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un triangle rouge avec une silhouette de piéton ?",
    explanation:
      "Ce panneau triangulaire rouge avec une silhouette de piéton signale un passage pour piétons à proximité ou une zone de traversée fréquente par des piétons. Le conducteur doit ralentir et être prêt à céder le passage aux piétons voulant traverser.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'piéton', 'passage', 'attention'],
    answers: [
      { text: 'Zone piétonne, accès interdit aux véhicules', isCorrect: false },
      { text: 'Attention, passage pour piétons à proximité', isCorrect: true },
      { text: 'Passage souterrain pour piétons', isCorrect: false },
      { text: 'École, enfants qui traversent', isCorrect: false },
    ],
  },
  {
    text: "Que signifie le panneau octogonal rouge avec 'STOP' écrit en blanc ?",
    explanation:
      "Le panneau STOP (octogone rouge) est le seul panneau octogonal en Suisse. Il signifie que vous devez marquer un arrêt complet avant la ligne de cédez-le-passage, même si la voie est libre. Un simple ralentissement n'est pas suffisant ; un arrêt complet est obligatoire.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'stop', 'arrêt obligatoire', 'priorité'],
    answers: [
      { text: 'Ralentir et céder le passage si nécessaire', isCorrect: false },
      { text: 'Arrêt complet obligatoire avant de poursuivre', isCorrect: true },
      { text: 'Arrêt interdit sauf urgence', isCorrect: false },
      { text: 'Zone de stationnement interdit', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau triangulaire rouge représentant deux voitures se croisant ?",
    explanation:
      "Ce panneau avertit d'un rétrécissement de la chaussée ou d'une route étroite où deux véhicules peuvent difficilement se croiser. Il faut ralentir et être prêt à serrer à droite ou à s'arrêter pour laisser passer un véhicule venant en sens inverse.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.MEDIUM,
    tags: ['panneau', 'rétrécissement', 'route étroite', 'croisement'],
    answers: [
      { text: 'Interdiction de dépasser', isCorrect: false },
      { text: 'Carrefour à double sens', isCorrect: false },
      { text: 'Rétrécissement de la chaussée, croisement difficile', isCorrect: true },
      { text: 'Voie réservée aux véhicules venant en face', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau carré bleu avec un 'P' blanc ?",
    explanation:
      "Un panneau carré bleu avec la lettre 'P' blanche indique un parc de stationnement autorisé. Il peut être accompagné d'indications complémentaires sur la durée maximale de stationnement ou les conditions d'accès (payant, disque de stationnement, etc.).",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'stationnement', 'parking', 'bleu'],
    answers: [
      { text: 'Stationnement interdit', isCorrect: false },
      { text: 'Zone de police', isCorrect: false },
      { text: 'Parc de stationnement autorisé', isCorrect: true },
      { text: 'Priorité aux piétons', isCorrect: false },
    ],
  },
  {
    text: "Que signifie un panneau triangulaire rouge représentant un feu tricolore ?",
    explanation:
      "Ce panneau triangulaire rouge avec un feu tricolore avertit d'un carrefour à feux de signalisation à proximité. Le conducteur doit être prêt à s'arrêter au feu rouge et à respecter les indications des feux. Ce panneau est placé en amont du carrefour.",
    category: QuestionCategory.SIGNS,
    difficulty: Difficulty.EASY,
    tags: ['panneau', 'feux', 'signalisation', 'carrefour'],
    answers: [
      { text: 'Les feux sont en panne, prudence', isCorrect: false },
      { text: 'Attention, carrefour à feux de signalisation à proximité', isCorrect: true },
      { text: 'Vous pouvez passer au feu orange', isCorrect: false },
      { text: 'Carrefour sans feux, priorité à droite', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // PRIORITY (Priorité)
  // ────────────────────────────────────────
  {
    text: "À un carrefour sans signalisation en Suisse, qui a la priorité ?",
    explanation:
      "En Suisse, à un carrefour sans signalisation particulière, la règle de base est la priorité à droite : le véhicule venant de votre droite est prioritaire. Cette règle s'applique également entre véhicules circulant sur des routes d'importance équivalente.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.EASY,
    tags: ['priorité', 'carrefour', 'droite', 'règle générale'],
    answers: [
      { text: 'Le véhicule le plus grand', isCorrect: false },
      { text: 'Le véhicule venant de gauche', isCorrect: false },
      { text: 'Le véhicule venant de droite', isCorrect: true },
      { text: 'Le premier arrivé au carrefour', isCorrect: false },
    ],
  },
  {
    text: "Que signifie la règle de priorité de droite en Suisse ?",
    explanation:
      "La priorité à droite signifie que vous devez céder le passage à tout véhicule arrivant de votre droite sur une route d'importance équivalente. Cette règle s'applique en l'absence de signalisation de priorité et garantit un ordre de passage logique aux carrefours.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.EASY,
    tags: ['priorité', 'droite', 'règle', 'carrefour'],
    answers: [
      { text: 'Vous avez toujours la priorité si vous êtes à droite du carrefour', isCorrect: false },
      { text: 'Vous devez céder le passage aux véhicules venant de votre droite', isCorrect: true },
      { text: 'Les véhicules à droite doivent s\'arrêter', isCorrect: false },
      { text: 'La voie de droite est prioritaire sur la voie de gauche', isCorrect: false },
    ],
  },
  {
    text: "Vous êtes sur une route principale (signalée par un panneau de priorité). Un véhicule veut s'insérer depuis une route secondaire. Qui a la priorité ?",
    explanation:
      "Sur une route principale signalée par un panneau de priorité (losange jaune avec bordure blanche), vous êtes prioritaire. Le conducteur venant de la route secondaire doit obligatoirement céder le passage avant de s'engager sur la route principale.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.EASY,
    tags: ['priorité', 'route principale', 'route secondaire', 'losange jaune'],
    answers: [
      { text: 'Le véhicule venant de la route secondaire', isCorrect: false },
      { text: 'Le véhicule roulant sur la route principale', isCorrect: true },
      { text: 'Le véhicule venant de droite, peu importe la route', isCorrect: false },
      { text: 'Ils doivent se concerter entre eux', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la règle de priorité pour les véhicules d'urgence (ambulance, pompiers, police) en Suisse ?",
    explanation:
      "Les véhicules d'urgence utilisant leurs signaux lumineux et sonores (gyrophares et sirènes) bénéficient de la priorité absolue. Vous devez immédiatement vous ranger sur la droite et céder le passage, même si vous avez la priorité selon d'autres règles.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.EASY,
    tags: ['priorité', 'urgence', 'ambulance', 'pompiers', 'gyrophare'],
    answers: [
      { text: 'Ils respectent les mêmes règles que les autres véhicules', isCorrect: false },
      { text: 'Ils ont la priorité uniquement sur autoroute', isCorrect: false },
      { text: 'Ils ont la priorité absolue et vous devez vous ranger à droite', isCorrect: true },
      { text: 'Vous pouvez continuer si vous avez la priorité', isCorrect: false },
    ],
  },
  {
    text: "Dans un rond-point sans signalisation spécifique en Suisse, qui a la priorité ?",
    explanation:
      "En Suisse, dans un rond-point signalé par le panneau 'Cédez le passage', les véhicules circulant à l'intérieur du rond-point ont la priorité sur ceux qui veulent y entrer. Cette règle a été inversée en 2000 pour améliorer la fluidité du trafic.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.MEDIUM,
    tags: ['priorité', 'rond-point', 'giratoire', 'cédez le passage'],
    answers: [
      { text: 'Le véhicule entrant dans le rond-point', isCorrect: false },
      { text: 'Le véhicule venant de droite à l\'intérieur du rond-point', isCorrect: false },
      { text: 'Les véhicules circulant à l\'intérieur du rond-point', isCorrect: true },
      { text: 'Le premier arrivé au rond-point', isCorrect: false },
    ],
  },
  {
    text: "Vous approchez d'un carrefour avec un panneau 'cédez le passage' (triangle inversé). Que devez-vous faire ?",
    explanation:
      "Le panneau 'Cédez le passage' (triangle rouge inversé) signifie que vous devez laisser passer tous les véhicules qui circulent sur la route que vous allez croiser. Contrairement au STOP, vous n'êtes pas obligé de vous arrêter si la voie est libre, mais vous devez impérativement céder la priorité.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.EASY,
    tags: ['priorité', 'cédez le passage', 'triangle inversé', 'carrefour'],
    answers: [
      { text: 'Vous arrêter complètement avant de poursuivre', isCorrect: false },
      { text: 'Céder le passage aux véhicules sur la route croisée', isCorrect: true },
      { text: 'Accélérer pour passer avant les autres véhicules', isCorrect: false },
      { text: 'Utiliser votre klaxon pour signaler votre passage', isCorrect: false },
    ],
  },
  {
    text: "Sur une route en montagne en Suisse, entre deux véhicules qui se croisent sur une route étroite, lequel doit se ranger ?",
    explanation:
      "Sur les routes de montagne étroites en Suisse, le véhicule qui monte a la priorité sur celui qui descend. En pratique, c'est le véhicule descendant qui doit se ranger ou reculer jusqu'à un endroit permettant le croisement. Cette règle reconnaît qu'il est techniquement plus facile de reculer en descendant.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.MEDIUM,
    tags: ['priorité', 'montagne', 'route étroite', 'croisement'],
    answers: [
      { text: 'Le véhicule qui monte doit se ranger', isCorrect: false },
      { text: 'Le plus petit véhicule doit se ranger', isCorrect: false },
      { text: 'Le véhicule qui descend doit se ranger', isCorrect: true },
      { text: 'Celui dont le conducteur est le moins expérimenté', isCorrect: false },
    ],
  },
  {
    text: "Les cyclistes ont-ils des droits de priorité spéciaux en Suisse ?",
    explanation:
      "En Suisse, les cyclistes sont soumis aux mêmes règles de priorité que les autres usagers de la route, mais ils bénéficient d'une protection renforcée dans certains cas. Par exemple, les pistes cyclables traversant un carrefour peuvent être prioritaires, et les conducteurs doivent particulièrement veiller à ne pas mettre en danger les cyclistes, qui sont des usagers vulnérables.",
    category: QuestionCategory.PRIORITY,
    difficulty: Difficulty.MEDIUM,
    tags: ['priorité', 'cyclistes', 'vélo', 'usagers vulnérables'],
    answers: [
      { text: 'Les cyclistes ont toujours la priorité sur les voitures', isCorrect: false },
      { text: 'Les cyclistes sont soumis aux mêmes règles mais sont des usagers vulnérables à protéger', isCorrect: true },
      { text: 'Les cyclistes n\'ont aucune priorité spéciale', isCorrect: false },
      { text: 'Les cyclistes ont la priorité uniquement en ville', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // SPEED_LIMITS (Limitations de vitesse)
  // ────────────────────────────────────────
  {
    text: "Quelle est la vitesse maximale autorisée en agglomération en Suisse ?",
    explanation:
      "En agglomération (localité), la vitesse maximale autorisée en Suisse est de 50 km/h, sauf indication contraire. Cette limite s'applique dès l'entrée de la localité, signalée par le panneau de localité. Certaines zones résidentielles peuvent avoir une limite de 30 km/h.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.EASY,
    tags: ['vitesse', 'agglomération', 'localité', '50 km/h'],
    answers: [
      { text: '30 km/h', isCorrect: false },
      { text: '50 km/h', isCorrect: true },
      { text: '60 km/h', isCorrect: false },
      { text: '80 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la vitesse maximale autorisée hors agglomération sur une route ordinaire en Suisse ?",
    explanation:
      "Hors agglomération, sur les routes ordinaires (hors autoroute et semi-autoroute), la vitesse maximale autorisée est de 80 km/h. Cette limite s'applique automatiquement en dehors des localités, sauf si des panneaux indiquent une autre limitation.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.EASY,
    tags: ['vitesse', 'hors agglomération', 'route ordinaire', '80 km/h'],
    answers: [
      { text: '60 km/h', isCorrect: false },
      { text: '80 km/h', isCorrect: true },
      { text: '100 km/h', isCorrect: false },
      { text: '90 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la vitesse maximale autorisée sur une semi-autoroute (route express à 2x2 voies) en Suisse ?",
    explanation:
      "Sur les semi-autoroutes (routes express à chaussées séparées sans voies de service), la vitesse maximale est de 100 km/h. Ces routes sont signalées par un panneau spécifique et sont différentes des autoroutes qui permettent 120 km/h.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.MEDIUM,
    tags: ['vitesse', 'semi-autoroute', 'route express', '100 km/h'],
    answers: [
      { text: '80 km/h', isCorrect: false },
      { text: '100 km/h', isCorrect: true },
      { text: '120 km/h', isCorrect: false },
      { text: '110 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la vitesse maximale autorisée sur l'autoroute en Suisse ?",
    explanation:
      "Sur les autoroutes suisses, la vitesse maximale autorisée est de 120 km/h. Contrairement à certains pays voisins comme l'Allemagne, il n'existe pas de sections illimitées en Suisse. Cette limite est signalée à l'entrée de l'autoroute et par des panneaux périodiques.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.EASY,
    tags: ['vitesse', 'autoroute', '120 km/h', 'limitation'],
    answers: [
      { text: '100 km/h', isCorrect: false },
      { text: '110 km/h', isCorrect: false },
      { text: '120 km/h', isCorrect: true },
      { text: '130 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la sanction en Suisse pour un excès de vitesse de 26 à 30 km/h en agglomération ?",
    explanation:
      "En Suisse, un excès de vitesse de 26 à 30 km/h en agglomération (soit rouler entre 76 et 80 km/h là où la limite est 50 km/h) est considéré comme un délit grave. Cela entraîne un retrait de permis de conduite de un mois minimum, en plus d'une amende.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.HARD,
    tags: ['vitesse', 'excès', 'sanction', 'retrait de permis', 'amende'],
    answers: [
      { text: 'Simple amende sans retrait de permis', isCorrect: false },
      { text: 'Retrait de permis de 1 mois minimum', isCorrect: true },
      { text: 'Avertissement verbal uniquement', isCorrect: false },
      { text: 'Amende et 3 points de permis', isCorrect: false },
    ],
  },
  {
    text: "Dans une zone 30 en Suisse, quelle est la règle de priorité applicable ?",
    explanation:
      "Dans une zone 30, la vitesse est limitée à 30 km/h. La règle de priorité reste généralement la priorité à droite, sauf si des marquages au sol ou des panneaux indiquent autre chose. Ces zones visent à améliorer la sécurité dans les quartiers résidentiels.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.MEDIUM,
    tags: ['vitesse', 'zone 30', 'priorité', 'résidentiel'],
    answers: [
      { text: 'Il n\'y a pas de règle de priorité dans une zone 30', isCorrect: false },
      { text: 'La priorité à droite s\'applique sauf indication contraire', isCorrect: true },
      { text: 'Le piéton a toujours la priorité dans une zone 30', isCorrect: false },
      { text: 'Le véhicule le plus lent a la priorité', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la vitesse maximale autorisée pour un véhicule tractant une remorque sur autoroute en Suisse ?",
    explanation:
      "En Suisse, un véhicule tractant une remorque est soumis à une limite de 80 km/h sur toutes les routes, y compris sur l'autoroute. Cette limitation plus basse est due aux risques accrus liés à l'instabilité et à la distance de freinage plus longue des ensembles véhicule-remorque.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.HARD,
    tags: ['vitesse', 'remorque', 'autoroute', '80 km/h'],
    answers: [
      { text: '100 km/h', isCorrect: false },
      { text: '120 km/h', isCorrect: false },
      { text: '80 km/h', isCorrect: true },
      { text: '90 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quel est l'impact de la pluie sur la vitesse autorisée sur l'autoroute en Suisse ?",
    explanation:
      "En Suisse, il n'existe pas de réduction légale automatique de vitesse par temps de pluie sur autoroute (contrairement à la France). La limite reste à 120 km/h. Cependant, le conducteur est légalement tenu d'adapter sa vitesse aux conditions météorologiques, ce qui implique de ralentir si nécessaire.",
    category: QuestionCategory.SPEED_LIMITS,
    difficulty: Difficulty.HARD,
    tags: ['vitesse', 'pluie', 'autoroute', 'adaptation', 'conditions météo'],
    answers: [
      { text: 'La limite est réduite à 100 km/h automatiquement', isCorrect: false },
      { text: 'La limite reste 120 km/h mais vous devez adapter votre vitesse', isCorrect: true },
      { text: 'La limite est réduite à 80 km/h par temps de pluie', isCorrect: false },
      { text: 'L\'autoroute est fermée par temps de pluie intense', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // ALCOHOL (Alcool et drogues)
  // ────────────────────────────────────────
  {
    text: "Quel est le taux d'alcoolémie maximum autorisé en Suisse pour un conducteur expérimenté ?",
    explanation:
      "En Suisse, le taux d'alcoolémie maximum autorisé pour un conducteur expérimenté est de 0.5 pour mille (‰) dans le sang, ce qui correspond à 0.25 mg par litre d'air expiré. Au-delà de ce seuil, la conduite est sanctionnée pénalement.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.EASY,
    tags: ['alcool', 'taux', 'alcoolémie', '0.5 pour mille'],
    answers: [
      { text: '0.3 pour mille (‰)', isCorrect: false },
      { text: '0.5 pour mille (‰)', isCorrect: true },
      { text: '0.8 pour mille (‰)', isCorrect: false },
      { text: '1.0 pour mille (‰)', isCorrect: false },
    ],
  },
  {
    text: "Quel est le taux d'alcoolémie maximum autorisé pour les conducteurs novices en Suisse ?",
    explanation:
      "En Suisse, les conducteurs novices (en phase probatoire, généralement dans les 3 premières années après l'obtention du permis) sont soumis à un taux d'alcoolémie de zéro (0.0 pour mille). Toute présence d'alcool dans le sang est sanctionnée pour ces conducteurs.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.MEDIUM,
    tags: ['alcool', 'novice', 'probatoire', 'zéro alcool'],
    answers: [
      { text: '0.5 pour mille, comme les conducteurs expérimentés', isCorrect: false },
      { text: '0.3 pour mille', isCorrect: false },
      { text: '0.1 pour mille', isCorrect: false },
      { text: '0.0 pour mille (tolérance zéro)', isCorrect: true },
    ],
  },
  {
    text: "Quelles sont les conséquences d'un taux d'alcoolémie entre 0.5‰ et 0.79‰ au volant en Suisse ?",
    explanation:
      "Un taux d'alcoolémie entre 0.5‰ et 0.79‰ est considéré comme une infraction administrative en Suisse. Cela entraîne généralement un avertissement et peut conduire à un retrait de permis selon les circonstances. La récidive aggrave les sanctions.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.HARD,
    tags: ['alcool', 'sanction', 'infraction', 'permis'],
    answers: [
      { text: 'Aucune sanction, c\'est légal', isCorrect: false },
      { text: 'Infraction administrative, possible avertissement ou retrait de permis', isCorrect: true },
      { text: 'Retrait immédiat et définitif du permis', isCorrect: false },
      { text: 'Simple amende sans autre conséquence', isCorrect: false },
    ],
  },
  {
    text: "L'alcool influence-t-il la conduite même en dessous du seuil légal de 0.5‰ ?",
    explanation:
      "Oui, l'alcool influence négativement les capacités de conduite dès les premiers verres, bien avant d'atteindre le seuil légal de 0.5‰. L'alcool diminue la vigilance, allonge le temps de réaction, altère le jugement et réduit la coordination. Il n'est donc pas raisonnable de conduire même avec un taux légèrement inférieur à la limite.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.MEDIUM,
    tags: ['alcool', 'influence', 'capacités', 'réaction', 'vigilance'],
    answers: [
      { text: 'Non, sous 0.5‰ il n\'y a aucun effet sur la conduite', isCorrect: false },
      { text: 'Oui, l\'alcool affecte les capacités de conduite dès les premiers verres', isCorrect: true },
      { text: 'L\'alcool améliore la confiance et donc la conduite', isCorrect: false },
      { text: 'Seuls les alcools forts (vodka, whisky) affectent la conduite', isCorrect: false },
    ],
  },
  {
    text: "Combien de temps faut-il en moyenne pour que le corps élimine l'alcool d'un verre de vin (1dl) ?",
    explanation:
      "En moyenne, le corps humain élimine environ 0.1 à 0.15 pour mille d'alcool par heure. Un verre de vin standard (1 dl à 12%) correspond à environ 0.2-0.3‰ selon le poids corporel. Il faut donc approximativement 2 heures pour éliminer un verre de vin. Ni le café, ni l'eau, ni d'autres remèdes n'accélèrent ce processus.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.MEDIUM,
    tags: ['alcool', 'élimination', 'temps', 'corps humain'],
    answers: [
      { text: '30 minutes', isCorrect: false },
      { text: 'Environ 1 à 2 heures', isCorrect: true },
      { text: '4 à 5 heures', isCorrect: false },
      { text: 'Le café élimine l\'alcool en 15 minutes', isCorrect: false },
    ],
  },
  {
    text: "Conduire sous l'influence de drogues illégales est-il soumis aux mêmes règles que l'alcool en Suisse ?",
    explanation:
      "Non, pour les drogues illégales, la tolérance est zéro en Suisse. Contrairement à l'alcool où un seuil de 0.5‰ est toléré, toute présence de substances illégales dans le sang lors de la conduite est sanctionnée. Les médicaments légaux peuvent également affecter la conduite et doivent être signalés sur le permis.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.MEDIUM,
    tags: ['drogue', 'tolérance zéro', 'substances', 'médicaments'],
    answers: [
      { text: 'Oui, un seuil toléré existe pour les drogues comme pour l\'alcool', isCorrect: false },
      { text: 'Non, tolérance zéro pour les drogues illégales', isCorrect: true },
      { text: 'Seules les drogues dures (héroïne, cocaïne) sont concernées', isCorrect: false },
      { text: 'Les drogues douces (cannabis) sont tolérées comme l\'alcool', isCorrect: false },
    ],
  },
  {
    text: "En Suisse, un conducteur peut-il être soumis à un test d'alcoolémie sans raison particulière ?",
    explanation:
      "Oui, en Suisse, la police peut procéder à des contrôles d'alcoolémie préventifs (tests aléatoires) sans avoir besoin de soupçons particuliers. Ces contrôles sont réguliers, surtout le week-end et lors des fêtes. Refuser de se soumettre à un test est une infraction grave.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.MEDIUM,
    tags: ['alcool', 'contrôle', 'police', 'test aléatoire'],
    answers: [
      { text: 'Non, la police a besoin d\'un motif valable', isCorrect: false },
      { text: 'Oui, des contrôles préventifs aléatoires sont autorisés', isCorrect: true },
      { text: 'Uniquement si vous avez été impliqué dans un accident', isCorrect: false },
      { text: 'Uniquement entre minuit et 6h du matin', isCorrect: false },
    ],
  },
  {
    text: "Quelles sont les conséquences d'un taux d'alcoolémie supérieur à 0.8‰ en Suisse ?",
    explanation:
      "Un taux d'alcoolémie supérieur à 0.8‰ constitue un délit pénal en Suisse (conduite en état d'ébriété qualifiée). Les sanctions incluent : retrait du permis de conduite d'au moins 3 mois, poursuite pénale, amende ou peine privative de liberté. En cas de récidive, le retrait peut être définitif.",
    category: QuestionCategory.ALCOHOL,
    difficulty: Difficulty.HARD,
    tags: ['alcool', 'délit pénal', 'retrait permis', 'sanction grave'],
    answers: [
      { text: 'Amende de 200 CHF et avertissement', isCorrect: false },
      { text: 'Délit pénal : retrait de permis minimum 3 mois, poursuite pénale', isCorrect: true },
      { text: 'Retrait du permis de 30 jours uniquement', isCorrect: false },
      { text: 'Emprisonnement immédiat sans autre sanction', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // DISTANCES (Distances de sécurité)
  // ────────────────────────────────────────
  {
    text: "Quelle est la règle générale pour la distance de sécurité derrière un autre véhicule en Suisse ?",
    explanation:
      "La règle générale en Suisse est de maintenir une distance de sécurité correspondant à la moitié de la vitesse en mètres (ex: à 80 km/h → 40 mètres), soit environ 2 secondes de distance temporelle. Sur autoroute à 120 km/h, la distance recommandée est d'au moins 60 mètres.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.EASY,
    tags: ['distance', 'sécurité', 'freinage', 'règle générale'],
    answers: [
      { text: '10 mètres à toute vitesse', isCorrect: false },
      { text: 'La moitié de la vitesse en mètres (ex: 40m à 80 km/h)', isCorrect: true },
      { text: 'Au moins 100 mètres en toute circonstance', isCorrect: false },
      { text: 'La longueur du véhicule qui précède', isCorrect: false },
    ],
  },
  {
    text: "Quel est l'impact de la vitesse sur la distance de freinage d'un véhicule ?",
    explanation:
      "La distance de freinage augmente avec le carré de la vitesse : si vous doublez votre vitesse, votre distance de freinage est multipliée par 4. Par exemple, à 50 km/h la distance d'arrêt est d'environ 28 mètres (13m de réaction + 15m de freinage), tandis qu'à 100 km/h elle est d'environ 80 mètres.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.MEDIUM,
    tags: ['distance', 'freinage', 'vitesse', 'physique'],
    answers: [
      { text: 'La distance de freinage augmente proportionnellement à la vitesse', isCorrect: false },
      { text: 'La distance de freinage augmente avec le carré de la vitesse', isCorrect: true },
      { text: 'La distance de freinage ne dépend pas de la vitesse', isCorrect: false },
      { text: 'En doublant la vitesse, on double la distance de freinage', isCorrect: false },
    ],
  },
  {
    text: "Comment la pluie influence-t-elle la distance de freinage ?",
    explanation:
      "Sur chaussée mouillée, la distance de freinage peut doubler par rapport à une chaussée sèche. L'adhérence des pneus est réduite, ce qui allonge significativement la distance nécessaire pour s'arrêter. Il est donc impératif de réduire sa vitesse et d'augmenter la distance de sécurité par temps de pluie.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.MEDIUM,
    tags: ['distance', 'freinage', 'pluie', 'adhérence', 'chaussée mouillée'],
    answers: [
      { text: 'La distance de freinage n\'est pas affectée par la pluie', isCorrect: false },
      { text: 'La distance de freinage augmente légèrement (10%)', isCorrect: false },
      { text: 'La distance de freinage peut doubler sur chaussée mouillée', isCorrect: true },
      { text: 'La pluie réduit la distance de freinage grâce à l\'effet de refroidissement', isCorrect: false },
    ],
  },
  {
    text: "Quelle distance doit-on maintenir pour dépasser un cycliste en Suisse ?",
    explanation:
      "Lors du dépassement d'un cycliste en Suisse, vous devez maintenir une distance latérale suffisante pour assurer sa sécurité. La recommandation est d'au moins 1.5 mètre de distance latérale. Si la route est trop étroite pour dépasser en sécurité, il faut patienter derrière le cycliste.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.MEDIUM,
    tags: ['distance', 'cycliste', 'dépassement', 'distance latérale'],
    answers: [
      { text: '50 cm de distance latérale suffisent', isCorrect: false },
      { text: 'Au moins 1.5 mètre de distance latérale', isCorrect: true },
      { text: 'Il faut changer de voie mais pas de distance minimale', isCorrect: false },
      { text: '3 mètres minimum obligatoire par la loi', isCorrect: false },
    ],
  },
  {
    text: "Quel est le temps de réaction moyen d'un conducteur en bonne condition ?",
    explanation:
      "Le temps de réaction moyen d'un conducteur en bonne condition est d'environ 0.8 à 1 seconde. Pendant ce temps, à 50 km/h, le véhicule parcourt environ 14 mètres avant même que le conducteur ne commence à freiner. L'alcool, la fatigue et les distractions (téléphone) augmentent significativement ce temps.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.MEDIUM,
    tags: ['réaction', 'temps', 'freinage', 'facteur humain'],
    answers: [
      { text: 'Moins de 0.3 secondes', isCorrect: false },
      { text: 'Environ 0.8 à 1 seconde', isCorrect: true },
      { text: '2 à 3 secondes', isCorrect: false },
      { text: '5 secondes', isCorrect: false },
    ],
  },
  {
    text: "À quelle distance minimale doit-on se garer d'un passage pour piétons en Suisse ?",
    explanation:
      "En Suisse, il est interdit de stationner à moins de 5 mètres d'un passage pour piétons. Cette règle vise à garantir la visibilité des piétons qui souhaitent traverser et la visibilité des conducteurs qui doivent voir les piétons à temps pour s'arrêter.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.MEDIUM,
    tags: ['stationnement', 'passage piétons', 'distance', 'sécurité'],
    answers: [
      { text: '2 mètres', isCorrect: false },
      { text: '5 mètres', isCorrect: true },
      { text: '10 mètres', isCorrect: false },
      { text: 'Il n\'y a pas de distance minimale légale', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la distance de freinage approximative à 50 km/h sur route sèche ?",
    explanation:
      "À 50 km/h sur route sèche avec des pneus en bon état, la distance de freinage pure est d'environ 13-15 mètres. En ajoutant la distance parcourue pendant le temps de réaction (environ 14 mètres à 50 km/h), la distance totale d'arrêt est d'environ 27-30 mètres.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.HARD,
    tags: ['freinage', 'distance', '50 km/h', 'arrêt'],
    answers: [
      { text: 'Environ 5 mètres', isCorrect: false },
      { text: 'Environ 13-15 mètres (freinage seul)', isCorrect: true },
      { text: 'Environ 50 mètres', isCorrect: false },
      { text: 'Environ 30 mètres (freinage seul)', isCorrect: false },
    ],
  },
  {
    text: "Comment calculer la distance de sécurité avec la méthode des 2 secondes ?",
    explanation:
      "La méthode des 2 secondes consiste à choisir un point fixe sur la route (panneau, arbre) et à compter 2 secondes entre le passage du véhicule devant et votre propre passage à ce point. Si vous passez avant 2 secondes, vous êtes trop proche. Cette méthode s'adapte automatiquement à toutes les vitesses.",
    category: QuestionCategory.DISTANCES,
    difficulty: Difficulty.EASY,
    tags: ['distance', 'sécurité', '2 secondes', 'méthode'],
    answers: [
      { text: 'Mesurer 100 mètres avec le compteur kilométrique', isCorrect: false },
      { text: 'Choisir un point fixe et compter 2 secondes entre le véhicule devant et vous', isCorrect: true },
      { text: 'Maintenir toujours au moins 50 mètres', isCorrect: false },
      { text: 'Suivre le véhicule devant à la même vitesse sans intervalle', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // HIGHWAY (Autoroute)
  // ────────────────────────────────────────
  {
    text: "Quel document est obligatoire pour circuler sur les autoroutes suisses ?",
    explanation:
      "Pour circuler sur les autoroutes et semi-autoroutes suisses, une vignette autoroutière annuelle est obligatoire. Cette vignette doit être apposée sur le pare-brise. Elle est valable du 1er décembre au 31 janvier de l'année suivante. Son prix est fixé à 40 CHF (40 EUR pour les étrangers).",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.EASY,
    tags: ['autoroute', 'vignette', 'obligatoire', 'Suisse'],
    answers: [
      { text: 'Un permis de circulation valide suffît', isCorrect: false },
      { text: 'Une vignette autoroutière annuelle', isCorrect: true },
      { text: 'Un abonnement mensuel TCS', isCorrect: false },
      { text: 'Un badge électronique (comme le badge télépéage français)', isCorrect: false },
    ],
  },
  {
    text: "Sur autoroute, à quelle voie doit-on rester en circulation normale en Suisse ?",
    explanation:
      "Sur les autoroutes suisses, la règle est de circuler sur la voie la plus à droite et de n'utiliser la voie de gauche que pour dépasser. Il est interdit de rouler sur la voie de gauche sans raison valable (rouler sur la gauche par paresse ou commodité est une infraction).",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.EASY,
    tags: ['autoroute', 'voie', 'droite', 'dépassement'],
    answers: [
      { text: 'La voie du milieu si disponible', isCorrect: false },
      { text: 'La voie la plus à droite en circulation normale', isCorrect: true },
      { text: 'N\'importe quelle voie selon votre convenance', isCorrect: false },
      { text: 'La voie de gauche est réservée aux véhicules rapides', isCorrect: false },
    ],
  },
  {
    text: "Est-il autorisé de dépasser par la droite sur autoroute en Suisse ?",
    explanation:
      "En Suisse, il est interdit de dépasser par la droite sur autoroute, sauf dans les embouteillages où le trafic de la voie de droite peut avancer plus vite. Dépasser intentionnellement par la droite en circulation fluide est une infraction sanctionnée.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.MEDIUM,
    tags: ['autoroute', 'dépassement', 'droite', 'interdit'],
    answers: [
      { text: 'Oui, c\'est autorisé si vous êtes plus rapide', isCorrect: false },
      { text: 'Non, sauf en cas d\'embouteillage', isCorrect: true },
      { text: 'Oui, mais uniquement si la voie de gauche est occupée', isCorrect: false },
      { text: 'Non, c\'est toujours interdit même en embouteillage', isCorrect: false },
    ],
  },
  {
    text: "Que doit faire un conducteur en cas de panne sur autoroute en Suisse ?",
    explanation:
      "En cas de panne sur autoroute, le conducteur doit immédiatement mettre son clignotant d'urgence, s'arrêter sur la bande d'arrêt d'urgence, faire sortir tous les occupants et les éloigner du côté gauche, poser un triangle de pré-signalisation (au moins 100m en arrière), revêtir un gilet de sécurité et appeler les secours.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.MEDIUM,
    tags: ['autoroute', 'panne', 'urgence', 'bande d\'arrêt d\'urgence', 'triangle'],
    answers: [
      { text: 'Rester dans le véhicule et attendre les secours', isCorrect: false },
      { text: 'S\'arrêter sur la bande d\'urgence, sortir, poser le triangle, appeler les secours', isCorrect: true },
      { text: 'Continuer à rouler jusqu\'à la prochaine sortie', isCorrect: false },
      { text: 'Traverser l\'autoroute pour atteindre la borne d\'urgence en face', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la distance minimale entre deux sorties d'autoroute en Suisse ?",
    explanation:
      "Cette question est un piège : il n'y a pas de distance minimale standardisée entre les sorties d'autoroute définie dans le code de la route suisse. Ce qui importe, c'est que les conducteurs suivent les panneaux de signalisation et anticipent leur sortie suffisamment tôt pour quitter l'autoroute en sécurité.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.HARD,
    tags: ['autoroute', 'sortie', 'distance', 'signalisation'],
    answers: [
      { text: '5 km entre chaque sortie', isCorrect: false },
      { text: '10 km entre chaque sortie', isCorrect: false },
      { text: 'Il n\'y a pas de distance minimale standardisée', isCorrect: true },
      { text: '2 km entre chaque sortie', isCorrect: false },
    ],
  },
  {
    text: "Comment s'insère-t-on correctement sur l'autoroute depuis une voie d'accélération en Suisse ?",
    explanation:
      "Pour s'insérer correctement sur l'autoroute, vous devez utiliser la voie d'accélération pour atteindre la vitesse du trafic autoroutier, céder le passage aux véhicules déjà sur l'autoroute, vous insérer progressivement sur la voie de droite en mettant votre clignotant, et ne jamais vous arrêter sur la voie d'accélération.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.MEDIUM,
    tags: ['autoroute', 'insertion', 'voie d\'accélération', 'priorité'],
    answers: [
      { text: 'Freiner et attendre une grande trouée dans le trafic', isCorrect: false },
      { text: 'Accélérer pour atteindre la vitesse du trafic et s\'insérer en cédant le passage', isCorrect: true },
      { text: 'Vous avez la priorité et pouvez vous insérer directement', isCorrect: false },
      { text: 'Klaxonner pour signaler votre présence avant de vous insérer', isCorrect: false },
    ],
  },
  {
    text: "À partir de quelle heure commence-t-il à être interdit de faire du bruit (démarrage, klaxon) sur autoroute en Suisse ?",
    explanation:
      "La question porte sur les nuisances sonores, mais sur l'autoroute il n'y a pas d'interdiction horaire spécifique du klaxon ou du démarrage. En revanche, le klaxon ne doit être utilisé que pour avertir d'un danger immédiat. L'usage du klaxon par impatience ou politesse est interdit sur toutes les routes.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.HARD,
    tags: ['autoroute', 'klaxon', 'bruit', 'réglementation'],
    answers: [
      { text: 'À partir de 22h00', isCorrect: false },
      { text: 'À partir de 21h00', isCorrect: false },
      { text: 'Le klaxon n\'est autorisé que pour signaler un danger immédiat, pas de restriction horaire sur autoroute', isCorrect: true },
      { text: 'À partir de 23h00', isCorrect: false },
    ],
  },
  {
    text: "Qu'est-ce que le corridor de sécurité (Rettungsgasse) sur autoroute en Suisse ?",
    explanation:
      "Le corridor de sécurité (Rettungsgasse en allemand) est un couloir libre que les conducteurs doivent créer au centre des voies en cas d'embouteillage pour permettre le passage des véhicules d'urgence. En Suisse, cette pratique est obligatoire depuis 2021 : les véhicules de la voie de gauche restent à gauche, ceux des autres voies restent à droite.",
    category: QuestionCategory.HIGHWAY,
    difficulty: Difficulty.MEDIUM,
    tags: ['autoroute', 'corridor de sécurité', 'embouteillage', 'urgence'],
    answers: [
      { text: 'Un couloir créé par les conducteurs pour laisser passer les secours en cas d\'embouteillage', isCorrect: true },
      { text: 'La bande d\'arrêt d\'urgence réservée aux conducteurs en difficulté', isCorrect: false },
      { text: 'Une voie autoroutière réservée aux véhicules d\'urgence en permanence', isCorrect: false },
      { text: 'La distance minimale entre deux véhicules autorisée', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // REAL_SITUATIONS (Situations réelles)
  // ────────────────────────────────────────
  {
    text: "Vous conduisez de nuit et croisez un véhicule venant en sens inverse. Que faites-vous avec vos phares ?",
    explanation:
      "Lorsqu'un véhicule arrive en sens inverse, vous devez passer en feux de croisement (codes) avant que l'éblouissement ne gêne l'autre conducteur, généralement à environ 150-200 mètres. Vous ne rallumez les pleins phares qu'une fois le véhicule croisé et que son feu arrière n'éblouit plus votre rétroviseur.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.EASY,
    tags: ['nuit', 'phares', 'croisement', 'éblouissement'],
    answers: [
      { text: 'Garder les pleins phares pour mieux voir la route', isCorrect: false },
      { text: 'Passer en feux de croisement avant de croiser le véhicule', isCorrect: true },
      { text: 'Éteindre tous les phares pendant le croisement', isCorrect: false },
      { text: 'Klaxonner pour alerter l\'autre conducteur', isCorrect: false },
    ],
  },
  {
    text: "Que faites-vous si vous réalisez que vous avez manqué votre sortie d'autoroute ?",
    explanation:
      "Si vous manquez votre sortie d'autoroute, vous devez continuer jusqu'à la prochaine sortie et faire demi-tour en suivant la signalisation. Il est strictement interdit de faire marche arrière ou demi-tour sur l'autoroute, car cela représente un danger mortel pour vous et les autres usagers.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.EASY,
    tags: ['autoroute', 'sortie manquée', 'demi-tour', 'urgence'],
    answers: [
      { text: 'Faire marche arrière sur la bande d\'urgence jusqu\'à la sortie', isCorrect: false },
      { text: 'Traverser le terre-plein central pour revenir en arrière', isCorrect: false },
      { text: 'Continuer jusqu\'à la prochaine sortie et faire demi-tour', isCorrect: true },
      { text: 'S\'arrêter et attendre que la voie soit libre pour faire demi-tour', isCorrect: false },
    ],
  },
  {
    text: "Vous approchez d'un passage à niveau sans barrière et le signal lumineux clignote en rouge. Que faites-vous ?",
    explanation:
      "Lorsque le signal lumineux rouge clignote à un passage à niveau, vous devez vous arrêter immédiatement devant la ligne d'arrêt et attendre que le signal s'éteigne. Un train arrive et peut être proche. Ne jamais franchir un passage à niveau lorsque les signaux lumineux ou sonores sont activés.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.EASY,
    tags: ['passage à niveau', 'train', 'signal', 'arrêt obligatoire'],
    answers: [
      { text: 'Accélérer pour passer rapidement avant le train', isCorrect: false },
      { text: 'Ralentir et passer avec précaution si vous ne voyez pas de train', isCorrect: false },
      { text: 'S\'arrêter devant la ligne d\'arrêt et attendre que le signal s\'éteigne', isCorrect: true },
      { text: 'Klaxonner et passer en regardant des deux côtés', isCorrect: false },
    ],
  },
  {
    text: "Que faites-vous si votre véhicule commence à déraper sur une route verglacée ?",
    explanation:
      "En cas de dérapage sur glace, vous ne devez surtout pas freiner brusquement (risque d'aggravation). Vous devez lâcher l'accélérateur, tourner légèrement le volant dans le sens du dérapage (contre-braquage), et rester calme. Si vous avez l'ABS, freinez progressivement sans pomper. La prévention reste la meilleure solution : adapter sa vitesse aux conditions.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.HARD,
    tags: ['dérapage', 'verglas', 'contrôle', 'contre-braquage'],
    answers: [
      { text: 'Freiner à fond pour s\'arrêter au plus vite', isCorrect: false },
      { text: 'Lâcher l\'accélérateur et tourner dans le sens du dérapage', isCorrect: true },
      { text: 'Accélérer pour retrouver l\'adhérence', isCorrect: false },
      { text: 'Ouvrir la portière pour freiner avec votre pied', isCorrect: false },
    ],
  },
  {
    text: "Vous approchez d'un feu de signalisation qui vient de passer au orange. Que faites-vous ?",
    explanation:
      "Le feu orange (jaune) signifie que le feu va passer au rouge. Si vous pouvez vous arrêter en sécurité avant la ligne d'arrêt, vous devez le faire. Si vous êtes trop proche et qu'un freinage brusque serait dangereux, vous pouvez continuer. Franchir un feu orange intentionnellement pour ne pas s'arrêter est une infraction.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.MEDIUM,
    tags: ['feu', 'orange', 'arrêt', 'signalisation'],
    answers: [
      { text: 'Accélérer pour passer avant le rouge', isCorrect: false },
      { text: 'S\'arrêter si possible en sécurité, sinon continuer', isCorrect: true },
      { text: 'Le feu orange signifie toujours continuer à rouler', isCorrect: false },
      { text: 'Klaxonner et passer rapidement', isCorrect: false },
    ],
  },
  {
    text: "Un enfant court soudainement sur la route devant vous. Quelle est la bonne réaction ?",
    explanation:
      "Face à un enfant qui court sur la route, vous devez freiner d'urgence immédiatement tout en regardant si vous pouvez vous décaler sans danger. Un freinage d'urgence peut être inconfortable mais est vital. Évitez les manœuvres d'esquive brusques qui peuvent faire perdre le contrôle. Après l'arrêt, signalez votre présence avec les feux de détresse.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.MEDIUM,
    tags: ['urgence', 'enfant', 'freinage', 'piéton'],
    answers: [
      { text: 'Klaxonner pour avertir l\'enfant', isCorrect: false },
      { text: 'Freiner d\'urgence immédiatement', isCorrect: true },
      { text: 'Dévier brusquement sur la voie opposée', isCorrect: false },
      { text: 'Accélérer pour passer rapidement devant l\'enfant', isCorrect: false },
    ],
  },
  {
    text: "Comment utilisez-vous les feux de détresse en Suisse ?",
    explanation:
      "Les feux de détresse (tous les clignotants simultanément) doivent être utilisés uniquement en cas de danger pour signaler votre présence à d'autres conducteurs : panne, accident, arrêt d'urgence sur autoroute, ou pour signaler un danger imprévu. Ils ne doivent pas être utilisés comme justification pour un stationnement illicite temporaire.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.EASY,
    tags: ['feux de détresse', 'urgence', 'signalisation', 'danger'],
    answers: [
      { text: 'Pour remercier un autre conducteur', isCorrect: false },
      { text: 'Pour signaler un danger ou une situation d\'urgence', isCorrect: true },
      { text: 'Pour se garer en double file quelques minutes', isCorrect: false },
      { text: 'Par temps de brouillard ou de pluie intense', isCorrect: false },
    ],
  },
  {
    text: "Que faites-vous si vous rencontrez un convoi funèbre sur la route ?",
    explanation:
      "En Suisse, les convois funèbres n'ont pas de priorité légale spécifique. Cependant, ils sont constitués de véhicules circulant en groupe et vous devez éviter de les couper pour ne pas perturber le convoi. Par respect et par prudence, il est recommandé de laisser passer le convoi complet avant de vous insérer.",
    category: QuestionCategory.REAL_SITUATIONS,
    difficulty: Difficulty.HARD,
    tags: ['convoi', 'funèbre', 'priorité', 'respect'],
    answers: [
      { text: 'Vous avez la priorité et pouvez couper le convoi', isCorrect: false },
      { text: 'Vous devez immédiatement vous arrêter sur le côté', isCorrect: false },
      { text: 'Éviter de couper le convoi par respect et pour la sécurité', isCorrect: true },
      { text: 'Les convois funèbres ont une priorité absolue en Suisse', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // ECO_DRIVING (Éco-conduite)
  // ────────────────────────────────────────
  {
    text: "Quelle technique d'éco-conduite permet de réduire le plus la consommation de carburant ?",
    explanation:
      "L'anticipation est la technique d'éco-conduite la plus efficace. En anticipant les situations (ralentissements, feux rouges, virages), vous pouvez lever le pied bien à l'avance et laisser le moteur freiner le véhicule par son inertie, ce qui consomme peu ou pas de carburant sur les voitures modernes avec injection coupée.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.EASY,
    tags: ['éco-conduite', 'anticipation', 'consommation', 'carburant'],
    answers: [
      { text: 'Accélérer fort puis freiner brusquement', isCorrect: false },
      { text: 'Anticiper et lever le pied à l\'avance', isCorrect: true },
      { text: 'Rouler en sous-régime permanent', isCorrect: false },
      { text: 'Éteindre le moteur en descente', isCorrect: false },
    ],
  },
  {
    text: "À quelle vitesse sur autoroute la consommation de carburant augmente-t-elle significativement ?",
    explanation:
      "La résistance aérodynamique augmente avec le carré de la vitesse. Au-delà de 110-120 km/h, la consommation augmente très rapidement. Rouler à 130 km/h au lieu de 110 km/h peut augmenter la consommation de 25 à 30%. La vitesse optimale pour la consommation sur autoroute se situe généralement entre 90 et 110 km/h.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.MEDIUM,
    tags: ['éco-conduite', 'vitesse', 'consommation', 'aérodynamique'],
    answers: [
      { text: 'Dès 80 km/h', isCorrect: false },
      { text: 'Au-delà de 110-120 km/h', isCorrect: true },
      { text: 'La vitesse n\'a pas d\'impact sur la consommation', isCorrect: false },
      { text: 'Uniquement au-delà de 150 km/h', isCorrect: false },
    ],
  },
  {
    text: "Quel est l'impact de la climatisation sur la consommation de carburant ?",
    explanation:
      "La climatisation peut augmenter la consommation de carburant de 5 à 20% selon les conditions. En ville, l'impact est plus important car le moteur travaille déjà à bas régime. Pour réduire cet impact, il est conseillé d'aérer le véhicule avant de démarrer la clim, de régler la température à 4-5°C en dessous de l'extérieur, et de l'éteindre 5 minutes avant d'arriver.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.MEDIUM,
    tags: ['éco-conduite', 'climatisation', 'consommation', 'économie'],
    answers: [
      { text: 'La climatisation n\'a aucun impact sur la consommation', isCorrect: false },
      { text: 'La climatisation augmente la consommation de 5 à 20%', isCorrect: true },
      { text: 'La climatisation réduit la consommation car le moteur tourne plus frais', isCorrect: false },
      { text: 'L\'impact est négligeable, moins de 1%', isCorrect: false },
    ],
  },
  {
    text: "Quel rapport de boîte de vitesses convient le mieux pour l'éco-conduite en ville ?",
    explanation:
      "Pour l'éco-conduite, il faut monter les vitesses le plus tôt possible (à bas régime, environ 2000 tr/min pour un moteur essence) et rester sur un rapport élevé. En ville, on peut passer en 4e ou 5e vitesse dès que possible. L'objectif est de maintenir le moteur à bas régime avec peu d'accélération.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.MEDIUM,
    tags: ['éco-conduite', 'vitesses', 'rapport', 'régime moteur'],
    answers: [
      { text: 'Rester en 2e vitesse pour avoir plus de couple', isCorrect: false },
      { text: 'Monter les vitesses tôt et rester sur un rapport élevé à bas régime', isCorrect: true },
      { text: 'Utiliser le point mort le plus souvent possible', isCorrect: false },
      { text: 'Rouler en sur-régime pour consommer moins', isCorrect: false },
    ],
  },
  {
    text: "Quelle pression de pneus est recommandée pour une éco-conduite optimale ?",
    explanation:
      "Pour l'éco-conduite, les pneus doivent être gonflés à la pression recommandée par le constructeur, voire légèrement plus (certains constructeurs recommandent d'augmenter de 0.2 bar pour les longs trajets). Des pneus sous-gonflés augmentent la résistance au roulement et donc la consommation de 3 à 5%. Vérifiez la pression à froid.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.EASY,
    tags: ['éco-conduite', 'pneus', 'pression', 'gonflage'],
    answers: [
      { text: 'La pression maximale indiquée sur le pneu', isCorrect: false },
      { text: 'La pression recommandée par le constructeur, à froid', isCorrect: true },
      { text: 'Une pression réduite pour plus de confort', isCorrect: false },
      { text: 'La pression n\'a aucun impact sur la consommation', isCorrect: false },
    ],
  },
  {
    text: "Qu'est-ce que le système 'start-stop' et à quoi sert-il ?",
    explanation:
      "Le système start-stop coupe automatiquement le moteur lorsque le véhicule est à l'arrêt (feu rouge, embouteillage) et le redémarre dès que vous relâchez la pédale de frein. Ce système peut réduire la consommation de 5 à 15% en conditions urbaines où les arrêts sont fréquents. Il est également bénéfique pour réduire les émissions de CO2.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.EASY,
    tags: ['start-stop', 'éco-conduite', 'économie', 'émissions'],
    answers: [
      { text: 'Un système pour démarrer le moteur à distance', isCorrect: false },
      { text: 'Un système qui coupe et redémarre le moteur automatiquement à l\'arrêt', isCorrect: true },
      { text: 'Un mode de conduite sportif pour les démarrages rapides', isCorrect: false },
      { text: 'Un système d\'alerte pour les conducteurs somnolents', isCorrect: false },
    ],
  },
  {
    text: "Comment l'éco-conduite réduit-elle les émissions de CO2 ?",
    explanation:
      "L'éco-conduite réduit les émissions de CO2 en diminuant la consommation de carburant. Comme la combustion d'1 litre d'essence produit environ 2.4 kg de CO2, toute réduction de consommation entraîne directement une réduction des émissions. Des techniques comme l'anticipation, la montée rapide des vitesses et la limitation de la vitesse peuvent réduire les émissions de 15 à 30%.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.MEDIUM,
    tags: ['éco-conduite', 'CO2', 'émissions', 'environnement'],
    answers: [
      { text: 'L\'éco-conduite n\'a aucun impact sur les émissions de CO2', isCorrect: false },
      { text: 'En réduisant la consommation, on réduit directement les émissions de CO2', isCorrect: true },
      { text: 'L\'éco-conduite augmente les émissions car le moteur tourne plus longtemps', isCorrect: false },
      { text: 'Seuls les véhicules hybrides peuvent réduire leurs émissions', isCorrect: false },
    ],
  },
  {
    text: "Quel est le meilleur moment pour changer de vitesse dans une voiture manuelle pour économiser du carburant ?",
    explanation:
      "Pour économiser du carburant dans une voiture manuelle, il faut monter les vitesses vers 2000 tr/min (essence) ou 1500 tr/min (diesel), et descendre les vitesses aussi tard que possible. L'objectif est de maintenir le moteur à bas régime dans le rapport le plus élevé possible. Un changement de vitesse trop tardif (hauts régimes) gaspille du carburant.",
    category: QuestionCategory.ECO_DRIVING,
    difficulty: Difficulty.MEDIUM,
    tags: ['vitesses', 'régime', 'éco-conduite', 'boîte manuelle'],
    answers: [
      { text: 'À 3500 tr/min pour profiter de la pleine puissance', isCorrect: false },
      { text: 'Vers 2000 tr/min pour l\'essence, 1500 tr/min pour le diesel', isCorrect: true },
      { text: 'Dès que le moteur commence à accélérer', isCorrect: false },
      { text: 'À la limite rouge du compte-tours', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // SAFETY (Sécurité)
  // ────────────────────────────────────────
  {
    text: "Le port de la ceinture de sécurité est-il obligatoire en Suisse pour tous les passagers ?",
    explanation:
      "Oui, en Suisse, le port de la ceinture de sécurité est obligatoire pour tous les occupants du véhicule, à toutes les places et sur toutes les routes. Le conducteur est également responsable de s'assurer que les enfants portent la ceinture ou sont installés dans un siège-enfant adapté. Les contraventions s'élèvent à 60 CHF minimum.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.EASY,
    tags: ['ceinture', 'sécurité', 'obligatoire', 'tous les passagers'],
    answers: [
      { text: 'Uniquement sur autoroute', isCorrect: false },
      { text: 'Uniquement pour le conducteur et le passager avant', isCorrect: false },
      { text: 'Pour tous les occupants à toutes les places', isCorrect: true },
      { text: 'Ce n\'est qu\'une recommandation, pas une obligation', isCorrect: false },
    ],
  },
  {
    text: "À quel âge et avec quel équipement un enfant peut-il voyager sans siège-enfant en Suisse ?",
    explanation:
      "En Suisse, les enfants doivent utiliser un système de retenue adapté (siège-enfant) jusqu'à ce qu'ils atteignent 150 cm de taille, quelle que soit leur âge. En pratique, cela signifie généralement jusqu'à 12 ans environ. Au-delà de 150 cm, la ceinture adulte suffit.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.MEDIUM,
    tags: ['siège enfant', 'enfant', 'sécurité', 'taille'],
    answers: [
      { text: 'Dès 6 ans', isCorrect: false },
      { text: 'Dès 12 ans, peu importe la taille', isCorrect: false },
      { text: 'Quand l\'enfant atteint 150 cm de taille', isCorrect: true },
      { text: 'Dès que l\'enfant pèse 30 kg', isCorrect: false },
    ],
  },
  {
    text: "L'utilisation du téléphone portable au volant (sans kit mains-libres) est-elle sanctionnée en Suisse ?",
    explanation:
      "Oui, en Suisse, utiliser un téléphone portable tenu en main pendant la conduite est interdit et sanctionné d'une amende de 100 CHF. Cette interdiction s'applique même à l'arrêt si le moteur tourne. Des exceptions existent pour les appareils mains-libres intégrés au véhicule ou les oreillettes.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.EASY,
    tags: ['téléphone', 'conduite', 'distraction', 'amende'],
    answers: [
      { text: 'Non, c\'est autorisé si le trajet est court', isCorrect: false },
      { text: 'Oui, amende de 100 CHF', isCorrect: true },
      { text: 'C\'est autorisé à l\'arrêt mais pas en mouvement', isCorrect: false },
      { text: 'Uniquement interdit sur autoroute', isCorrect: false },
    ],
  },
  {
    text: "Quels équipements de sécurité sont obligatoires en permanence dans un véhicule en Suisse ?",
    explanation:
      "En Suisse, les véhicules doivent obligatoirement être équipés d'une trousse de premiers secours et d'un triangle de signalisation. En plus de ces équipements obligatoires, il est fortement recommandé d'avoir un gilet de sécurité (fluorescent), bien qu'il ne soit pas obligatoire en Suisse contrairement à d'autres pays européens.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.MEDIUM,
    tags: ['sécurité', 'équipement', 'trousse', 'triangle', 'obligatoire'],
    answers: [
      { text: 'Seulement un triangle de signalisation', isCorrect: false },
      { text: 'Trousse de premiers secours et triangle de signalisation', isCorrect: true },
      { text: 'Gilet fluorescent, triangle et extincteur', isCorrect: false },
      { text: 'Aucun équipement n\'est obligatoire en Suisse', isCorrect: false },
    ],
  },
  {
    text: "Quand doit-on utiliser les pneus neige en Suisse ?",
    explanation:
      "En Suisse, les pneus neige ne sont pas obligatoires par la loi nationale, mais certains cantons ou communes peuvent les rendre obligatoires dans certaines conditions. Cependant, si vous conduisez avec des pneus inadaptés aux conditions hivernales et causez un accident, votre responsabilité est engagée. Il est fortement recommandé de monter les pneus neige de novembre à mars.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.MEDIUM,
    tags: ['pneus neige', 'hiver', 'obligation', 'sécurité'],
    answers: [
      { text: 'Ils sont obligatoires du 1er novembre au 31 mars en Suisse', isCorrect: false },
      { text: 'Ils ne sont pas obligatoires légalement mais recommandés en hiver', isCorrect: true },
      { text: 'Ils ne sont obligatoires que sur les routes de montagne', isCorrect: false },
      { text: 'Ils sont interdits, seules les chaînes sont autorisées', isCorrect: false },
    ],
  },
  {
    text: "Quel est le risque principal de conduire avec la fatigue ?",
    explanation:
      "La fatigue au volant est comparable à l'alcool : elle réduit la concentration, allonge le temps de réaction, altère le jugement et peut provoquer des micro-sommeils (endormissement de 4 à 30 secondes). Un micro-sommeil à 80 km/h fait parcourir au véhicule jusqu'à 200 mètres sans contrôle. C'est une cause majeure d'accidents mortels.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.EASY,
    tags: ['fatigue', 'sécurité', 'micro-sommeil', 'danger'],
    answers: [
      { text: 'La fatigue n\'a pas de réel impact si on conduit depuis longtemps', isCorrect: false },
      { text: 'Risque de micro-sommeil et perte de contrôle', isCorrect: true },
      { text: 'La fatigue améliore la concentration par effort de compensation', isCorrect: false },
      { text: 'Le risque est faible sur autoroute car la route est droite', isCorrect: false },
    ],
  },
  {
    text: "À quelle fréquence les pneus d'un véhicule doivent-ils être contrôlés en Suisse ?",
    explanation:
      "Il est recommandé de contrôler la pression et l'usure des pneus au moins une fois par mois et avant chaque long voyage. En Suisse, la profondeur minimale légale des rainures est de 1.6 mm, mais les professionnels recommandent de changer les pneus à 3 mm pour maintenir de bonnes performances de freinage, surtout par temps de pluie.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.MEDIUM,
    tags: ['pneus', 'contrôle', 'usure', 'sécurité'],
    answers: [
      { text: 'Une fois par an lors du contrôle technique', isCorrect: false },
      { text: 'Au moins une fois par mois et avant les longs trajets', isCorrect: true },
      { text: 'Seulement si un voyant s\'allume', isCorrect: false },
      { text: 'Tous les 10 000 km uniquement', isCorrect: false },
    ],
  },
  {
    text: "Que risque-t-on si on conduit sans avoir effectué le contrôle périodique obligatoire du véhicule ?",
    explanation:
      "En Suisse, le contrôle périodique des véhicules (MFK - Motorfahrzeugkontrolle) est obligatoire tous les 4 ans pour les voitures de moins de 10 ans, puis tous les 2 ans au-delà. Conduire un véhicule dont le contrôle est périmé expose à des amendes, et en cas d'accident, l'assurance peut refuser de couvrir les dommages.",
    category: QuestionCategory.SAFETY,
    difficulty: Difficulty.HARD,
    tags: ['contrôle technique', 'MFK', 'véhicule', 'obligation'],
    answers: [
      { text: 'Aucune sanction, c\'est uniquement une recommandation', isCorrect: false },
      { text: 'Amende et possible refus de couverture par l\'assurance', isCorrect: true },
      { text: 'Seule l\'assurance peut refuser, pas d\'amende', isCorrect: false },
      { text: 'Confiscation immédiate du véhicule', isCorrect: false },
    ],
  },

  // ────────────────────────────────────────
  // BEHAVIORS (Comportements)
  // ────────────────────────────────────────
  {
    text: "Qu'est-ce que la conduite agressive et quelles en sont les conséquences légales en Suisse ?",
    explanation:
      "La conduite agressive comprend des comportements comme les dépassements dangereux, les coups de klaxon répétés, les freinages brusques intentionnels, et les gestes menaçants. En Suisse, la conduite agressive peut être sanctionnée sous le chef de conduite imprudente ou dangereuse, avec retrait de permis et poursuites pénales.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.MEDIUM,
    tags: ['comportement', 'agressivité', 'conduite dangereuse', 'sanction'],
    answers: [
      { text: 'Il n\'y a pas de sanction spécifique pour la conduite agressive', isCorrect: false },
      { text: 'Retrait de permis possible et poursuites pénales', isCorrect: true },
      { text: 'Simple avertissement verbal de la police', isCorrect: false },
      { text: 'Amende de 50 CHF maximum', isCorrect: false },
    ],
  },
  {
    text: "En Suisse, est-il permis de klaxonner pour saluer un ami sur le bord de la route ?",
    explanation:
      "Non, en Suisse (comme dans toute la Suisse), il est interdit d'utiliser le klaxon à titre inutile, notamment pour saluer ou par impatience. Le klaxon est réservé aux situations de danger. Un usage non justifié peut être sanctionné d'une amende, particulièrement en zone résidentielle ou la nuit.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.EASY,
    tags: ['klaxon', 'comportement', 'interdit', 'nuisances'],
    answers: [
      { text: 'Oui, c\'est autorisé si le contact est bref', isCorrect: false },
      { text: 'Oui, mais uniquement en dehors des zones résidentielles', isCorrect: false },
      { text: 'Non, le klaxon est réservé aux situations de danger', isCorrect: true },
      { text: 'Oui, à condition de ne pas dépasser 3 secondes', isCorrect: false },
    ],
  },
  {
    text: "Quelle est la bonne conduite à adopter face à un conducteur agressif qui vous suit de trop près ?",
    explanation:
      "Face à un conducteur agressif qui vous tailgates (colle à votre pare-chocs), la meilleure réaction est de garder son calme, ne pas freiner brusquement, et si possible vous ranger pour le laisser passer. Évitez tout contact visuel prolongé ou geste provocateur. Chercher l'affrontement peut aggraver la situation (road rage).",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.MEDIUM,
    tags: ['comportement', 'agressivité', 'road rage', 'sécurité'],
    answers: [
      { text: 'Freiner brusquement pour lui faire peur', isCorrect: false },
      { text: 'Garder son calme et se ranger pour le laisser passer', isCorrect: true },
      { text: 'Accélérer pour créer de la distance', isCorrect: false },
      { text: 'S\'arrêter pour lui parler directement', isCorrect: false },
    ],
  },
  {
    text: "Que doit faire un conducteur qui est impliqué dans un accident en Suisse ?",
    explanation:
      "En cas d'accident en Suisse, vous devez : 1) Sécuriser les lieux (triangle, feux de détresse), 2) Porter secours aux blessés, 3) Appeler les secours (117 police, 118 pompiers, 144 ambulance, 140 TCS), 4) Ne pas bouger les blessés graves sauf danger immédiat, 5) Établir un constat amiable avec l'autre partie, 6) Ne pas quitter les lieux sans autorisation.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.MEDIUM,
    tags: ['accident', 'comportement', 'secours', 'procédure'],
    answers: [
      { text: 'Partir rapidement pour ne pas bloquer la circulation', isCorrect: false },
      { text: 'Sécuriser, appeler les secours, aider les blessés, rester sur place', isCorrect: true },
      { text: 'Prendre des photos et partir si ce n\'est pas de votre faute', isCorrect: false },
      { text: 'Attendre que les autres appellent les secours', isCorrect: false },
    ],
  },
  {
    text: "Est-il obligatoire de laisser entrer un véhicule qui change de file d'urgence (clignotant allumé) sur autoroute en Suisse ?",
    explanation:
      "En Suisse, il n'existe pas d'obligation légale de céder le passage à un véhicule changeant de file sur autoroute même s'il a le clignotant allumé (contrairement à un carrefour avec règles de priorité). Cependant, la loi oblige à ne pas gêner inutilement les autres conducteurs, et la courtoisie recommande de faciliter les changements de voie.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.HARD,
    tags: ['comportement', 'changement de voie', 'clignotant', 'courtoisie'],
    answers: [
      { text: 'Oui, c\'est obligatoire légalement', isCorrect: false },
      { text: 'Non, mais la courtoisie et la sécurité recommandent de faciliter le passage', isCorrect: true },
      { text: 'Uniquement si le véhicule vient de la droite', isCorrect: false },
      { text: 'Oui, mais seulement si vous roulez moins vite que lui', isCorrect: false },
    ],
  },
  {
    text: "Que faut-il faire lorsqu'un conducteur vous fait des appels de phares derrière vous sur autoroute ?",
    explanation:
      "Si un conducteur derrière vous fait des appels de phares, cela signifie généralement qu'il veut vous dépasser. La bonne réaction est de vérifier qu'il est sûr de se rabattre à droite, puis de le faire pour libérer la voie de gauche. Cependant, si vous êtes déjà sur la voie de droite, les appels de phares ne vous concernent pas.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.EASY,
    tags: ['comportement', 'appels de phares', 'autoroute', 'dépassement'],
    answers: [
      { text: 'Freiner pour lui signaler de s\'éloigner', isCorrect: false },
      { text: 'Vous rabattre à droite si c\'est sûr pour le laisser passer', isCorrect: true },
      { text: 'Ignorer et maintenir votre vitesse', isCorrect: false },
      { text: 'Accélérer pour ne pas le gêner', isCorrect: false },
    ],
  },
  {
    text: "Comment doit se comporter un conducteur lors d'un contrôle de police en Suisse ?",
    explanation:
      "Lors d'un contrôle de police en Suisse, vous devez arrêter votre véhicule en sécurité sur la droite, éteindre le moteur, baisser la vitre, et présenter calmement votre permis de conduire, votre carte grise et votre attestation d'assurance. Vous devez répondre aux questions de manière courtoise. Vous avez le droit de vous taire pour les questions pouvant vous incriminer.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.MEDIUM,
    tags: ['police', 'contrôle', 'comportement', 'documents'],
    answers: [
      { text: 'Partir rapidement car vous avez vos droits', isCorrect: false },
      { text: 'S\'arrêter, présenter les documents demandés et coopérer calmement', isCorrect: true },
      { text: 'Refuser de sortir du véhicule jusqu\'à l\'arrivée d\'un avocat', isCorrect: false },
      { text: 'Filmer la scène immédiatement avec votre téléphone', isCorrect: false },
    ],
  },
  {
    text: "Est-il permis d'utiliser des écouteurs pour écouter de la musique en conduisant en Suisse ?",
    explanation:
      "En Suisse, il n'est pas expressément interdit par la loi d'utiliser des écouteurs pour écouter de la musique en conduisant. Cependant, si cela diminue votre capacité à entendre les signaux de danger (klaxons, sirènes) et provoque un accident, votre responsabilité sera engagée. L'utilisation d'un seul écouteur est généralement tolérée.",
    category: QuestionCategory.BEHAVIORS,
    difficulty: Difficulty.HARD,
    tags: ['écouteurs', 'musique', 'distraction', 'légalité'],
    answers: [
      { text: 'Non, les écouteurs sont formellement interdits en Suisse', isCorrect: false },
      { text: 'Pas expressément interdit, mais vous êtes responsable si cela diminue votre sécurité', isCorrect: true },
      { text: 'Oui, c\'est totalement légal et sans responsabilité', isCorrect: false },
      { text: 'Uniquement autorisé avec des écouteurs de type casque ouvert', isCorrect: false },
    ],
  },
];

// ─────────────────────────────────────────
// Badges
// ─────────────────────────────────────────

const badges = [
  {
    id: 'FIRST_CORRECT',
    name: 'Première bonne réponse',
    description: 'Vous avez répondu correctement à votre première question.',
    icon: '🌟',
    condition: { type: 'CORRECT_ANSWERS', count: 1 },
  },
  {
    id: 'STREAK_3',
    name: 'En forme !',
    description: 'Vous avez maintenu une série de 3 jours d\'étude consécutifs.',
    icon: '🔥',
    condition: { type: 'STREAK_DAYS', count: 3 },
  },
  {
    id: 'STREAK_7',
    name: 'Une semaine parfaite',
    description: 'Bravo ! 7 jours d\'étude consécutifs.',
    icon: '🔥🔥',
    condition: { type: 'STREAK_DAYS', count: 7 },
  },
  {
    id: 'STREAK_30',
    name: 'Mois de dévotion',
    description: '30 jours consécutifs d\'étude — vous êtes exemplaire !',
    icon: '💎',
    condition: { type: 'STREAK_DAYS', count: 30 },
  },
  {
    id: 'PERFECT_EXAM',
    name: 'Examen parfait',
    description: 'Vous avez obtenu 100% à un examen blanc.',
    icon: '🏆',
    condition: { type: 'EXAM_SCORE', score: 100 },
  },
  {
    id: 'FIRST_EXAM',
    name: 'Premier examen',
    description: 'Vous avez complété votre premier examen blanc.',
    icon: '📋',
    condition: { type: 'EXAMS_COMPLETED', count: 1 },
  },
  {
    id: 'EXAM_5',
    name: 'Candidat assidu',
    description: 'Vous avez complété 5 examens blancs.',
    icon: '📚',
    condition: { type: 'EXAMS_COMPLETED', count: 5 },
  },
  {
    id: 'CATEGORY_MASTER_SIGNS',
    name: 'Expert en panneaux',
    description: 'Vous avez répondu correctement à 10 questions sur les panneaux de signalisation.',
    icon: '🚧',
    condition: { type: 'CATEGORY_CORRECT', category: 'SIGNS', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_PRIORITY',
    name: 'Maître de la priorité',
    description: 'Vous avez répondu correctement à 10 questions sur les priorités.',
    icon: '✋',
    condition: { type: 'CATEGORY_CORRECT', category: 'PRIORITY', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_SPEED',
    name: 'Sage de la vitesse',
    description: 'Vous avez répondu correctement à 10 questions sur les limitations de vitesse.',
    icon: '⚡',
    condition: { type: 'CATEGORY_CORRECT', category: 'SPEED_LIMITS', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_ALCOHOL',
    name: 'Conducteur sobre',
    description: 'Vous avez répondu correctement à 10 questions sur l\'alcool et les drogues.',
    icon: '🍶',
    condition: { type: 'CATEGORY_CORRECT', category: 'ALCOHOL', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_HIGHWAY',
    name: 'As de l\'autoroute',
    description: 'Vous avez répondu correctement à 10 questions sur l\'autoroute.',
    icon: '🛣️',
    condition: { type: 'CATEGORY_CORRECT', category: 'HIGHWAY', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_DISTANCES',
    name: 'Gardien des distances',
    description: 'Vous avez répondu correctement à 10 questions sur les distances de sécurité.',
    icon: '📏',
    condition: { type: 'CATEGORY_CORRECT', category: 'DISTANCES', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_ECO',
    name: 'Conducteur écolo',
    description: 'Vous avez répondu correctement à 10 questions sur l\'éco-conduite.',
    icon: '🌿',
    condition: { type: 'CATEGORY_CORRECT', category: 'ECO_DRIVING', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_SAFETY',
    name: 'Ambassadeur de la sécurité',
    description: 'Vous avez répondu correctement à 10 questions sur la sécurité.',
    icon: '🛡️',
    condition: { type: 'CATEGORY_CORRECT', category: 'SAFETY', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_BEHAVIORS',
    name: 'Conducteur modèle',
    description: 'Vous avez répondu correctement à 10 questions sur les comportements.',
    icon: '🤝',
    condition: { type: 'CATEGORY_CORRECT', category: 'BEHAVIORS', count: 10 },
  },
  {
    id: 'CATEGORY_MASTER_REAL',
    name: 'Expert terrain',
    description: 'Vous avez répondu correctement à 10 questions de situations réelles.',
    icon: '🎯',
    condition: { type: 'CATEGORY_CORRECT', category: 'REAL_SITUATIONS', count: 10 },
  },
  {
    id: 'QUESTIONS_50',
    name: '50 questions réussies',
    description: 'Vous avez répondu correctement à 50 questions au total.',
    icon: '🥉',
    condition: { type: 'CORRECT_ANSWERS', count: 50 },
  },
  {
    id: 'QUESTIONS_100',
    name: 'Centurion',
    description: 'Vous avez répondu correctement à 100 questions au total.',
    icon: '🥈',
    condition: { type: 'CORRECT_ANSWERS', count: 100 },
  },
  {
    id: 'QUESTIONS_500',
    name: 'Champion',
    description: 'Vous avez répondu correctement à 500 questions au total — vous êtes prêt pour l\'examen !',
    icon: '🥇',
    condition: { type: 'CORRECT_ANSWERS', count: 500 },
  },
  {
    id: 'AI_LEARNER',
    name: 'Apprenti IA',
    description: 'Vous avez utilisé l\'assistant IA pour la première fois.',
    icon: '🤖',
    condition: { type: 'AI_MESSAGES', count: 1 },
  },
  {
    id: 'LEVEL_5',
    name: 'Niveau 5 atteint',
    description: 'Vous avez atteint le niveau 5 — vous progressez bien !',
    icon: '⭐',
    condition: { type: 'LEVEL', level: 5 },
  },
  {
    id: 'LEVEL_10',
    name: 'Niveau 10 atteint',
    description: 'Niveau 10 — vous êtes un conducteur en devenir !',
    icon: '🌠',
    condition: { type: 'LEVEL', level: 10 },
  },
];

// ─────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...');

  // ── Badges ──────────────────────────────
  console.log(`\n📛 Seeding ${badges.length} badges...`);
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        condition: badge.condition,
      },
      create: badge,
    });
  }
  console.log(`✅ ${badges.length} badges seeded.`);

  // ── Questions ────────────────────────────
  console.log(`\n❓ Seeding ${questions.length} questions...`);

  let created = 0;
  let updated = 0;

  for (const q of questions) {
    // Use the question text as a stable key for upsert
    const existing = await prisma.question.findFirst({
      where: { text: q.text },
      include: { answers: true },
    });

    if (existing) {
      // Update the question
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
        },
      });

      // Remove old answers and recreate
      await prisma.answer.deleteMany({ where: { questionId: existing.id } });
      await prisma.answer.createMany({
        data: q.answers.map((a) => ({ ...a, questionId: existing.id })),
      });

      updated++;
    } else {
      // Create the question with nested answers
      await prisma.question.create({
        data: {
          text: q.text,
          explanation: q.explanation,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
          isAIGenerated: false,
          isPublished: true,
          embeddings: [],
          answers: {
            create: q.answers,
          },
        },
      });
      created++;
    }
  }

  console.log(`✅ Questions: ${created} created, ${updated} updated.`);

  // ── Summary ──────────────────────────────
  const totals = await prisma.question.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  console.log('\n📊 Questions per category:');
  for (const row of totals) {
    console.log(`   ${row.category}: ${row._count.id}`);
  }

  const totalQ = await prisma.question.count();
  const totalA = await prisma.answer.count();
  const totalB = await prisma.badge.count();

  console.log(`\n🏁 Seed complete!`);
  console.log(`   Total questions : ${totalQ}`);
  console.log(`   Total answers   : ${totalA}`);
  console.log(`   Total badges    : ${totalB}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { ScenarioData } from '../../core/scenario/Scenario';

export const chapter1Scenario: ScenarioData = {
  metadata: {
    id: 'chapter1',
    title: '第一章：シャッター商店街の怪死',
    chapter: 1,
    phase: 'investigation',
    estimatedDurationMinutes: 30,
  },
  flags: {
    'met_detective': false,
    'found_ledger': false,
    'heard_rumor': false,
    'unlocked_back_alley': false,
    'confronted_landlord': false,
  },
  dialogueNodes: {
    'start': {
      id: 'start',
      speakerId: 'protagonist',
      textKey: 'scenario.ch1.start.monologue',
      portrait: 'protagonist_neutral',
      background: 'shop_interior',
      choices: [
        {
          id: 'go_outside',
          textKey: 'scenario.ch1.start.choice.outside',
          targetNodeId: 'street_entrance',
        },
        {
          id: 'check_ledger',
          textKey: 'scenario.ch1.start.choice.ledger',
          targetNodeId: 'check_ledger',
          conditions: [{ flag: 'found_ledger', operator: 'lacks', value: true }],
        },
      ],
    },
    'street_entrance': {
      id: 'street_entrance',
      speakerId: 'protagonist',
      textKey: 'scenario.ch1.street.entrance',
      portrait: 'protagonist_neutral',
      background: 'shopping_street',
      choices: [
        {
          id: 'talk_detective',
          textKey: 'scenario.ch1.street.choice.detective',
          targetNodeId: 'detective_intro',
          conditions: [{ flag: 'met_detective', operator: 'lacks', value: true }],
        },
        {
          id: 'investigate_alley',
          textKey: 'scenario.ch1.street.choice.alley',
          targetNodeId: 'back_alley',
          conditions: [{ flag: 'unlocked_back_alley', operator: 'eq', value: true }],
        },
        {
          id: 'confront_landlord',
          textKey: 'scenario.ch1.street.choice.landlord',
          targetNodeId: 'landlord_confrontation',
          conditions: [{ flag: 'confronted_landlord', operator: 'lacks', value: true }],
        },
      ],
    },
    'detective_intro': {
      id: 'detective_intro',
      speakerId: 'detective_kuroda',
      textKey: 'scenario.ch1.detective.intro',
      portrait: 'kuroda_serious',
      background: 'shopping_street',
      onEnter: ['met_detective'],
      choices: [
        {
          id: 'ask_about_case',
          textKey: 'scenario.ch1.detective.choice.ask_case',
          targetNodeId: 'detective_case_info',
        },
        {
          id: 'ask_about_victim',
          textKey: 'scenario.ch1.detective.choice.ask_victim',
          targetNodeId: 'detective_victim_info',
        },
        {
          id: 'leave_detective',
          textKey: 'scenario.ch1.detective.choice.leave',
          targetNodeId: 'street_entrance',
        },
      ],
    },
    'detective_case_info': {
      id: 'detective_case_info',
      speakerId: 'detective_kuroda',
      textKey: 'scenario.ch1.detective.case_info',
      portrait: 'kuroda_serious',
      background: 'shopping_street',
      choices: [
        {
          id: 'back_to_detective',
          textKey: 'scenario.ch1.detective.choice.back',
          targetNodeId: 'detective_intro',
        },
      ],
    },
    'detective_victim_info': {
      id: 'detective_victim_info',
      speakerId: 'detective_kuroda',
      textKey: 'scenario.ch1.detective.victim_info',
      portrait: 'kuroda_serious',
      background: 'shopping_street',
      choices: [
        {
          id: 'back_to_detective',
          textKey: 'scenario.ch1.detective.choice.back',
          targetNodeId: 'detective_intro',
        },
      ],
    },
    'back_alley': {
      id: 'back_alley',
      speakerId: 'protagonist',
      textKey: 'scenario.ch1.alley.discovery',
      portrait: 'protagonist_surprised',
      background: 'back_alley',
      onEnter: ['found_ledger'],
      choices: [
        {
          id: 'examine_ledger',
          textKey: 'scenario.ch1.alley.choice.examine',
          targetNodeId: 'examine_ledger',
        },
        {
          id: 'return_street',
          textKey: 'scenario.ch1.alley.choice.return',
          targetNodeId: 'street_entrance',
        },
      ],
    },
    'examine_ledger': {
      id: 'examine_ledger',
      speakerId: 'protagonist',
      textKey: 'scenario.ch1.alley.ledger_content',
      portrait: 'protagonist_thinking',
      background: 'back_alley',
      choices: [
        {
          id: 'return_street',
          textKey: 'scenario.ch1.alley.choice.return',
          targetNodeId: 'street_entrance',
        },
      ],
    },
    'landlord_confrontation': {
      id: 'landlord_confrontation',
      speakerId: 'landlord_yamada',
      textKey: 'scenario.ch1.landlord.confrontation',
      portrait: 'yamada_angry',
      background: 'landlord_office',
      onEnter: ['confronted_landlord'],
      choices: [
        {
          id: 'present_ledger',
          textKey: 'scenario.ch1.landlord.choice.present_ledger',
          targetNodeId: 'landlord_confession',
          conditions: [
            { flag: 'found_ledger', operator: 'has', value: true },
          ],
          isObjection: true,
          evidenceId: 'ledger',
        },
        {
          id: 'bluff',
          textKey: 'scenario.ch1.landlord.choice.bluff',
          targetNodeId: 'landlord_threaten',
        },
        {
          id: 'retreat',
          textKey: 'scenario.ch1.landlord.choice.retreat',
          targetNodeId: 'street_entrance',
        },
      ],
    },
    'landlord_confession': {
      id: 'landlord_confession',
      speakerId: 'landlord_yamada',
      textKey: 'scenario.ch1.landlord.confession',
      portrait: 'yamada_defeated',
      background: 'landlord_office',
      choices: [
        {
          id: 'end_chapter',
          textKey: 'scenario.ch1.landlord.choice.end',
          targetNodeId: 'chapter1_end',
        },
      ],
    },
    'landlord_threaten': {
      id: 'landlord_threaten',
      speakerId: 'landlord_yamada',
      textKey: 'scenario.ch1.landlord.threaten',
      portrait: 'yamada_angry',
      background: 'landlord_office',
      choices: [
        {
          id: 'retry_confrontation',
          textKey: 'scenario.ch1.landlord.choice.retry',
          targetNodeId: 'landlord_confrontation',
        },
        {
          id: 'retreat',
          textKey: 'scenario.ch1.landlord.choice.retreat',
          targetNodeId: 'street_entrance',
        },
      ],
    },
    'chapter1_end': {
      id: 'chapter1_end',
      speakerId: 'protagonist',
      textKey: 'scenario.ch1.end.monologue',
      portrait: 'protagonist_determined',
      background: 'shop_interior',
      autoAdvance: true,
      delayMs: 3000,
    },
  },
  branchConditions: [
    {
      id: 'unlock_alley_after_detective',
      conditions: [
        { flag: 'met_detective', operator: 'has', value: true },
        { flag: 'heard_rumor', operator: 'has', value: true },
      ],
      targetNodeId: 'street_entrance',
      priority: 10,
    },
  ],
  evidence: {
    'ledger': {
      id: 'ledger',
      nameKey: 'evidence.ledger.name',
      descriptionKey: 'evidence.ledger.desc',
      iconPath: 'assets/evidence/ledger.png',
      category: 'document',
      isObtained: false,
      canPresent: true,
      relatedFlags: ['found_ledger'],
    },
    'victim_photo': {
      id: 'victim_photo',
      nameKey: 'evidence.victim_photo.name',
      descriptionKey: 'evidence.victim_photo.desc',
      iconPath: 'assets/evidence/victim_photo.png',
      category: 'item',
      isObtained: true,
      canPresent: true,
      relatedFlags: [],
    },
    'rumor_note': {
      id: 'rumor_note',
      nameKey: 'evidence.rumor_note.name',
      descriptionKey: 'evidence.rumor_note.desc',
      iconPath: 'assets/evidence/rumor_note.png',
      category: 'document',
      isObtained: false,
      canPresent: false,
      relatedFlags: ['heard_rumor'],
    },
  },
  locations: {
    'shop': {
      id: 'shop',
      nameKey: 'location.shop.name',
      backgroundPath: 'assets/backgrounds/shop_interior.png',
      musicKey: 'bgm_shop',
      nodes: ['start'],
      connectedLocations: ['shopping_street'],
      isUnlocked: true,
    },
    'shopping_street': {
      id: 'shopping_street',
      nameKey: 'location.shopping_street.name',
      backgroundPath: 'assets/backgrounds/shopping_street.png',
      musicKey: 'bgm_street',
      nodes: ['street_entrance', 'detective_intro', 'detective_case_info', 'detective_victim_info', 'landlord_confrontation', 'landlord_confession', 'landlord_threaten'],
      connectedLocations: ['shop', 'back_alley', 'landlord_office'],
      isUnlocked: true,
    },
    'back_alley': {
      id: 'back_alley',
      nameKey: 'location.back_alley.name',
      backgroundPath: 'assets/backgrounds/back_alley.png',
      musicKey: 'bgm_suspense',
      nodes: ['back_alley', 'examine_ledger'],
      connectedLocations: ['shopping_street'],
      isUnlocked: false,
    },
    'landlord_office': {
      id: 'landlord_office',
      nameKey: 'location.landlord_office.name',
      backgroundPath: 'assets/backgrounds/landlord_office.png',
      musicKey: 'bgm_tension',
      nodes: ['landlord_confrontation', 'landlord_confession', 'landlord_threaten'],
      connectedLocations: ['shopping_street'],
      isUnlocked: true,
    },
  },
  characters: {
    'protagonist': {
      id: 'protagonist',
      nameKey: 'character.protagonist.name',
      descriptionKey: 'character.protagonist.desc',
      portraitPath: 'assets/portraits/protagonist.png',
      relationship: 'ally',
      knownFacts: ['文房具店の息子', '裏では情報屋'],
    },
    'detective_kuroda': {
      id: 'detective_kuroda',
      nameKey: 'character.kuroda.name',
      descriptionKey: 'character.kuroda.desc',
      portraitPath: 'assets/portraits/kuroda.png',
      relationship: 'neutral',
      knownFacts: ['担当刑事', '表向きは協力的'],
      unlockConditions: [{ flag: 'met_detective', operator: 'has', value: true }],
    },
    'landlord_yamada': {
      id: 'landlord_yamada',
      nameKey: 'character.yamada.name',
      descriptionKey: 'character.yamada.desc',
      portraitPath: 'assets/portraits/yamada.png',
      relationship: 'hostile',
      knownFacts: ['悪徳地主', '商店街の土地を買い占めている'],
    },
  },
  startNodeId: 'start',
  trialScriptId: 'trial_chapter1',
};

export const trialChapter1Script = {
  id: 'trial_chapter1',
  title: '法廷：地主・山田の責任追及',
  phases: [
    {
      id: 'testimony_1',
      type: 'testimony',
      witnessId: 'landlord_yamada',
      statements: [
        {
          id: 'stmt_1_1',
          textKey: 'trial.ch1.landlord.stmt_1',
          isPressable: true,
          pressReactionKey: 'trial.ch1.landlord.press_1',
        },
        {
          id: 'stmt_1_2',
          textKey: 'trial.ch1.landlord.stmt_2',
          isPressable: false,
        },
        {
          id: 'stmt_1_3',
          textKey: 'trial.ch1.landlord.stmt_3',
          isPressable: true,
          pressReactionKey: 'trial.ch1.landlord.press_3',
        },
      ],
      contradictions: [
        {
          statementId: 'stmt_1_2',
          evidenceId: 'ledger',
          explanationKey: 'trial.ch1.landlord.contradiction_1',
          penaltyOnFail: 1,
        },
      ],
    },
    {
      id: 'cross_examination_1',
      type: 'cross-examination',
      witnessId: 'detective_kuroda',
      statements: [
        {
          id: 'stmt_2_1',
          textKey: 'trial.ch1.kuroda.stmt_1',
          isPressable: true,
          pressReactionKey: 'trial.ch1.kuroda.press_1',
        },
        {
          id: 'stmt_2_2',
          textKey: 'trial.ch1.kuroda.stmt_2',
          isPressable: false,
        },
      ],
      contradictions: [
        {
          statementId: 'stmt_2_2',
          evidenceId: 'victim_photo',
          explanationKey: 'trial.ch1.kuroda.contradiction_1',
          penaltyOnFail: 1,
        },
      ],
    },
    {
      id: 'verdict',
      type: 'verdict',
      witnessId: 'judge',
      statements: [
        {
          id: 'verdict_1',
          textKey: 'trial.ch1.verdict',
          isPressable: false,
        },
      ],
      contradictions: [],
    },
  ],
};
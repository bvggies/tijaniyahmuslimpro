export type CardColor = 'teal' | 'green' | 'amber' | 'grey';

export interface InfoCard {
  id: string;
  title: string;
  body: string;
  color: CardColor;
  icon: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  cards: InfoCard[];
}

export const tariqaTijaniyyahContent: Section[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    icon: 'book',
    cards: [
      {
        id: 'what-is-tariqa',
        title: 'What is Tariq Tijaniyyah?',
        body: 'The Tijaniyyah (Arabic: الطريقة التجانية transliterated: Al-Tariqah al-Tijaniyyah, or \'The Tijani Path\') is a sufi tariqa (order, path) originating in North Africa but now more widespread in West Africa, particularly in Senegal, The Gambia, Mauritania, Mali, and Northern Nigeria and Sudan. Its adherents are called Tijani (spelled Tijaan or Tijaan in Wolof, Tidiane or Tidjane in French).',
        color: 'teal',
        icon: 'information-circle',
      },
      {
        id: 'core-principles',
        title: 'Core Principles',
        body: 'Tijani attach a large importance to culture and education, and emphasize the individual adhesion of the disciple (murid). To become a member of the order, one must receive the Tijani wird, or a sequence of holy phrases to be repeated twice daily, from a muqaddam, or representative of the order.',
        color: 'green',
        icon: 'star',
      },
    ],
  },
  {
    id: 'foundation',
    title: 'Foundation of the Order',
    icon: 'flag',
    cards: [
      {
        id: 'founder',
        title: 'Founder: Sidi \'Ahmad al-Tijāni',
        body: 'Sidi Ahmad al-Tijani (1737-1815), who was born in Algeria and died in Fes, Morocco, founded the Tijäni order around 1781. Tijäni Islam, an \'Islam for the poor\', reacted against the conservative, hierarchical Qadiriyyah brotherhood then dominant, focusing on social reform and grass-roots Islamic revival.',
        color: 'green',
        icon: 'person',
      },
    ],
  },
  {
    id: 'expansion',
    title: 'Expansion in West Africa',
    icon: 'globe',
    cards: [
      {
        id: 'early-expansion',
        title: 'Early Expansion',
        body: 'Although several other Sufi orders overshadow the Tijäniyyah in its birthplace of North Africa, the order has become the largest Sufi order in West Africa and continues to expand rapidly. It was brought to southern Mauritania around 1789 by Muhammad al-Häfiz of the \'Idaw Ali tribe.',
        color: 'amber',
        icon: 'trending-up',
      },
      {
        id: 'omar-tall',
        title: 'Key Figures: Omar Tall',
        body: 'Muhammad al-Hafiz\'s disciple Mawlüd Val initiated the 19th-century Fulbe leader Al-Häjj Omar Tall (Allaaji Omar Taal) and the Fulbe cleric Abd al-Karim an-Nagil from Futa Jalon (modern Guinea) into the order. After receiving instruction from Muhammad al-Ghali from 1828 to 1830 in Makka, Omar Tall was appointed Khalifa (successor or head representative) of Ahmed at-Tijani for all of the Western Sudan.',
        color: 'teal',
        icon: 'person',
      },
      {
        id: 'malick-sy',
        title: 'El-Hajj Malick Sy',
        body: 'In Senegal\'s Wolof country, especially the northern regions of Kajoor and Jolof, the Tijani Order was spread primarily by El-Hajj Malick Sy (spelled \'El-Hadji Malick Sy\' in French, \'Allaaji Maalig Si\' in Wolof), born in 1855 near Dagana. In 1902, he founded a zăwiya (religious center) in Tivaouane (Tiwaawan), which became a center for Islamic education and culture under his leadership.',
        color: 'grey',
        icon: 'person',
      },
      {
        id: 'ibrahima-niass',
        title: 'Ibrahima Niass - The Faydah',
        body: 'The branch founded by Abdoulaye Niass\'s son, Al-Hadj Ibrahima Niass (Allaaji Ibrayima Ñas, often called \'Baye\' or \'Baay\', which is \'father\' in Wolof), in the Kaolack suburb of Medina Baye in 1930, has become by far the largest and most visible Tijani branch around the world today. Ibrahima Niass\'s teaching that all disciples, and not only specialists, can attain a direct mystical knowledge of God through tarbiyyah rühiyyah (mystical education) has struck a chord with millions worldwide.',
        color: 'green',
        icon: 'person',
      },
    ],
  },
  {
    id: 'jihad-states',
    title: 'Tijaniyah Jihad States',
    icon: 'shield',
    cards: [
      {
        id: 'tijaniyya-jihad-state',
        title: 'Tijaniyya Jihad State',
        body: 'The Tijaniyya Jihad state was founded on 10 March 1861 by Umar ibn Said in Segu (the traditional ruler style Fama was continued by the autochthonous dynasty in part of the state until the 1893 French takeover), using the ruler title Imam, also styled Amir al-Muslimin; in 1862 Masina (ruler title Ardo) is incorporated into Tijaniyya Jihad state.',
        color: 'amber',
        icon: 'flag',
      },
      {
        id: 'dina',
        title: 'Dina (Sise Jihad State)',
        body: 'Dina (the Sise Jihad state), in 1818 founded by Shaykhu Ahmadu, ruler title Imam (also styled Amir al-Mu\'minin); on 16 May 1862 conquered by the Tijaniyya Jihad state.',
        color: 'teal',
        icon: 'flag',
      },
    ],
  },
  {
    id: 'practices',
    title: 'Practices',
    icon: 'heart',
    cards: [
      {
        id: 'tijani-wird',
        title: 'The Tijani Wird',
        body: 'Upon entering the order, one receives the Tijani wird from a muqaddam or representative of the order. The muqaddam explains to the initiate the duties of the order, which include keeping the basic tenets of Islam (including the five pillars of Islam), to honor and respect one\'s parents, and not to follow another Sufi order in addition to the Tijäniyya. Initiates are to pronounce the Tijani wird (a process that usually takes ten to fifteen minutes) every morning and afternoon.',
        color: 'green',
        icon: 'book',
      },
      {
        id: 'wird-formula',
        title: 'The Wird Formula',
        body: 'The wird is a formula that includes repetitions of \'La \'ilaha \'ila Llah\' (\'There is no God but Allah\'), \'Astaghfiru Lläh\' (\'I ask God for forgiveness\'), and a prayer for Muhammad called the Salatu I-Fatih (Prayer of the Opener).',
        color: 'green',
        icon: 'document-text',
      },
      {
        id: 'wazifah-jumah',
        title: 'Wazifah and Hadarat al-Jum\'ah',
        body: 'They are also to participate in the Wazitah, a similar formula that is chanted as a group, often at a mosque, after the sundown prayer (maghrib), as well as in the Hadarat al-Jum\'ah, another formula chanted among other disciples on Friday afternoon.',
        color: 'amber',
        icon: 'time',
      },
      {
        id: 'dhikr-meetings',
        title: 'Dhikr and Meetings',
        body: 'Additionally, disciples in many areas organize regular meetings, often on Thursday evenings or before or after Wazifa and Hadarat al-Jum\'ah, to engage in dhikr Alläh, or mentioning God. This consists in repeating the phrase "Lã \'ilãha \'ilã Llāh" or simply "Allah" as a group.',
        color: 'teal',
        icon: 'people',
      },
      {
        id: 'mawlid',
        title: 'Mawlid an-nabawi (Gammu)',
        body: 'The most important communal event of the year for most Tijani groups is the Mawlid an-nabawi (known in Wolof as the Gammu, spelled Gamou in French), or the celebration of the birth of Muhammad, which falls on the night of the 12th of the Islamic month of Rabi al-\'Awwal. Most major Tijäni religious centers organize a large Mawlid event once a year, and hundreds of thousands of disciples attend the largest ones.',
        color: 'green',
        icon: 'calendar',
      },
    ],
  },
];

export const quoteText = 'The best of people are those who benefit others';
export const quoteAttribution = 'Prophet Muhammad (SAW)';


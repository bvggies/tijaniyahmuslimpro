export type CardColor = 'teal' | 'green' | 'amber' | 'grey';
export type ListStyle = 'none' | 'numbered' | 'lettered' | 'bulleted';

export interface FiqhCard {
  id: string;
  title: string;
  body: string;
  color: CardColor;
  icon: string;
  isCollapsible?: boolean;
  listStyle?: ListStyle;
  listItems?: string[];
}

export interface FiqhSection {
  id: string;
  title: string;
  icon: string;
  cards: FiqhCard[];
}

export const tijaniyaFiqhContent: FiqhSection[] = [
  {
    id: 'overview',
    title: 'Overview & Conditions',
    icon: 'shield-checkmark',
    cards: [
      {
        id: 'conditions',
        title: 'THE CONDITIONS OF TIJANIYA FIQH',
        body: `There are three obligatory litanies or 'wird': LAAZIM – WAZIFA – HAILALA

These litanies are blessed by the Quran and Sunnah, and authorized by the Prophet Muhammad (peace be upon him) through Shaykh Ahmad al-Tijani. To benefit fully from these practices, certain conditions must be observed.

The conditions are:
• Sincere intention (niyyah) for the sake of Allah alone
• Adherence to the Quran and Sunnah
• Respect for the authorized practices
• Regular performance without interruption
• Proper understanding of the practices
• Following the guidance of a qualified teacher (muqaddam)
• Maintaining good character and avoiding major sins
• Not mixing with unauthorized practices from other orders`,
        color: 'teal',
        icon: 'shield',
        listStyle: 'bulleted',
      },
      {
        id: 'important-notes',
        title: 'Important Notes',
        body: `Anyone who does not respect one of these conditions will not benefit from the litanies, even if they perform them regularly. The conditions are not optional recommendations but essential requirements for the spiritual benefits to manifest.

Following these conditions helps to take the maximum advantage of the litanies and ensures that the practices are performed in the correct manner, with the proper intention, and in accordance with the teachings of the Tijaniyah path.`,
        color: 'amber',
        icon: 'warning',
      },
    ],
  },
  {
    id: 'lazim',
    title: 'I. THE LAZIM (WIRD)',
    icon: 'time',
    cards: [
      {
        id: 'three-pillars',
        title: 'Three Mandatory Pillars',
        body: `The Lazim consists of three mandatory pillars that must be performed twice daily (morning and afternoon):

1. Astaghfirullah 100 times
   "I seek forgiveness from Allah"

2. Salat 'ala Nabi 100 times
   "Send blessings upon the Prophet"

3. La Ilaha illallah 100 times
   "There is no god but Allah"`,
        color: 'green',
        icon: 'list',
        listStyle: 'numbered',
      },
      {
        id: 'salatul-fatihi',
        title: 'Notes: Salatul Fatihi',
        body: `The Salat 'ala Nabi in the Lazim is performed using the Salatul Fatihi formula:

"Allahumma salli 'ala sayyidina Muhammadin al-fatihi lima ughliqa, wal-khatimi lima sabaqa, wan-nasiri al-haqqi bil-haqqi, wal-hadi ila siratika al-mustaqim, wa 'ala alihi haqqa qadrihi wa-miqdarihi al-'azim."

Translation: "O Allah, send blessings upon our master Muhammad, the opener of what was closed, the seal of what came before, the helper of truth with truth, the guide to Your straight path, and upon his family according to his true worth and great measure."

This salawat is considered one of the most powerful forms of sending blessings upon the Prophet and carries immense spiritual benefits.`,
        color: 'grey',
        icon: 'document-text',
        isCollapsible: true,
      },
      {
        id: 'after-100th',
        title: 'After the 100th La Ilaha illAllah',
        body: `After completing the 100th recitation of "La Ilaha illAllah," the practitioner should say:

"Sayyidunaa Muhammadun Rasulullah"

This completes the Lazim and acknowledges the Prophetic guidance that makes the practice valid and blessed.`,
        color: 'teal',
        icon: 'checkmark-circle',
      },
    ],
  },
  {
    id: 'time-of-wird',
    title: 'TIME OF THE WIRD',
    icon: 'calendar',
    cards: [
      {
        id: 'wird-timing',
        title: 'TIME OF THE WIRD',
        body: `The Lazim (Wird) must be performed twice daily:

Morning Time: After Fajr prayer until before Dhuhr prayer. The preferred time is immediately after Fajr.

Afternoon Time: After Dhuhr prayer until before Maghrib prayer. The preferred time is after 'Asr prayer.

Important: The Wird should not be performed during the prohibited times (sunrise, sunset, and when the sun is at its zenith). If one misses the morning Wird, it should be made up before Dhuhr. If one misses the afternoon Wird, it should be made up before Maghrib.

The Wird must be performed in a state of ritual purity (wudu) and in a clean place. It is recommended to face the Qibla during performance.`,
        color: 'amber',
        icon: 'time',
        isCollapsible: true,
      },
    ],
  },
  {
    id: 'waziifa',
    title: 'II. THE WAZIIFA',
    icon: 'people',
    cards: [
      {
        id: 'how-to-perform',
        title: 'How to Perform',
        body: `The Waziifa must be performed in congregation whenever possible. It is typically performed in a mosque or designated gathering place after Maghrib prayer.

The congregation should be led by a qualified person (muqaddam or authorized leader) who ensures the proper recitation and timing.`,
        color: 'green',
        icon: 'people-circle',
      },
      {
        id: 'four-pillars',
        title: 'Four Mandatory Pillars',
        body: `The Waziifa consists of four mandatory pillars:

a) Recitation of Surat al-Fatiha
   The opening chapter of the Quran, recited once

b) Recitation of Surat al-Inshirah
   "Have We not expanded for you your breast?" - recited once

c) Recitation of Salatul Fatihi
   The same salawat formula used in the Lazim, recited 50 times

d) Recitation of Djawharatul Kamaal
   "Jawharat al-Kamal" - recited 12 times
   
   Conditions for Djawharatul Kamaal:
   • Must be performed in congregation
   • Must be led by an authorized leader
   • All participants must be in a state of wudu
   • Should be performed after Maghrib prayer`,
        color: 'teal',
        icon: 'list',
        listStyle: 'lettered',
      },
    ],
  },
  {
    id: 'time-of-waziifa',
    title: 'Time of Waziifa',
    icon: 'alarm',
    cards: [
      {
        id: 'waziifa-timing',
        title: 'Time of Waziifa',
        body: `The Waziifa is performed once daily, after Maghrib prayer. The preferred time is immediately after Maghrib, before 'Isha prayer.

It should be performed in congregation at the mosque or designated gathering place. If one cannot attend the congregation due to valid reasons (illness, travel, etc.), they may perform it individually, but congregation is strongly preferred.

The Waziifa should not be delayed beyond 'Isha time except in cases of necessity.`,
        color: 'amber',
        icon: 'time',
      },
      {
        id: 'women-note',
        title: 'NOTE (Women & Wazeefa)',
        body: `Women may perform the Waziifa at home if they cannot attend the mosque congregation. They should:
• Perform it after Maghrib prayer
• Maintain the same recitations and order
• If possible, gather with other women for congregation
• Follow the same conditions of wudu and cleanliness`,
        color: 'grey',
        icon: 'information-circle',
        listStyle: 'bulleted',
      },
    ],
  },
  {
    id: 'haylala',
    title: 'III. THE HAYLALA (THE HADRA OF THE FRIDAY, THE \'ASRU)',
    icon: 'star',
    cards: [
      {
        id: 'what-is-haylala',
        title: 'What is Haylala?',
        body: `The Haylala is the special dhikr performed on Friday afternoon (after 'Asr prayer). It is also known as the Hadra of Friday or the 'Asr gathering.

This practice is performed once weekly, specifically on Friday, and has a designated time window from after 'Asr prayer until before Maghrib prayer.`,
        color: 'green',
        icon: 'star',
      },
      {
        id: 'important-warning',
        title: 'Important Warning',
        body: `Missing the Haylala without a valid excuse results in missing a huge blessing. The Friday Haylala is considered one of the most important weekly practices and should not be neglected.

Only valid excuses such as illness, travel, or unavoidable circumstances exempt one from this practice.`,
        color: 'amber',
        icon: 'warning',
      },
      {
        id: 'single-pillar',
        title: 'Single Pillar',
        body: `The Haylala consists of a single pillar:

Recitation of 1000 or 1200 or 1600 times "La Ilaha illAllah"

The practitioner may choose one of these numbers (1000, 1200, or 1600) and maintain consistency. This should be performed in congregation on Friday after 'Asr prayer.`,
        color: 'teal',
        icon: 'infinite',
      },
    ],
  },
];

export const heroText = {
  title: 'THE CONDITIONS OF TIJANIYA FIQH',
  subtitle: 'There are three obligatory litanies or \'wird\': LAAZIM – WAZIFA – HAILALA',
};


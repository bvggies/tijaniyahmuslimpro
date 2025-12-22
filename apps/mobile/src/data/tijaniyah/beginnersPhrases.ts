export interface BeginnersPhrase {
  id: string;
  term: string;
  alt?: string;
  definition: string;
}

export interface BeginnersPhraseSection {
  letter: string;
  items: BeginnersPhrase[];
}

export const beginnersPhrasesSections: BeginnersPhraseSection[] = [
  {
    letter: 'A',
    items: [
      {
        id: 'alaihissalatu-wassalam',
        term: 'ALAIHISSALATU WASSALAM',
        alt: 'See Sallallahu \'Alaihi Wa Sallam',
        definition: 'See Sallallahu \'Alaihi Wa Sallam',
      },
      {
        id: 'al-hamdu-lillahi',
        term: 'AL-HAMDU LILLAHI RABBIL \'ALAMIN',
        definition: `This is a verse from the Qur'an that Muslims recite and say many times per day. Other than being recited daily during prayers, a Muslim reads this expression in every activity of his daily life. The meaning of it is: "Praise be to Allah, the Lord of the worlds."
A Muslim invokes the praises of Allah before he does his daily work; and when he finishes, he thanks Allah for His favors. A Muslim is grateful to Allah for all His blessings. It is a statement of thanks, appreciation, and gratitude from the creature to his Creator.`,
      },
      {
        id: 'allahu-akbar',
        term: 'ALLAHU AKBAR',
        definition: `This statement is said by Muslims numerous times. During the call for prayer, during prayer, when they are happy, and wish to express their approval of what they hear, when they slaughter an animal, and when they want to praise a speaker, Muslims do say this expression of Allahu Akbar. Actually it is most said expression in the world. Its meaning: "Allah is the Greatest." Muslims praise Allah in every aspect of life; and as such they say Allahu Akbar.`,
      },
      {
        id: 'assalamu-alaikum',
        term: 'ASSALAMU \'ALAIKUM',
        definition: `This is an expression Muslims say whenever they meet one another. It is a statement of greeting with peace. The meaning of it is: "Peace be upon you."
Muslims try to establish peace on earth even through the friendly relation of greeting and meeting one another.
The other forms are:
"Assalamu 'Alalikum Wa Rahmatullah," which means: "May the peace and the Mercy of Allah be upon you"
"Assalamu Alalikum Wa Rahmatullahi Wa Barakatuh," which means :"May the peace, the mercy, and the blessings of Allah be upon you."`,
      },
      {
        id: 'astaghfirullah',
        term: 'ASTAGHFIRULLAH',
        definition: `This is an expression used by a Muslim when he wants to ask Allah forgiveness. The meaning of it is: "I ask Allah forgiveness." A Muslim says this phrase many times, even when he is talking to another person. When a Muslim abstains from doing wrong, or even when he wants to prove that he is innocent of an incident he uses this expression. After every Salah (payer), a Muslim says this statement three times.`,
      },
      {
        id: 'auzu-billahi',
        term: 'A\'UZU BILLAHI MINASHAITANIR RAJIM',
        definition: `This is an expression and a statement that Muslims have to recite before reading to Qur'an, before speaking, before doing any work, before making a supplication, before taking ablution, before entering the wash room, and before doing many other daily activities. The meaning of this phrase is: "I seek refuge from Allah from the outcast Satan." Allah is the Arabic name of God.
Satan is the source of evil and he always tries to misguide and mislead people. The Qur'an states that Satan is not an angel but a member of the Jinn, which are spiritual beings created by Allah. So the belief that Satan is a fallen angel is rejected in Islam.`,
      },
    ],
  },
  {
    letter: 'B',
    items: [
      {
        id: 'barakallah',
        term: 'BARAKALLAH',
        definition: `This is an expression which means: "May the blessings of Allah (be upon you)." When a Muslim wants to thank to another person, he uses different statements to express his thanks, appreciation, and gratitude. One of them is to say "Baraka Allah."`,
      },
      {
        id: 'bismillahir-rahmanir-rahim',
        term: 'BISMILLAHIR RAHMANIR RAHIM',
        definition: `This is a phrase from the Qur'an that is recited before reading the Qur'an. It is to be read immediately after one reads the phrase: "A'uzu Billahi Minashaitanir Rajim."
This phrase is also recited before doing any daily activity. The meaning of it is: "In the name of Allah, the Most Beneficent, the Most Merciful."`,
      },
    ],
  },
  {
    letter: 'I',
    items: [
      {
        id: 'in-sha-allah',
        term: 'IN SHA\' ALLAH',
        definition: `When a person wishes to plan for the future, when he promises, when he makes resolutions, and when he makes a pledge, he makes them with permission and the will of Allah. For this reason, a Muslim uses the Qur'anic instructions by saying "In Sha ' Allah." The meaning of this statement is: "If Allah wills." Muslims are to strive hard and to put their trusts with Allah. They leave the results in the hands of Allah.`,
      },
      {
        id: 'inna-lillahi',
        term: 'INNA LILLAHI WA INNA ILAHI RAJI\'UN',
        definition: `When a Muslim is struck with a calamity, when he loses one of his loved ones, or when he has gone bankrupt, he should be patient and say this statement, the meaning of which is : "We are from Allah and to Whom we are returning."
Muslims believe that Allah is the One who gives and it is He takes away. He is testing us. Hence, a Muslim submits himself to Allah. He is grateful and thankful to Allah for whatever he gets. On the other hand, he is patient and says this expression in times of turmoil and calamity.`,
      },
    ],
  },
  {
    letter: 'J',
    items: [
      {
        id: 'jazakallahu-khayran',
        term: 'JAZAKALLAHU KHAYRAN',
        definition: `This is a statement of thanks and appreciation to be said to the person who does a favor. Instead of saying "thanks" (Shukran), the Islamic statement of thanks is to say this phrase. Its meaning is: "May Allah reward you for the good."
It is understood that human beings can't repay one another enough. Hence, it is better to request Almighty Allah to reward the person who did a favor and to give him the best.`,
      },
    ],
  },
  {
    letter: 'K',
    items: [
      {
        id: 'kalam',
        term: 'KALAM',
        definition: `"Talk" or "speech" as in "kalamu Allah"; has also been used through the ages to mean "logic" or "philosophy".`,
      },
    ],
  },
  {
    letter: 'L',
    items: [
      {
        id: 'la-hawla-wa-la-quwwata',
        term: 'LA HAWLA WA LA QUWWATA ILLA BILLAH',
        definition: `The meaning of this expression is: " There is no power and no strength save in Allah." This expression is read by a Muslim when he is struck by a calamity, or is taken over by a situation beyond his control. A Muslim puts his trust in the hands of Allah, and submits himself to Allah.`,
      },
      {
        id: 'la-ilaha-illallah',
        term: 'LA ILAHA ILLALLAH',
        definition: `This expression is the most important one in Islam. It is the creed that every person has to say to be considered a Muslim. It is part of the first pillar of Islam. The meaning of which is: " There is no lord worthy of worship except Allah."
The second part of this first pillar is to say: "Muhammadun Rasul Allah," which means: "Muhammad is the messenger of Allah."`,
      },
    ],
  },
  {
    letter: 'M',
    items: [
      {
        id: 'ma-sha-allah',
        term: 'MA SHA\' ALLAH',
        definition: `This is an expression that Muslims say whenever they are excited and surprised. When they wish to express their happiness, they use such an expression. The meaning of "Ma sha' Allah" is: "Whatever Allah wants." or "Whatever Allah wants to give, He gives." This means that whenever Allah gives something good to someone, blesses him, honors him, and opens the door of success in business, a Muslim says this statement of "Ma Sha' Allah."
It has become a tradition that whenever a person constructs a building, a house, or an office, he puts a plaque on the wall or the entrance with this statement. It is a sign of thanks and appreciation from the person to Almighty Allah for whatever he was blessed with.`,
      },
      {
        id: 'muhammadun-rasulullah',
        term: 'MUHAMMADUN RASULULLAH',
        definition: `This statement is the second part of the first pillar of Islam literally meaning "Muhammad is the messenger of Allah." The meaning of this part is that Prophet Muhammad is the last and final prophet and messenger of Allah to mankind. He is the culmination, summation, purification of the previous prophets of Allah to humanity.`,
      },
    ],
  },
  {
    letter: 'P',
    items: [
      {
        id: 'p-b-u-h',
        term: 'P.B.U.H.',
        definition: `These letters are abbreviations for the words "Peace Be Upon Him" which is the meaning of the Arabic expression " 'Alaihis Salam", which is an expression that is said when the name of a prophet is mentioned.
This expression is widely used by English speaking Muslims. It is to be noticed here that this expression does not give the full meaning of "Salla Allahu 'Alaihi Wa Sallam". Therefore it is recommended that people do not use (p.b.u.h.) after the name of prophet Muhammad (s.a.w.); they should use "Salla Allahu 'Alaihi Wa Sallam" instead, or they may use the abbreviated form of (s.a..w) in writing.`,
      },
    ],
  },
  {
    letter: 'R',
    items: [
      {
        id: 'radhiallahu-anhu',
        term: 'RADHIALLAHU \'ANHU',
        definition: `This is an expression to be used by Muslims whenever a name of a companion of the Prophet Muhammad (s.a.w.) is mentioned or used in writing. The meaning of this statement is: "May Allah be pleased with him."
Muslims are taught to be respectful to the elderly and to those who contributed to the spread and success in Islam. They are to be grateful to the companions of the prophet (s.a.w.) for their sacrifices, their leadership, and their contributions. Muslims are advised to use this phrase when such names are mentioned or written.`,
      },
    ],
  },
  {
    letter: 'S',
    items: [
      {
        id: 'sadaqallahul-azim',
        term: 'SADAQALLAHUL \'AZIM',
        definition: `This is a statement of truth that a Muslim says after reading any amount of verses from the Qur'an. The meaning of it is: "Allah says the truth."
The Qur'an is the exact words of Allah in verbatim. When Allah speaks, He says the truth; and when the Qur'an is being recited, a Muslim is reciting the words of truth of Allah. Hence, he says: "Sadaqallahul 'Azim."`,
      },
      {
        id: 'sallallahu-alaihi-wa-sallam',
        term: 'SALLALLAHU \'ALAIHI WA SALLAM',
        alt: 'Abbreviated as: S.A.W.',
        definition: `When the name of Prophet Muhammad (saw) is mentioned or written, a Muslim is to respect him and invoke this statement of peace upon him. The meaning of it is: "May the blessings and the peace of Allah be upon him (Muhammad)".
Another expression that is alternatively used is: "Alaihissalatu Wassalam." This expression means: "On Him (Muhammad) are the blessings and the peace of Allah."
Allah has ordered Muslims, in the Qur'an, to say such an expression. Muslims are informed that if they proclaim such a statement once, Allah will reward them ten times.`,
      },
      {
        id: 'subhanahu-wa-taala',
        term: 'SUBHANAHU WA TA\'ALA',
        alt: 'Abbrviated as: S.W.T.',
        definition: `This is an expression that Muslims use whenever the name of Allah is pronounced or written. The meaning of this expression is: "Allah is pure of having partners and He is exalted from having a son."
Muslims believe that Allah is the only God, the Creator of the Universe. He does not have partners or children. Sometimes Muslims use other expressions when the name of Allah is written or pronounced. Some of which are: "'Azza Wa Jall": He is the Mighty and the Majestic; "Jalla Jalaluh": He is the exalted Majestic.`,
      },
    ],
  },
  {
    letter: 'W',
    items: [
      {
        id: 'wa-alaikumus-salam',
        term: 'WA \'ALAIKUMUS SALAM',
        definition: `This is an expression that a Muslim is to say as an answer for the greeting. When a person greets another with a salutation of peace, the answer for the greeting is an answer of peace. The meaning of this statement is: "And upon you is the peace." The other expressions are: " Wa Alaikums Salaam Wa Rahmatullah." and "Wa 'Alaikums Salam Wa Rahmatullahi Wa Barakatuh."`,
      },
    ],
  },
];


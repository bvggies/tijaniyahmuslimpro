export interface BeginnersTerm {
  id: string;
  term: string;
  definition: string;
}

export interface BeginnersTermSection {
  letter: string;
  items: BeginnersTerm[];
}

export const beginnersTermsSections: BeginnersTermSection[] = [
  {
    letter: 'A',
    items: [
      { id: 'aameen', term: 'Aameen', definition: 'May God Accept' },
      { id: 'adhaan', term: 'Adhaan', definition: 'The Muslim Call To Prayer' },
      { id: 'ahadeeth', term: 'Ahadeeth', definition: 'The Sayings And Traditions Of The Holy Prophet Muhammad (Peace Be Upon Him) – Singular – Hadith' },
      { id: 'akhirah', term: 'Akhirah', definition: 'After-Life' },
      { id: 'alhumdulillah', term: 'Alhumdulillah', definition: 'Praise Be To God' },
      { id: 'alim', term: 'Alim', definition: 'An Islamic Religious Scholar – Plural – Ulamaa\'' },
      { id: 'allah', term: 'Allah', definition: 'God' },
      { id: 'allah-hu-akbar', term: 'Allah Hu Akbar', definition: 'God Is The Greatest' },
      { id: 'anbiyaa', term: 'Anbiyaa', definition: 'The Prophets' },
      { id: 'ansar', term: 'Ansar', definition: 'Helpers' },
      { id: 'aqeedah', term: 'Aqeedah', definition: 'Belief (The Articles Of Faith)' },
      { id: 'arafat', term: 'Arafat', definition: 'A Mountain East Of Mecca' },
      { id: 'as', term: 'AS', definition: '\'Alayhee As-Salaam' },
      { id: 'asma-ul-husna', term: 'Asma-ul-Husna', definition: 'The Beautiful Names Of God' },
      { id: 'asr', term: 'Asr', definition: 'The Afternoon Prayer' },
      { id: 'as-salaamu-alaykum', term: 'As-Salaamu \'Alaykum', definition: 'Peace Be On You' },
      { id: 'astagfirullah', term: 'Astagfirullah', definition: 'I Seek Forgiveness Of God' },
      { id: 'ayah', term: 'Ayah', definition: 'A Verse Of The Holy Qur\'an – Plural – Ayat' },
    ],
  },
  {
    letter: 'B',
    items: [
      { id: 'barzakh', term: 'Barzakh', definition: 'Life In The Grave' },
      { id: 'bida', term: 'Bid\'a', definition: 'An Innovative Practice' },
      { id: 'bismillah', term: 'Bismillah', definition: 'In The Name Of God' },
    ],
  },
  {
    letter: 'D',
    items: [
      { id: 'dajjal', term: 'Dajjal', definition: 'Anti-Christ' },
      { id: 'dawah', term: 'Dawah', definition: 'Propagation Of Islam' },
      { id: 'deen', term: 'Deen', definition: 'Way Of Life' },
      { id: 'dhikr-ul-llah', term: 'Dhikr-ul-Llah', definition: 'Remembrance of God' },
      { id: 'dua', term: 'Du\'a', definition: 'Supplication' },
      { id: 'duhr', term: 'Duhr', definition: 'Noon Prayer' },
      { id: 'dunya', term: 'Dunya', definition: 'This World' },
    ],
  },
  {
    letter: 'E',
    items: [
      { id: 'eid-al-adha', term: 'Eid Al-Adha', definition: 'The Feast Of The Sacrifice (Commemorating The Obedience Of Abraham To God To Sacrifice His Son Ishmael)' },
      { id: 'eid-al-fitr', term: 'Eid Al-Fitr', definition: 'Marking The End Of Ramadan' },
    ],
  },
  {
    letter: 'F',
    items: [
      { id: 'fajr', term: 'Fajr', definition: 'The Dawn Prayer' },
      { id: 'faqeeh', term: 'Faqeeh', definition: 'An Islamic Scholar Who Can Give An Authonatative Legal Opinion Or Judgement' },
      { id: 'fardh', term: 'Fardh', definition: 'Obligatory' },
      { id: 'fatihah', term: 'Fatihah', definition: 'The Opening Chapter' },
      { id: 'fatwa', term: 'Fatwa', definition: 'Ruling/Verdict' },
      { id: 'firdows', term: 'Firdows', definition: 'The Middle And Highest Part Of Paradise' },
      { id: 'fitna', term: 'Fitna', definition: 'Corruption' },
    ],
  },
  {
    letter: 'G',
    items: [
      { id: 'gheeba', term: 'Gheeba', definition: 'Talking Evil About Someone In His Or Her Absence (Backbiting)' },
      { id: 'ghusl', term: 'Ghusl', definition: 'Washing Of The Body To Be Pure' },
    ],
  },
  {
    letter: 'H',
    items: [
      { id: 'hadith', term: 'Hadith', definition: 'Narrations/Reports Of The Deeds And Sayings Of The Holy Prophet' },
      { id: 'hadith-qudsi', term: 'Hadith Qudsi', definition: 'Sayings Of God Narrated By The Holy Prophet Muhammad (Peace Be Upon Him)' },
      { id: 'hajj', term: 'Hajj', definition: 'Pilgrimage To Mecca During The Islamic Month Of Dhul-Hijjah' },
      { id: 'halaal', term: 'Halaal', definition: 'The Lawful' },
      { id: 'haraam', term: 'Haraam', definition: 'The Prohibited' },
      { id: 'hassana', term: 'Hassana', definition: 'Good Deeds Committed In The Path Of God – Plural – Hassanaat' },
      { id: 'hayaa', term: 'Hayaa\'', definition: 'Bashfulness, Modesty' },
      { id: 'hijaab', term: 'Hijaab', definition: 'A Covering (i.e. Covering Of The Head For Muslim Women)' },
      { id: 'hijrah', term: 'Hijrah', definition: 'Migration In The Path Of God' },
    ],
  },
  {
    letter: 'I',
    items: [
      { id: 'ibaadah', term: 'Ibaadah', definition: 'Worship' },
      { id: 'iblis', term: 'Iblis', definition: 'Satan – Also Known As – Shaytaan' },
      { id: 'iftar', term: 'Iftar', definition: 'Breaking Of The Fast Immediately After Sunset (In The Month Of Ramadan – The Holy Month Of Fasting)' },
      { id: 'ihsan', term: 'Ihsan', definition: 'Highest Level Of Obedience In Worship – The Worship Of God As If You See Him Knowing That Although You Do Not See Him But He Sees You' },
      { id: 'ikhlas', term: 'Ikhlas', definition: 'Complete Faith – Sincerity Of The Heart In Worship And Purity Of Intention' },
      { id: 'ilm', term: '\'Ilm', definition: 'Knowledge' },
      { id: 'imam', term: 'Imam', definition: 'A Leader In The Community (Also Leads Prayer)' },
      { id: 'imaan', term: 'Imaan', definition: 'Faith' },
      { id: 'insan', term: 'Insan', definition: 'Human' },
      { id: 'insha-allah', term: 'Insha Allah', definition: 'If God Wills' },
      { id: 'iqamaa', term: 'Iqamaa', definition: 'The Call Of Prayer Which Announces The Congregational Prayer Is About To Begin' },
      { id: 'iqraa', term: 'Iqraa', definition: 'Read' },
      { id: 'isha', term: 'Isha', definition: 'The Night Prayer' },
      { id: 'islam', term: 'Islam', definition: 'Submission To The Will Of God' },
      { id: 'istighfar', term: 'Istighfar', definition: 'Seeking God\'s Forgiveness For One\'s Own Misdeeds' },
    ],
  },
  {
    letter: 'J',
    items: [
      { id: 'jahanam', term: 'Jahanam', definition: 'Hell' },
      { id: 'jahiliyah', term: 'Jahiliyah', definition: 'Ignorance' },
      { id: 'jamah', term: 'Jam\'ah', definition: 'Congregation' },
      { id: 'jannah', term: 'Jannah', definition: 'Paradise' },
      { id: 'jazak-allah', term: 'Jazak Allah', definition: 'May God Reward You' },
      { id: 'jibreel', term: 'Jibreel', definition: 'The Angel Gabriel' },
      { id: 'jihad', term: 'Jihad', definition: 'A Struggle' },
      { id: 'jin', term: 'Jin', definition: 'God\'s Creation Made Of Smokeless Fire' },
      { id: 'jumah', term: 'Jum\'ah', definition: 'Friday' },
      { id: 'juz', term: 'Juz', definition: 'A Part Of The Holy Qur\'an' },
    ],
  },
  {
    letter: 'K',
    items: [
      { id: 'kaaba', term: 'Ka\'aba', definition: 'Where All Muslims Face When Praying – The Holiest Mosque' },
      { id: 'kaafir', term: 'Kaafir', definition: 'Unbeliever – Plural – Kuffar' },
      { id: 'kalimah', term: 'Kalimah', definition: 'Statement – Also Known As – Sahadah' },
      { id: 'khalifa', term: 'Khalifa', definition: 'A Muslim Ruler' },
      { id: 'khutba', term: 'Khutba', definition: 'Sermon' },
      { id: 'kitab', term: 'Kitab', definition: 'Book' },
      { id: 'kufr', term: 'Kufr', definition: 'Disbelief in God\'s Commands' },
    ],
  },
  {
    letter: 'L',
    items: [
      { id: 'lailatul-qadr', term: 'Lailatul-Qadr', definition: 'The Night Of Power – One Of The Last Odd Nights In The Last 10 Nights Of The Holy Month Of Ramadan' },
      { id: 'la-illaha-ill-allah', term: 'La Illaha Ill Allah', definition: 'There Is No Deity Except God' },
    ],
  },
  {
    letter: 'M',
    items: [
      { id: 'maghfirah', term: 'Maghfirah', definition: 'Forgiveness' },
      { id: 'maghrib', term: 'Maghrib', definition: 'Prayer After Sunset' },
      { id: 'mahram', term: 'Mahram', definition: 'A Man Whom A Woman Can Never Marry Because Of Closeness Of Relationship (I.E. Father, Brother, Uncle, Son) – Her Husband Is Also Her Mahram' },
      { id: 'mahr', term: 'Mahr', definition: 'Dowry Given By A Husband To His Wife' },
      { id: 'malaikah', term: 'Malaikah', definition: 'Angels – Singular – Malak' },
      { id: 'masjid', term: 'Masjid', definition: 'Mosque – Plural – Masajid' },
      { id: 'mubarak', term: 'Mubarak', definition: 'Blessed' },
      { id: 'mujahid', term: 'Mujahid', definition: 'One Who Takes Active Part In A Jihad – Plural – Mujahideen' },
      { id: 'munafiq', term: 'Munafiq', definition: 'Hypocrite – Plural – Munafiqeen' },
      { id: 'mushrik', term: 'Mushrik', definition: 'People Who Associate Partners With God – Plural – Mushrikeen' },
      { id: 'muslim', term: 'Muslim', definition: 'Submission Of Will (To God)' },
      { id: 'mustahab', term: 'Mustahab', definition: 'Recommended But Not Obligatory' },
    ],
  },
  {
    letter: 'N',
    items: [
      { id: 'nabi', term: 'Nabi', definition: 'Prophet – Plural – Anbiya' },
      { id: 'nafilah', term: 'Nafilah', definition: 'Optional Prayer – Plural – Nawafil' },
      { id: 'nas', term: 'Nas', definition: 'Mankind' },
      { id: 'nikah', term: 'Nikah', definition: 'Marriage' },
      { id: 'nisaa', term: 'Nisaa', definition: 'Women' },
      { id: 'niyaah', term: 'Niyaah', definition: 'Intention Of The Heart' },
      { id: 'noor', term: 'Noor', definition: 'Light' },
    ],
  },
  {
    letter: 'Q',
    items: [
      { id: 'qabr', term: 'Qabr', definition: 'Grave' },
      { id: 'qadr', term: 'Qadr', definition: 'Power' },
      { id: 'qari', term: 'Qari', definition: 'One Who Memorizes The Qur\'an By Heart And Constantly Recites It – Religious Scholar Or Teacher – Plural – Qurra' },
      { id: 'qiblah', term: 'Qiblah', definition: 'Direction In Which All Muslim Pray (Towards Mecca – The Holy Ka\'aba)' },
      { id: 'quran', term: 'Qur\'an', definition: 'The Word Of God – The Final Revelation From God' },
    ],
  },
  {
    letter: 'R',
    items: [
      { id: 'ra', term: 'RA', definition: 'Radi Allahu \'Anhu/\'Anha – May God Be Pleased With Him/Her – Plural – Radi Allahu \'Anhum – May God Be Pleased With Them' },
      { id: 'rabb', term: 'Rabb', definition: 'Lord' },
      { id: 'rakah', term: 'Rak\'ah', definition: 'A Unit Of Prayer – Plural – Rak\'at' },
      { id: 'ramadan', term: 'Ramadan', definition: 'The Holy Month In The Islamic Calander' },
      { id: 'rasool', term: 'Rasool', definition: 'Messenger – Plural – Rusull' },
      { id: 'riba', term: 'Riba', definition: 'Usury' },
      { id: 'rooh', term: 'Rooh', definition: 'Spirit' },
      { id: 'rukn', term: 'Rukn', definition: 'Pillar – Singular – Arkan' },
    ],
  },
  {
    letter: 'S',
    items: [
      { id: 'sabr', term: 'Sabr', definition: 'Patience And Perseverance' },
      { id: 'sadaqa', term: 'Sadaqa', definition: 'Anything Given Away In Charity For The Pleasure Of God' },
      { id: 'sahabi', term: 'Sahabi', definition: 'Companion Of Prophet Muhammad – Plural – Sahabiyeen Sahih – Healthy And Sound With No Defects' },
      { id: 'sakinah', term: 'Sakinah', definition: 'Calm, Peaceful Tranquillity' },
      { id: 'salaam', term: 'Salaam', definition: 'Peace' },
      { id: 'salat', term: 'Salat', definition: 'Prayers' },
      { id: 'saw', term: 'SAW', definition: 'Salallahu \'Alayhee Wa Sallam (May The Peace And Blessings Of God Be Upon Him)' },
      { id: 'shahada', term: 'Shahada', definition: 'To Bear Witness' },
      { id: 'shaheed', term: 'Shaheed', definition: 'Martyr' },
      { id: 'shariah', term: 'Shariah', definition: 'The Islamic Law' },
      { id: 'shaytaan', term: 'Shaytaan', definition: 'Satan – Also Known As – Iblis' },
      { id: 'shuhadaa', term: 'Shuhadaa', definition: 'Person Who Die For The Sake Of (In The Path Of) God' },
      { id: 'shura', term: 'Shura', definition: 'Consultation' },
      { id: 'siratul-mustaqeem', term: 'Siratul-Mustaqeem', definition: 'The Straight Path' },
      { id: 'subhan-allah', term: 'Subhan Allah', definition: 'Glory Be To God' },
      { id: 'sunnah', term: 'Sunnah', definition: 'The Traditions And Practices Of Muhammad – Plural – Sunnan' },
      { id: 'surah', term: 'Surah', definition: 'A Chapter Of The Holy Qur\'an' },
    ],
  },
  {
    letter: 'T',
    items: [
      { id: 'tafsir', term: 'Tafsir', definition: 'A commentary' },
      { id: 'tahara', term: 'Tahara', definition: 'Purification' },
      { id: 'tajweed', term: 'Tajweed', definition: 'Recitation Of The Holy Qur\'an With Precise Articulation And Exact Intonation' },
      { id: 'taqwa', term: 'Taqwa', definition: 'Fear Of God (Fear To Do Anything That Would Displease God)' },
      { id: 'taubah', term: 'Taubah', definition: 'Repenting After Committing A Sin' },
      { id: 'tawheed', term: 'Tawheed', definition: 'The Divine Unity' },
      { id: 'thawab', term: 'Thawab', definition: 'Spiritual Reward Given By God' },
      { id: 'tilawat', term: 'Tilawat', definition: 'Reciting The Holy Qur\'an And Conveying It\'s Message To Others' },
    ],
  },
  {
    letter: 'U',
    items: [
      { id: 'ummah', term: 'Ummah', definition: 'The Body Of Muslims As One Distinct Integrated Community' },
      { id: 'umrah', term: 'Umrah', definition: 'Pilgramage To Mecca But Not During Hajj' },
    ],
  },
  {
    letter: 'W',
    items: [
      { id: 'wa-alaykum-as-salaam', term: 'Wa-\'Alaykum As-Salaam', definition: 'And On You Be Peace (Reply To The Muslim Greeting Of – As-Salaamu \'Alaykum – Peace Be Upon You)' },
      { id: 'wahy', term: 'Wahy', definition: 'Revelation' },
      { id: 'walee', term: 'Walee', definition: 'A Guardian – Plural – Awliyaa' },
      { id: 'walima', term: 'Walima', definition: 'Marriage Banquet' },
      { id: 'witr', term: 'Witr', definition: 'A Prayer With An Odd Amount Of Unit' },
      { id: 'wudu', term: 'Wudu', definition: 'Ritual Washing With Water To Be Pure For Prayer' },
    ],
  },
  {
    letter: 'Y',
    items: [
      { id: 'yarhamukullah', term: 'Yarhamuku\'llah', definition: 'May God\'s Mercy Be Upon You (A Response To A Sneezer When He/She Says – Alhumdulillah – Praise To God)' },
    ],
  },
  {
    letter: 'Z',
    items: [
      { id: 'zakat', term: 'Zakat', definition: 'The Muslims Wealth Tax – It Is Compulsory On All Muslims – One Must Pay 2.5% Of One\'s Yearly Savings' },
    ],
  },
];


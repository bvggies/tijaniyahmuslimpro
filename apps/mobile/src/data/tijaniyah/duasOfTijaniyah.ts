export interface TijaniyahDua {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  transliteration?: string;
  context?: string;
  reference?: string;
  route: string;
}

export const DUAS_OF_TIJANIYAH: TijaniyahDua[] = [
  {
    id: 'khatmul-wazifa',
    title: 'Duʿā Khatmul Wazifa',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ بِجَاهِ سَيِّدِنَا مُحَمَّدٍ ﷺ وَبِسِرِّ الطَّرِيقَةِ التِّجَانِيَّةِ أَنْ تَتَقَبَّلَ مِنَّا هَذَا الْوِرْدَ، وَأَنْ تَجْعَلَهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ، وَأَنْ تَنَفَعَنَا بِهِ فِي الدُّنْيَا وَالْآخِرَةِ، آمِينَ.',
    translation: 'O Allah, we ask You by the rank of our master Muḥammad ﷺ and by the secret of the Tijani path to accept this Wazifa from us, to make it purely for Your noble Face, and to benefit us by it in this world and the next. Amīn.',
    transliteration: 'Allāhumma innā nas\'aluka bi-jāhi sayyidinā Muḥammadin ṣallallāhu \'alayhi wa sallam wa bi-sirriṭ-ṭarīqati at-Tijāniyyati an tataqabbala minnā hādhā al-wird, wa an taj\'alahu khāliṣan li-wajhika al-karīm, wa an tanfa\'anā bihī fī ad-dunyā wa al-ākhirah, āmīn.',
    context: 'This supplication is recited after completing the Wazifa (the daily Tijaniyah litany). It seeks acceptance of the worship and asks for its benefits in both this world and the Hereafter.',
    reference: 'Tijaniyah Path',
    route: 'DuaKhatmulWazifa',
  },
  {
    id: 'rabil-ibadi',
    title: 'Duʿā Rābil ʿIbādi',
    arabic: 'رَبِّ الْعِبَادِ، يَا مَنْ بِيَدِهِ مَقَادِيرُ الْخَلَائِقِ، يَا مَنْ لَا يَعْجِزُهُ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، اقْضِ حَوَائِجَنَا، وَيَسِّرْ أُمُورَنَا، وَفَرِّجْ هُمُومَنَا، وَاغْفِرْ لَنَا وَلِوَالِدِينَا وَلِإِخْوَانِنَا فِي الطَّرِيقَةِ التِّجَانِيَّةِ، آمِينَ.',
    translation: 'Lord of the servants, O He in Whose hand are the destinies of all creation, O He Whom nothing in the earth or the heavens can incapacitate, fulfill our needs, ease our affairs, relieve our worries, and forgive us, our parents, and our brothers in the Tijani path. Amīn.',
    transliteration: 'Rabbi al-\'ibādi, yā man bi-yadihi maqādīru al-khalā\'iq, yā man lā ya\'jizuhu shay\'un fī al-arḍi wa lā fī as-samā\', iqḍi ḥawā\'ijanā, wa yassir umūranā, wa farrij humūmanā, wa aghfir lanā wa li-wālidaynā wa li-ikhwāninā fī aṭ-ṭarīqati at-Tijāniyyah, āmīn.',
    context: 'This supplication is a comprehensive prayer seeking Allah\'s help in all matters of life. It asks for the fulfillment of needs, ease in affairs, relief from worries, and forgiveness for oneself, parents, and fellow Tijaniyah brothers and sisters.',
    reference: 'Tijaniyah Path',
    route: 'DuaRabilIbadi',
  },
  {
    id: 'hasbil-muhaiminu',
    title: 'Duʿā Ḥasbil Muhaiminu',
    arabic: 'حَسْبِيَ الْمُهَيْمِنُ الَّذِي لَا يُحِيطُ بِهِ مَكَانٌ، وَلَا يَشْغَلُهُ شَأْنٌ عَنْ شَأْنٍ، حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    translation: 'Sufficient for me is al‑Muhaimīn, Whom no place encompasses and Whom no affair distracts from any other affair. Sufficient for me is Allah—there is no god except Him; in Him I place my trust, and He is the Lord of the Mighty Throne.',
    transliteration: 'Ḥasbiya al-Muhayminu alladhī lā yuḥīṭu bihī makān, wa lā yashghuluhu sha\'nun \'an sha\'n, ḥasbiya Allāhu lā ilāha illā huwa, \'alayhi tawakkaltu, wa huwa rabbu al-\'arshi al-\'aẓīm.',
    context: 'This powerful supplication expresses complete trust and reliance on Allah. It acknowledges His all-encompassing power and that nothing can distract Him from any matter. It is often recited for protection and seeking Allah\'s sufficiency in all affairs.',
    reference: 'Tijaniyah Path',
    route: 'DuaHasbilMuhaiminu',
  },
];


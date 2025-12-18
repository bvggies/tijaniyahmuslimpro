import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '@tmp/db';
import { ok, serverError } from '../lib/response';

const TIJANIYAH_DUAS = [
  {
    key: 'khatmul_wazifa',
    title: 'Duʿā Khatmul Wazifa',
    arabic:
      'اللَّهُمَّ إِنَّا نَسْأَلُكَ بِجَاهِ سَيِّدِنَا مُحَمَّدٍ ﷺ وَبِسِرِّ الطَّرِيقَةِ التِّجَانِيَّةِ أَنْ تَتَقَبَّلَ مِنَّا هَذَا الْوِرْدَ، وَأَنْ تَجْعَلَهُ خَالِصًا لِوَجْهِكَ الْكَرِيمِ، وَأَنْ تَنَفَعَنَا بِهِ فِي الدُّنْيَا وَالْآخِرَةِ، آمِينَ.',
    translation:
      'O Allah, we ask You by the rank of our master Muḥammad ﷺ and by the secret of the Tijani path to accept this Wazifa from us, to make it purely for Your noble Face, and to benefit us by it in this world and the next. Amīn.',
  },
  {
    key: 'rabil_ibadi',
    title: 'Duʿā Rābil ʿIbādi',
    arabic:
      'رَبِّ الْعِبَادِ، يَا مَنْ بِيَدِهِ مَقَادِيرُ الْخَلَائِقِ، يَا مَنْ لَا يَعْجِزُهُ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، اقْضِ حَوَائِجَنَا، وَيَسِّرْ أُمُورَنَا، وَفَرِّجْ هُمُومَنَا، وَاغْفِرْ لَنَا وَلِوَالِدِينَا وَلِإِخْوَانِنَا فِي الطَّرِيقَةِ التِّجَانِيَّةِ، آمِينَ.',
    translation:
      'Lord of the servants, You in Whose Hand are the decrees of all creation, You for Whom nothing in the earth nor in the heavens is difficult: fulfil our needs, ease our affairs, relieve our worries, and forgive us, our parents, and our brothers and sisters upon the Tijani path. Amīn.',
  },
  {
    key: 'hasbil_muhaiminu',
    title: 'Duʿā Ḥasbil Muhaiminu',
    arabic:
      'حَسْبِيَ الْمُهَيْمِنُ الَّذِي لَا يُحِيطُ بِهِ مَكَانٌ، وَلَا يَشْغَلُهُ شَأْنٌ عَنْ شَأْنٍ، حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    translation:
      'Sufficient for me is al‑Muhaimīn, Whom no place encompasses and Whom no affair distracts from any other affair. Sufficient for me is Allah—there is no god except Him; in Him I place my trust, and He is the Lord of the Mighty Throne.',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Ensure these duas are present in the Dua table (idempotent).
    await Promise.all(
      TIJANIYAH_DUAS.map(dua =>
        prisma.dua.upsert({
          where: { title: dua.title },
          update: {},
          create: {
            title: dua.title,
            arabic: dua.arabic,
            translation: dua.translation,
            reference: 'Tijaniyah',
            category: {
              connectOrCreate: {
                where: { name: 'Tijaniyah Dua' },
                create: { name: 'Tijaniyah Dua' },
              },
            },
          },
        }),
      ),
    );

    const stored = await prisma.dua.findMany({
      where: { title: { in: TIJANIYAH_DUAS.map(d => d.title) } },
      orderBy: { createdAt: 'asc' },
    });

    ok(res, { duas: stored });
  } catch (error) {
    console.error('tijaniyah-duas error', error);
    serverError(res);
  }
}




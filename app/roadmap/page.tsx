import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Discover the Optimism Prime roadmap: Reliquary Prime, Autobribes, treasury automation, and future protocol upgrades.',
};

type RoadmapSection = {
  title: string;
  items: string[];
};

const roadmapData: RoadmapSection[] = [
  {
    title: 'OPTIMISM PRIME',
    items: ['Grow our treasury', 'Automate our treasury management workflow'],
  },
  {
    title: 'RELIQUARY PRIME & AUTOBRIBES',
    items: [
      'Improve UI (claim all, filter / sort relics, merge / split / send)',
      'Write documentation',
      'Integrate other ve(3,3) exchanges',
      'Beta test Autobribes using funds from Optimism Prime Treasury',
      'Grow a veNFT for each instance',
      'Have the code reviewed by pairs and find funding for audits',
      'Clarify fundraising & incentive model and find seed investors',
    ],
  },
  {
    title: 'LENDERBOTS DAO',
    items: ['Deploy staking mechanism to distribute interest rate'],
  },
  {
    title: 'AUTOBOTS NFTS',
    items: [
      'Automate reward distribution',
      'Relaunch collection with new designs & royalties',
      'Add some small revenue sharing to common Autobots',
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <h1
          className="text-4xl md:text-5xl text-white/90 mb-12 tracking-wider text-center"
          style={{ fontFamily: 'Transformers, sans-serif' }}
        >
          ROADMAP
        </h1>

        <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent mx-auto mb-12" />

        <div className="space-y-8">
          {roadmapData.map((section, index) => (
            <div
              key={index}
              className="
                relative
                bg-linear-to-br from-black/70 via-black/50 to-black/70
                backdrop-blur-xl
                border border-white/10
                rounded-2xl
                p-8 md:p-12
                shadow-[0_0_40px_rgba(0,0,0,0.5)]
                hover:border-red-500/30
                transition-all duration-300
              "
            >
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-red-500/30 rounded-br-2xl" />

              <div className="absolute top-4 right-6 text-red-500/30 font-mono text-sm">
                [{String(index + 1).padStart(2, '0')}]
              </div>

              <h2
                className="text-2xl md:text-3xl text-white/90 mb-6 tracking-wide"
                style={{ fontFamily: 'Transformers, sans-serif' }}
              >
                {section.title}
              </h2>

              <div className="w-16 h-0.5 bg-linear-to-r from-red-500 to-transparent mb-6" />

              <ul className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start gap-4 text-white/80 text-lg leading-relaxed"
                  >
                    <span className="mt-2 w-2 h-2 bg-red-500/50 rotate-45 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-16">
          <div className="w-16 h-px bg-linear-to-r from-transparent to-red-500/50" />
          <div className="w-3 h-3 border border-red-500/50 rotate-45" />
          <div className="w-16 h-px bg-linear-to-l from-transparent to-red-500/50" />
        </div>
      </div>
    </div>
  );
}

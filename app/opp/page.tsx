export default function OppPage() {
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">

        <h1 
          className="text-4xl md:text-5xl text-white/90 mb-12 tracking-wider text-center"
          style={{ fontFamily: 'Transformers, sans-serif' }}
        >
          $OPP
        </h1>

        <div className="w-24 h-0.5g-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-12" />
        
        <div className="
          relative
          bg-linear-to-br from-black/70 via-black/50 to-black/70
          backdrop-blur-xl
          border border-white/10
          rounded-2xl
          p-10 md:p-16 lg:p-20
          shadow-[0_0_80px_rgba(0,0,0,0.8)]
        ">
          
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-red-500/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-red-500/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-red-500/30 rounded-br-2xl" />

          <h2 
            className="text-4xl md:text-5xl text-white/90 mb-12 tracking-wider"
            style={{ fontFamily: 'Transformers, sans-serif' }}
          >
            OPTIPRIMUS
          </h2>

          <div className="w-24 h-0.5 bg-linear-to-r from-red-500 to-transparent mb-12" />

          <div className="text-white/80 text-lg md:text-xl leading-loose space-y-8">
            
            <p>
              <span 
                className="text-2xl md:text-3xl text-white/90"
                style={{ fontFamily: 'Transformers, sans-serif' }}
              >
                OptiPrimus
              </span>
              , the creator god - the multiversal force for good has provided some
              of his life force to bring Optimism Prime to life.
            </p>

            <p>
              Even in the face of losing decentralization to the combined might of
              the Regulator forces, Optimism Prime never abandoned his fight to
              liberate the Optimistic Chain. Given the current events and
              regulations, Optimism Prime and the decentrabots have staged a plan
              to counter this unfair legislators: the{' '}
              <a 
                href="https://optimistic.etherscan.io/token/0x676f784d19c7f1ac6c6beaeaac78b02a73427852"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
              >
                $OPP
              </a>{' '}
              token.
            </p>

            <p>
              Optimism Prime is the first{' '}
              <span className="text-white font-semibold">FAIR LAUNCH</span> token
              mechanics in the Optimism Chain. NO PRESALE, NO VC&apos;s. Just a fair
              token, cheap gas and lots of fun!
            </p>

            <p>
              The token has a 1,000,000,000 supply and is fully distributed. It can 
              be bought and used for liquidity providing on{' '}
              <a 
                href="https://app.velodrome.finance/swap?from=eth&to=0x676f784d19c7f1ac6c6beaeaac78b02a73427852"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
              >
                Velodrome
              </a>
              . A leveraged farming pool is available on{' '}
              <a 
                href="https://www.tarot.to/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
              >
                Tarot
              </a>
              .
            </p>

            <p>
              We have suffered losses, but we&apos;ve not lost the war, we can still
              have lots of fun, and most important, we can still do it FREELY on
              Optimism. Hop on our journey and join our socials.{' '}
              <a 
                href="https://discord.gg/SpfdM2VwUy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
              >
                Be a part of the first legit meme token and let&apos;s save the blockchain together.
              </a>
            </p>

            <div className="pt-8 border-t border-white/10">
              <p 
                className="text-white/90 text-xl md:text-2xl italic tracking-wide"
                style={{ fontFamily: 'Transformers, sans-serif' }}
              >
                &quot;Now all we need is a little Energon and a lot of Luck.&quot;
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

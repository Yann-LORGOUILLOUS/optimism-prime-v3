'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useReliquaryService } from '@/presentation/hooks/useReliquaryService';
import type { PoolDisplayData, RelicDisplayData} from '@/application/services';
import { useCreateRelicAndDeposit, useApprove } from '@/presentation/hooks/useReliquaryActions';
import { MILLISECONDS_PER_WEEK, OPTIMISM_CHAIN_ID } from '@/shared/constants/time';
import { TokenAmount } from '@/domain/reliquary/value-objects/TokenAmount';

type ReliquaryVersion = 1 | 2;

const DISCLAIMER_STORAGE_KEY = 'opp_earn-warning-acknowledged';
const DISCLAIMER_TIMESTAMP_KEY = 'opp_earn-warning-acknowledged-timestamp';
const MEDIUM_ARTICLE_URL = 'https://medium.com/optimism-prime/introducing-the-reliquary-prime-12d648212a07';
const FEATURED_POOL_NAME = 'Soundwave';
const OP_TOKEN_URL = 'https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042';

function tryGetDisclaimerStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const acknowledged = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    const timestamp = localStorage.getItem(DISCLAIMER_TIMESTAMP_KEY);
    if (!acknowledged) return true;
    if (timestamp && Date.now() - parseInt(timestamp) > MILLISECONDS_PER_WEEK) return true;
    return false;
  } catch {
    return true;
  }
}

function saveDisclaimerAcknowledgment(): void {
  try {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    localStorage.setItem(DISCLAIMER_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    return;
  }
}

export default function EarnPage() {
  const { isConnected, chain, address } = useAccount();
  const [reliquaryVersion, setReliquaryVersion] = useState<ReliquaryVersion>(2);
  const [showDisclaimer, setShowDisclaimer] = useState(() => tryGetDisclaimerStatus());
  const [showAdvancedPools, setShowAdvancedPools] = useState(false);
  const [showAllUserRelics, setShowAllUserRelics] = useState(false);
  const [showAllPoolRelics, setShowAllPoolRelics] = useState(false);
  const [showPoolsDetails, setShowPoolsDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch, loadAllRelics } = useReliquaryService(reliquaryVersion);

  const acknowledgeDisclaimer = () => {
    saveDisclaimerAcknowledgment();
    setShowDisclaimer(false);
  };

  const isOptimism = chain?.id === OPTIMISM_CHAIN_ID;

  const { featuredPool, advancedPools, featuredPoolIndex } = useMemo(() => {
    if (!data) return { featuredPool: null, advancedPools: [], featuredPoolIndex: null };
    const featured = data.pools.find(p => p.displayName.includes(FEATURED_POOL_NAME));
    const advanced = data.pools.filter(p => p !== featured);
    return { 
      featuredPool: featured || null, 
      advancedPools: advanced,
      featuredPoolIndex: featured?.index ?? null
    };
  }, [data]);

  const { visibleUserRelics, hiddenUserRelicsCount } = useMemo(() => {
    if (!data) return { visibleUserRelics: [], hiddenUserRelicsCount: 0 };

    const activeUserRelics = data.userRelics.filter(relic => !relic.amount.isZero() || relic.canClaim);
    const visible = showAllUserRelics ? data.userRelics : activeUserRelics;

    return {
      visibleUserRelics: visible,
      hiddenUserRelicsCount: data.userRelics.length - activeUserRelics.length
    };
  }, [data, showAllUserRelics]);


  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center px-4 py-12">
      <PageTitle />
      <Divider />

      <div className="w-full max-w-6xl flex flex-col gap-6">
        <InfoBlock />
        
        <VersionSelector 
          version={reliquaryVersion} 
          onVersionChange={(v) => {
            setReliquaryVersion(v);
            setShowAdvancedPools(false);
            setShowAllUserRelics(false);
            setShowAllPoolRelics(false);
            setShowPoolsDetails(false);
          }} 
        />

        {!isConnected && <MessageCard message="Please connect to Optimism" />}
        {isConnected && !isOptimism && <MessageCard message="Please switch to Optimism network" />}
        {isConnected && isOptimism && isLoading && !data && <LoadingCard version={reliquaryVersion} />}
        {isConnected && isOptimism && error && <ErrorCard message={error} onRetry={refetch} />}
        
        {isConnected && isOptimism && data && (
          <>
            <ReliquaryOverviewSection 
              data={data} 
              version={reliquaryVersion}
              onRefresh={refetch}
              isRefreshing={isLoading}
            />

            <FeaturedPoolSection pool={featuredPool} />

            <AdvancedPoolsSection 
              pools={advancedPools}
              isVisible={showAdvancedPools}
              onToggle={() => setShowAdvancedPools(!showAdvancedPools)}
              showPoolsDetails={showPoolsDetails}
              onToggleDetails={() => setShowPoolsDetails(!showPoolsDetails)}
              allPools={data.pools}
            />

            <UserRelicsSection 
              data={data}
              visibleRelics={visibleUserRelics}
            />

            <ShowAllUserRelicsSection
              totalRelics={data.userRelics.length}
              hiddenRelicsCount={hiddenUserRelicsCount}
              isShowingAll={showAllUserRelics}
              onToggle={() => setShowAllUserRelics(!showAllUserRelics)}
            />

            <AllPoolRelicsSection
              allRelics={data.allRelics}
              isVisible={showAllPoolRelics}
              isLoading={data.allRelicsLoading}
              isLoaded={data.allRelicsLoaded}
              onToggle={() => {
                if (!showAllPoolRelics && !data.allRelicsLoaded) {
                  loadAllRelics();
                }
                setShowAllPoolRelics(!showAllPoolRelics);
              }}
            />

            <CreateRelicButton onClick={() => setShowCreateModal(true)} />
          </>
        )}
      </div>

      {showDisclaimer && <DisclaimerModal onAccept={acknowledgeDisclaimer} />}
      
      {showCreateModal && data && (
        <CreateRelicModal
          reliquaryAddress={data.address as `0x${string}`}
          pools={data.pools}
          defaultPoolIndex={featuredPoolIndex}
          userAddress={address}
          userTokenBalances={data.userTokenBalances}
          userTokenAllowances={data.userTokenAllowances}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

function PageTitle() {
  return (
    <h1 className="text-4xl md:text-5xl text-white/90 mb-6 tracking-wider text-center" style={{ fontFamily: 'Transformers, sans-serif' }}>
      EARN
    </h1>
  );
}

function Divider() {
  return <div className="w-24 h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent mb-12" />;
}

function InfoBlock() {
  return (
    <Card>
      <p className="text-white/80 text-lg text-center">
        Deposit your assets in the Reliquary Prime to earn a share of Optimism Prime treasury yield
      </p>
      <p className="text-white/60 mt-2 text-center">
        More information in{' '}
        <a href={MEDIUM_ARTICLE_URL} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors">
          our Medium article
        </a>
      </p>
    </Card>
  );
}

function VersionSelector({ version, onVersionChange }: { version: ReliquaryVersion; onVersionChange: (v: ReliquaryVersion) => void }) {
  return (
    <Card>
      <div className="flex gap-4 justify-center">
        <VersionButton label="V1" isActive={version === 1} onClick={() => onVersionChange(1)} />
        <VersionButton label="V2" isActive={version === 2} onClick={() => onVersionChange(2)} />
      </div>
    </Card>
  );
}

function VersionButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 text-lg
        ${isActive 
          ? 'bg-red-500/20 text-white border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.18)]' 
          : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
    >
      {label}
    </button>
  );
}

function MessageCard({ message }: { message: string }) {
  return (
    <Card>
      <p className="text-white/80 text-xl text-center">{message}</p>
    </Card>
  );
}

function LoadingCard({ version }: { version: ReliquaryVersion }) {
  return (
    <Card>
      <div className="flex items-center justify-center gap-3">
        <LoadingSpinner />
        <span className="text-white/80 text-lg">Loading V{version}...</span>
      </div>
    </Card>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-red-500/30">
      <p className="text-red-400 text-lg mb-4 text-center">{message}</p>
      <div className="flex justify-center">
        <ActionButton onClick={onRetry}>Retry</ActionButton>
      </div>
    </Card>
  );
}

function ReliquaryOverviewSection({ data, version, onRefresh, isRefreshing }: { 
  data: ReturnType<typeof useReliquaryService>['data'];
  version: ReliquaryVersion; 
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  if (!data) return null;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl text-white" style={{ fontFamily: 'Transformers, sans-serif' }}>
          Reliquary Prime V{version}
        </h2>
        <button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshIcon className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mb-2 text-center">
        <span className="text-white/50 text-sm">Contract: </span>
        <a href={`https://optimistic.etherscan.io/address/${data.address}`} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline">
          {formatAddress(data.address)}
        </a>
      </div>
      
      <div className="mb-6 text-center">
        <span className="text-white/50 text-sm">Reward token: </span>
        <a 
          href={OP_TOKEN_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-red-400 hover:text-red-300 underline underline-offset-2 font-medium transition-colors"
        >
          Optimism OP
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricBox label="TVL" value={`$${formatNumber(data.tvlUsd)}`} />
        <MetricBox label="Average APR" value={`${data.averageApr.toFixed(2)}%`} variant="primary" />
        <MetricBox 
          label="Weekly Rewards" 
          value={`$${formatNumber(data.weeklyRewardRateUsd)}`} 
          subValue={`${formatNumber(data.weeklyRewardRate)} ${data.rewardTokenSymbol}`}
        />
      </div>
    </Card>
  );
}

function MetricBox({ label, value, subValue, variant = 'default' }: { 
  label: string; 
  value: string; 
  subValue?: string;
  variant?: 'default' | 'primary';
}) {
  const bgClass = variant === 'primary' 
    ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30' 
    : 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20';

  return (
    <div className={`${bgClass} border rounded-xl p-5 flex flex-col items-center justify-center min-h-25`}>
      <p className="text-white/50 text-sm mb-2">{label}</p>
      <p className={`text-xl font-bold ${variant === 'primary' ? 'text-green-400' : 'text-white'}`}>{value}</p>
      {subValue && <p className="text-white/40 text-xs mt-2">{subValue}</p>}
    </div>
  );
}

function PoolMetricBox({ label, value, variant = 'default' }: { 
  label: string; 
  value: string; 
  variant?: 'default' | 'primary';
}) {
  const bgClass = variant === 'primary' 
    ? 'bg-red-500/15 border-red-500/40' 
    : 'bg-red-500/10 border-red-500/30';

  return (
    <div className={`${bgClass} border rounded-xl p-4 flex flex-col items-center justify-center min-h-22.5`}>
      <p className="text-white/50 text-sm mb-2">{label}</p>
      <p className={`text-xl font-bold ${variant === 'primary' ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function FeaturedPoolSection({ pool }: { pool: PoolDisplayData | null }) {
  if (!pool) return null;

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6 pl-2">
        <DiamondIcon />
        <h3 className="text-xl text-white" style={{ fontFamily: 'Transformers, sans-serif' }}>
          Active Product
        </h3>
      </div>
      <PoolCardExpanded pool={pool} />
    </Card>
  );
}

function PoolCardExpanded({ pool }: { pool: PoolDisplayData }) {
  return (
    <div className="bg-black/30 rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6 px-2">
        <a href={pool.url} target="_blank" rel="noopener noreferrer" className="text-white text-lg font-medium hover:text-red-400 transition-colors">
          {pool.displayName}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 px-4">
        <PoolMetricBox label="TVL" value={`$${formatNumber(pool.tvlUsd)}`} />
        <PoolMetricBox label="APR" value={`${pool.averageApr.toFixed(2)}%`} variant="primary" />
      </div>

      <div className="border-t border-white/10 pt-5">
        <p className="text-white/50 text-sm mb-4 px-2">Maturity Levels</p>
        <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
          {pool.levels.map(level => (
            <LevelCard key={level.level} level={level} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelCard({ level }: { level: PoolDisplayData['levels'][0] }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-red-500/20 transition-colors">
      <p className="text-white/60 text-xs font-medium mb-2">Lv.{level.level}</p>
      <p className="text-green-400 text-sm font-bold">
        {level.apr > 0 ? `${level.apr.toFixed(1)}%` : '-'}
        {level.apr > 100 && ' 🔥'}
      </p>
      <p className="text-white/30 text-xs mt-1">x{level.multiplier}</p>
      <p className="text-white/40 text-xs mt-1">{`$${formatNumber(level.tvlUsd)}`}</p>
    </div>
  );
}

function AdvancedPoolsSection({ pools, isVisible, onToggle, showPoolsDetails, onToggleDetails, allPools }: { 
  pools: PoolDisplayData[]; 
  isVisible: boolean; 
  onToggle: () => void;
  showPoolsDetails: boolean;
  onToggleDetails: () => void;
  allPools: PoolDisplayData[];
}) {
  if (pools.length === 0) return null;

  return (
    <Card>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2 group">
        <div className="flex items-center gap-3">
          <LayersIcon />
          <h3 className="text-xl text-white" style={{ fontFamily: 'Transformers, sans-serif' }}>
            Show Advanced Pools
          </h3>
          <span className="text-white/40 text-sm">({pools.length} pools)</span>
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <ChevronIcon direction={isVisible ? 'up' : 'down'} />
        </div>
      </button>

      {isVisible && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {pools.map(pool => (
              <PoolCardCollapsible key={pool.index} pool={pool} />
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={onToggleDetails}
              className="px-6 py-3 rounded-full font-medium tracking-wide transition-all duration-300
                bg-white/10 text-white/80 border border-white/20 hover:bg-white/15 hover:border-white/30"
            >
              {showPoolsDetails ? 'HIDE POOLS DETAILS' : 'SHOW ALL POOLS DETAILS'}
            </button>
          </div>
          
          {showPoolsDetails && (
            <PoolsDetailsPanel pools={allPools} />
          )}
        </>
      )}
    </Card>
  );
}

function PoolCardCollapsible({ pool }: { pool: PoolDisplayData }) {
  const [showLevels, setShowLevels] = useState(false);

  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <a href={pool.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-red-400 transition-colors">
          {pool.displayName}
        </a>
        <button 
          onClick={() => setShowLevels(!showLevels)} 
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
            ${showLevels 
              ? 'bg-white/20 text-white border border-white/30' 
              : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'}`}
        >
          {showLevels ? 'Hide' : 'Levels'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <PoolMetricBox label="TVL" value={`$${formatNumber(pool.tvlUsd)}`} />
        <PoolMetricBox label="APR" value={`${pool.averageApr.toFixed(2)}%`} variant="primary" />
      </div>

      {showLevels && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-white/40 text-xs mb-2">Maturity Levels</p>
          <div className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
            {pool.levels.map(level => (
              <LevelCard key={level.level} level={level} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PoolsDetailsPanel({ pools }: { pools: PoolDisplayData[] }) {
  return (
    <div className="mt-6 bg-linear-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
      <CornerDecorations />

      <div className="flex items-center justify-between mb-6">
        <h4
          className="text-xl text-white tracking-wide"
          style={{ fontFamily: 'Transformers, sans-serif' }}
        >
          POOLS DETAILS
        </h4>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400/70" />
          Active
          <span className="mx-1">•</span>
          <span className="inline-block w-2 h-2 rounded-full bg-white/25" />
          Inactive
        </div>
      </div>

      <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
        {pools.map((pool, i) => (
          <div
            key={pool.index}
            className={[
              'rounded-2xl border transition-all',
              i % 2 === 1
                ? 'bg-red-500/10 border-red-500/15'
                : 'bg-black/25 border-white/10',
              pool.isActive
                ? 'shadow-[0_0_0_1px_rgba(239,68,68,0.18)] border-red-500/25'
                : 'opacity-90 hover:opacity-100 hover:border-white/20',
            ].join(' ')}
          >
            <PoolDetailCard pool={pool} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PoolDetailCard({ pool }: { pool: PoolDisplayData }) {
  const totalAllocShare = (pool.allocShare * 100).toFixed(2);

  return (
    <div className="p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={[
              'w-2.5 h-2.5 rounded-full shrink-0',
              pool.isActive
                ? 'bg-green-400/80 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                : 'bg-white/25',
            ].join(' ')}
          />
          <a
            href={pool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium truncate hover:text-red-300 transition-colors"
          >
            {pool.displayName}
          </a>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/5 border border-white/10 text-white/70">
            {pool.tokenSymbol}
          </span>
          {pool.isActive && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-green-500/15 border border-green-500/25 text-green-300">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-white/50 text-xs mb-1">Reward Alloc</p>
          <p className="text-white font-mono text-sm">{totalAllocShare}%</p>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <p className="text-white/50 text-xs mb-1">TVL</p>
          <p className="text-white font-mono text-sm">${formatNumber(pool.tvlUsd)}</p>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-red-500/20">
          <p className="text-white/50 text-xs mb-1">Average APR</p>
          <p className="text-green-400 font-mono text-sm">{pool.averageApr.toFixed(2)}%</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm">Maturity Levels</p>
          <p className="text-white/35 text-xs font-mono">{pool.levels.length} levels</p>
        </div>

        <div className="space-y-3">
          {pool.levels.map((level) => (
            <div
              key={level.level}
              className="bg-black/25 rounded-xl border border-white/10 p-4 hover:border-red-500/20 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-red-500/15 border border-red-500/25 text-red-200">
                  LVL {level.level}
                </span>
                <div className="text-xs font-mono text-white/50">
                  x{(level.multiplier * 10).toFixed(0)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-white/65">
                <div className="flex items-center justify-between bg-black/25 rounded-lg border border-white/10 px-3 py-2">
                  <span className="text-white/45">Maturity</span>
                  <span className="text-white/75">
                    {formatMaturity(level.requiredMaturity)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-black/25 rounded-lg border border-white/10 px-3 py-2">
                  <span className="text-white/45">TVL</span>
                  <span className="text-white/75">
                    ${formatNumber(level.tvlUsd)}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-black/25 rounded-lg border border-white/10 px-3 py-2">
                  <span className="text-white/45">APR</span>
                  <span className="text-green-400">
                    {level.apr > 0 ? `${level.apr.toFixed(2)}%` : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-black/25 rounded-lg border border-white/10 px-3 py-2">
                  <span className="text-white/45">Multiplier</span>
                  <span className="text-white/75">
                    x{(level.multiplier * 10).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



function formatMaturity(seconds: number): string {
  if (seconds === 0) return '-';
  const weeks = Math.floor(seconds / 604800);
  const days = Math.floor((seconds % 604800) / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  let result = '';
  if (weeks > 0) result += `${weeks} week${weeks > 1 ? 's' : ''}, `;
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''}, `;
  result += `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  return result;
}

function UserRelicsSection({ data, visibleRelics }: {
  data: NonNullable<ReturnType<typeof useReliquaryService>['data']>;
  visibleRelics: RelicDisplayData[];
}) {
  const hasRelics = data.userRelics.length > 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl text-white" style={{ fontFamily: 'Transformers, sans-serif' }}>
          Your Prime Relics
        </h3>
      </div>

      {hasRelics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricBox label="Total Deposited" value={`$${formatNumber(data.totalUserDepositUsd)}`} />
          <MetricBox 
            label="Pending Rewards" 
            value={`${data.totalUserPendingRewards.formatted(4)} ${data.rewardTokenSymbol}`} 
            subValue={`$${formatNumber(data.totalUserPendingRewardsUsd)}`}
          />
          <MetricBox label="Relics Owned" value={data.userRelics.length.toString()} />
        </div>
      )}

      {!hasRelics ? (
        <p className="text-center text-white/50 py-8">You don&apos;t have any relics yet. Create one below!</p>
      ) : visibleRelics.length === 0 ? (
        <p className="text-center text-white/50 py-8">
          No relics with TVL or claimable rewards. Use &quot;SHOW ALL YOUR RELICS&quot; to view everything.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleRelics.map(relic => (
            <RelicCard key={relic.id} relic={relic} rewardSymbol={data.rewardTokenSymbol} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ShowAllUserRelicsSection({ totalRelics, hiddenRelicsCount, isShowingAll, onToggle }: {
  totalRelics: number;
  hiddenRelicsCount: number;
  isShowingAll: boolean;
  onToggle: () => void;
}) {
  if (hiddenRelicsCount <= 0) return null;

  return (
    <Card>
      <div className="flex justify-center">
        <ActionButton onClick={onToggle} size="lg" className="w-full md:w-auto">
          {isShowingAll ? 'HIDE YOUR RELICS' : `SHOW ALL YOUR RELICS (${totalRelics})`}
        </ActionButton>
      </div>
    </Card>
  );
}

function AllPoolRelicsSection({ allRelics, isVisible, isLoading, isLoaded, onToggle }: {
  allRelics: RelicDisplayData[];
  isVisible: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  onToggle: () => void;
}) {
  const totalCount = allRelics?.length ?? 0;

  return (
    <Card>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2 group">
        <div className="flex items-center gap-3">
          <VaultIcon />
          <h3 className="text-xl text-white" style={{ fontFamily: 'Transformers, sans-serif' }}>
            See All Relics
          </h3>
          {isLoaded && (
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
              {totalCount}
            </span>
          )}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
          <ChevronIcon direction={isVisible ? 'up' : 'down'} />
        </div>
      </button>

      {isVisible && (
        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <LoadingSpinner />
              <span className="text-white/60">Loading all relics...</span>
            </div>
          ) : totalCount === 0 && isLoaded ? (
            <p className="text-center text-white/50 py-8">No relics found</p>
          ) : (
            <div className="max-h-125 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allRelics.map(relic => (
                  <MiniRelicCard key={relic.id} relic={relic} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function MiniRelicCard({ relic }: { relic: RelicDisplayData }) {
  return (
    <div className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-red-500/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-mono text-sm">#{relic.id}</span>
        <span className="text-green-400 text-sm font-bold">{relic.apr.toFixed(1)}%</span>
      </div>
      <p className="text-white/60 text-xs truncate">{relic.poolName}</p>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-white/40">Lv.{relic.level}</span>
        <span className="text-white/60">{`$${formatNumber(relic.amountUsd)}`}</span>
      </div>
    </div>
  );
}

function RelicCard({ relic, rewardSymbol }: { relic: RelicDisplayData; rewardSymbol: string }) {
  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <h4 className="text-lg text-white mb-3" style={{ fontFamily: 'Transformers, sans-serif' }}>
            Relic #{relic.id}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/40">Pool</span>
              <p><a href={relic.poolUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">{relic.poolName}</a></p>
            </div>
            <div>
              <span className="text-white/40">Level</span>
              <p className="text-white">{relic.level} / {relic.maxLevel}</p>
            </div>
            <div>
              <span className="text-white/40">Value</span>
              <p className="text-white">{`$${formatNumber(relic.amountUsd)}`}</p>
            </div>
            <div>
              <span className="text-white/40">APR</span>
              <p className="text-green-400">{relic.apr.toFixed(2)}%</p>
            </div>
            <div>
              <span className="text-white/40">Boost</span>
              <p className="text-yellow-400">x{relic.multiplier}</p>
            </div>
            <div>
              <span className="text-white/40">Pending</span>
              <p className="text-white">{relic.pendingReward.formatted(4)} {rewardSymbol}</p>
            </div>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col gap-3">
          <div className="flex gap-2">
            <ActionButton onClick={() => {}} disabled={!relic.canClaim} className="flex-1">
              Claim
            </ActionButton>
            <ActionButton onClick={() => {}} disabled={!relic.canLevelUp} className="flex-1">
              Level Up
            </ActionButton>
          </div>
          <div className="flex gap-2">
            <ActionButton onClick={() => {}} variant="secondary" className="flex-1">
              Deposit
            </ActionButton>
            <ActionButton onClick={() => {}} variant="secondary" className="flex-1">
              Withdraw
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateRelicButton({ onClick }: { onClick: () => void }) {
  return (
    <Card>
  <div className="flex justify-center py-4 w-full">
    <div className="w-full max-w-130">
      <button
        onClick={onClick}
        className="w-full py-4 rounded-full font-medium tracking-wide transition-all duration-300 text-lg
          bg-red-500/20 text-white border border-red-500/40
          shadow-[0_0_16px_rgba(239,68,68,0.18)]
          hover:bg-red-500/30 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)] hover:scale-105"
        style={{ fontFamily: 'Transformers, sans-serif' }}
      >
        CREATE RELIC
      </button>
    </div>
  </div>
</Card>

  );
}

function CreateRelicModal({ 
  reliquaryAddress, 
  pools, 
  defaultPoolIndex,
  userAddress,
  userTokenBalances,
  userTokenAllowances,
  onSuccess,
  onClose
}: { 
  reliquaryAddress: `0x${string}`; 
  pools: PoolDisplayData[];
  defaultPoolIndex: number | null;
  userAddress: `0x${string}` | undefined;
  userTokenBalances: Record<string, TokenAmount>;
  userTokenAllowances: Record<string, TokenAmount>;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const activePools = pools.filter(p => p.isActive);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<number | null>(defaultPoolIndex);
  const [depositAmount, setDepositAmount] = useState('');

  const { createRelicAndDeposit, isPending: isCreating, isSuccess: createSuccess } = useCreateRelicAndDeposit();
  const { approve, isPending: isApproving, isSuccess: approveSuccess } = useApprove();

  const selectedPool = activePools.find(p => p.index === selectedPoolIndex);
  const userBalance = selectedPool ? userTokenBalances[selectedPool.tokenAddress] : null;
  const userAllowance = selectedPool ? userTokenAllowances[selectedPool.tokenAddress] : null;

  const depositAmountRaw = useMemo(() => {
    if (!depositAmount || !selectedPool) return BigInt(0);
    try {
      return TokenAmount.fromFormatted(depositAmount, selectedPool.tokenDecimals).raw;
    } catch {
      return BigInt(0);
    }
  }, [depositAmount, selectedPool]);

  const needsApproval = useMemo(() => {
    if (!userAllowance || depositAmountRaw === BigInt(0)) return false;
    return depositAmountRaw > userAllowance.raw;
  }, [userAllowance, depositAmountRaw]);

  const canCreate = selectedPoolIndex !== null && depositAmountRaw > BigInt(0) && userAddress && !needsApproval;

  useEffect(() => {
    if (defaultPoolIndex !== null && selectedPoolIndex === null) {
      setSelectedPoolIndex(defaultPoolIndex);
    }
  }, [defaultPoolIndex, selectedPoolIndex]);

  useEffect(() => {
    if (createSuccess) {
      onSuccess();
    }
    if (approveSuccess) {
      // Just refresh, don't close
    }
  }, [createSuccess, approveSuccess, onSuccess]);

  const handleApprove = () => {
    if (!selectedPool || !userAddress) return;
    approve(
      selectedPool.tokenAddress as `0x${string}`,
      reliquaryAddress,
      BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    );
  };

  const handleCreate = () => {
    if (!selectedPool || !userAddress || depositAmountRaw === BigInt(0)) return;
    createRelicAndDeposit(
      reliquaryAddress,
      userAddress,
      selectedPool.index,
      depositAmountRaw
    );
  };

  const handleMaxClick = () => {
    if (userBalance) {
      setDepositAmount(userBalance.formatted(18));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative bg-linear-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-[0_0_60px_rgba(239,68,68,0.2)]"
        onClick={e => e.stopPropagation()}
      >
        <CornerDecorations size="large" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <CloseIcon />
        </button>

        <h3 className="text-2xl text-white mb-6 text-center" style={{ fontFamily: 'Transformers, sans-serif' }}>
          Create New Relic
        </h3>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Select Pool</label>
            <select
              value={selectedPoolIndex ?? ''}
              onChange={(e) => setSelectedPoolIndex(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-500/50 focus:outline-none"
            >
              <option value="">Choose a pool...</option>
              {activePools.map(pool => (
                <option key={pool.index} value={pool.index}>
                  {pool.displayName} - APR: {pool.averageApr.toFixed(2)}%
                </option>
              ))}
            </select>
          </div>

          {selectedPool && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/60 text-sm">Deposit Amount</label>
                {userBalance && (
                  <span className="text-white/40 text-sm">
                    Balance: {userBalance.formatted(4)} {selectedPool.tokenSymbol}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-black/60 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-red-500/50 focus:outline-none"
                />
                <button
                  onClick={handleMaxClick}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 hover:bg-white/15 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            {needsApproval ? (
              <button 
                onClick={handleApprove} 
                disabled={isApproving}
                className={`w-full px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 text-lg
                  ${isApproving 
                    ? 'bg-gray-600/50 text-white/40 cursor-not-allowed'
                    : 'bg-red-500/20 text-white border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.18)] hover:bg-red-500/30'}`}
                style={{ fontFamily: 'Transformers, sans-serif' }}
              >
                {isApproving ? 'APPROVING...' : `APPROVE ${selectedPool?.tokenSymbol}`}
              </button>
            ) : (
              <button 
                onClick={handleCreate} 
                disabled={!canCreate || isCreating}
                className={`w-full px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 text-lg
                  ${(!canCreate || isCreating)
                    ? 'bg-gray-600/50 text-white/40 cursor-not-allowed'
                    : 'bg-red-500/20 text-white border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.18)] hover:bg-red-500/30'}`}
                style={{ fontFamily: 'Transformers, sans-serif' }}
              >
                {isCreating ? 'CREATING...' : 'CREATE RELIC'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DisclaimerModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-linear-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 max-w-lg mx-4 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
        <CornerDecorations size="large" />
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="text-2xl font-bold tracking-wider text-red-500" style={{ fontFamily: 'Transformers, sans-serif' }}>
            ⚠️ DISCLAIMER ⚠️
          </span>
          <p className="text-white/80 text-lg">
            The Reliquary Prime code is unaudited, use at your own risk.
          </p>
          <ActionButton onClick={onAccept} size="lg">
            Accept
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative bg-linear-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 ${className}`}>
      <CornerDecorations />
      {children}
    </div>
  );
}

function CornerDecorations({ size = 'normal' }: { size?: 'normal' | 'large' }) {
  const dimension = size === 'large' ? 'w-16 h-16' : 'w-12 h-12';
  return (
    <>
      <div className={`absolute top-0 left-0 ${dimension} border-t-2 border-l-2 border-red-500/30 rounded-tl-2xl pointer-events-none`} />
      <div className={`absolute bottom-0 right-0 ${dimension} border-b-2 border-r-2 border-red-500/30 rounded-br-2xl pointer-events-none`} />
    </>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = 'primary', size = 'md', className = '' }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClasses = {
    primary: disabled
      ? 'bg-gray-600/50 text-white/40 cursor-not-allowed'
      : 'bg-red-500/20 text-white border border-red-500/40 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    secondary: disabled
      ? 'bg-gray-600/50 text-white/40 cursor-not-allowed'
      : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-medium transition-all duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 text-white/70 hover:text-white ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ChevronIcon({ direction, size = 'md' }: { direction: 'up' | 'down'; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <svg className={`${sizeClass} text-white/60 transition-transform ${direction === 'up' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 9l10 13 10-13-10-7zm0 2.5L18.5 9 12 19.5 5.5 9 12 4.5z"/>
      <path d="M12 6L7 9.5 12 17l5-7.5L12 6z" fillOpacity="0.3"/>
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
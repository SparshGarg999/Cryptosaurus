import { fetcher } from '@/lib/coingecko.actions';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { TrendingDown, TrendingUp, Zap } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { TrendingCoinsFallback } from './fallback';

const TrendingCoins = async () => {
  let trendingCoins;

  try {
    trendingCoins = await fetcher<{ coins: TrendingCoin[] }>('/search/trending', undefined, 300);
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return <TrendingCoinsFallback />;
  }

  const columns: DataTableColumn<TrendingCoin>[] = [
    {
      header: 'Name',
      cellClassName: 'name-cell',
      cell: (coin) => {
        const item = coin.item;

        return (
          <Link href={`/coins/${item.id}`}>
            <Image src={item.large} alt={item.name} width={36} height={36} />
            <p>{item.name}</p>
          </Link>
        );
      },
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (coin) => {
        const item = coin.item;
        const isTrendingUp = item.data.price_change_percentage_24h.usd > 0;

        return (
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold w-fit",
            isTrendingUp 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          )}>
            {isTrendingUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(item.data.price_change_percentage_24h.usd).toFixed(2)}%
          </div>
        );
      },
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin) => formatCurrency(coin.item.data.price),
    },
  ];

  return (
    <div id="trending-coins" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
      <h4 className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-yellow-400 fill-yellow-400/20" /> 
        Trending Markets
      </h4>

      <DataTable
        data={trendingCoins.coins.slice(0, 6) || []}
        columns={columns}
        rowKey={(coin) => coin.item.id}
        tableClassName="trending-coins-table"
        headerCellClassName="py-3!"
        bodyCellClassName="py-2!"
      />
    </div>
  );
};

export default TrendingCoins;

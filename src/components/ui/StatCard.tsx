import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StatCard({
  label,
  value,
  icon,
  trend,
  tone = 'market'
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  tone?: 'market' | 'citrus' | 'slate' | 'tomato';
}) {
  const toneClasses: Record<string, string> = {
    market: 'text-market-500',
    citrus: 'text-citrus-500',
    slate: 'text-slate2-400',
    tomato: 'text-tomato-500'
  };
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'tag-corner overflow-hidden rounded-xl border border-slate2-100 bg-white p-4 shadow-card dark:border-slate2-700 dark:bg-slate2-800',
        toneClasses[tone]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate2-400">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-ink dark:text-slate2-50">{value}</p>
        </div>
        <div className={cn('rounded-lg bg-current/10 p-2', toneClasses[tone])}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          {trend.positive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-market-500" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-tomato-500" />
          )}
          <span className={trend.positive ? 'text-market-500' : 'text-tomato-500'}>{trend.value}%</span>
          <span className="text-slate2-400">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

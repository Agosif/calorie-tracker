'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

type MealRow = {
  id: number;
  name: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

type Nutrient = { label: string; current: number; goal: number; unit: string };

export interface CalorieTrackerCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  currentCalories: number;
  goalCalories: number;
  nutrients: Nutrient[];
  todaysMeals: MealRow[];
  className?: string;
}

const MEAL_EMOJI: Record<MealRow['mealType'], string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
};

export const CalorieTrackerCard = React.forwardRef<HTMLDivElement, CalorieTrackerCardProps>(
  ({ className, icon, title, subtitle, currentCalories, goalCalories, nutrients, todaysMeals }, ref) => {
    const progressPercentage = Math.min((currentCalories / goalCalories) * 100, 100);

    const animatedCalories = useSpring(0, { damping: 40, stiffness: 300 });
    const displayCalories = useTransform(animatedCalories, (v) => v.toFixed(0));

    React.useEffect(() => {
      animatedCalories.set(currentCalories);
    }, [currentCalories, animatedCalories]);

    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-sm rounded-3xl bg-card p-6 text-card-foreground shadow-lg',
          'flex flex-col gap-6 border',
          className,
        )}
      >
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <motion.p className="text-6xl font-bold tracking-tighter tabular-nums">
              {displayCalories}
            </motion.p>
            <p className="mb-2 text-muted-foreground font-medium tabular-nums">of {goalCalories}</p>
            <p className="mb-2 ml-auto font-medium">Calories</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-primary/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm">Nutrients</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {nutrients.map((n) => {
              const pct = Math.min(100, Math.round((n.current / Math.max(1, n.goal)) * 100));
              return (
                <li key={n.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{n.label}</span>
                    <span className="tabular-nums">
                      {n.current}/{n.goal}
                      {n.unit}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm">Today&apos;s meals</h3>
          {todaysMeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing logged yet today.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todaysMeals.map((m) => (
                <li key={m.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">
                    {MEAL_EMOJI[m.mealType]} {m.name}
                  </span>
                  <span className="font-medium tabular-nums shrink-0">{m.calories} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href="/log"
            className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 rounded-full py-3')}
          >
            + Manual
          </Link>
          <Link
            href="/scan"
            className={cn(buttonVariants({ variant: 'default' }), 'flex-[2] rounded-full py-3 text-base font-semibold')}
          >
            📷 Scan a meal
          </Link>
        </div>
      </div>
    );
  },
);

CalorieTrackerCard.displayName = 'CalorieTrackerCard';

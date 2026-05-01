"use client";

import { useState } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/types";

interface ContentCalendarProps {
  articles: Article[];
}

export function ContentCalendar({ articles }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getArticlesForDay(day: Date) {
    return articles.filter((article) => {
      return isSameDay(new Date(article.created_at), day);
    });
  }

  const statusColor: Record<string, string> = {
    published: "bg-emerald-400",
    draft: "bg-amber-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border border-border rounded-[var(--radius-lg)] overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] uppercase tracking-wider font-medium text-text-quaternary py-2 bg-surface/50 border-b border-border"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dayArticles = getArticlesForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-1.5 border-b border-r border-border last:border-r-0 transition-colors ${
                !inMonth ? "opacity-40 bg-bg-primary" : "bg-bg-secondary"
              } ${today ? "ring-1 ring-inset ring-accent-warm/40" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-medium mb-0.5 ${
                  today
                    ? "bg-accent-warm text-bg-primary"
                    : "text-text-tertiary"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {dayArticles.slice(0, 3).map((article) => {
                  const title = article.en?.title || article.zh?.title || "Untitled";
                  return (
                    <Link
                      key={article.id}
                      href={`/admin/posts/${article.id}/edit`}
                      className="block group"
                    >
                      <div className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate hover:bg-surface transition-colors">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColor[article.status] ?? "bg-text-quaternary"}`} />
                        <span className="truncate text-text-secondary group-hover:text-text-primary">{title}</span>
                      </div>
                    </Link>
                  );
                })}
                {dayArticles.length > 3 && (
                  <span className="text-[9px] text-text-quaternary px-1">
                    +{dayArticles.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-[11px] text-text-quaternary">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Published</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Draft</span>
      </div>
    </div>
  );
}

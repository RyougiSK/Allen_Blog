import Image from "next/image";
import { SITE, PILLARS } from "@/lib/constants";

export default function AdminCompass() {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-16">
      {/* ─── Section 1: Hero ─── */}
      <section className="text-center py-20">
        <div className="mb-8">
          <Image
            src={SITE.logo}
            alt={SITE.name}
            width={48}
            height={48}
            className="mx-auto rounded-full opacity-80"
          />
        </div>
        <h1 className="font-display text-[length:var(--text-display-lg)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-text-primary">
          {SITE.name}
        </h1>
        <p className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-display-md)] leading-[var(--leading-display)] text-text-secondary mt-2">
          {SITE.nameZh}
        </p>
        <p className="text-[length:var(--text-body)] text-text-tertiary mt-6 max-w-xl mx-auto leading-[var(--leading-body)]">
          Rebuilding Inner Order in a Complex World
        </p>
        <div className="mt-8 space-y-2 text-[length:var(--text-body-sm)] text-text-quaternary max-w-lg mx-auto">
          <p className="font-[family-name:var(--font-sans-zh)]">
            在复杂世界中，重新建立一种清醒、完整而有秩序的存在方式。
          </p>
          <p>A long-term project about rebuilding inner coherence in modern life.</p>
        </div>
      </section>

      {/* ─── Section 2: Eternal Theme ─── */}
      <section className="mt-[var(--spacing-section)]">
        <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-10 text-center">
          <p className="text-[length:var(--text-caption)] tracking-[var(--tracking-widest)] uppercase text-text-quaternary mb-6">
            永恒主题 · Eternal Theme
          </p>
          <h2 className="font-display text-[length:var(--text-display-sm)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-text-primary">
            现代人在复杂世界中的精神秩序
          </h2>
          <p className="text-[length:var(--text-body-lg)] text-text-secondary mt-3">
            Inner Order in a Complex World
          </p>
          <div className="my-8 flex justify-center">
            <span className="block h-1 w-1 rounded-full bg-accent-warm/60" />
          </div>
          <p className="font-[family-name:var(--font-sans-zh)] text-[length:var(--text-body-sm)] text-text-quaternary leading-[var(--leading-body)] max-w-md mx-auto">
            不探讨任何特定学科或方法论——只探讨人如何在现代世界中活出内在的秩序与完整。
          </p>
          <p className="text-[length:var(--text-body-sm)] text-text-quaternary mt-2 italic max-w-md mx-auto">
            Do not create merely to publish. Create to understand.
          </p>
        </div>
      </section>

      {/* ─── Section 3: Three Pillars ─── */}
      <section className="mt-[var(--spacing-section)]">
        <p className="text-[length:var(--text-caption)] tracking-[var(--tracking-widest)] uppercase text-text-quaternary mb-8 text-center">
          三大支柱 · Three Pillars
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Self */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8 border-l-2 border-l-accent-self">
            <h3 className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body-lg)] text-text-primary mb-1">
              {PILLARS.self.zh}
            </h3>
            <p className="text-[length:var(--text-body-sm)] text-text-secondary mb-4">
              {PILLARS.self.en}
            </p>
            <p className="text-[length:var(--text-body-sm)] italic text-accent-self-light mb-4">
              {PILLARS.self.question.zh} / {PILLARS.self.question.en}
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary mb-3">
              意识、身份、情绪、内在叙事、自我认知
            </p>
            <p className="text-[length:var(--text-micro)] text-text-quaternary font-medium uppercase tracking-[var(--tracking-wide)]">
              心脏 · Heart
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-4 pt-4 border-t border-border/40">
              The foundation. Without knowing the self, all else is performance.
            </p>
          </div>

          {/* Nature */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8 border-l-2 border-l-accent-nature-light">
            <h3 className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body-lg)] text-text-primary mb-1">
              {PILLARS.nature.zh}
            </h3>
            <p className="text-[length:var(--text-body-sm)] text-text-secondary mb-4">
              {PILLARS.nature.en}
            </p>
            <p className="text-[length:var(--text-body-sm)] italic text-accent-nature-light mb-4">
              {PILLARS.nature.question.zh} / {PILLARS.nature.question.en}
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary mb-3">
              自然法则、社会结构、关系、归属、边界
            </p>
            <p className="text-[length:var(--text-micro)] text-text-quaternary font-medium uppercase tracking-[var(--tracking-wide)]">
              骨骼 · Skeleton
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-4 pt-4 border-t border-border/40">
              The structure. Understanding where you stand in the larger order.
            </p>
          </div>

          {/* Living */}
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8 border-l-2 border-l-accent-living">
            <h3 className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body-lg)] text-text-primary mb-1">
              {PILLARS.living.zh}
            </h3>
            <p className="text-[length:var(--text-body-sm)] text-text-secondary mb-4">
              {PILLARS.living.en}
            </p>
            <p className="text-[length:var(--text-body-sm)] italic text-accent-living mb-4">
              {PILLARS.living.question.zh} / {PILLARS.living.question.en}
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary mb-3">
              日常实践、习惯、仪式、节奏、具身体验
            </p>
            <p className="text-[length:var(--text-micro)] text-text-quaternary font-medium uppercase tracking-[var(--tracking-wide)]">
              血肉 · Flesh
            </p>
            <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-4 pt-4 border-t border-border/40">
              The practice. Where understanding becomes lived experience.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Section 4: Relationship Diagram ─── */}
      <section className="mt-[var(--spacing-section)]">
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full border-2 border-accent-self/60 flex items-center justify-center">
                <span className="text-[length:var(--text-micro)] text-accent-self-light">自</span>
              </div>
              <span className="text-[length:var(--text-micro)] text-text-quaternary mt-2">Self</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full border-2 border-accent-nature-light/60 flex items-center justify-center">
                <span className="text-[length:var(--text-micro)] text-accent-nature-light">世</span>
              </div>
              <span className="text-[length:var(--text-micro)] text-text-quaternary mt-2">World</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full border-2 border-accent-living/60 flex items-center justify-center">
                <span className="text-[length:var(--text-micro)] text-accent-living">活</span>
              </div>
              <span className="text-[length:var(--text-micro)] text-text-quaternary mt-2">Living</span>
            </div>
          </div>
          {/* Connecting lines */}
          <div className="relative h-12 w-px border-l border-dashed border-border-emphasis/60 my-2" />
          <div className="h-16 w-16 rounded-full border border-accent-warm/40 bg-bg-tertiary flex items-center justify-center">
            <span className="font-display text-[length:var(--text-body-sm)] text-accent-warm">序</span>
          </div>
          <p className="text-[length:var(--text-caption)] text-text-quaternary mt-3 tracking-[var(--tracking-wide)]">
            Inner Order · 内在秩序
          </p>
        </div>
      </section>

      {/* ─── Section 5: Monthly Theme ─── */}
      <section className="mt-[var(--spacing-section)]">
        <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-10">
          <p className="text-[length:var(--text-caption)] tracking-[var(--tracking-widest)] uppercase text-text-quaternary mb-6 text-center">
            本月核心问题 · Monthly Question
          </p>
          <p className="font-display text-[length:var(--text-display-sm)] leading-[var(--leading-display)] text-text-primary text-center italic">
            &ldquo;What does it mean to live with intention?&rdquo;
          </p>
          <p className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body-lg)] text-text-secondary text-center mt-2">
            「何为有意识地生活？」
          </p>
          <div className="my-8 border-t border-border/40" />
          <p className="text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] text-text-quaternary mb-4">
            Example questions to carry:
          </p>
          <ul className="space-y-3 text-[length:var(--text-body-sm)] text-text-tertiary">
            <li className="flex items-start gap-3">
              <span className="block h-1 w-1 rounded-full bg-accent-warm/50 mt-2 shrink-0" />
              What am I avoiding by staying busy?
            </li>
            <li className="flex items-start gap-3">
              <span className="block h-1 w-1 rounded-full bg-accent-warm/50 mt-2 shrink-0" />
              Where do I feel most ordered inside?
            </li>
            <li className="flex items-start gap-3">
              <span className="block h-1 w-1 rounded-full bg-accent-warm/50 mt-2 shrink-0" />
              What would I write if no one would read it?
            </li>
            <li className="flex items-start gap-3">
              <span className="block h-1 w-1 rounded-full bg-accent-warm/50 mt-2 shrink-0" />
              Am I creating from clarity or from noise?
            </li>
          </ul>
          <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-8 text-center">
            Carry one question. Let it work on you quietly.
          </p>
        </div>
      </section>

      {/* ─── Section 6: Publishing Rhythm ─── */}
      <section className="mt-[var(--spacing-section)]">
        <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-10">
          <p className="text-[length:var(--text-caption)] tracking-[var(--tracking-widest)] uppercase text-text-quaternary mb-6 text-center">
            创作节奏 · Creative Rhythm
          </p>
          <p className="font-display text-[length:var(--text-display-sm)] leading-[var(--leading-display)] text-text-primary text-center">
            Every Two Weeks
          </p>
          <div className="my-8 flex justify-center">
            <span className="block h-1 w-1 rounded-full bg-accent-warm/60" />
          </div>
          <div className="flex flex-col items-center gap-4 text-[length:var(--text-body)] text-text-secondary">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent-living/60" />
              <span>1 小红书 post</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent-self/60" />
              <span>1 Blog essay</span>
            </div>
          </div>
          <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-8 text-center max-w-sm mx-auto">
            Slow consistency over frantic output. Two weeks is the rhythm — not a deadline, but a breath.
          </p>
        </div>
      </section>

      {/* ─── Section 7: Writing Direction ─── */}
      <section className="mt-[var(--spacing-section)]">
        <p className="text-[length:var(--text-caption)] tracking-[var(--tracking-widest)] uppercase text-text-quaternary mb-8 text-center">
          写作方向 · Writing Direction
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8">
            <h3 className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body-lg)] text-text-primary mb-4">
              中文写作
            </h3>
            <p className="text-[length:var(--text-body-sm)] text-text-tertiary leading-[var(--leading-body)] mb-4">
              温和、内省、有呼吸感。像和一个安静的朋友说话。
            </p>
            <div className="flex flex-wrap gap-2">
              {["温和", "清醒", "有节奏", "不说教", "有留白"].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-border/60 px-3 py-1 text-[length:var(--text-caption)] text-text-quaternary"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-6 pt-4 border-t border-border/40">
              写给三年后的自己也能读懂的文字。
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border/60 bg-bg-tertiary p-8">
            <h3 className="font-display text-[length:var(--text-body-lg)] text-text-primary mb-4">
              English Writing
            </h3>
            <p className="text-[length:var(--text-body-sm)] text-text-tertiary leading-[var(--leading-body)] mb-4">
              Clear, contemplative, unhurried. Like thinking aloud in a quiet room.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Gentle", "Precise", "Spacious", "Non-prescriptive", "Honest"].map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-border/60 px-3 py-1 text-[length:var(--text-caption)] text-text-quaternary"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-[length:var(--text-caption)] text-text-quaternary italic mt-6 pt-4 border-t border-border/40">
              Write what you would still mean in three years.
            </p>
          </div>
        </div>
        <p className="text-[length:var(--text-caption)] text-text-quaternary text-center mt-6 italic">
          Two voices, one mind. Not translation — parallel expression.
        </p>
      </section>

      {/* ─── Section 8: Quiet Reminder ─── */}
      <section className="mt-[var(--spacing-section)] py-24 text-center">
        <p className="font-[family-name:var(--font-sans-zh)] text-[length:var(--text-body)] text-text-tertiary leading-[var(--leading-body)] max-w-md mx-auto">
          你不是内容创作者。你是一个在寻找内在秩序的人，恰好在写作。
        </p>
        <p className="text-[length:var(--text-body-sm)] text-text-quaternary mt-4 max-w-md mx-auto leading-[var(--leading-body)]">
          You are not a content creator. You are someone seeking inner order, who happens to write.
        </p>
        <div className="mt-12">
          <p className="font-display text-[length:var(--text-body-lg)] text-text-quaternary">
            {SITE.name}
          </p>
          <p className="font-[family-name:var(--font-display-zh)] text-[length:var(--text-body)] text-text-quaternary mt-1">
            {SITE.nameZh}
          </p>
        </div>
      </section>
    </div>
  );
}

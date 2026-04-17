"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n/locale-context";
import { submitContactInquiry } from "@/lib/actions/contact";
import { Mail } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("collaboration");
  const [message, setMessage] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { t, locale } = useLocale();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("loading");
    const dbLocale = locale === "zh-cn" ? "zh" : "en";

    try {
      const result = await submitContactInquiry(
        name,
        email,
        inquiryType,
        message,
        referralSource,
        dbLocale as "en" | "zh",
      );
      setStatus(result.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-bg-secondary p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-accent-warm mb-4" />
        <p className="text-[length:var(--text-body-lg)] text-accent-warm font-display">
          {t("contact.success")}
        </p>
        <p className="text-[length:var(--text-caption)] text-text-tertiary mt-2">
          {t("contact.responseTime")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-[length:var(--text-caption)] text-text-tertiary mb-2">
          {t("contact.name")}
        </label>
        <Input
          type="text"
          placeholder={t("contact.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-[length:var(--text-caption)] text-text-tertiary mb-2">
          {t("contact.email")}
        </label>
        <Input
          type="email"
          placeholder={t("contact.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-[length:var(--text-caption)] text-text-tertiary mb-2">
          {t("contact.inquiryType")}
        </label>
        <Select
          value={inquiryType}
          onChange={(e) => setInquiryType(e.target.value)}
        >
          <option value="interview">{t("contact.inquiryInterview")}</option>
          <option value="collaboration">{t("contact.inquiryCollaboration")}</option>
          <option value="speaking">{t("contact.inquirySpeaking")}</option>
          <option value="other">{t("contact.inquiryOther")}</option>
        </Select>
      </div>

      <div>
        <label className="block text-[length:var(--text-caption)] text-text-tertiary mb-2">
          {t("contact.message")}
        </label>
        <Textarea
          placeholder={t("contact.messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          required
          className="font-sans"
        />
      </div>

      <div>
        <label className="block text-[length:var(--text-caption)] text-text-tertiary mb-2">
          {t("contact.referralSource")}
        </label>
        <Input
          type="text"
          placeholder={t("contact.referralPlaceholder")}
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
        />
      </div>

      {status === "error" && (
        <p className="text-[length:var(--text-caption)] text-[var(--color-danger)]">
          {t("contact.error")}
        </p>
      )}

      <Button type="submit" loading={status === "loading"} className="self-start">
        {t("contact.submit")}
      </Button>
    </form>
  );
}

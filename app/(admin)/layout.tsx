import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminNavbar } from "@/components/features/admin-navbar";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { ToastProvider } from "@/components/ui/toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <LocaleProvider locale={locale} dictionary={dictionary}>
      <ToastProvider>
        <div className="flex flex-col flex-1">
          <AdminNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </ToastProvider>
    </LocaleProvider>
  );
}

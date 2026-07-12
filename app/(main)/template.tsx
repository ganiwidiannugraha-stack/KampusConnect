import { PageTransition } from "@/components/PageTransition";

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

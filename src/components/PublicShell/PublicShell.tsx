import { ReactNode } from "react";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

export function PublicShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <>
      <PublicHeader />
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen mx-5">
        {children}
      </div>
      {showFooter && <PublicFooter />}
    </>
  );
}

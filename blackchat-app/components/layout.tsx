import React from 'react';
import { Toaster } from "@/components/ui/toaster";

type LayoutProps = {
  children: React.ReactNode;
  currentPageName: string;
};

const Layout = ({ children, currentPageName }: LayoutProps) => {
  // For this specific app, we don't need a persistent sidebar or header
  // The pages themselves will handle their layout
  return (
    <>
      <main>{children}</main>
      <Toaster />
    </>
  );
};

export default Layout;


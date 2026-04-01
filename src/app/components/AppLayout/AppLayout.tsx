import type { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="pl-0 md:pl-72">{children}</div>;
};

import type { FC } from 'react';

import type { ClassStyleProps } from '../../../../types/ClassStyleProps';

export const SpinnerIcon: FC<ClassStyleProps> = ({ className, style }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <circle
        id="circle-opaque"
        cx="12"
        cy="12"
        r="11"
        stroke="currentColor"
        strokeWidth="2"
        style={{ opacity: 0.1 }}
      />
      <mask
        id="mask0_4099_28642"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
      </mask>
      <g mask="url(#mask0_4099_28642)">
        <rect x="12" y="-16.5" width="27" height="27" fill="currentColor" />
      </g>
    </svg>
  );
};

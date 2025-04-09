import React from 'react';
import { z } from 'zod';

export const SpacerPropsSchema = z.object({
  props: z
    .object({
      height: z.number().gte(0).optional().nullish(),
    })
    .optional()
    .nullable(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;

export const SpacerPropsDefaults = {
  height: 16,
};

export function Spacer({ props }: SpacerProps) {
  const height = props?.height ?? SpacerPropsDefaults.height;

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      <tbody>
        <tr>
          <td colSpan={3} style={{ height }}></td>
        </tr>
      </tbody>
    </table>
  );
}

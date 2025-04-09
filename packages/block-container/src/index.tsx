import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      borderRadius: z.number().optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type ContainerProps = {
  style?: z.infer<typeof ContainerPropsSchema>['style'];
  children?: JSX.Element | JSX.Element[] | null;
};

function getBorder(style: ContainerProps['style']) {
  if (!style || !style.borderColor) {
    return undefined;
  }
  return `1px solid ${style.borderColor}`;
}

export function Container({ style, children }: ContainerProps) {
  const padding = style?.padding ? getPadding(style.padding)!.split(' ') : [];

  const tableStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    border: getBorder(style),
    borderRadius: style?.borderRadius ?? undefined,
  };

  return (
    <table
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      <tbody>
        {padding[0] && (
          <tr>
            <td colSpan={3} style={{ height: padding[0] }}></td>
          </tr>
        )}
        <tr>
          {padding[3] && <td style={{ width: padding[3] }}></td>}
          <td>
            <div style={tableStyle}>{children}</div>
          </td>
          {padding[1] && <td style={{ width: padding[1] }}></td>}
        </tr>
        {padding[2] && (
          <tr>
            <td colSpan={3} style={{ height: padding[2] }}></td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

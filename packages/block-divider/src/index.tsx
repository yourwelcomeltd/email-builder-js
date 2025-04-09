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

export const DividerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      lineColor: COLOR_SCHEMA,
      lineHeight: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type DividerProps = z.infer<typeof DividerPropsSchema>;

export const DividerPropsDefaults = {
  lineHeight: 1,
  lineColor: '#333333',
};

export function Divider({ style, props }: DividerProps) {
  const padding = style?.padding ? getPadding(style.padding)!.split(' ') : [];

  const st: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
  };

  const borderTopWidth = props?.lineHeight ?? DividerPropsDefaults.lineHeight;
  const borderTopColor = props?.lineColor ?? DividerPropsDefaults.lineColor;

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
            <div style={st}>
              <hr
                style={{
                  width: '100%',
                  border: 'none',
                  borderTop: `${borderTopWidth}px solid ${borderTopColor}`,
                  margin: 0,
                }}
              />
            </div>
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

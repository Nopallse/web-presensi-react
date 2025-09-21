import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: '#0ea5e9',
    colorPrimaryHover: '#0284c7',
    colorPrimaryActive: '#0369a1',
    colorPrimaryBg: '#f0f9ff',
    colorPrimaryBgHover: '#e0f2fe',
    colorPrimaryBorder: '#bae6fd',
    colorPrimaryBorderHover: '#7dd3fc',
    colorPrimaryText: '#0369a1',
    colorPrimaryTextHover: '#075985',
    colorPrimaryTextActive: '#0c4a6e',

    // Success colors
    colorSuccess: '#22c55e',
    colorSuccessHover: '#16a34a',
    colorSuccessActive: '#15803d',
    colorSuccessBg: '#f0fdf4',
    colorSuccessBgHover: '#dcfce7',
    colorSuccessBorder: '#bbf7d0',
    colorSuccessBorderHover: '#86efac',

    // Warning colors
    colorWarning: '#f59e0b',
    colorWarningHover: '#d97706',
    colorWarningActive: '#b45309',
    colorWarningBg: '#fffbeb',
    colorWarningBgHover: '#fef3c7',
    colorWarningBorder: '#fde68a',
    colorWarningBorderHover: '#fcd34d',

    // Error colors
    colorError: '#ef4444',
    colorErrorHover: '#dc2626',
    colorErrorActive: '#b91c1c',
    colorErrorBg: '#fef2f2',
    colorErrorBgHover: '#fee2e2',
    colorErrorBorder: '#fecaca',
    colorErrorBorderHover: '#fca5a5',

    // Info colors
    colorInfo: '#0ea5e9',
    colorInfoHover: '#0284c7',
    colorInfoActive: '#0369a1',
    colorInfoBg: '#f0f9ff',
    colorInfoBgHover: '#e0f2fe',
    colorInfoBorder: '#bae6fd',
    colorInfoBorderHover: '#7dd3fc',

    // Neutral colors
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorTextQuaternary: '#94a3b8',
    colorFill: '#f1f5f9',
    colorFillSecondary: '#e2e8f0',
    colorFillTertiary: '#cbd5e1',
    colorFillQuaternary: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgSpotlight: '#ffffff',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // Font settings
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',

    // Line height
    lineHeight: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    lineHeightHeading1: 1.21,
    lineHeightHeading2: 1.27,
    lineHeightHeading3: 1.33,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Control height
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
    controlHeightXS: 16,

    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',

    // Size
    sizeStep: 4,
    sizeUnit: 4,
    size: 16,
    sizeLG: 24,
    sizeSM: 12,
    sizeXS: 8,
    sizeXXS: 4,

    // Layout
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Box shadow
    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // Z-index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },
  components: {
    Button: {
      colorPrimary: '#0ea5e9',
      algorithm: true,
    },
    Input: {
      colorPrimary: '#0ea5e9',
      algorithm: true,
    },
    Table: {
      colorPrimary: '#0ea5e9',
      algorithm: true,
    },
    Menu: {
      colorPrimary: '#0ea5e9',
      algorithm: true,
    },
    Layout: {
      colorBgHeader: '#ffffff',
      bodyBg: '#f8fafc',
      triggerBg: '#ffffff',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
      colorTextLightSolid: '#ffffff',
    },
  },
};
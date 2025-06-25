import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: themes.light,
  panelPosition: 'bottom',
  selectedPanel: 'controls',
  showNav: true,
  showPanel: true,
  showToolbar: true,
  isFullscreen: false,
  sidebar: {
    showRoots: true,
    collapsedRoots: ['other'],
  },
});
import React from 'react';
import { LogoIcon } from './icons';

export const ToolHeader: React.FC = () => (
  <div className="h">
    <div className="lg" style={{ marginLeft: '52px' }}>
      <i><LogoIcon /></i>
      <span>FFmpeg-<b>Gui</b></span>
    </div>
  </div>
);

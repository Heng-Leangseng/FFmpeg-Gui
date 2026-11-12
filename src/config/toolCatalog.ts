export type ToolStatus = 'available' | 'planned' | 'experimental';

export interface ToolOperation {
  id: string;
  name: string;
  status: ToolStatus;
}

export interface ToolSubcategory {
  id: string;
  name: string;
  operations: ToolOperation[];
}

export interface ToolCategory {
  id: string;
  name: string;
  subcategories: ToolSubcategory[];
}

export const toolCatalog: ToolCategory[] = [
  {
    id: 'video',
    name: 'Video',
    subcategories: [
      {
        id: 'video-compression',
        name: 'Compression',
        operations: [
          { id: 'compress-video', name: 'Compress Video', status: 'available' },
        ],
      },
      {
        id: 'video-editing',
        name: 'Editing',
        operations: [
          { id: 'trim-cut', name: 'Trim / Cut', status: 'planned' },
          { id: 'merge-videos', name: 'Merge Videos', status: 'planned' },
          { id: 'split-video', name: 'Split Video', status: 'planned' },
          { id: 'change-speed', name: 'Change Speed', status: 'available' },
          { id: 'change-frame-rate', name: 'Change Frame Rate', status: 'planned' },
        ],
      },
      {
        id: 'video-cropping',
        name: 'Cropping & Framing',
        operations: [
          { id: 'crop-video', name: 'Crop', status: 'planned' },
          { id: 'resize-video', name: 'Resize', status: 'planned' },
          { id: 'rotate-video', name: 'Rotate', status: 'planned' },
          { id: 'flip-video', name: 'Flip', status: 'planned' },
        ],
      },
      {
        id: 'video-format',
        name: 'Format & Conversion',
        operations: [
          { id: 'convert-video', name: 'Convert Video', status: 'planned' },
          { id: 'remux-container-video', name: 'Remux Container', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    subcategories: [
      {
        id: 'audio-extraction',
        name: 'Extraction',
        operations: [
          { id: 'extract-audio', name: 'Extract Audio', status: 'planned' },
        ],
      },
      {
        id: 'audio-editing',
        name: 'Editing',
        operations: [
          { id: 'trim-audio', name: 'Trim Audio', status: 'planned' },
          { id: 'merge-audio', name: 'Merge Audio', status: 'planned' },
          { id: 'adjust-volume', name: 'Adjust Volume', status: 'planned' },
          { id: 'mute-audio', name: 'Mute Audio', status: 'planned' },
          { id: 'fade-in-out', name: 'Fade In / Out', status: 'planned' },
        ],
      },
      {
        id: 'audio-format',
        name: 'Format & Conversion',
        operations: [
          { id: 'convert-audio', name: 'Convert Audio', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'subtitles',
    name: 'Subtitles',
    subcategories: [
      {
        id: 'subs-extraction',
        name: 'Extraction',
        operations: [
          { id: 'extract-subtitles', name: 'Extract Subtitles', status: 'planned' },
        ],
      },
      {
        id: 'subs-editing',
        name: 'Editing',
        operations: [
          { id: 'add-subtitles', name: 'Add Subtitles', status: 'planned' },
          { id: 'burn-subtitles', name: 'Burn Subtitles', status: 'planned' },
          { id: 'synchronize-subtitles', name: 'Synchronize Subtitles', status: 'planned' },
        ],
      },
      {
        id: 'subs-format',
        name: 'Format & Conversion',
        operations: [
          { id: 'convert-subtitle-format', name: 'Convert Subtitle Format', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'images-animation',
    name: 'Images & Animation',
    subcategories: [
      {
        id: 'frame-operations',
        name: 'Frame Operations',
        operations: [
          { id: 'extract-frames', name: 'Extract Frames', status: 'planned' },
          { id: 'create-image-sequence', name: 'Create Image Sequence', status: 'planned' },
        ],
      },
      {
        id: 'img-conversion',
        name: 'Conversion',
        operations: [
          { id: 'video-to-gif', name: 'Video to GIF', status: 'planned' },
          { id: 'image-sequence-to-video', name: 'Image Sequence to Video', status: 'planned' },
          { id: 'convert-images', name: 'Convert Images', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'media-streams',
    name: 'Media & Streams',
    subcategories: [
      {
        id: 'stream-management',
        name: 'Stream Management',
        operations: [
          { id: 'add-remove-tracks', name: 'Add / Remove Tracks', status: 'planned' },
          { id: 'remux-media', name: 'Remux Media', status: 'planned' },
          { id: 'extract-attachments', name: 'Extract Attachments', status: 'planned' },
        ],
      },
      {
        id: 'metadata',
        name: 'Metadata',
        operations: [
          { id: 'edit-metadata', name: 'Edit Metadata', status: 'planned' },
          { id: 'edit-chapters', name: 'Edit Chapters', status: 'planned' },
          { id: 'inspect-media', name: 'Inspect Media', status: 'planned' },
        ],
      },
    ],
  },
  {
    id: 'misc',
    name: 'Misc',
    subcategories: [
      {
        id: 'misc-operations',
        name: 'Misc',
        operations: [
          { id: 'export-ass-subtitles', name: 'Export ASS Subtitles', status: 'planned' },
          { id: 'specialized-operations', name: 'Specialized Operations', status: 'planned' },
          { id: 'uncommon-format-operations', name: 'Uncommon Format Operations', status: 'planned' },
        ],
      },
    ],
  },
];

export const getAllOperations = () => {
  const results: Array<ToolOperation & { category: string; categoryId: string; subcategory: string; subcategoryId: string }> = [];
  for (const cat of toolCatalog) {
    for (const sub of cat.subcategories) {
      for (const op of sub.operations) {
        results.push({
          ...op,
          category: cat.name,
          categoryId: cat.id,
          subcategory: sub.name,
          subcategoryId: sub.id,
        });
      }
    }
  }
  return results;
};

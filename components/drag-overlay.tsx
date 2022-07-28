import React from 'react';
import { MuxUploaderDrop } from '@mux/mux-uploader-react';

type Props = {
  dragActive?: boolean | undefined,
};

const DragOverlay: React.FC<Props> = ({ children, dragActive }) => {
  if (!dragActive) {
    return <>{children}</>;
  }

  return (
    <>
      {/* TO-DO: Allow adjusting text styles with overlay. CSS vars? Bake into package CSS styles? (TD). */}
      <MuxUploaderDrop overlay overlayText="Upload to stream.new" mux-uploader="uploader">
        {children}
      </MuxUploaderDrop>
    </>
  );
};

export default DragOverlay;

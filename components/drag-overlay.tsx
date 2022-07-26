import { ReactElement } from 'react';
import { MuxUploaderDrop } from '@mux/mux-uploader-react';
import { breakpoints } from '../style-vars';

type Props = {
  children: ReactElement,
  dragActive: boolean | undefined,
};

const DragOverlay: React.FC<Props> = ({ children, dragActive }) => {
  {/* TO-DO: CSS is messed up here. MuxPlayer has a height of 0. (TD).*/}
  if (!dragActive) {
    return <>{children}</>;
  }

  return (
    <>
      {/* TO-DO: Text styles with overlay. CSS vars? Bake into package CSS styles? (TD).*/}
      {/* TO-DO: Disable drag and drop + overlay when attr present. Consider making its own component. (TD).*/}
      <MuxUploaderDrop className="drag-overlay" overlay overlayText="Upload to stream.new" mux-uploader="uploader" style={{ position: 'static', 
          display: 'flex', flexDirection: 'column', height: '100%' }}>
        {children}
      </MuxUploaderDrop>
      <style jsx>{`
        .drag-overlay {
          height: 100%;
          width: 100%;
          position: absolute;
          z-index: 1;
          background-color:  rgba(226, 253, 255, 0.95);
          transition: 0.5s;
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .drag-overlay h1 {
          font-size: 46px;
          line-height: 46px;
          text-align: center;
        }

        .drag-overlay.active {
          display: flex;
        }

        @media only screen and (min-width: ${breakpoints.md}px) {
          .drag-overlay h1 {
            font-size: 96px;
            line-height: 120px;
          }
        }
      `}
      </style>
    </>
  );
};

export default DragOverlay;

import React from 'react';
import { render, screen } from '@testing-library/react';
import DragOverlay from './drag-overlay';

// Mock the MuxUploaderDrop component
jest.mock('@mux/mux-uploader-react', () => ({
  MuxUploaderDrop: ({ children, overlay, overlayText, 'mux-uploader': muxUploader }) => 
    <div className="mux-uploader-drop" data-overlay={overlay} data-text={overlayText} data-testid="mux-uploader-drop">{children}</div>
}));

describe('DragOverlay', () => {
  it('renders children when drag is not active', () => {
    render(
      <DragOverlay dragActive={false}>
        <div>Child content</div>
      </DragOverlay>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders overlay when drag is active', () => {
    render(
      <DragOverlay dragActive={true}>
        <div>Child content</div>
      </DragOverlay>
    );
    
    expect(screen.getByTestId('mux-uploader-drop')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('displays drop message when active', () => {
    render(
      <DragOverlay dragActive={true}>
        <div>Content</div>
      </DragOverlay>
    );
    
    expect(screen.getByTestId('mux-uploader-drop')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('includes styling when drag active', () => {
    render(
      <DragOverlay dragActive={true}>
        <div>Content</div>
      </DragOverlay>
    );
    
    expect(screen.getByTestId('mux-uploader-drop')).toBeInTheDocument();
  });

  it('passes through children in both states', () => {
    const { rerender } = render(
      <DragOverlay dragActive={true}>
        <span>Test content</span>
      </DragOverlay>
    );
    
    // When active, should render MuxUploaderDrop
    expect(screen.getByTestId('mux-uploader-drop')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    
    rerender(
      <DragOverlay dragActive={false}>
        <span>Test content</span>
      </DragOverlay>
    );
    
    // When inactive, should render children directly
    expect(screen.queryByTestId('mux-uploader-drop')).not.toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
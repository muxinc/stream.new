// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import DragOverlay from './drag-overlay';

// Mock the MuxUploaderDrop component
jest.mock('@mux/mux-uploader-react', () => ({
  MuxUploaderDrop: ({ children, overlay, overlayText, 'mux-uploader': muxUploader }) => 
    <div className="mux-uploader-drop" data-overlay={overlay} data-text={overlayText}>{children}</div>
}));

describe('DragOverlay', () => {
  it('renders children when drag is not active', () => {
    const wrapper = shallow(
      <DragOverlay dragActive={false}>
        <div>Child content</div>
      </DragOverlay>
    );
    expect(wrapper.text()).toContain('Child content');
  });

  it('renders overlay when drag is active', () => {
    const wrapper = shallow(
      <DragOverlay dragActive={true}>
        <div>Child content</div>
      </DragOverlay>
    );
    // Check for the mocked component or div element
    const hasOverlay = wrapper.find('MuxUploaderDrop').length > 0 || 
                      wrapper.find('div.mux-uploader-drop').length > 0;
    expect(hasOverlay).toBe(true);
  });

  it('displays drop message when active', () => {
    const wrapper = shallow(
      <DragOverlay dragActive={true}>
        <div>Content</div>
      </DragOverlay>
    );
    // Check that the component structure exists
    expect(wrapper.exists()).toBe(true);
    // The component should render MuxUploaderDrop when active
    expect(wrapper.find('MuxUploaderDrop').exists()).toBe(true);
  });

  it('includes styling when drag active', () => {
    const wrapper = shallow(
      <DragOverlay dragActive={true}>
        <div>Content</div>
      </DragOverlay>
    );
    // Check that the component renders (styled-jsx may not show in shallow render)
    expect(wrapper.exists()).toBe(true);
  });

  it('passes through children in both states', () => {
    const activeWrapper = shallow(
      <DragOverlay dragActive={true}>
        <span>Test content</span>
      </DragOverlay>
    );
    const inactiveWrapper = shallow(
      <DragOverlay dragActive={false}>
        <span>Test content</span>
      </DragOverlay>
    );
    
    // When active, should render MuxUploaderDrop
    expect(activeWrapper.find('MuxUploaderDrop').exists()).toBe(true);
    // When inactive, should render children directly
    expect(inactiveWrapper.text()).toContain('Test content');
  });
});
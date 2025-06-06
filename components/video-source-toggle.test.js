import React from 'react';
import { shallow } from 'enzyme';
import VideoSourceToggle from './video-source-toggle';

describe('VideoSourceToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders toggle options', () => {
    const wrapper = shallow(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    expect(wrapper.find('button').length).toBe(2);
  });

  it('handles source selection', () => {
    const wrapper = shallow(
      <VideoSourceToggle activeSource="camera" onChange={mockOnChange} />
    );
    
    const cameraButton = wrapper.find('button').first();
    cameraButton.simulate('click');
    expect(mockOnChange).toHaveBeenCalledWith('camera');
  });

  it('displays source labels', () => {
    const wrapper = shallow(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    const text = wrapper.text();
    expect(text).toContain('Camera');
    expect(text).toContain('Screenshare');
  });

  it('applies selected state correctly', () => {
    const wrapper = shallow(<VideoSourceToggle activeSource="camera" onChange={mockOnChange} />);
    const cameraButton = wrapper.find('button').first();
    expect(cameraButton.hasClass('active')).toBe(true);
  });

  it('handles screen source selection', () => {
    const wrapper = shallow(
      <VideoSourceToggle activeSource="screen" onChange={mockOnChange} />
    );
    
    const screenButton = wrapper.find('button').at(1);
    screenButton.simulate('click');
    expect(mockOnChange).toHaveBeenCalledWith('screen');
  });
});
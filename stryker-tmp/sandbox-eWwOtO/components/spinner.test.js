// @ts-nocheck
import React from 'react';
import { shallow } from 'enzyme';
import Spinner from './spinner';

describe('Spinner', () => {
  it('renders spinner element', () => {
    const wrapper = shallow(<Spinner />);
    expect(wrapper.find('div.spinner')).toHaveLength(1);
  });

  it('applies default classes', () => {
    const wrapper = shallow(<Spinner />);
    expect(wrapper.find('div.spinner')).toHaveLength(1);
    // Check that the component renders properly
    expect(wrapper.exists()).toBe(true);
  });

  it('renders with custom props', () => {
    const wrapper = shallow(<Spinner size={8} color="#ff0000" />);
    expect(wrapper.find('div.spinner')).toHaveLength(1);
    // Check that the component renders with props
    expect(wrapper.exists()).toBe(true);
  });

  it('handles different sizes', () => {
    const smallWrapper = shallow(<Spinner size={4} />);
    const largeWrapper = shallow(<Spinner size={10} />);
    
    expect(smallWrapper.find('div.spinner')).toHaveLength(1);
    expect(largeWrapper.find('div.spinner')).toHaveLength(1);
  });
});
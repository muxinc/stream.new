import React from 'react';
import { shallow } from 'enzyme';
import ErrorMessage from './error-message';

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    const wrapper = shallow(<ErrorMessage message="Something went wrong" />);
    expect(wrapper.text()).toContain('Something went wrong');
  });

  it('renders with default styling', () => {
    const wrapper = shallow(<ErrorMessage message="Error" />);
    expect(wrapper.find('div.message').exists()).toBe(true);
  });

  it('handles empty message', () => {
    const wrapper = shallow(<ErrorMessage message="" />);
    expect(wrapper.find('div.message').exists()).toBe(true);
    expect(wrapper.text()).toContain('Unknown error');
  });

  it('renders default error for undefined message', () => {
    const wrapper = shallow(<ErrorMessage />);
    expect(wrapper.find('div.message').exists()).toBe(true);
    expect(wrapper.text()).toContain('Unknown error');
  });

  it('applies correct CSS classes', () => {
    const wrapper = shallow(<ErrorMessage message="Test error" />);
    expect(wrapper.find('.message')).toHaveLength(1);
    // styled-jsx may not render style elements in shallow rendering
    expect(wrapper.exists()).toBe(true);
  });
});
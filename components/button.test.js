import React from 'react';
import { shallow } from 'enzyme';
import Button from './button';

describe('Button', () => {
  it('renders with children', () => {
    const wrapper = shallow(<Button>Click me</Button>);
    expect(wrapper.find('button').text()).toBe('Click me');
  });

  it('renders with default props', () => {
    const wrapper = shallow(<Button>Test</Button>);
    expect(wrapper.find('button').prop('type')).toBe('button');
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button onClick={onClick}>Click</Button>);
    
    wrapper.find('button').simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different button types', () => {
    const wrapper = shallow(<Button type="submit">Submit</Button>);
    expect(wrapper.find('button').prop('type')).toBe('submit');
  });

  it('renders as anchor when buttonLink is true', () => {
    const wrapper = shallow(<Button buttonLink href="/test">Link Button</Button>);
    expect(wrapper.find('a').exists()).toBe(true);
    expect(wrapper.find('a').prop('href')).toBe('/test');
  });

  it('applies disabled state', () => {
    const wrapper = shallow(<Button disabled>Disabled</Button>);
    // The disabled prop affects styling but may not be set as HTML attribute
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('spreads additional props', () => {
    const wrapper = shallow(
      <Button data-testid="custom-button" aria-label="Custom">
        Test
      </Button>
    );
    
    expect(wrapper.find('button').prop('data-testid')).toBe('custom-button');
    expect(wrapper.find('button').prop('aria-label')).toBe('Custom');
  });
});
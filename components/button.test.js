import React from 'react';
import { shallow } from 'enzyme';
import Button from './button';

describe('Button', () => {
  it('renders with children', () => {
    const wrapper = shallow(<Button>Click me</Button>);
    expect(wrapper.text()).toBe('Click me');
  });

  it('renders with default props', () => {
    const wrapper = shallow(<Button>Test</Button>);
    expect(wrapper.find('button').prop('type')).toBe('button');
    expect(wrapper.find('button').prop('disabled')).toBe(false);
  });

  it('applies custom className', () => {
    const wrapper = shallow(<Button className="custom-class">Test</Button>);
    expect(wrapper.hasClass('custom-class')).toBe(true);
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button onClick={onClick}>Click</Button>);
    
    wrapper.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>
    );
    
    wrapper.simulate('click');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders with different button types', () => {
    const wrapper = shallow(<Button type="submit">Submit</Button>);
    expect(wrapper.find('button').prop('type')).toBe('submit');
  });

  it('applies loading state', () => {
    const wrapper = shallow(<Button loading>Loading</Button>);
    expect(wrapper.find('button').prop('disabled')).toBe(true);
  });

  it('renders with different variants', () => {
    const primaryWrapper = shallow(<Button variant="primary">Primary</Button>);
    const secondaryWrapper = shallow(<Button variant="secondary">Secondary</Button>);
    
    expect(primaryWrapper.hasClass('primary')).toBe(true);
    expect(secondaryWrapper.hasClass('secondary')).toBe(true);
  });

  it('renders as different HTML element with "as" prop', () => {
    const wrapper = shallow(<Button as="a" href="/test">Link Button</Button>);
    expect(wrapper.type()).toBe('a');
    expect(wrapper.prop('href')).toBe('/test');
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
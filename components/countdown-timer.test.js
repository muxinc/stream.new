import React from 'react';
import { shallow, mount } from 'enzyme';
import CountdownTimer from './countdown-timer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial count', () => {
    const wrapper = shallow(<CountdownTimer initialCount={3} onComplete={jest.fn()} />);
    expect(wrapper.find('.countdown-number').text()).toBe('3');
  });

  it('counts down to zero', () => {
    const onComplete = jest.fn();
    const wrapper = mount(<CountdownTimer initialCount={3} onComplete={onComplete} />);

    expect(wrapper.find('.countdown-number').text()).toBe('3');

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(wrapper.find('.countdown-number').text()).toBe('2');

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(wrapper.find('.countdown-number').text()).toBe('1');

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(wrapper.find('.countdown-number').exists()).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const wrapper = mount(<CountdownTimer initialCount={5} onComplete={jest.fn()} />);

    wrapper.unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('applies animation classes', () => {
    const wrapper = shallow(<CountdownTimer initialCount={3} onComplete={jest.fn()} />);
    expect(wrapper.find('.countdown-animation').exists()).toBe(true);
  });

  it('handles different initial counts', () => {
    const wrapper1 = shallow(<CountdownTimer initialCount={5} onComplete={jest.fn()} />);
    const wrapper2 = shallow(<CountdownTimer initialCount={10} onComplete={jest.fn()} />);

    expect(wrapper1.find('.countdown-number').text()).toBe('5');
    expect(wrapper2.find('.countdown-number').text()).toBe('10');
  });

  it('does not call onComplete multiple times', () => {
    const onComplete = jest.fn();
    const wrapper = mount(<CountdownTimer initialCount={1} onComplete={onComplete} />);

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(onComplete).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('handles zero initial count', () => {
    const onComplete = jest.fn();
    const wrapper = mount(<CountdownTimer initialCount={0} onComplete={onComplete} />);

    expect(wrapper.find('.countdown-number').exists()).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const wrapper = shallow(
      <CountdownTimer initialCount={3} onComplete={jest.fn()} className="custom-timer" />
    );
    expect(wrapper.hasClass('custom-timer')).toBe(true);
  });
});
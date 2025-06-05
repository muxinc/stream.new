import React from 'react';
import { shallow, mount } from 'enzyme';
import StopWatch from './stop-watch';

describe('StopWatch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial time as 00:00', () => {
    const wrapper = shallow(<StopWatch />);
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:00');
  });

  it('starts counting when isRecording is true', () => {
    const wrapper = mount(<StopWatch isRecording={true} />);

    expect(wrapper.find('.stopwatch-display').text()).toBe('00:00');

    jest.advanceTimersByTime(1000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:01');

    jest.advanceTimersByTime(59000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('01:00');

    jest.advanceTimersByTime(60000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('02:00');
  });

  it('stops counting when isRecording changes to false', () => {
    const wrapper = mount(<StopWatch isRecording={true} />);

    jest.advanceTimersByTime(5000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:05');

    wrapper.setProps({ isRecording: false });
    
    jest.advanceTimersByTime(5000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:05');
  });

  it('resumes counting when isRecording changes back to true', () => {
    const wrapper = mount(<StopWatch isRecording={true} />);

    jest.advanceTimersByTime(5000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:05');

    wrapper.setProps({ isRecording: false });
    jest.advanceTimersByTime(2000);

    wrapper.setProps({ isRecording: true });
    jest.advanceTimersByTime(3000);
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('00:08');
  });

  it('formats time correctly for hours', () => {
    const wrapper = mount(<StopWatch isRecording={true} />);

    jest.advanceTimersByTime(3661000); // 1 hour, 1 minute, 1 second
    wrapper.update();
    expect(wrapper.find('.stopwatch-display').text()).toBe('01:01:01');
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const wrapper = mount(<StopWatch isRecording={true} />);

    wrapper.unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('applies recording class when recording', () => {
    const wrapper = shallow(<StopWatch isRecording={true} />);
    expect(wrapper.hasClass('recording')).toBe(true);
  });

  it('removes recording class when not recording', () => {
    const wrapper = shallow(<StopWatch isRecording={false} />);
    expect(wrapper.hasClass('recording')).toBe(false);
  });

  it('handles rapid prop changes', () => {
    const wrapper = mount(<StopWatch isRecording={true} />);

    jest.advanceTimersByTime(1000);
    wrapper.setProps({ isRecording: false });
    wrapper.setProps({ isRecording: true });
    jest.advanceTimersByTime(1000);
    wrapper.update();

    expect(wrapper.find('.stopwatch-display').text()).toBe('00:02');
  });

  it('applies custom className', () => {
    const wrapper = shallow(<StopWatch className="custom-stopwatch" />);
    expect(wrapper.hasClass('custom-stopwatch')).toBe(true);
  });
});
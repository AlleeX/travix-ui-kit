import React from 'react';
import { shallow } from 'enzyme';
import Modal from '../../../components/modal/modal';

describe('Modal: open', () => {
  const requestAnimationFrame = global.window.document.requestAnimationFrame;

  jest.useFakeTimers();

  beforeEach(() => {
    global.window.requestAnimationFrame = (cb) => { cb(); };
  });

  afterEach(() => {
    global.window.requestAnimationFrame = requestAnimationFrame;
  });

  it('should change state "isOpen" in setTimeout', () => {
    const onClose = jest.fn();
    const component = shallow(
      <Modal
        active
        onClose={onClose}
      >
        Modal Content
      </Modal>
    );
    expect(onClose).not.toBeCalled();
    expect(component.state().isOpen).toBe(false);
    component.setState({ isOpen: true });

    component.instance().close();
    expect(setTimeout.mock.calls[0][1]).toBe(300);
    expect(component.state().isOpen).toBe(true);

    jest.runAllTimers();

    expect(component.state().isOpen).toBe(false);
    expect(onClose).toBeCalled();
  });

  it('should change state "isOpen" in setTimeout', () => {
    const component = shallow(
      <Modal
        active
      >
        Modal Content
      </Modal>
    );
    expect(component.state().isOpen).toBe(false);
    component.setState({ isOpen: true });

    component.instance().close();
    expect(setTimeout.mock.calls[0][1]).toBe(300);
    expect(component.state().isOpen).toBe(true);

    jest.runAllTimers();

    expect(component.state().isOpen).toBe(false);
  });
});

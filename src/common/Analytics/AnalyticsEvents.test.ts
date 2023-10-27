import { analyticsEvents, createAnalyticsTracker } from './AnalyticsEvents';

describe('AnalyticsEvents', () => {
  it('allows tracking SDK events', async () => {
    const eventKey = 'LoginWithInvite';
    const event = {
      user: 'abc123',
    };
    const listener = jest.fn();
    analyticsEvents.addListener('track', listener);
    analyticsEvents.emit('track', eventKey, event);
    analyticsEvents.removeListener('track', listener);
    analyticsEvents.emit('track', eventKey, event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(eventKey, event);
  });

  it('allows users to track custom events', async () => {
    type MyTrackEvents = {
      EventOne: {
        requiredValue: string;
      };
    };
    const eventKey = 'EventOne';
    const event = {
      requiredValue: 'my value',
    };
    const listener = jest.fn();
    analyticsEvents.addListener('track', listener);
    const tracker = createAnalyticsTracker<MyTrackEvents>();
    tracker.track(eventKey, event);
    analyticsEvents.removeListener('track', listener);
    tracker.track(eventKey, event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(eventKey, event);
  });
});

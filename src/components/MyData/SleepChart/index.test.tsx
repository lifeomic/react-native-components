import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { SleepChart } from './index';
import { useSleepChartData } from './useSleepChartData';
import {
  addMinutes,
  format,
  startOfDay,
  addDays,
  addMonths,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { scaleTime } from 'd3-scale';

jest.unmock('@react-navigation/native');
jest.mock('./useSleepChartData', () => ({
  useSleepChartData: jest.fn(),
}));

jest.mock(
  'victory-native/src/components/victory-primitives/tspan',
  () =>
    ({ children }: any) =>
      <Text>{children}</Text>,
);
jest.mock('react-native-svg', () => {
  const actual = jest.requireActual('react-native-svg');

  return new Proxy(actual, {
    get(target, prop) {
      if (prop === 'Text') {
        return ({ children }: any) => <Text>{children}</Text>;
      }

      return target[prop];
    },
  });
});

const mockUseSleepChartData = useSleepChartData as any as jest.Mock<
  ReturnType<typeof useSleepChartData>
>;

const REM = {
  system: 'http://loinc.org',
  code: '93829-0',
};
const Awake = {
  system: 'http://loinc.org',
  code: '93828-2',
};
const Light = {
  system: 'http://loinc.org',
  code: '93830-8',
};
const Deep = {
  system: 'http://loinc.org',
  code: '93831-6',
};

describe('LineChart', () => {
  it('should render daily chart', async () => {
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          component: [
            {
              code: {
                coding: [REM],
              },
              valuePeriod: {
                start: new Date(0).toISOString(),
                end: addMinutes(new Date(0), 2).toISOString(),
              },
            },
            {
              code: {
                coding: [Awake],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 2).toISOString(),
                end: addMinutes(new Date(0), 3).toISOString(),
              },
            },
            {
              code: {
                coding: [Light],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 3).toISOString(),
                end: addMinutes(new Date(0), 4).toISOString(),
              },
            },
            {
              code: {
                coding: [Deep],
              },
              valuePeriod: {
                start: addMinutes(new Date(0), 4).toISOString(),
                end: addMinutes(new Date(0), 5).toISOString(),
              },
            },
            // malformed components - not rendered:
            {
              code: {
                coding: [],
              },
              valuePeriod: {
                start: new Date(0).toISOString(),
              },
            },
            {
              code: {
                coding: [REM],
              },
              valuePeriod: {
                end: addMinutes(new Date(0), 5).toISOString(),
              },
            },
          ],
        },
      ],
      xDomain: scaleTime().domain([new Date(0), addMinutes(new Date(0), 5)]),
      dateRange: [new Date(0), new Date(0)],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={{ start: new Date(0), end: new Date(0) }}
        title="Single Day Test Title"
      />,
    );

    expect(await findByText('Single Day Test Title')).toBeDefined();
    expect(await findByText(format(new Date(0), 'hh:mm aa'))).toBeDefined();
    expect(
      await findByText(format(addMinutes(new Date(0), 5), 'hh:mm aa')),
    ).toBeDefined();
    expect(await findByText('Awake')).toBeDefined();
    expect(await findByText('REM')).toBeDefined();
    expect(await findByText('Light')).toBeDefined();
    expect(await findByText('Deep')).toBeDefined();
    expect(
      await findByLabelText(
        `2 minutes of REM sleep starting at ${new Date(
          0,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `1 minutes of Awake sleep starting at ${addMinutes(
          new Date(0),
          2,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `1 minutes of Light sleep starting at ${addMinutes(
          new Date(0),
          3,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `1 minutes of Deep sleep starting at ${addMinutes(
          new Date(0),
          4,
        ).toLocaleTimeString()}`,
      ),
    ).toBeDefined();
  });

  it('should render multi day chart', async () => {
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 7 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 7 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addDays(new Date(0), 1),
            9.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addDays(new Date(0), 1).toISOString(),
            end: addMinutes(addDays(new Date(0), 1), 9.5 * 60).toISOString(),
          },
        },
      ],
      xDomain: scaleTime().domain([new Date(0), addDays(new Date(0), 7)]),
      dateRange: [new Date(0), addDays(new Date(0), 7)],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={{ start: new Date(0), end: addDays(new Date(0), 7) }}
        title="Multi Day Test Title"
      />,
    );

    expect(await findByText('Multi Day Test Title')).toBeDefined();
    expect(await findByText(format(new Date(0), 'MM/dd'))).toBeDefined();
    expect(
      await findByText(format(addDays(new Date(0), 7), 'MM/dd')),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `7 hours and 0 minutes of sleep on ${format(
          startOfDay(addMinutes(new Date(0), 7 * 60)),
          'MMMM d',
        )}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `9 hours and 30 minutes of sleep on ${format(
          startOfDay(addMinutes(addDays(new Date(0), 1), 9.5 * 60)),
          'MMMM d',
        )}`,
      ),
    ).toBeDefined();
  });

  it('should render year chart', async () => {
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(new Date(0), 18 * 60).toISOString(),
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: addMinutes(new Date(0), 18 * 60).toISOString(),
          },
        },
        {
          resourceType: 'Observation',
          code: {},
          status: 'final',
          effectiveDateTime: addMinutes(
            addMonths(new Date(0), 1),
            9.5 * 60,
          ).toISOString(),
          valuePeriod: {
            start: addMonths(new Date(0), 1).toISOString(),
            end: addMinutes(addMonths(new Date(0), 1), 9.5 * 60).toISOString(),
          },
        },
      ],
      xDomain: scaleTime().domain([
        startOfYear(new Date(0)),
        endOfYear(new Date(0)),
      ]),
      dateRange: [startOfYear(new Date(0)), endOfYear(new Date(0))],
    });

    const { findByText, findByLabelText } = render(
      <SleepChart
        dateRange={{
          start: startOfYear(new Date(0)),
          end: endOfYear(new Date(0)),
        }}
        title="Year Test Title"
      />,
    );

    expect(await findByText('Year Test Title')).toBeDefined();
    expect(
      await findByText(format(startOfYear(new Date(0)), 'MMM')),
    ).toBeDefined();
    expect(
      await findByText(format(endOfYear(new Date(0)), 'MMM')),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `Average of 18 hours and 0 minutes of sleep for ${format(
          startOfDay(addMinutes(new Date(0), 18 * 60)),
          'MMMM',
        )}`,
      ),
    ).toBeDefined();
    expect(
      await findByLabelText(
        `Average of 9 hours and 30 minutes of sleep for ${format(
          startOfDay(addMinutes(addMonths(new Date(0), 1), 9.5 * 60)),
          'MMMM',
        )}`,
      ),
    ).toBeDefined();
  });

  it('calls share when the share button is pressed', async () => {
    mockUseSleepChartData.mockReturnValue({
      isFetching: false,
      sleepData: [],
      xDomain: scaleTime().domain([new Date(0), addMinutes(new Date(0), 5)]),
      dateRange: [new Date(0), new Date(0)],
    });

    const onShare = jest.fn();

    const { getByTestId } = render(
      <SleepChart
        dateRange={{ start: new Date(0), end: new Date(0) }}
        onShare={onShare}
        title="Test Title"
      />,
    );

    await act(async () => fireEvent.press(await getByTestId('share-button')));

    expect(onShare).toHaveBeenCalledWith({
      dataUri: 'mockImageData',
      dateRange: [startOfDay(new Date(0)), startOfDay(new Date(0))],
      selectedPoints: [],
      title: 'Test Title',
    });
  });
});

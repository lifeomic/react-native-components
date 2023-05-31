import React from 'react';

import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { TrackerDetails } from '../../../../src/components/TrackTile/TrackerDetails/TrackerDetails';
import { MockEnvironmentDecorator } from './util/MockEnvironmentDecorator';
import {
  MetricType,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
} from '../../../../src/components/TrackTile/services/TrackTileService';
import { t } from '../../../../lib/i18n';
import { boolean, withKnobs, object, date } from '@storybook/addon-knobs';
import { Anchor } from '@lifeomic/chromicons-native';
import {
  UnitPicker,
  UnitPickerProps,
} from '../../../../src/components/TrackTile/TrackerDetails/UnitPicker';
import { IconProvider } from '../../../../src';
import { SafeView } from '../../helpers/SafeView';

storiesOf('TrackerDetails', module)
  .addDecorator(withKnobs)
  .addDecorator((storyFn, context) =>
    MockEnvironmentDecorator({
      trackers: [
        {
          id: '1',
          name: 'Test',
          color: 'chartreuse',
          system: TRACKER_CODE_SYSTEM,
        },
      ],
    })(storyFn, context),
  )
  .addDecorator((story) => <SafeView>{story()}</SafeView>)
  .add('default', () => {
    const referenceDate = date('Reference Date', undefined);
    return (
      <IconProvider
        icons={
          boolean('Use Custom Icons', false)
            ? {
                id: Anchor,
              }
            : {}
        }
      >
        <TrackerDetails
          tracker={
            {
              id: 'id',
              name: 'Example',
              color: '#5F9EA0',
              resourceType: 'Observation',
              description: t(
                'track-tile.example-description',
                'This is an example description for the track tile that is to be added',
              ),
              units: [
                {
                  unit: 'unit-1',
                  display: 'steps',
                  target: 100,
                  default: true,
                },
                {
                  unit: 'unit-2',
                  display: 'skips',
                  target: 75,
                },
                {
                  unit: 'unit-3',
                  display: 'jumps',
                  target: 50,
                },
              ],
              system: TRACKER_CODE_SYSTEM,
            } as Partial<MetricType> as any
          }
          valuesContext={{
            system: TRACKER_CODE_SYSTEM,
            codeBelow: TRACKER_CODE,
          }}
          referenceDate={new Date(referenceDate)}
          // NOTE: This should not be necessary in production apps where the referenceDate prop does not change on the fly.
          // https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
          key={referenceDate}
        />
      </IconProvider>
    );
  })
  .add('UnitPicker', () => {
    const units: UnitPickerProps['units'] = object('units', [
      {
        code: 'c1',
        display: 'Unit 1',
        system: 's1',
        target: 1,
        unit: 'u1',
        default: true,
      },
      {
        code: 'c2',
        display: 'Unit 2',
        system: 's2',
        target: 2,
        unit: 'u2',
        default: false,
      },
    ]);

    return (
      <View style={{ alignItems: 'center' }}>
        <UnitPicker
          value="u1"
          units={units}
          onChange={() => console.log('changed')}
        />
        <UnitPicker
          value="u2"
          units={units}
          onChange={() => console.log('changed')}
        />
      </View>
    );
  });

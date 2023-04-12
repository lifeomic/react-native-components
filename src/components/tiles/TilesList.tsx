import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { AppTile } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { spacing } from '../BrandConfigProvider/theme/base';
import { createStyles } from '../BrandConfigProvider';

export interface TilesListProps {
  TrackTile?: JSX.Element;
  tiles?: AppTile[];
  children?: React.ReactNode;
  styles?: TilesListStyles;
  tileStyles?: TileStyles;
  onAppTilePress?: () => void;
}

export const TilesList = ({
  TrackTile,
  tiles,
  children,
  styles: instanceStyles,
  tileStyles,
  onAppTilePress,
}: TilesListProps) => {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();
  const { appTileScreens } = useDeveloperConfig();

  const onAppTilePressDefault = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        navigate('tiles/CustomAppTile', { appTile });
      } else {
        navigate('tiles/AppTile', { appTile });
      }
    },
    [navigate, appTileScreens],
  );

  return (
    <ScrollView testID={tID('tiles-list')} style={styles.scrollView}>
      {TrackTile && TrackTile}
      <View style={styles.view}>
        {tiles?.map((appTile) => (
          <Tile
            key={appTile.id}
            id={appTile.id}
            title={appTile.title}
            onPress={
              onAppTilePress ? onAppTilePress : onAppTilePressDefault(appTile)
            }
            styles={tileStyles}
          />
        ))}
        {children}
      </View>
    </ScrollView>
  );
};

const defaultStyles = createStyles('TilesList', () => ({
  scrollView: {},
  view: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.extraSmall,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;

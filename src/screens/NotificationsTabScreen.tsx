import React, { useMemo } from 'react';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useNotifications } from '../hooks/useNotifications';
import { Divider, List } from 'react-native-paper';
import { SafeAreaView, View } from 'react-native';
import formatRelative from 'date-fns/formatRelative';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { tID } from '../common';

export const NotificationsTabScreen = () => {
  const { Bell, BellOff } = useIcons();
  const { isLoading, data } = useNotifications();
  const { styles } = useStyles(defaultStyles);

  const surveyIcon = useMemo(
    () => <List.Icon style={styles.icon} icon={Bell} />,
    [styles.icon, Bell],
  );
  const noNotificationsIcon = useMemo(
    () => <List.Icon style={styles.icon} icon={BellOff} />,
    [styles.icon, BellOff],
  );

  if (isLoading) {
    return (
      <ActivityIndicatorView
        message={t(
          'notifications-screen-loading-notifications',
          'Loading results',
        )}
      />
    );
  }

  const notificationEntries = data?.notificationsForUser.edges.map(
    (edge, index) => {
      return (
        <View key={edge.node.id}>
          <List.Item
            title={edge.node.fullText}
            titleNumberOfLines={4}
            style={styles.listItem}
            // TODO: switch to i18next formatter when available
            description={formatRelative(new Date(edge.node.time), new Date())}
            left={() => surveyIcon}
            testID={tID(`notification-${index}`)}
          />
          <Divider />
        </View>
      );
    },
  );

  const noNotifications = (
    <List.Item
      title={t(
        'no-notifications-message',
        'You have no notifications to display!',
      )}
      testID={tID('no-notifications-message')}
      style={styles.listItem}
      left={() => noNotificationsIcon}
    />
  );

  const notificationsAreaContent =
    notificationEntries && notificationEntries.length
      ? notificationEntries
      : noNotifications;

  return (
    <View testID="notifications-screen">
      <SafeAreaView>
        <Divider />
        {notificationsAreaContent}
      </SafeAreaView>
    </View>
  );
};

const defaultStyles = createStyles('NotificationsTabScreen', () => ({
  listItem: {},
  icon: { paddingLeft: 16 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type NotificationsTabScreenStyle = NamedStylesProp<typeof defaultStyles>;

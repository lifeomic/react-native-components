import React, { useContext, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import {
  registerDeviceToken,
  requestNotificationsPermissions,
} from '../../../../src/common/Notifications';
import {
  PushNotificationsEvent,
  PushNotificationsContext,
} from '../../../../src/hooks/usePushNotifications';
import { useActiveAccount, useHttpClient } from '../../../../src';
import { Notifications } from 'react-native-notifications';

const styles = StyleSheet.create({
  openedNotificationView: {
    backgroundColor: 'lightgray',
    margin: 10,
  },
  openedNotificationText: {
    fontWeight: 'bold',
  },
  receivedNotificationView: {
    backgroundColor: 'lightblue',
    margin: 10,
  },
  recievedNotificationText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingTop: '20%',
    display: 'flex',
    flexDirection: 'row',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    width: '49%',
  },
  clearButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
    width: '43%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});

export const NotificationsScreen = () => {
  const pushNotificationsContext = useContext(PushNotificationsContext);

  const { events, setEvents } = pushNotificationsContext;
  const { httpClient } = useHttpClient();
  const { account } = useActiveAccount();

  const sendLocalNotification = () => {
    Notifications.postLocalNotification({
      body: 'Local notification!',
      title: 'Local Notification Title',
      sound: 'chime.aiff',
      badge: 0,
      type: '',
      thread: '',
      payload: {
        category: 'LO_RN_SDK_CATEGORY',
        link: 'localNotificationLink',
      },
      //@ts-ignore
      android_channel_id: 'LifeOmic react native SDK',
    });
  };

  const clearLocalNotifications = () => {
    setEvents([]);
  };

  const renderOpenedNotification = (notification: Notification) => {
    return (
      <View style={styles.openedNotificationView}>
        <Text style={styles.openedNotificationText}>Notification Opened</Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
      </View>
    );
  };

  const renderReceivedNotification = (notification: Notification) => {
    return (
      <View style={styles.receivedNotificationView}>
        <Text style={styles.recievedNotificationText}>
          Notification Received
        </Text>
        <Text>{`Title: ${notification.title}`}</Text>
        <Text>{`Body: ${notification.body}`}</Text>
      </View>
    );
  };

  const renderEvent = (event: PushNotificationsEvent) => {
    if (event.type === 'notificationReceived') {
      return renderReceivedNotification(event.notification);
    }
    return renderOpenedNotification(event.notification);
  };

  // Request the permissions to receive notifications
  useEffect(() => {
    requestNotificationsPermissions(({ deviceToken }) => {
      if (deviceToken && account) {
        // Register the device with the LifeOmic platform to start receiving push notifications
        registerDeviceToken({
          deviceToken,
          application: 'Application-Name', // The application name will be provided by LifeOmic upon onboarding
          httpClient,
          accountId: account.id,
        });
      }
    });
  }, [account, httpClient]);

  return (
    <View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendLocalNotification}
        >
          <Text style={styles.buttonText}>Send local notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearLocalNotifications}
        >
          <Text style={styles.buttonText}>Clear notifications</Text>
        </TouchableOpacity>
      </View>

      {events.map((event: PushNotificationsEvent, idx: number) => (
        <View key={`event${idx}`}>{renderEvent(event)}</View>
      ))}
    </View>
  );
};

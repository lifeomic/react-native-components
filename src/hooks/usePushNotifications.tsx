import React, { createContext, useEffect, useState } from 'react';
import { useHttpClient } from './useHttpClient';
import { Account } from './useAccounts';
import { useActiveAccount } from './useActiveAccount';
import {
  getInitialNotification,
  onNotificationOpened,
  onNotificationReceived,
} from 'src/common';
import { Platform } from 'react-native';
import { Notifications } from 'react-native-notifications';
import { AxiosInstance } from 'axios';

interface SharedStateType {
  sharedState: string;
  setSharedState: React.Dispatch<React.SetStateAction<string>>;
}

interface PushNotificationsStateType {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  httpClient: AxiosInstance;
  account: Account | undefined;
}

export const MyContext = createContext<SharedStateType | undefined>(undefined);
export const PushNotificationsContext = createContext<
  PushNotificationsStateType | undefined
>(undefined);

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState<any[]>([]); //TODO - fix type (something like the above)
  const { httpClient } = useHttpClient();
  const { account } = useActiveAccount();

  useEffect(() => {
    // setSharedState('Initial value. hey');
  }, []);

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setEvents((events) => [
        { type: 'notificationOpened', notification },
        ...events,
      ]);
    });

    onNotificationReceived((notification) => {
      setEvents((events) => [
        { type: 'notificationReceived', notification },
        ...events,
      ]);
    });

    const getInitial = async () => {
      // Get the notification that opened the application
      const notification = await getInitialNotification();
      if (notification) {
        setEvents((events) => [
          { type: 'notificationOpened', notification },
          ...events,
        ]);
      }
    };

    getInitial();
  }, []);

  // Set the notification channel for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannel({
        channelId: 'sdk-example-channel',
        name: 'SDK Example',
        importance: 5,
        description: 'Channel for the SDK',
        enableLights: true,
        enableVibration: true,
        showBadge: true,
        vibrationPattern: [200, 1000, 500, 1000, 500],
      });
    }
  }, []);

  const value: PushNotificationsStateType = {
    events,
    setEvents,
    httpClient,
    account,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

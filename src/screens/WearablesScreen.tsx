import React, { useCallback } from 'react';
import { StyleSheet, Linking, SafeAreaView, View } from 'react-native';
import { WearablesView } from '../components/Wearables';
import {
  useSetSyncTypes,
  useSetWearableState,
  useWearableIntegrations,
} from '../hooks/useWearables';
import { getBundleId } from 'react-native-device-info';
import { SyncTypeSettings } from '../components/Wearables/WearableTypes';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

const WearablesScreen = () => {
  const appId = getBundleId().toLowerCase();
  const { data, refetch, isLoading } = useWearableIntegrations(appId);
  const setWearableState = useSetWearableState();
  const setSyncTypes = useSetSyncTypes();

  const wearables = data?.items || [];

  const toggleWearable = useCallback(
    async (ehrId: string, value: boolean) => {
      return setWearableState(ehrId, value, {
        appId,
      });
    },
    [appId, setWearableState],
  );

  const updateSyncTypeSettings = async (settings: SyncTypeSettings) => {
    await setSyncTypes(settings);
    refetch();
  };
  return (
    <View style={[styles.container]}>
      <SafeAreaView style={[styles.container]}>
        <WearablesView
          enableMultiWearable={true}
          loading={isLoading}
          onRefreshNeeded={refetch}
          onShowLearnMore={openURL}
          onShowWearableAuth={openURL}
          onSyncTypeSelectionsUpdate={updateSyncTypeSettings}
          onToggleWearable={toggleWearable}
          wearables={wearables}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
});

export default WearablesScreen;

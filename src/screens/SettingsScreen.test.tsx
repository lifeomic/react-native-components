import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useWearables } from '../hooks/useWearables';
import { SettingsScreen } from './SettingsScreen';
import { openURL } from '../common/urls';
import { useAppConfig } from '../hooks/useAppConfig';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useWearables', () => ({
  useWearables: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));
jest.mock('../common/urls', () => ({
  openURL: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useWearablesMock = useWearables as jest.Mock;
const useNavigationMock = useNavigation as jest.Mock;
const getVersionMock = DeviceInfo.getVersion as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const openURLMock = openURL as jest.Mock;

const navigateMock = jest.fn();

beforeEach(() => {
  getVersionMock.mockReturnValue('1.0');
  useActiveAccountMock.mockReturnValue({
    account: { name: 'Account Name' },
  });
  useWearablesMock.mockReturnValue({
    useWearableIntegrationsQuery: jest.fn().mockReturnValue({
      data: undefined,
    }),
  });
  useNavigationMock.mockReturnValue({
    navigate: navigateMock,
  });
  useAppConfigMock.mockReturnValue({
    data: {
      supportLink: 'http://unit-test/support',
    },
  });
});

test('shows logout button and version', async () => {
  const { getByTestId } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByTestId('oauth-logout-button')).toBeDefined();
    expect(getByTestId('version-text')).toBeDefined();
  });
});

test('shows account name', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Account Name')).toBeDefined();
  });
});

test('shows placeholder if account still loading', async () => {
  useActiveAccountMock.mockReturnValue({});
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Accounts')).toBeDefined();
  });
});

test('navigates to user profile', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Profile')).toBeDefined();
  });
  fireEvent.press(getByText('Profile'));

  expect(navigateMock).toHaveBeenCalledWith('Settings/Profile');
});

test('navigates to account selection', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Account Name')).toBeDefined();
  });
  fireEvent.press(getByText('Account Name'));

  expect(navigateMock).toHaveBeenCalledWith('Settings/AccountSelection');
});

test('opens the support link', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Support')).toBeDefined();
  });
  fireEvent.press(getByText('Support'));

  expect(openURLMock).toHaveBeenCalledWith('http://unit-test/support');
});

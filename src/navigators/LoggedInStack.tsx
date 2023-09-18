import React, { useCallback, useEffect, useState } from 'react';
import { TabNavigator } from './TabNavigator';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CircleThreadScreen } from '../screens/CircleThreadScreen';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';
import { OnboardingCourseScreen } from '../screens/OnboardingCourseScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInRootParamList } from './types';
import { useConsent } from '../hooks/useConsent';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useActiveProject } from '../hooks/useActiveProject';
import { useOnboardingCourse } from '../hooks/useOnboardingCourse';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { t } from 'i18next';
import { usePendingInvite } from '../hooks/usePendingInvite';
import { useSetUserProfileEffect } from '../hooks/useSetUserProfileEffect';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { useUser } from '../hooks/useUser';
import { useJoinCircles } from '../hooks/Circles/useJoinCircles';

export function LoggedInStack() {
  const Stack = createNativeStackNavigator<LoggedInRootParamList>();
  const { inviteParams } = usePendingInvite();
  useSetUserProfileEffect();
  const {
    account,
    isLoading: isLoadingAccount,
    isFetched: isFetchedAccount,
  } = useActiveAccount();
  const {
    activeProject,
    activeSubjectId,
    isLoading: isLoadingProject,
    isFetched: isFetchedProject,
  } = useActiveProject();
  const { data: userData } = useUser();
  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();
  const {
    shouldLaunchOnboardingCourse,
    isLoading: onboardingCourseIsLoading,
    isFetched: onboardingCourseIsFetched,
  } = useOnboardingCourse();
  const { isInitialLoading: loadingJoinCircles } = useJoinCircles();
  const { onAppSessionStart } = useDeveloperConfig();
  const [shouldWaitForOnUserSignIn, setShouldWaitForOnUserSignIn] = useState(
    !!onAppSessionStart,
  );

  const loadingProject = !isFetchedProject || isLoadingProject;
  const loadingAccount = !isFetchedAccount || isLoadingAccount;
  const hasAccount = !loadingAccount && !!account?.id;
  const loadingAccountOrProject =
    loadingAccount || (hasAccount && loadingProject);
  const loadingOnboardingCourse =
    !onboardingCourseIsFetched || onboardingCourseIsLoading;
  const hasAccountAndProject = !!(activeProject?.id && account?.id);
  const hasUserAndPatient = !!(activeSubjectId && userData);

  const resumeAppSession = useCallback(async () => {
    setShouldWaitForOnUserSignIn(false);
  }, [setShouldWaitForOnUserSignIn]);

  const initialRoute = !(hasAccountAndProject || hasUserAndPatient)
    ? 'InviteRequired'
    : shouldRenderConsentScreen
    ? 'screens/ConsentScreen'
    : shouldLaunchOnboardingCourse
    ? 'screens/OnboardingCourseScreen'
    : 'app';

  const getLoadingMessage = useCallback(() => {
    if (loadingAccountOrProject) {
      return t('waiting-for-account-and-project', 'Loading account');
    } else if (hasAccountAndProject && loadingConsents) {
      return t('root-stack-waiting-for-consents', 'Loading consents');
    } else if (hasAccountAndProject && loadingOnboardingCourse) {
      return t(
        'root-stack-waiting-for-app-config',
        'Loading onboarding course data',
      );
    } else if (inviteParams?.inviteId) {
      return t('root-stack-accepting-invitation', 'Accepting invitation');
    } else if (loadingJoinCircles) {
      return t('root-stack-waiting-for-circle-join', 'Joining Circles');
    } else if (shouldWaitForOnUserSignIn) {
      return t(
        'root-stack-waiting-for-on-user-signin',
        'Processing user sign-in',
      );
    }
  }, [
    hasAccountAndProject,
    inviteParams?.inviteId,
    loadingAccountOrProject,
    loadingConsents,
    loadingJoinCircles,
    loadingOnboardingCourse,
    shouldWaitForOnUserSignIn,
  ]);

  const loadingMessage = getLoadingMessage();

  useEffect(() => {
    const executeOnUserSignInIfNeeded = async () => {
      if (
        shouldWaitForOnUserSignIn &&
        hasAccountAndProject &&
        hasUserAndPatient
      ) {
        await onAppSessionStart?.(resumeAppSession);
      }
    };

    executeOnUserSignInIfNeeded();
  }, [
    userData,
    account,
    activeProject,
    activeSubjectId,
    hasAccountAndProject,
    hasUserAndPatient,
    onAppSessionStart,
    resumeAppSession,
    shouldWaitForOnUserSignIn,
  ]);

  if (loadingMessage) {
    return <ActivityIndicatorView message={loadingMessage} />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="InviteRequired"
        component={InviteRequiredScreen}
        options={{
          presentation: 'fullScreenModal',
          title: t('invite-required', 'Invitation Required'),
        }}
      />
      <Stack.Screen
        name="app"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="screens/ConsentScreen"
        component={ConsentScreen}
        options={{
          presentation: 'fullScreenModal',
          title: t('consent', 'Consent'),
        }}
      />
      <Stack.Screen
        name="screens/OnboardingCourseScreen"
        component={OnboardingCourseScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen name="Circle/Thread" component={CircleThreadScreen} />
    </Stack.Navigator>
  );
}

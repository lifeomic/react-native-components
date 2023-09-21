import { useState } from 'react';
import { useUnreadMessages } from './useUnreadMessages';
import { chunk, compact, find, uniq } from 'lodash';
import { useLookupUsers } from './Circles/usePrivatePosts';
import { useSession } from './useSession';
import { useActiveProject } from './useActiveProject';

export const useMyMessages = (tileId: string) => {
  const [pageIndex, setPageIndex] = useState(0);
  const { activeSubject } = useActiveProject();
  const appConfig = activeSubject?.project?.appConfig;
  const { userConfiguration } = useSession();
  const { user: userData } = userConfiguration;
  const { unreadIds } = useUnreadMessages();
  const messageTile = find(
    appConfig?.homeTab?.messageTiles,
    (tile) => tile.id === tileId,
  );
  const recipientsUserIds = messageTile?.userIds.filter(
    (id) => id !== userData?.id,
  );

  // If unread isn't in the receipt list do not use it
  const permittedUnreadIds = unreadIds?.filter((id) =>
    recipientsUserIds?.includes(id),
  );

  // Unread messages always show on the top of the list
  const sortedList =
    permittedUnreadIds && recipientsUserIds
      ? uniq([...permittedUnreadIds, ...recipientsUserIds])
      : recipientsUserIds;

  // Break-down list of users into smaller chunks
  const recipientsListChunked = chunk(sortedList, 10);

  // Use current scroll-index to expand the list of users
  // in view up to the maximum
  const usersInView = compact(
    recipientsListChunked.flatMap((users, index) => {
      if (index <= pageIndex) {
        return users;
      }
    }),
  );

  // Construct object to identify which user
  // queries should be enabled
  const userQueryList = sortedList?.map((userId) => ({
    userId,
    enabled: usersInView.includes(userId),
  }));

  // Get user details (picture/displayName) for usersInView
  const userQueries = useLookupUsers(userQueryList);
  const userDetailsList = compact(
    userQueries.map(({ data }) => {
      if (!data) {
        return;
      }

      return {
        userId: data.user.userId,
        displayName: data.user.profile.displayName,
        picture: data.user.profile.picture,
        isUnread: unreadIds?.includes(data.user.userId) ?? false,
      };
    }),
  );

  const isLoading = userQueries.some(
    ({ isInitialLoading }) => isInitialLoading,
  );

  const fetchNextPage = () => {
    if (recipientsListChunked.length - 1 > pageIndex) {
      // Expand list of users in view
      setPageIndex((currentIndex) => currentIndex + 1);
    }
  };

  const hasNextPage = recipientsListChunked.length - 1 > pageIndex;
  return { userDetailsList, isLoading, fetchNextPage, hasNextPage };
};

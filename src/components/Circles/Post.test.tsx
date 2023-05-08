import React from 'react';
import { render } from '@testing-library/react-native';
import { Post } from './Post';
import type { Post as PostType } from '../../hooks/usePosts';

jest.mock('./ReactionsToolbar');

test('renders a post', () => {
  const post: PostType = {
    id: '123',
    __typename: 'ActivePost',
    replies: { edges: [], pageInfo: {} },
    parentId: '456',
    status: 'READY',
    message: 'Some message!',
    author: {
      profile: {
        displayName: 'Joe Shmoe',
        picture: '',
      },
    },
    createdAt: '2023-05-02T02:00:00',
    replyCount: 0,
    reactionTotals: [
      {
        type: '',
        count: 1,
      },
    ],
  };
  const postItem = render(<Post post={post} />);
  expect(postItem.getByText(post.message!)).toBeDefined();
  expect(postItem.getByText(post.author!.profile.displayName)).toBeDefined();
});

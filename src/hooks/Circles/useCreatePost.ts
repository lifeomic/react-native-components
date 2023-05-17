import { omit } from 'lodash';
import { useQueryClient, useMutation } from 'react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useGraphQLClient } from '../useGraphQLClient';
import { useUser } from '../useUser';
import { ParentType, Priority, AttachmentType, Post } from './types';
import { InfinitePostsData } from './useInfinitePosts';
import { optimisticallyUpdatePosts } from './utils/optimisticallyUpdatePosts';
import { gql } from 'graphql-request';

type CreatePostInput = {
  post: {
    id: string;
    message: string;
    parentId: string;
    parentType: ParentType;
    priority?: Priority;
    attachmentsV2?: {
      externalId: string;
      type: AttachmentType;
      subType: string;
    }[];
  };
};

export function useCreatePost() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const { data } = useUser();
  const queryClient = useQueryClient();

  const createPostMutation = async (input: CreatePostInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(
      createPostMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('createPost', createPostMutation, {
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      const optimisticPost: Post = {
        ...omit(newPost.post, 'parentType'),
        id: newPost.post.id,
        __typename: 'ActivePost',
        reactionTotals: [],
        createdAt: new Date().toISOString(),
        replyCount: 0,
        status: 'READY',
        replies: { edges: [], pageInfo: {} },
        author: {
          profile: {
            displayName: data?.profile.displayName ?? '',
            picture: data?.profile.picture ?? '',
          },
        },
        authorId: data?.id,
      };

      if (newPost.post.parentType === ParentType.CIRCLE) {
        queryClient.setQueryData(
          ['posts'],
          (currentData?: InfinitePostsData) => {
            const newData: InfinitePostsData = currentData ?? {
              pages: [
                {
                  postsV2: {
                    edges: [],
                    pageInfo: { endCursor: '', hasNextPage: false },
                  },
                },
              ],
              pageParams: [],
            };

            newData.pages[0].postsV2.edges.unshift({ node: optimisticPost });
            return newData;
          },
        );
      } else if (newPost.post.parentType === ParentType.POST) {
        optimisticallyUpdatePosts({
          queryClient,
          id: newPost.post.parentId,
          transformFn: (post) => {
            post.replyCount++;
            post.replies = post.replies || { edges: [] };
            post.replies.edges.unshift({ node: optimisticPost });

            return post;
          },
        });
      }

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

const createPostMutationDocument = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        id
      }
    }
  }
`;

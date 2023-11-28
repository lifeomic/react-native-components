import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useMe } from './useMe';
import { useHttpClient } from './useHttpClient';
import { usePendingInvite } from './usePendingInvite';

export interface Project {
  id: string;
  name: string;
}

interface ProjectsResponse {
  items: Project[];
}

export function useSubjectProjects() {
  const { account } = useActiveAccount();
  const { data: subjects } = useMe();
  const { httpClient } = useHttpClient();
  const { lastAcceptedId } = usePendingInvite();

  return useQuery<Project[]>(
    [`${account}-projects`, subjects, lastAcceptedId],
    async () => {
      if (subjects?.length) {
        const res = await httpClient.get<ProjectsResponse>(
          `/v1/projects?${subjects?.map((s) => `id=${s.projectId}`).join('&')}`,
        );
        return res.data.items;
      } else {
        // Having no subjects is a supported state.
        // Instead of disabling the query to wait for subjects we are
        // returning a mock response to keep downstream queries moving
        return [];
      }
    },
  );
}

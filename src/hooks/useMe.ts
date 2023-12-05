import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from './useHttpClient';
import { Patient } from 'fhir/r3';

export interface Subject {
  subjectId: string;
  projectId: string;
  name: Patient['name'];
  subject: Patient;
}

interface Entry {
  resource: Patient;
}

interface MeResponse {
  resourceType: 'Bundle';
  entry: Entry[];
}

export function useMe() {
  const { httpClient } = useHttpClient();

  const useMeQuery = useQuery(['fhir/dstu3/$me'], () =>
    httpClient.get<MeResponse>('/v1/fhir/dstu3/$me').then((res) =>
      res.data.entry?.map(
        (entry) =>
          ({
            subjectId: entry.resource.id,
            projectId: entry.resource.meta?.tag?.find(
              (t) => t.system === 'http://lifeomic.com/fhir/dataset',
            )?.code,
            name: entry.resource.name,
            subject: entry.resource,
          } as Subject),
      ),
    ),
  );

  return useMeQuery;
}

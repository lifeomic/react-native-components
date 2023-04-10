import { useQuery, useMutation } from 'react-query';
import { Bundle, Observation } from 'fhir/r3';
import formatISO from 'date-fns/formatISO';
import { useHttpClient } from './useHttpClient';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import merge from 'deepmerge';

type ResourceTypes = {
  Observation: Observation;
};
type ResourceType = Observation;

type QueryParams = {
  resourceType: keyof ResourceTypes;
  pageSize?: number;
};

type DeleteParams = {
  id: string;
  resourceType: keyof ResourceTypes;
};

export function useFhirClient() {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const { activeProject, activeSubjectId } = useActiveProject();

  const useSearchResourcesQuery = (queryParams: QueryParams) => {
    const params = merge(
      {
        // Defaults:
        _tag: `http://lifeomic.com/fhir/dataset|${activeProject?.id}`,
        patient: activeSubjectId,
      },
      queryParams,
    );
    const resourceType = queryParams.resourceType;

    // TODO: add code, date, & other query param capabilities
    // TODO: consider using fhir-search across the board (documenting delay)

    return useQuery(
      [`search-${resourceType}`, params],
      () => {
        return httpClient
          .post<Bundle<ResourceTypes[typeof resourceType]>>(
            `/v1/fhir/dstu3/${resourceType}/_search`,
            params,
            {
              headers: accountHeaders,
            },
          )
          .then((res) => res.data);
      },
      {
        enabled: !!accountHeaders && !!activeProject?.id && !!activeSubjectId,
      },
    );
  };

  const useCreateResourceMutation = () => {
    return useMutation({
      mutationFn: async (resourceToUpsert: ResourceType) => {
        if (!accountHeaders || !activeProject?.id || !activeSubjectId) {
          throw new Error('Cannot mutate resource in current state');
        }
        let resource = merge<ResourceType>({}, resourceToUpsert);

        // Subject
        resource.subject = {
          reference: `Patient/${activeSubjectId}`,
        };

        // Project/dataset
        if (
          !resource.meta?.tag?.find(
            (t) => t.system === 'http://lifeomic.com/fhir/dataset',
          )
        ) {
          resource = merge(resource, { meta: { tag: [] } });
          resource.meta!.tag!.push({
            system: 'http://lifeomic.com/fhir/dataset',
            code: activeProject?.id,
          });
        }

        // Date/time
        if (resource.resourceType === 'Observation') {
          const observation = resource as fhir3.Observation;
          if (!observation.effectiveDateTime) {
            observation.effectiveDateTime = formatISO(Date.now());
          }
        }

        return httpClient
          .post<ResourceType>(
            `/v1/fhir/dstu3/${resource.resourceType}`,
            resource,
            {
              headers: accountHeaders,
            },
          )
          .then((res) => res.data);
      },
    });
  };

  const useDeleteResourceMutation = () => {
    return useMutation({
      mutationFn: async (params: DeleteParams) => {
        if (!accountHeaders) {
          throw new Error('Cannot delete resource in current state');
        }

        return httpClient
          .delete(`/v1/fhir/dstu3/${params.resourceType}/${params.id}`, {
            headers: accountHeaders,
          })
          .then((res) => res.data);
      },
    });
  };

  return {
    useSearchResourcesQuery,
    useCreateResourceMutation,
    useDeleteResourceMutation,
  };
}

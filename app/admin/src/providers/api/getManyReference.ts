import { type Identifier, type RaRecord } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface GetManyReferenceParams {
  target: string;
  id: Identifier;
  pagination: { page: number; perPage: number };
  sort: { field: string; order: 'ASC' | 'DESC' };
  filter: unknown;
  meta?: unknown; // request metadata
  signal?: AbortSignal;
}
interface GetManyReferenceResult<RecordType> {
  data: RecordType[];
  total?: number;
  // if using partial pagination
  pageInfo?: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  meta?: unknown; // response metadata
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type getManyReference = <RecordType extends RaRecord = any>(
  resource: string,
  params: GetManyReferenceParams,
) => Promise<GetManyReferenceResult<RecordType>>;

export const getManyReference: getManyReference = async (resource, params) => {
  const { target, id, pagination, sort, signal, filter } = params;
  const { page, perPage } = pagination || { page: 1, perPage: 50 };
  const { field, order } = sort || { field: 'created_at', order: 'ASC' };

  const queryParams: Record<string, string> = {
    [target]: id.toString(),
    page: page.toString(),
    pageSize: perPage.toString(),
    orderBy: field,
    orderDirection: order.toLowerCase() === 'asc' ? 'asc' : 'desc',
    ...(filter as object),
  };

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${API_URL}/api/v1/admin/${resource}?${queryString}`;

  const response = await httpClient(url, { signal });

  const payload = await response.json;

  return {
    data: payload.data.items,
    total: payload.data.totalItems,
  };
};

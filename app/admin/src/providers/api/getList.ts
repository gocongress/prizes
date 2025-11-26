import {
  type PaginationPayload,
  type QueryFunctionContext,
  type RaRecord,
  type SortPayload,
} from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface GetListParams extends QueryFunctionContext {
  pagination?: PaginationPayload;
  sort?: SortPayload;
  filter?: unknown;
  meta?: unknown; // request metadata
  signal?: AbortSignal;
}

interface GetListResult<RecordType> {
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
type getList = <RecordType extends RaRecord = any>(
  resource: string,
  params: GetListParams,
) => Promise<GetListResult<RecordType>>;

export const getList: getList = async (resource, params) => {
  const { pagination, sort, signal, filter } = params;
  const { page, perPage } = pagination || { page: 1, perPage: 10 };
  const { field, order } = sort || { field: 'created_at', order: 'ASC' };

  const queryParams: Record<string, string> = {
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

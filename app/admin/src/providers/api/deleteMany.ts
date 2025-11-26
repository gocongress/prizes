import { type Identifier } from 'react-admin';
import { API_URL } from '../../config';
import { httpClient } from './httpClient';

interface DeleteManyParams {
  ids: Identifier[];
  meta?: unknown;
}
interface DeleteManyResult {
  data: Identifier[];
}
type deleteMany = (resource: string, params: DeleteManyParams) => Promise<DeleteManyResult>;

export const deleteMany: deleteMany = async (resource, params) => {
  const { ids } = params;

  const url = `${API_URL}/api/v1/admin/${resource}`;

  await Promise.all(
    ids.map(async (id) => {
      const deleteUrl = `${url}/${id}`;
      await httpClient(deleteUrl, {
        method: 'DELETE',
      });
    }),
  );

  return {
    data: ids,
  };
};

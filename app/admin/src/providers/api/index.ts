import { create } from './create';
import { _delete } from './delete';
import { deleteMany } from './deleteMany';
import { getList } from './getList';
import { getMany } from './getMany';
import { getManyReference } from './getManyReference';
import { getOne } from './getOne';
import { getRoute } from './getRoute';
import { update } from './update';
import { updateMany } from './updateMany';

export default {
  getList,
  getOne,
  getRoute,
  getMany,
  getManyReference,
  create,
  update,
  delete: _delete,
  deleteMany,
  updateMany,
};
